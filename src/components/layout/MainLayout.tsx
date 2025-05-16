
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './Navbar';
import useAuthStore from '@/store/authStore';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const MainLayout = ({ children, requireAuth = false, allowedRoles = [] }: MainLayoutProps) => {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      
      if (requireAuth && !isAuthenticated) {
        navigate('/login');
      } else if (
        requireAuth &&
        isAuthenticated &&
        allowedRoles.length > 0 &&
        user && 
        !allowedRoles.includes(user.role)
      ) {
        // Redirect based on role if not allowed
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/');
        }
      }
    };

    init();
  }, [requireAuth, isAuthenticated, allowedRoles, user, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        {children}
      </main>
      <footer className="bg-secondary py-8 mt-12">
        <div className="container text-center">
          <p>© {new Date().getFullYear()} Wedding Hall Booking Platform</p>
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;
