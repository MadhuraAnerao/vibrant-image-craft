
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera, Image, Search, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const UserHomePage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();

  const handleCameraClick = () => {
    // We'll implement camera functionality in the PhotoEditor page
    navigate('/editor', { state: { source: 'camera' } });
  };

  const handleGalleryClick = () => {
    // Gallery selection will be handled in the PhotoEditor page
    navigate('/editor', { state: { source: 'gallery' } });
  };

  const handleSearchClick = () => {
    // Search functionality will be handled in the PhotoEditor page
    navigate('/editor', { state: { source: 'search' } });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-editor-dark to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-editor-primary-purple">PixelCraft</h1>
          <div className="flex items-center gap-4">
            <span className="text-editor-light-purple">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Choose an Option</h2>
          <p className="text-gray-300 mb-8">Select how you'd like to edit an image</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-editor-dark border-editor-purple hover:border-editor-primary-purple transition-all hover:scale-105 cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center" onClick={handleCameraClick}>
              <div className="bg-editor-purple/20 p-5 rounded-full mb-5">
                <Camera size={40} className="text-editor-primary-purple" />
              </div>
              <h3 className="text-xl font-bold text-editor-primary-purple mb-2">Take Photo</h3>
              <p className="text-gray-300 text-center">Use your camera to capture a new photo to edit</p>
            </CardContent>
          </Card>

          <Card className="bg-editor-dark border-editor-purple hover:border-editor-primary-purple transition-all hover:scale-105 cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center" onClick={handleGalleryClick}>
              <div className="bg-editor-purple/20 p-5 rounded-full mb-5">
                <Image size={40} className="text-editor-primary-purple" />
              </div>
              <h3 className="text-xl font-bold text-editor-primary-purple mb-2">Choose Image</h3>
              <p className="text-gray-300 text-center">Select an image from your device's gallery</p>
            </CardContent>
          </Card>

          <Card className="bg-editor-dark border-editor-purple hover:border-editor-primary-purple transition-all hover:scale-105 cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center" onClick={handleSearchClick}>
              <div className="bg-editor-purple/20 p-5 rounded-full mb-5">
                <Search size={40} className="text-editor-primary-purple" />
              </div>
              <h3 className="text-xl font-bold text-editor-primary-purple mb-2">Search Image</h3>
              <p className="text-gray-300 text-center">Search and use images from online sources</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserHomePage;
