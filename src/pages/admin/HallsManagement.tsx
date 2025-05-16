
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HallFilters } from '@/components/halls/HallFilters';
import MainLayout from '@/components/layout/MainLayout';
import useHallsStore from '@/store/hallsStore';
import { toast } from 'sonner';

const HallsManagement = () => {
  const { 
    halls, 
    filteredHalls, 
    isLoading, 
    fetchHalls, 
    setFilters, 
    resetFilters,
    approveHall,
    deleteHall
  } = useHallsStore();

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  const handleApprove = async (id: string) => {
    try {
      await approveHall(id);
      toast.success('Hall approved successfully!');
    } catch (error) {
      toast.error('Failed to approve hall');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hall? This action cannot be undone.')) {
      try {
        await deleteHall(id);
        toast.success('Hall deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete hall');
      }
    }
  };

  return (
    <MainLayout requireAuth={true} allowedRoles={['admin']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              Halls Management
            </h1>
            <p className="text-gray-600">
              View, approve, edit or remove wedding halls
            </p>
          </div>

          <Button asChild>
            <Link to="/admin/halls/new">Add New Hall</Link>
          </Button>
        </div>

        <div className="mb-8">
          <HallFilters 
            onFilter={setFilters} 
            onReset={resetFilters} 
            showApprovalFilter={true}
          />
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading halls...</p>
              </div>
            ) : filteredHalls.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price per Seat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHalls.map((hall) => (
                    <tr key={hall.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/admin/halls/${hall.id}`} className="text-blue-600 hover:text-blue-900">
                          {hall.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hall.district}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hall.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${hall.pricePerSeat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hall.approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {hall.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hall.owner ? (
                          `${hall.owner.firstName} ${hall.owner.lastName}`
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {!hall.approved && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApprove(hall.id)}
                            >
                              Approve
                            </Button>
                          )}
                          <Button 
                            asChild
                            variant="outline" 
                            size="sm"
                          >
                            <Link to={`/admin/halls/${hall.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(hall.id)}
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
                <p>No halls found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HallsManagement;
