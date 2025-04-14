import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import BiometricAuth from '@/components/BiometricAuth';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';

// Dialog components for authentication
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VaultImage {
  id: string;
  src: string;
  date: string;
}

const ImageVault = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(true);
  const [vaultImages, setVaultImages] = useState<VaultImage[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  useEffect(() => {
    // Load vault images if authenticated
    if (isAuthenticated) {
      loadVaultImages();
    }
  }, [isAuthenticated]);

  const loadVaultImages = async () => {
    try {
      // In a real app, load images from secure storage
      const { value } = await Preferences.get({ key: 'vaultImages' });
      if (value) {
        setVaultImages(JSON.parse(value));
      }
    } catch (error) {
      console.error("Error loading vault images:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vault images",
      });
    }
  };

  const saveVaultImages = async (images: VaultImage[]) => {
    try {
      await Preferences.set({
        key: 'vaultImages',
        value: JSON.stringify(images),
      });
    } catch (error) {
      console.error("Error saving vault images:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save to vault",
      });
    }
  };

  const addImageToVault = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      if (image.webPath) {
        const newImage: VaultImage = {
          id: `vault-${Date.now()}`,
          src: image.webPath,
          date: new Date().toISOString(),
        };
        
        const updatedImages = [...vaultImages, newImage];
        setVaultImages(updatedImages);
        await saveVaultImages(updatedImages);
        
        toast({
          title: "Success",
          description: "Image added to vault",
        });
      }
    } catch (error) {
      console.error("Error adding image to vault:", error);
      if (error instanceof Error && error.message !== 'User cancelled photos selection.') {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add image to vault",
        });
      }
    }
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImageIds(prev => 
      prev.includes(id) 
        ? prev.filter(imageId => imageId !== id) 
        : [...prev, id]
    );
  };

  const deleteSelectedImages = async () => {
    if (selectedImageIds.length === 0) return;
    
    const updatedImages = vaultImages.filter(
      image => !selectedImageIds.includes(image.id)
    );
    
    setVaultImages(updatedImages);
    setSelectedImageIds([]);
    await saveVaultImages(updatedImages);
    
    toast({
      title: "Success",
      description: `${selectedImageIds.length} image(s) removed from vault`,
    });
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthDialog(false);
  };

  const handleAuthError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: error,
    });
  };

  // Show image details or options
  const viewImage = (image: VaultImage) => {
    if (selectedImageIds.length > 0) {
      // In selection mode, toggle selection
      toggleImageSelection(image.id);
    } else {
      // Otherwise view the image
      navigate('/editor', { state: { source: 'vault', imageUrl: image.src } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-editor-dark to-gray-900 text-white">
      <Dialog open={showAuthDialog && !isAuthenticated} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Authenticate to Access Vault</DialogTitle>
          </DialogHeader>
          <BiometricAuth 
            onSuccess={handleAuthSuccess} 
            onError={handleAuthError} 
          />
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-editor-primary-purple flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Secure Vault
          </h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {isAuthenticated ? (
          <>
            <div className="flex justify-between mb-4">
              <Button onClick={addImageToVault}>
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              {selectedImageIds.length > 0 && (
                <Button variant="destructive" onClick={deleteSelectedImages}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedImageIds.length})
                </Button>
              )}
            </div>

            {vaultImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Lock className="w-16 h-16 mb-4" />
                <p className="text-xl mb-2">Your vault is empty</p>
                <p className="text-sm">Add images to keep them private</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vaultImages.map(image => (
                  <div 
                    key={image.id} 
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
                      selectedImageIds.includes(image.id) ? 'ring-2 ring-editor-primary-purple' : ''
                    }`}
                    onClick={() => viewImage(image)}
                  >
                    <img 
                      src={image.src} 
                      alt="Vault" 
                      className="w-full h-full object-cover"
                    />
                    {selectedImageIds.includes(image.id) && (
                      <div className="absolute inset-0 bg-editor-primary-purple/30 flex items-center justify-center">
                        <div className="bg-editor-primary-purple w-6 h-6 rounded-full flex items-center justify-center">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Lock className="w-16 h-16 mb-4" />
            <p className="text-xl mb-2">Authentication Required</p>
            <p className="text-sm mb-4">Please verify your identity to access the vault</p>
            <Button onClick={() => setShowAuthDialog(true)}>
              Authenticate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageVault;
