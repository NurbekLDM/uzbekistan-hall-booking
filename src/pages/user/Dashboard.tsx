
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingTable } from '@/components/bookings/BookingTable';
import MainLayout from '@/components/layout/MainLayout';
import useBookingsStore from '@/store/bookingsStore';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

const UserDashboard = () => {
  const { bookings, filteredBookings, isLoading, fetchUserBookings, cancelBooking } = useBookingsStore();
  const { user } = useAuthStore();

  const user_id = user?.id;

  useEffect(() => {
    fetchUserBookings(user_id);
  }, [fetchUserBookings]);

  const handleCancelBooking = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  // Filter upcoming bookings
  const upcomingBookings = filteredBookings.filter(
    (booking) => booking.status === 'upcoming'
  );
  
  // Filter past bookings
  const pastBookings = filteredBookings.filter(
    (booking) => booking.status === 'past'
  );

  return (
    <MainLayout requireAuth={true} allowedRoles={['user']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              Welcome, {user?.first_name + ' '+ user?.last_name|| 'User'}
            </h1>
            <p className="text-gray-600">
              Manage your wedding hall bookings
            </p>
          </div>

          <Button asChild>
            <Link to="/halls">Book a New Venue</Link>
          </Button>
        </div>

        {/* Dashboard overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {bookings.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Venues you've booked
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Upcoming Events
              </CardTitle>
              <Check className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {upcomingBookings.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Upcoming bookings
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Next Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div>
                  <div className="text-lg font-medium">
                    {upcomingBookings[0].hallName}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(upcomingBookings[0].date).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No upcoming events
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
            <TabsTrigger value="past">Past Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading bookings...</p>
              </div>
            ) : upcomingBookings.length > 0 ? (
              <BookingTable 
                data={upcomingBookings} 
                onCancelBooking={handleCancelBooking}
                isLoading={isLoading}
                showHallName={true}
              />
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <h3 className="text-xl font-medium mb-2">No upcoming bookings</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any upcoming bookings yet.
                </p>
                <Button asChild>
                  <Link to="/halls">Book a Venue</Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading bookings...</p>
              </div>
            ) : pastBookings.length > 0 ? (
              <BookingTable 
                data={pastBookings} 
                onCancelBooking={handleCancelBooking}
                isLoading={isLoading}
                showHallName={true}
              />
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <h3 className="text-xl font-medium mb-2">No past bookings</h3>
                <p className="text-gray-600">
                  You don't have any past bookings yet.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
