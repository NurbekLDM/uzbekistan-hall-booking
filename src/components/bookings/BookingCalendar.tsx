
import { useState } from 'react';
import { addDays, format, isBefore, isSameDay, startOfToday } from 'date-fns';
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
  selectedDate?: Date | undefined;
  minDate?: Date;
  disableBooking?: boolean;
}

interface BookingDetailsProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetails = ({ booking, onClose }: BookingDetailsProps) => {
  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Information about this booking.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-sm text-gray-900">{format(new Date(booking.date), 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-sm text-gray-900 capitalize">{booking.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Guest Count</p>
              <p className="text-sm text-gray-900">{booking.guestCount} guests</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Customer</p>
              <p className="text-sm text-gray-900">
                {booking.customerFirstName} {booking.customerLastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm text-gray-900">{booking.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hall</p>
              <p className="text-sm text-gray-900">{booking.hallName}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function BookingCalendar({ 
  bookings,
  onSelectDate,
  selectedDate,
  minDate = startOfToday(),
  disableBooking = false
}: BookingCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const today = startOfToday();

  // Create a map of bookings by date for easy lookup
  const bookingsByDate: Record<string, Booking> = {};
  bookings.forEach(booking => {
    const dateKey = format(new Date(booking.date), 'yyyy-MM-dd');
    bookingsByDate[dateKey] = booking;
  });

  // Custom day rendering to highlight dates
  const dayRenderer = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const isBooked = dateKey in bookingsByDate;
    const isPast = isBefore(day, today) && !isSameDay(day, today);
    
    let className = 'relative group';
    
    if (isPast) {
      className += ' bg-gray-100 text-gray-400';
    } else if (isBooked) {
      className += ' bg-red-100 text-red-800';
    } else {
      className += ' bg-green-100 text-green-800';
    }

    if (selectedDate && isSameDay(day, selectedDate)) {
      className += ' ring-2 ring-primary';
    }

    return (
      <div className={className}>
        <time dateTime={dateKey} className="mx-auto flex h-7 w-7 items-center justify-center rounded-full">
          {day.getDate()}
        </time>
        {isBooked && !isPast && (
          <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-600"></div>
        )}
      </div>
    );
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    
    const dateKey = format(date, 'yyyy-MM-dd');
    const booking = bookingsByDate[dateKey];
    
    if (booking) {
      // Show booking details
      setSelectedBooking(booking);
    } else if (!isBefore(date, today) && onSelectDate && !disableBooking) {
      // Select available date for booking
      onSelectDate(date);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Availability Calendar</h3>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-100 mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-100 mr-2"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-gray-100 mr-2"></div>
            <span>Past</span>
          </div>
        </div>
      </div>
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelectDate}
        disabled={(date) => isBefore(date, minDate) && !isSameDay(date, minDate)}
        modifiersStyles={{
          selected: {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)'
          }
        }}
        components={{
          Day: ({ date, ...props }) => {
            return <div {...props}>{dayRenderer(date)}</div>;
          }
        }}
        className="pointer-events-auto"
      />

      {selectedBooking && (
        <BookingDetails 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
}
