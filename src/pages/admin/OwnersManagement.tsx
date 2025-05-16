
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useOwnersStore from '@/store/ownersStore';
import { toast } from 'sonner';

const OwnersManagement = () => {
  const { 
    owners, 
    isLoading, 
    fetchOwners,
    deleteOwner
  } = useOwnersStore();

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this owner? This action cannot be undone.')) {
      try {
        await deleteOwner(id);
        toast.success('Owner deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete owner');
      }
    }
  };

  return (
    <MainLayout requireAuth={true} allowedRoles={['admin']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              Hall Owners Management
            </h1>
            <p className="text-gray-600">
              View and manage hall owners
            </p>
          </div>

          <Button asChild>
            <Link to="/admin/owners/new">Add New Owner</Link>
          </Button>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading owners...</p>
              </div>
            ) : owners.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Halls
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {owners.map((owner) => (
                    <tr key={owner.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/admin/owners/${owner.id}`} className="text-blue-600 hover:text-blue-900">
                          {owner.firstName} {owner.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {owner.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {owner.halls?.length || 0} halls
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button 
                            asChild
                            variant="outline" 
                            size="sm"
                          >
                            <Link to={`/admin/owners/${owner.id}/assign`}>
                              Assign Hall
                            </Link>
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(owner.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p>No owners found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnersManagement;
