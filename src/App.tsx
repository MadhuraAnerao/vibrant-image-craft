
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import UserHomePage from "./pages/UserHomePage";
import AdminDashboard from "./pages/AdminDashboard";
import PhotoEditor from "./pages/PhotoEditor";
import CameraPage from "./pages/Camera";
import ImageVault from "./pages/ImageVault";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  element, 
  requiredRole = null
}: { 
  element: React.ReactNode; 
  requiredRole?: 'admin' | 'user' | null;
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? "/admin" : "/"} replace />;
  }

  return <>{element}</>;
};

// Shared image route component
const SharedImageRoute = () => {
  const [searchParams] = useSearchParams();
  const imageId = searchParams.get('image');
  
  // If we have an image parameter, redirect to editor with that image
  if (imageId) {
    return <Navigate to={`/editor?shared=${imageId}`} replace />;
  }
  
  return <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute element={<UserHomePage />} requiredRole="user" />} />
            <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
            <Route path="/editor" element={<ProtectedRoute element={<PhotoEditor />} />} />
            <Route path="/camera" element={<ProtectedRoute element={<CameraPage />} />} />
            <Route path="/vault" element={<ProtectedRoute element={<ImageVault />} />} />
            <Route path="/shared-image/:id" element={<SharedImageRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
