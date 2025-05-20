import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
import { Card, CardContent } from '@/components/ui/card';
import { BookingCalendar } from './BookingCalendar';
import { Booking } from '@/store/bookingsStore';
import { Hall } from '@/store/hallsStore';

const phoneRegex = /^\+998[0-9]{9}$/;

const bookingFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Invalid phone number format (+998XXXXXXXXX)"),
  guestCount: z.number()
    .min(1, "Must have at least 1 guest")
    .max(1000, "Cannot exceed maximum capacity"),
  date: z.string().min(1, "Date is required"),
  hallId: z.string()
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  hall: Hall;
  bookings: Booking[];
  onSubmit: (data: BookingFormValues) => void;
  isLoading: boolean;
}

export function BookingForm({ hall, bookings, onSubmit, isLoading }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      guestCount: 1,
      date: '',
      hallId: hall.id
    }
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    form.setValue('date', format(date, 'yyyy-MM-dd'));
  };

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+998")) {
      if (cleaned.startsWith("998")) {
        cleaned = "+" + cleaned;
      } else if (cleaned.startsWith("8")) {
        cleaned = "+998" + cleaned.substring(1);
      } else {
        cleaned = "+998" + cleaned;
      }
    }
    return cleaned.slice(0, 13);
  };

  
const handleSubmit = async (values: BookingFormValues) => {
  try {
    // Sanani tekshirish
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    // Mehmonlar sonini tekshirish
    if (values.guestCount > hall.capacity) {
      toast.error(`Guest count cannot exceed hall capacity of ${hall.capacity}`);
      return;
    }

    // Formani yuborishdan oldin barcha ma'lumotlarni to'g'ri formatda tayyorlash
    const bookingData = {
      ...values,
      date: format(selectedDate, 'yyyy-MM-dd'),
      hallId: hall.id,
      guestCount: Number(values.guestCount)
    };

    console.log('Submitting booking data:', bookingData); // Debug uchun

    // onSubmit funksiyasini chaqirish
    await onSubmit(bookingData);

  } catch (error) {
    console.error('Booking submission error:', error);
    toast.error('Failed to submit booking');
  }
};



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <BookingCalendar
            bookings={bookings}
            onSelectDate={handleDateSelect}
            selectedDate={selectedDate}
            disableBooking={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
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
                        <Input placeholder="Enter last name" {...field} />
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
                      <Input
                        placeholder="+998XXXXXXXXX"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
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
                        min={1}
                        max={hall.capacity}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                disabled={isLoading || !selectedDate}
              >
                {isLoading ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}