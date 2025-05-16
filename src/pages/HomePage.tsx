import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HallCard from '@/components/halls/HallCard';
import { HallFilters } from '@/components/halls/HallFilters';
import MainLayout from '@/components/layout/MainLayout';
import useHallsStore from '@/store/hallsStore';

const HomePage = () => {
  const { halls, filteredHalls, isLoading, fetchHalls, filterHalls } = useHallsStore();
  const [featuredHalls, setFeaturedHalls] = useState([]);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  // Filter for only approved halls
  useEffect(() => {
    if (halls.length > 0) {
      filterHalls({ approved: true });
    }
  }, [halls, filterHalls]);

  return (
    <MainLayout>
      <section className="mb-16">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Find and Book the Perfect Wedding Venue in Tashkent
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Browse, compare and book the best wedding halls for your special day
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/halls">Browse All Venues</Link>
          </Button>
        </div>
      </section>
      
      <section className="mb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Browse</h3>
              <p className="text-gray-600">
                Search through our selection of premium wedding venues in Tashkent
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Compare</h3>
              <p className="text-gray-600">
                Compare venues by price, capacity, and location
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Book</h3>
              <p className="text-gray-600">
                Reserve your preferred date without visiting in-person
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold">Popular Venues</h2>
            <Button asChild variant="outline">
              <Link to="/halls">View All</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading venues...</p>
            ) : filteredHalls.length > 0 ? (
              filteredHalls.slice(0, 3).map((hall) => (
                <HallCard key={hall.id} hall={hall} />
              ))
            ) : (
              <p>No venues found.</p>
            )}
          </div>
        </div>
      </section>
      
      <section className="bg-primary/5 py-16 -mx-4 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-4">
                Are You a Wedding Hall Owner?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                List your venue on our platform to reach more customers and manage your bookings online.
              </p>
              <Button asChild size="lg">
                <Link to="/login">Get Started</Link>
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Benefits for Hall Owners</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-gold">✓</span>
                  <span>Reach more potential customers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gold">✓</span>
                  <span>Manage bookings digitally</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gold">✓</span>
                  <span>Showcase your venue with beautiful photos</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gold">✓</span>
                  <span>Handle booking conflicts automatically</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gold">✓</span>
                  <span>Increase your venue's visibility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
