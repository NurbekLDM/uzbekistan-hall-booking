import { ReactNode, useEffect, useState } from 'react';
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
  const { isAuthenticated, user, checkAuth, checkingAuth, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication on component mount
    const verifyAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return; 

    if (requireAuth) {
      if (!isAuthenticated && !checkingAuth && !isLoading) {
        navigate('/login');
        return;
      }

      if (
        isAuthenticated &&
        allowedRoles.length > 0 &&
        user &&
        !allowedRoles.includes(user.role)
      ) {
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/');
        }
      }
    }
  }, [authChecked, requireAuth, isAuthenticated, allowedRoles, user, checkingAuth, isLoading, navigate]);

  // Show loading indicator while checking auth
  if ((requireAuth && !authChecked) || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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

