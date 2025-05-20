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

import { TASHKENT_DISTRICTS } from "@/store/hallsStore";
import MapPicker from "@/components/MapPicker"; 
import useAuthStore from "@/store/authStore";

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
  owner_id?: string;
}


const formSchema = z.object({
  name: z.string().min(2, { message: "Hall name is required" }),
  district: z.string().min(1, { message: "District is required" }),
  address: z.string().min(1, { message: "Address is required" }),
 
  capacity: z.coerce
    .number()
    .min(1, { message: "Capacity must be at least 1" }),
  price: z.coerce.number().min(0, { message: "Price can't be negative" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  latitude: z.coerce.number().nullable().optional(), 
  longitude: z.coerce.number().nullable().optional(), 
  owner_id: z.string().nullable().optional()
  

 
});

type HallFormProps = {
  initialData?: Hall;
  isLoading?: boolean;
  onSubmit?: (data: FormData) => void;
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
   console.log("HallForm ga kelgan initialData:", initialData);

  const user = useAuthStore()
  
  
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      district: initialData?.district || "",
      address: initialData?.address || "",
      capacity: initialData?.capacity || 0,
      price: initialData?.price || 0,
      phone: initialData?.phone || "",
       owner_id: initialData?.owner_id || (user?.user.role === "owner" ? String(user.user.id) : undefined),
  
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
   
    setSelectedImages((prev: File[]) => prev.filter((_, i) => i !== index));

   
    const urlToRemove = previewImages[index];
    setPreviewImages((prev: string[]) => prev.filter((_, i) => i !== index));

   
    if (urlToRemove && !initialData?.images?.includes(urlToRemove)) {
      URL.revokeObjectURL(urlToRemove);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {

    form.setValue("latitude", lat, { shouldValidate: true }); 
    form.setValue("longitude", lng, { shouldValidate: true });

  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();

   
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
     
      

    selectedImages.forEach((file) => {
      formData.append("images", file); 
    });


    if (initialData?.images) {
      initialData.images.forEach((url) => {
        if (previewImages.includes(url)) {
          formData.append("existingImages", url);
        }
      });
    }

    console.log("FormData:", formData);
    if (onSubmit) {
      onSubmit(formData); 
    }
  };


  const initialMapPosition =
    typeof initialData?.latitude === "number" &&
    typeof initialData?.longitude === "number"
      ? {
          lat: initialData.latitude as number,
          lng: initialData.longitude as number,
        }
      : null;

      console.log(initialMapPosition, "initialMapPosition");

       console.log("Form errors:", form.formState.errors); 
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
 
<FormItem>
  <FormLabel>Location on Map</FormLabel>
  <FormControl>
   
    <div className={`w-full h-[300px] rounded-lg overflow-hidden relative ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      <MapPicker
        initialPosition={initialMapPosition}
        onLocationSelect={handleLocationSelect}
        disabledMap={isLoading}
        zoom={13}
      />
     
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  </FormControl>

 
  {form.watch("latitude") !== null &&
    form.watch("latitude") !== undefined && (
      <p className="text-sm text-gray-600 mt-2"> 
        Selected Location: Lat{" "}
        {form.watch("latitude")?.toFixed(6)}, Lng{" "}
        {form.watch("longitude")?.toFixed(6)}
      </p>
    )}

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
