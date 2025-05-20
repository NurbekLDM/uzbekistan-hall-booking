import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Check, MapPin, Phone, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from '@/components/ui/badge';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';
import { BookingForm } from '@/components/bookings/BookingForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import MapPicker from '@/components/MapPicker';

import useHallsStore from '@/store/hallsStore';
import useBookingsStore from '@/store/bookingsStore';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

const HallDetailsPage = () => {
  const { id } = useParams<{ id: string }>(); // ID har doim string bo'ladi
  const { currentHall, isLoading: hallLoading, fetchHallById } = useHallsStore();
  const { bookings, isLoading: bookingsLoading, fetchHallBookings, createBooking } = useBookingsStore();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('details');
  const [showBookingForm, setShowBookingForm] = useState(false);
  // selectedBookingDate state'ini HallDetailsPage dan olib tashladik, chunki BookingForm o'zi boshqaradi

  useEffect(() => {
    if (id) {
      fetchHallById(Number(id)); // ID ni numberga o'tkazamiz
      fetchHallBookings(id);
    }
  }, [id, fetchHallById, fetchHallBookings]);

  const hallBookings = bookings.filter(booking => booking.hallId === id);
  console.log(currentHall);

  // BookingForm dan keladigan ma'lumotlar turi
  interface BookingFormData {
    date: string; // yyyy-MM-dd formatida
    guestCount: number;
    firstName: string;
    lastName: string;
    phone: string;
    hallId: string;
  }

  const handleBookingSubmit = async (data: BookingFormData) => {
    if (!isAuthenticated) {
      toast.error('Please login to book this hall');
      return;
    }
    if (!user?.id) {
      toast.error('User ID not found. Please log in again.');
      return;
    }

    try {
      await createBooking({
        date: data.date, // BookingForm dan kelgan formatlangan sana
        guest_count: data.guestCount,
        first_name: data.firstName, // Maydon nomlari moslashtirildi
        last_name: data.lastName,   // Maydon nomlari moslashtirildi
        phone: data.phone,
        hall_id: data.hallId, // BookingForm dan kelgan hallId
        user_id: user.id,
        hallName: currentHall?.name || '',
      });

      toast.success('Booking created successfully! Awaiting admin approval.');
      setShowBookingForm(false);
      // setSelectedBookingDate(undefined); // Endi kerak emas
      fetchHallBookings(id); // Bookinglar ro'yxatini yangilash
    } catch (error) {
      toast.error('Failed to create booking');
      console.error(error);
    }
  };

  // HallDetailsPage dagi kalendar faqat mavjudlikni ko'rsatadi, tanlashni BookingForm ichidagi kalendar qiladi
  const handleDateSelectForDisplay = (date: Date) => {
    // Bu funksiya faqat kalendardagi sanani bosganda ishlaydi
    // Agar booked bo'lsa, BookingDetails ni ochadi (BookingCalendar ichida boshqariladi)
    // Agar bo'sh sana bo'lsa, hech narsa qilmaydi, chunki booking qilish "Make a Booking" tugmasi orqali boshlanadi
    console.log("Date selected on display calendar:", date);
  };


  if (hallLoading || !currentHall) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading venue details...</p>
        </div>
      </MainLayout>
    );
  }

  // currentHall.latitude va longitude string bo'lsa, ularni numberga o'tkazish
  const lat = typeof currentHall.latitude === 'string' ? Number(currentHall.latitude) : currentHall.latitude;
  const lng = typeof currentHall.longitude === 'string' ? Number(currentHall.longitude) : currentHall.longitude;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">
            {currentHall.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <MapPin size={18} className="mr-1" />
              <span>{currentHall.district}, {currentHall.address}</span>
            </div>
            <div className="flex items-center">
              <Users size={18} className="mr-1" />
              <span>Up to {currentHall.capacity} guests</span>
            </div>
            <div className="flex items-center">
              <Phone size={18} className="mr-1" />
              <span>{currentHall.phone}</span>
            </div>
            <Badge variant="outline" className="ml-auto">
              ${currentHall.price} per guest
            </Badge>
          </div>
        </div>

        {/* Images */}
        {currentHall.images && currentHall.images.length > 0 ? (
          <div className="mb-8">
            <Carousel className="w-full">
              <CarouselContent>
                {currentHall.images.map((image, index) => (
                  <CarouselItem key={index} className="basis-full">
                    <div className="h-[400px] rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:5000/${image}`}
                        alt={`${currentHall.name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        ) : (
          <div className="mb-8 h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
            <span className="text-gray-400">No Images Available</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>

                <div className="space-y-4">


                  <div className="space-y-2">
                    <h3 className="font-medium">Features:</h3>
                    <ul className="space-y-1">
                      <li className="flex items-start">
                        <Check size={18} className="mr-2 text-green-500 mt-0.5" />
                        <span>Capacity for up to {currentHall.capacity} guests</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="mr-2 text-green-500 mt-0.5" />
                        <span>Beautiful interior and comfortable seating</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="mr-2 text-green-500 mt-0.5" />
                        <span>Excellent location in {currentHall.district}</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="mr-2 text-green-500 mt-0.5" />
                        <span>Affordable pricing at ${currentHall.price} per guest</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium">Location:</h3>
                    <p className="text-gray-600">{currentHall.address}, {currentHall.district} District, Tashkent</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Contact:</h3>
                    <p className="text-gray-600">{currentHall.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Map:</h3>
                    <div className="w-full h-64">
                      {/* Latitude va Longitude ni Number ga o'tkazish */}
                      {currentHall.latitude !== null && currentHall.longitude !== null &&
                       !isNaN(lat) && !isNaN(lng) ? (
                        <MapPicker
                          initialPosition={{ lat: lat, lng: lng }}
                          disabledMap={true}
                          zoom={15}
                          hallName={currentHall.name}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg text-gray-500">
                          Map location not available.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-serif font-bold mb-4">Pricing Details</h2>
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Price per guest</span>
                      <span className="font-bold text-gold">${currentHall.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Maximum capacity</span>
                      <span>{currentHall.capacity} guests</span>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-4">
                        Example: For a wedding with 100 guests, the total would be ${currentHall.price * 100}.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setActiveTab('availability');
                          setShowBookingForm(true);
                        }}
                      >
                        Check Availability & Book
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="pt-6">
            {showBookingForm ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold">Book this Venue</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingForm(false)}
                  >
                    Back to Calendar
                  </Button>
                </div>

                {isAuthenticated && user?.role === 'user' ? (
                  <BookingForm
                    hall={currentHall}
                    bookings={hallBookings}
                    onSubmit={handleBookingSubmit}
                    isLoading={bookingsLoading}
                    // selectedDate propini endi BookingForm ichida boshqariladi, bu yerda yuborish kerak emas
                  />
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <Calendar className="w-12 h-12 mx-auto text-gold mb-2" />
                    <h3 className="text-xl font-medium mb-2">Login Required</h3>
                    <p className="text-gray-600 mb-4">
                      Please login as a user to book this venue
                    </p>
                    <Button asChild>
                      <a href="/login">Login to Book</a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold">Check Availability</h2>
                  <Button onClick={() => setShowBookingForm(true)}>
                    Make a Booking
                  </Button>
                </div>

                <div className="max-w-md mx-auto">
                  <BookingCalendar
                    bookings={hallBookings}
                    onSelectDate={handleDateSelectForDisplay} 
                    selectedDate={undefined} 
                    disableBooking={true} 
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default HallDetailsPage;
