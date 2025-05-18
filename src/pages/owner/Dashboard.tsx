import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Calendar, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingTable } from '@/components/bookings/BookingTable';
import HallCard from '@/components/halls/HallCard';
import MainLayout from '@/components/layout/MainLayout';
import useHallsStore from '@/store/hallsStore';
import useBookingsStore from '@/store/bookingsStore';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

const OwnerDashboard = () => {
  const { halls, filteredHalls, isLoading: hallsLoading, fetchHalls } = useHallsStore();
  const { bookings, isLoading: bookingsLoading, fetchHallBookings, cancelBooking } = useBookingsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchHalls();
    fetchHallBookings();
  }, [fetchHalls, fetchHallBookings]);


  const ownerHalls = filteredHalls.filter(hall => {
    if (!user) return false;
    return hall.ownerId === user.id;
  });

  const handleCancelBooking = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };


  const upcomingBookings = bookings.filter(
    (booking) => booking.status === 'upcoming'
  );
  
  // Filter past bookings
  const pastBookings = bookings.filter(
    (booking) => booking.status === 'past'
  );

  return (
    <MainLayout requireAuth={true} allowedRoles={['owner']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              Owner Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your wedding halls and bookings
            </p>
          </div>

          <Button asChild>
            <Link to="/owner/halls/new">Register New Hall</Link>
          </Button>
        </div>

        {/* Dashboard overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                My Halls
              </CardTitle>
              <Building className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {ownerHalls.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Wedding halls registered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Pending Bookings
              </CardTitle>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {upcomingBookings.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Upcoming events across all halls
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Total Guests
              </CardTitle>
              <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {upcomingBookings.reduce((sum, booking) => sum + booking.guestCount, 0)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Guests across upcoming events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Halls */}
        <div className="mb-10">
          <h2 className="text-2xl font-serif font-bold mb-6">
            My Wedding Halls
          </h2>
          
          {hallsLoading ? (
            <div className="text-center py-8">
              <p>Loading halls...</p>
            </div>
          ) : ownerHalls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownerHalls.map((hall) => (
                <HallCard 
                  key={hall.id} 
                  hall={hall} 
                  showApprovalStatus={true} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No halls registered</h3>
              <p className="text-gray-600 mb-4">
                You haven't registered any wedding halls yet.
              </p>
              <Button asChild>
                <Link to="/owner/halls/new">Register a Hall</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Bookings Tabs */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6">
            Hall Bookings
          </h2>
          
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
              <TabsTrigger value="past">Past Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <p>Loading bookings...</p>
                </div>
              ) : upcomingBookings.length > 0 ? (
                <BookingTable 
                  data={upcomingBookings} 
                  onCancelBooking={handleCancelBooking}
                  isLoading={bookingsLoading}
                />
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600">
                    There are no upcoming bookings for your halls.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <p>Loading bookings...</p>
                </div>
              ) : pastBookings.length > 0 ? (
                <BookingTable 
                  data={pastBookings} 
                  onCancelBooking={handleCancelBooking}
                  isLoading={bookingsLoading}
                />
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No past bookings</h3>
                  <p className="text-gray-600">
                    There are no past bookings for your halls.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerDashboard;
