import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import  HallForm  from '@/components/halls/HallForm';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useHallsStore from '@/store/hallsStore';
import { toast } from 'sonner';

const EditHall = () => {
  const { id } = useParams<{ id: string }>();
  const { currentHall, isLoading, fetchHallById, updateHall } = useHallsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchHallById(id);
    }
  }, [id, fetchHallById]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;
    
    try {
      // Pass formData directly to updateHall which should be designed to accept FormData
      await updateHall(id, formData);
      toast.success('Hall updated successfully!');
      navigate('/owner/dashboard');
    } catch (error) {
      toast.error('Failed to update hall');
      console.error(error);
    }
  };

  if (isLoading || !currentHall) {
    return (
      <MainLayout requireAuth={true} allowedRoles={['owner']}>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading hall information...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth={true} allowedRoles={['owner']}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Edit Hall</h1>
            <p className="text-gray-600">
              Update information for {currentHall.name}
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <HallForm 
            initialData={currentHall}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EditHall;
