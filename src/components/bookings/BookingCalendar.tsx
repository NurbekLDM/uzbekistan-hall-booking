import { useState } from 'react';
import { format, isBefore, isSameDay, startOfToday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Booking } from '@/store/bookingsStore';

interface BookingCalendarProps {
  bookings: Booking[];
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  disableBooking?: boolean;
}

export function BookingCalendar({
  bookings,
  onSelectDate,
  selectedDate,
  minDate = startOfToday(),
  disableBooking = false
}: BookingCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const today = startOfToday();

  const bookingsByDate: Record<string, Booking> = {};
  bookings.forEach(booking => {
    const dateKey = format(new Date(booking.date), 'yyyy-MM-dd');
    bookingsByDate[dateKey] = booking;
  });

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    
    const dateKey = format(date, 'yyyy-MM-dd');
    const booking = bookingsByDate[dateKey];
    
    if (booking) {
      setSelectedBooking(booking);
    } else if (!isBefore(date, minDate) && onSelectDate && !disableBooking) {
      onSelectDate(date);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Select Date</h3>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-100 mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-100 mr-2"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelectDate}
        disabled={(date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          return (
            isBefore(date, minDate) || 
            (dateKey in bookingsByDate) ||
            !isSameDay(date, minDate)
          );
        }}
        className="rounded-md border"
      />

      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                This date is already booked
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm">{format(new Date(selectedBooking.date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm capitalize">{selectedBooking.status}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}