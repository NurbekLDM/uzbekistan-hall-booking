
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Building, CalendarDays, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import useHallsStore from '@/store/hallsStore';
import useBookingsStore from '@/store/bookingsStore';
import useOwnersStore from '@/store/ownersStore';

const AdminDashboard = () => {
  const { halls, fetchHalls } = useHallsStore();
  const { bookings, fetchAllBookings } = useBookingsStore();
  const { owners, fetchOwners } = useOwnersStore();

  useEffect(() => {
    fetchHalls();
    fetchAllBookings();
    fetchOwners();
  }, [fetchHalls, fetchAllBookings, fetchOwners]);

  // Count halls awaiting approval
  const pendingHallsCount = halls.filter(hall => !hall.approved).length;

  // Count upcoming bookings
  const upcomingBookingsCount = bookings.filter(booking => booking.status === 'upcoming').length;

  return (
    <MainLayout requireAuth={true} allowedRoles={['admin']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage wedding halls, owners, and bookings
            </p>
          </div>

          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link to="/admin/owners/new">Add Owner</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/halls/new">Add Hall</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Total Halls
              </CardTitle>
              <Building className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {halls.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {pendingHallsCount} pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Hall Owners
              </CardTitle>
              <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {owners.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Registered hall owners
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Bookings
              </CardTitle>
              <BookMarked className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {bookings.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total bookings made
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Upcoming Events
              </CardTitle>
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {upcomingBookingsCount}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Events scheduled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="mb-10">
          <h2 className="text-2xl font-serif font-bold mb-6">
            Quick Access
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Halls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/halls">
                      View All Halls
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/halls/approvals">
                      Pending Approvals ({pendingHallsCount})
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/halls/new">
                      Add New Hall
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Owners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/owners">
                      View All Owners
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/owners/new">
                      Add New Owner
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/assignments">
                      Assign Halls
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/bookings">
                      All Bookings
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/bookings?status=upcoming">
                      Upcoming Events
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6">
            Recent Activity
          </h2>
          
          <Tabs defaultValue="halls">
            <TabsList>
              <TabsTrigger value="halls">Halls</TabsTrigger>
              <TabsTrigger value="owners">Owners</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>
            
            {/* These would typically show the most recent items */}
            <TabsContent value="halls" className="pt-6">
              <div className="bg-white rounded-lg overflow-hidden shadow">
                <div className="p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {halls.slice(0, 5).map((hall) => (
                        <tr key={hall.id}>
                          <td className="px-6 py-4">{hall.name}</td>
                          <td className="px-6 py-4">{hall.district}</td>
                          <td className="px-6 py-4">{hall.capacity}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              hall.approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {hall.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/admin/halls/${hall.id}`}>Details</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="p-4 border-t">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin/halls">View All Halls</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="owners" className="pt-6">
              <div className="bg-white rounded-lg overflow-hidden shadow">
                <div className="p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halls</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {owners.slice(0, 5).map((owner) => (
                        <tr key={owner.id}>
                          <td className="px-6 py-4">{owner.firstName} {owner.lastName}</td>
                          <td className="px-6 py-4">{owner.username}</td>
                          <td className="px-6 py-4">{owner.halls?.length || 0}</td>
                          <td className="px-6 py-4">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/admin/owners/${owner.id}`}>Details</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="p-4 border-t">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin/owners">View All Owners</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="bookings" className="pt-6">
              <div className="bg-white rounded-lg overflow-hidden shadow">
                <div className="p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hall</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4">{booking.hallName}</td>
                          <td className="px-6 py-4">{new Date(booking.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{booking.guestCount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/admin/bookings/${booking.id}`}>Details</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="p-4 border-t">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin/bookings">View All Bookings</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
