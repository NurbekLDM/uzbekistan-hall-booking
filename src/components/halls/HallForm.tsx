import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Extend Hall type to include latitude and longitude if not already present
import { TASHKENT_DISTRICTS } from "@/store/hallsStore";
import MapPicker from "@/components/MapPicker"; // MapPicker.tsx faylingiz joylashgan yo'lni to'g'rilab qo'ying

interface Hall {
  name: string;
  district: string;
  address: string;
  capacity: number;
  price: number;
  phone: string;
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Hall name is required" }),
  district: z.string().min(1, { message: "District is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  // capacity va price uchun z.coerce.number() dan foydalanamiz
  capacity: z.coerce
    .number()
    .min(1, { message: "Capacity must be at least 1" }),
  price: z.coerce.number().min(0, { message: "Price can't be negative" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  latitude: z.coerce.number().nullable().optional(), // MapPicker uchun ham coerce qoldiramiz
  longitude: z.coerce.number().nullable().optional(), // MapPicker uchun ham coerce qoldiramiz
  // images maydoni FormData orqali alohida boshqariladi, schema'da bo'lishi shart emas agar faqat fayllar yuborilsa
  // Agar mavjud image URL'lari ham yuborilsa, bu maydon kerak bo'lishi mumkin, lekin hozircha olib tashlaymiz
  // images: z.array(z.string()).optional(), // Olib tashlandi
});

type HallFormProps = {
  initialData?: Hall;
  isLoading?: boolean;
  onSubmit?: (data: FormData) => void; // <--- onSubmit FormData qabul qilishi kerak
};

const HallForm = ({
  initialData,
  isLoading = false,
  onSubmit,
}: HallFormProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>(
    initialData?.images || []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      district: initialData?.district || "",
      address: initialData?.address || "",
      capacity: initialData?.capacity || 0,
      price: initialData?.price || 0,
      phone: initialData?.phone || "",
      // defaultValues'ga latitude va longitude'ni qo'shamiz
      // initialData mavjud bo'lsa va latitude/longitude raqam bo'lsa, ularni ishlatamiz
      latitude:
        initialData?.latitude !== null &&
        initialData?.latitude !== undefined &&
        typeof initialData.latitude === "number"
          ? initialData.latitude
          : null,
      longitude:
        initialData?.longitude !== null &&
        initialData?.longitude !== undefined &&
        typeof initialData.longitude === "number"
          ? initialData.longitude
          : null,
      // images: initialData?.images || [], // defaultValues dan olib tashlandi
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev: File[]) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev: string[]) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // Tanlangan rasmlar ro'yxatidan o'chiramiz
    setSelectedImages((prev: File[]) => prev.filter((_, i) => i !== index));

    // Preview rasmlar ro'yxatidan o'chiramiz
    const urlToRemove = previewImages[index];
    setPreviewImages((prev: string[]) => prev.filter((_, i) => i !== index));

    // Agar o'chirilayotgan rasm yangi yuklangan bo'lsa (ya'ni initialData images ichida bo'lmasa),
    // uning Object URL'ini bo'shatamiz
    if (urlToRemove && !initialData?.images?.includes(urlToRemove)) {
      URL.revokeObjectURL(urlToRemove);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    // Formning latitude va longitude maydonlarini yangilaymiz
    form.setValue("latitude", lat, { shouldValidate: true }); // Validatsiyani yoqish
    form.setValue("longitude", lng, { shouldValidate: true }); // Validatsiyani yoqish
    // form.trigger("latitude"); // setValue da shouldValidate: true bo'lsa trigger shart emas
    // form.trigger("longitude");
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();

    // Add form values (bu loop latitude va longitude'ni ham avtomatik qo'shadi)
    Object.entries(values).forEach(([key, value]) => {
      // Nullable maydonlar uchun tekshiruv
      if (value !== null && value !== undefined) {
        // Raqam qiymatlarni FormData ga to'g'ri qo'shish
        if (typeof value === "number") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value as string);
        }
      }
    });

    // Add newly selected images <--- BU QISM QO'SHILDI
    selectedImages.forEach((file) => {
      formData.append("images", file); // Backendda 'images' nomli maydon kutilyapti
    });

    // Add existing image URLs that are still in previewImages
    // Backend agar existingImages nomli maydonni qabul qilsa, bu qism kerak
    if (initialData?.images) {
      initialData.images.forEach((url) => {
        if (previewImages.includes(url)) {
          formData.append("existingImages", url);
        }
      });
    }

    // onSubmit callback'ini FormData bilan chaqiramiz
    if (onSubmit) {
      onSubmit(formData); // <--- FormData yuboriladi
    }
  };

  // initialData?.latitude va initialData?.longitude raqam ekanligini tekshiramiz
  const initialMapPosition =
    typeof initialData?.latitude === "number" &&
    typeof initialData?.longitude === "number"
      ? {
          lat: initialData.latitude as number,
          lng: initialData.longitude as number,
        }
      : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hall Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter hall name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASHKENT_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter full address"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (seats)</FormLabel>
                <FormControl>
                  {/* field.value null bo'lsa, inputga bo'sh string beramiz */}
                  <Input
                    type="number"
                    placeholder="Enter capacity"
                    min={1}
                    {...field}
                    value={
                      field.value === null || field.value === undefined
                        ? ""
                        : field.value
                    }
                    onChange={(e) => {
                      // Input qiymati string bo'ladi, parseFloat bilan raqamga o'giramiz
                      const value =
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Per Seat ($)</FormLabel>
                <FormControl>
                  {/* field.value null bo'lsa, inputga bo'sh string beramiz */}
                  <Input
                    type="number"
                    placeholder="Enter price per seat"
                    min={0}
                    step="0.01"
                    {...field}
                    value={
                      field.value === null || field.value === undefined
                        ? ""
                        : field.value
                    }
                    onChange={(e) => {

                      const value =
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Xarita orqali joy tanlash qismi */}
        <FormItem>
          <FormLabel>Location on Map</FormLabel>
          <FormControl>
            <MapPicker
              initialPosition={initialMapPosition}
              onLocationSelect={handleLocationSelect}
            />
          </FormControl>
          {/* Latitude va Longitude qiymatlarini ko'rsatish (ixtiyoriy) */}
          {form.watch("latitude") !== null &&
            form.watch("latitude") !== undefined && (
              <p className="text-sm text-gray-600">
                Selected Location: Lat{" "}
                {form.watch("latitude")?.toFixed(6)}, Lng{" "}
                {form.watch("longitude")?.toFixed(6)}
              </p>
            )}
          {/* Xarita uchun xato xabari (agar schema'da validatsiya bo'lsa) */}
          {form.formState.errors.latitude && (
            <FormMessage>{form.formState.errors.latitude.message}</FormMessage>
          )}
          {form.formState.errors.longitude && (
            <FormMessage>{form.formState.errors.longitude.message}</FormMessage>
          )}
        </FormItem>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Images</FormLabel>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6">
            <Input
              type="file"
              id="images"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <label htmlFor="images" className="cursor-pointer">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  {/* Icon for upload */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="flex text-sm text-gray-600">
                  <span className="relative rounded-md font-medium text-gold hover:text-gold-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                    Upload images
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </label>
          </div>
          {/* Preview images */}
          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previewImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index}`}
                    className="h-24 w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-md text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Hall"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HallForm;
