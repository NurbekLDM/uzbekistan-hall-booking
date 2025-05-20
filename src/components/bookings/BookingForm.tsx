import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingCalendar } from './BookingCalendar'; // O'zgartirish yo'q
import { Booking } from '@/store/bookingsStore'; // Booking interface ni import qiling
import { Hall } from '@/store/hallsStore'; // Hall interface ni import qiling
import { toast } from 'sonner'; // Toast xabarlari uchun

// BookingForm uchun Zod sxemasi
const bookingFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }), // <<<<< O'ZGARTIRILDI
  guestCount: z.coerce.number()
    .min(1, { message: 'Guest count must be at least 1' }),
});

// BookingForm dan onSubmit ga yuboriladigan ma'lumotlar turi
interface BookingFormValues extends z.infer<typeof bookingFormSchema> {
  date: string; // Sanani string formatida yuboramiz (yyyy-MM-dd)
  hallId: string; // Hall ID
}

interface BookingFormProps {
  hall: Hall;
  bookings: Booking[]; // Mavjud bookinglar (validatsiya uchun kerak bo'lishi mumkin)
  onSubmit: (data: BookingFormValues) => void; // <<<<< Turi aniqlandi
  isLoading: boolean;
}

export function BookingForm({ hall, bookings, onSubmit, isLoading }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      guestCount: 1,
    },
  });

  function handleSubmit(values: z.infer<typeof bookingFormSchema>) {
    if (!selectedDate) {
      toast.error("Please select a date for your booking."); // <<<<< Xato xabari
      return;
    }

    // Sanani 'yyyy-MM-dd' formatida yuboramiz
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const bookingData: BookingFormValues = {
      ...values,
      date: formattedDate,
      hallId: hall.id, // Hall ID ni qo'shdik
    };

    onSubmit(bookingData);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingCalendar
            bookings={bookings}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
            // BookingForm ichidagi kalendar faqat tanlash uchun, ma'lumot ko'rsatish uchun emas
            disableBooking={false} // Bu yerda foydalanuvchi sanani tanlashi mumkin
          />

          {selectedDate && (
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <p className="text-sm font-medium">
                Selected Date: {format(selectedDate, 'PPP')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of guests"
                        min={1}
                        max={hall.capacity}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value); // <<<<< parseInt() ga o'zgartirildi
                          field.onChange(isNaN(value) ? '' : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      Maximum capacity: {hall.capacity} guests
                    </p>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Total Cost</h3>
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span>
                    {form.watch('guestCount') || 0} guests × ${hall.price}/guest
                  </span>
                  <span className="font-semibold">
                    ${(form.watch('guestCount') || 0) * hall.price}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedDate || isLoading} // Agar sana tanlanmagan bo'lsa, tugmani o'chirib qo'yamiz
              >
                {isLoading ? 'Booking...' : 'Book Now'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
