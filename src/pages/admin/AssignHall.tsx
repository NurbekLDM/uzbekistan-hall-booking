
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import useOwnersStore from '@/store/ownersStore';
import useHallsStore from '@/store/hallsStore';
import { toast } from 'sonner';

const formSchema = z.object({
  hallId: z.string().min(1, { message: 'Please select a hall' }),
});

const AssignHall = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchOwnerById, currentOwner, assignHallToOwner, isLoading: ownerLoading } = useOwnersStore();
  const { halls, fetchHalls, isLoading: hallsLoading } = useHallsStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOwnerById(id);
      fetchHalls();
    }
  }, [id, fetchOwnerById, fetchHalls]);

  // Filter halls that don't have an owner yet
  const availableHalls = halls.filter(hall => !hall.owner);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hallId: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await assignHallToOwner(id, values.hallId);
      toast.success('Hall assigned to owner successfully!');
      navigate('/admin/owners');
    } catch (error) {
      toast.error('Failed to assign hall to owner');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ownerLoading || !currentOwner) {
    return (
      <MainLayout requireAuth={true} allowedRoles={['admin']}>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading owner information...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth={true} allowedRoles={['admin']}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Assign Hall to Owner</h1>
            <p className="text-gray-600">
              Assign a wedding hall to {currentOwner.firstName} {currentOwner.lastName}
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Owner Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p>{currentOwner.firstName} {currentOwner.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p>{currentOwner.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Halls</p>
                <p>{currentOwner.halls?.length || 0}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="hallId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Hall to Assign</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a hall" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableHalls.length > 0 ? (
                              availableHalls.map((hall) => (
                                <SelectItem key={hall.id} value={hall.id}>
                                  {hall.name} ({hall.district})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No available halls to assign
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {availableHalls.length === 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            There are no available halls to assign. All halls already have owners.
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || availableHalls.length === 0}
                    >
                      {isSubmitting ? 'Assigning...' : 'Assign Hall'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AssignHall;
