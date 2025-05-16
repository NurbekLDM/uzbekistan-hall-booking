
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'owner':
        return '/owner/dashboard';
      case 'user':
      default:
        return '/user/dashboard';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container flex justify-between items-center py-4">
        <Link 
          to="/"
          className="flex items-center gap-2 font-serif"
        >
          <span className="text-2xl font-bold text-gray-900">Wedding</span>
          <span className="text-2xl font-bold text-gold">Halls</span>
        </Link>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={toggleNav}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/halls" className="text-gray-700 hover:text-gold transition-colors">
            Browse Halls
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="text-gray-700 hover:text-gold transition-colors">
                Dashboard
              </Link>
              <Button onClick={handleLogout} variant="outline" className="ml-4">
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md md:hidden z-50">
            <div className="flex flex-col p-4 gap-4">
              <Link 
                to="/halls"
                className="text-gray-700 hover:text-gold transition-colors py-2 border-b"
                onClick={() => setIsOpen(false)}
              >
                Browse Halls
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to={getDashboardLink()}
                    className="text-gray-700 hover:text-gold transition-colors py-2 border-b"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="mt-2"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    asChild 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button 
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
