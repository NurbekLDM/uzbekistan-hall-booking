
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page imports
import HomePage from "./pages/HomePage";
import HallsPage from "./pages/HallsPage";
import HallDetailsPage from "./pages/HallDetailsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User pages
import UserDashboard from "./pages/user/Dashboard";

// Owner pages
import OwnerDashboard from "./pages/owner/Dashboard";
import CreateHall from "./pages/owner/CreateHall";
import EditHall from "./pages/owner/EditHall";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import HallsManagement from "./pages/admin/HallsManagement";
import BookingsManagement from "./pages/admin/BookingsManagement";
import OwnersManagement from "./pages/admin/OwnersManagement";
import CreateOwner from "./pages/admin/CreateOwner";
import AssignHall from "./pages/admin/AssignHall";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/halls" element={<HallsPage />} />
          <Route path="/halls/:id" element={<HallDetailsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User routes */}
          <Route path="/user/dashboard" element={<UserDashboard />} />
          
          {/* Owner routes */}
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/halls/new" element={<CreateHall />} />
          <Route path="/owner/halls/:id/edit" element={<EditHall />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/halls" element={<HallsManagement />} />
          <Route path="/admin/halls/new" element={<CreateHall />} />
          <Route path="/admin/halls/:id/edit" element={<EditHall />} />
          <Route path="/admin/bookings" element={<BookingsManagement />} />
          <Route path="/admin/owners" element={<OwnersManagement />} />
          <Route path="/admin/owners/new" element={<CreateOwner />} />
          <Route path="/admin/owners/:id/assign" element={<AssignHall />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
