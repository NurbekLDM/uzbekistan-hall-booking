
import { useEffect } from 'react';
import HallCard from '@/components/halls/HallCard';
import { HallFilters } from '@/components/halls/HallFilters';
import MainLayout from '@/components/layout/MainLayout';
import useHallsStore from '@/store/hallsStore';

const HallsPage = () => {
  const { halls, filteredHalls, isLoading, fetchHalls, filterHalls, resetFilters } = useHallsStore();

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);


  useEffect(() => {
    if (halls.length > 0) {
      filterHalls({});
    }
  }, [halls, filterHalls]);

  const handleFilter = (filters: any) => {

    filterHalls({ ...filters, approved: true });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-8">
          Wedding Venues in Tashkent
        </h1>
        
        <div className="mb-8">
          <HallFilters 
            onFilter={handleFilter} 
            onReset={() => {
              resetFilters();
              filterHalls({ approved: true });
            }} 
            showApprovalFilter={false}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading venues...</p>
          </div>
        ) : filteredHalls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHalls.map((hall) => (
              <HallCard key={hall.id} hall={hall} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-xl font-medium mb-2">No venues found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or try again later
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HallsPage;
