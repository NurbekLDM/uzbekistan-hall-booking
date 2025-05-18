
import { useNavigate } from 'react-router-dom';
import  HallForm  from '@/components/halls/HallForm'
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useHallsStore from '@/store/hallsStore';
import { toast } from 'sonner';

const CreateHall = () => {
  const { createHall, isLoading } = useHallsStore();
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    try {
      await createHall(formData);
      toast.success('Hall registered successfully! Awaiting admin approval.');
      navigate('/owner/dashboard');
    } catch (error) {
      toast.error('Failed to register hall');
      console.error(error);
    }
  };

  return (
    <MainLayout requireAuth={true} allowedRoles={['owner']}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Register a New Hall</h1>
            <p className="text-gray-600">
              Provide details about your wedding hall
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <HallForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateHall;
