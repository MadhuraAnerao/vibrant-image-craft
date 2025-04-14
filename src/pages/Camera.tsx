
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, Save, ArrowLeft, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { saveToGallery } from '@/utils/imageUtils';

const CameraPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      if (image.webPath) {
        setCapturedImage(image.webPath);
        toast({
          title: "Success",
          description: "Photo captured successfully!",
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      if (error instanceof Error && error.message !== 'User cancelled photo capture.') {
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Failed to access camera. Please try again.",
        });
      }
    }
  };

  const saveImage = async () => {
    if (!capturedImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No image to save",
      });
      return;
    }

    try {
      if (imageContainerRef.current) {
        const success = await saveToGallery(imageContainerRef.current);
        if (success) {
          toast({
            title: "Image Saved",
            description: "Your image has been saved to your gallery",
          });
        } else {
          throw new Error("Failed to save image");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save image. Please try again.",
      });
    }
  };

  const editImage = () => {
    if (capturedImage) {
      navigate('/editor', { state: { source: 'camera', imageUrl: capturedImage } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-editor-dark to-gray-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-editor-primary-purple">Camera</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <div className="flex flex-col items-center justify-center py-10">
          {capturedImage ? (
            <div className="flex flex-col items-center">
              <div 
                ref={imageContainerRef} 
                className="relative w-full max-w-md h-64 sm:h-96 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden mb-4"
              >
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <Button onClick={() => setCapturedImage(null)}>
                  <CameraIcon className="w-5 h-5 mr-2" />
                  New Photo
                </Button>
                <Button onClick={saveImage} variant="secondary">
                  <Save className="w-5 h-5 mr-2" />
                  Save
                </Button>
                <Button onClick={editImage} variant="outline">
                  <Share className="w-5 h-5 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 rounded-lg w-full max-w-md h-64 sm:h-96 flex items-center justify-center mb-6">
                <CameraIcon className="w-16 h-16 text-gray-600" />
              </div>
              <Button onClick={takePicture} size="lg">
                <CameraIcon className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraPage;
