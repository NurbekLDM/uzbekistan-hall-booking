
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { BookingTable } from '@/components/bookings/BookingTable';
import MainLayout from '@/components/layout/MainLayout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useBookingsStore from '@/store/bookingsStore';
import useHallsStore, { TASHKENT_DISTRICTS } from '@/store/hallsStore';
import { toast } from 'sonner';

const formSchema = z.object({
  hallId: z.string().optional(),
  district: z.string().optional(),
  status: z.string().optional(),
});

const BookingsManagement = () => {
  const { 
    bookings, 
    filteredBookings, 
    isLoading: bookingsLoading, 
    fetchAllBookings,
    setFilters,
    resetFilters,
    cancelBooking
  } = useBookingsStore();
  
  const { 
    halls, 
    isLoading: hallsLoading, 
    fetchHalls 
  } = useHallsStore();

  useEffect(() => {
    fetchAllBookings();
    fetchHalls();
  }, [fetchAllBookings, fetchHalls]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hallId: '',
      district: '',
      status: '',
    },
  });

  const handleFilter = (values: z.infer<typeof formSchema>) => {
    const filters: any = {};
    if (values.hallId) filters.hallId = values.hallId;
    if (values.district) filters.district = values.district;
    if (values.status) filters.status = values.status;
    setFilters(filters);
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <MainLayout requireAuth={true} allowedRoles={['admin']}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">
            Bookings Management
          </h1>
          <p className="text-gray-600">
            View and manage all hall bookings
          </p>
        </div>

        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Filter Bookings</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFilter)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="hallId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hall</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Halls" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Halls</SelectItem>
                          {halls.map((hall) => (
                            <SelectItem key={hall.id} value={hall.id}>
                              {hall.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Districts" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Districts</SelectItem>
                          {TASHKENT_DISTRICTS.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="past">Past</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Apply Filters</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset();
                    resetFilters();
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div>
          {bookingsLoading ? (
            <div className="text-center py-8">
              <p>Loading bookings...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <BookingTable 
              data={filteredBookings} 
              onCancelBooking={handleCancelBooking}
              isLoading={bookingsLoading}
            />
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No bookings found</h3>
              <p className="text-gray-600">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingsManagement;
