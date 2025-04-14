import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  RotateCw,
  Crop,
  Palette,
  Type,
  Sticker,
  Save,
  ArrowLeft,
  Search,
  Camera as CameraIcon,
  Download,
  Share,
  QrCode
} from 'lucide-react';
import { ImageFilter } from '@/types/editor';
import { saveToGallery } from '@/utils/imageUtils';
import { searchImages, saveSearchQuery } from '@/services/imageSearchService';
import TiltControl from '@/components/TiltControl';
import QRShareDialog from '@/components/QRShareDialog';

// Image filters
const filters: ImageFilter[] = [
  { name: 'None', class: '' },
  { name: 'Grayscale', class: 'filter-grayscale' },
  { name: 'Sepia', class: 'filter-sepia' },
  { name: 'Invert', class: 'filter-invert' },
  { name: 'Saturate', class: 'filter-saturate' },
  { name: 'Hue-Rotate', class: 'filter-hue-rotate' }
];

const PhotoEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  
  // State for image source and editing
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);
  const [tilt, setTilt] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{id: string, url: string, title: string}>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('filter');
  const [text, setText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [showQrDialog, setShowQrDialog] = useState<boolean>(false);
  const [currentImageId, setCurrentImageId] = useState<string>('');

  // Get source and imageUrl from navigation state
  const source = location.state?.source || 'gallery';
  const initialImageUrl = location.state?.imageUrl;

  useEffect(() => {
    // If imageUrl is passed through state, use that
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
      setCurrentImageId(`image-${Date.now()}`);
      return;
    }

    // Handle different image sources based on navigation
    const handleImageSource = async () => {
      try {
        switch (source) {
          case 'camera':
            await takePicture();
            break;
          case 'gallery':
            await selectFromGallery();
            break;
          case 'search':
            // Don't do anything yet, user will search manually
            break;
          case 'vault':
            // Image should have been passed via state
            if (!initialImageUrl) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "No image provided from vault",
              });
            }
            break;
          default:
            toast({
              variant: "destructive",
              title: "Error",
              description: "Unknown image source",
            });
        }
      } catch (error) {
        console.error("Error handling image source:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to access image. Please try again.",
        });
      }
    };

    handleImageSource();
  }, [source, initialImageUrl]);

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      if (image.webPath) {
        setImageUrl(image.webPath);
        setCurrentImageId(`camera-${Date.now()}`);
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

  const selectFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Photos,
        resultType: CameraResultType.Uri
      });
      
      if (image.webPath) {
        setImageUrl(image.webPath);
        setCurrentImageId(`gallery-${Date.now()}`);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      if (error instanceof Error && error.message !== 'User cancelled photos selection.') {
        toast({
          variant: "destructive",
          title: "Gallery Error",
          description: "Failed to access gallery. Please try again.",
        });
      }
    }
  };

  const searchImagesHandler = async () => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a search term",
      });
      return;
    }

    setLoading(true);
    setSearchResults([]);
    
    try {
      // Save the search query
      await saveSearchQuery(searchQuery);
      
      // Search for images
      const results = await searchImages(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search images. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectSearchImage = (image: {id: string, url: string}) => {
    setImageUrl(image.url);
    setCurrentImageId(image.id);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleTiltChange = (value: number) => {
    setTilt(value);
  };

  const addTextToImage = () => {
    if (!text.trim()) return;
    
    if (imageContainerRef.current) {
      const textElement = document.createElement('div');
      textElement.innerText = text;
      textElement.style.position = 'absolute';
      textElement.style.top = '50%';
      textElement.style.left = '50%';
      textElement.style.transform = 'translate(-50%, -50%)';
      textElement.style.color = textColor;
      textElement.style.fontSize = '24px';
      textElement.style.fontWeight = 'bold';
      textElement.style.textShadow = '1px 1px 2px black';
      textElement.style.cursor = 'move';
      textElement.style.userSelect = 'none';
      
      // Make text draggable
      textElement.addEventListener('mousedown', (e) => {
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = textElement.offsetLeft;
        const startTop = textElement.offsetTop;
        
        const mouseMoveHandler = (e: MouseEvent) => {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          textElement.style.left = `${startLeft + dx}px`;
          textElement.style.top = `${startTop + dy}px`;
        };
        
        const mouseUpHandler = () => {
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      });
      
      imageContainerRef.current.appendChild(textElement);
      setText('');
      if (textInputRef.current) {
        textInputRef.current.value = '';
      }
    }
  };

  const saveImage = async () => {
    if (!imageUrl) {
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
            description: "Your edited image has been saved to your gallery",
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

  const downloadImage = async () => {
    if (!imageUrl || !imageContainerRef.current) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No image to download",
      });
      return;
    }

    try {
      // Create a canvas to capture the image with all edits
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }
      
      // Create a temporary image to draw on canvas
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply rotation if needed
        if (rotation !== 0 || tilt !== 0) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.rotate((tilt * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0);
        }
        
        // Apply filter effects
        if (activeFilter) {
          // Apply CSS filters to canvas
          switch (activeFilter) {
            case 'filter-grayscale':
              applyGrayscale(ctx, canvas);
              break;
            case 'filter-sepia':
              applySepia(ctx, canvas);
              break;
            case 'filter-invert':
              applyInvert(ctx, canvas);
              break;
            case 'filter-saturate':
              applySaturate(ctx, canvas);
              break;
            case 'filter-hue-rotate':
              applyHueRotate(ctx, canvas);
              break;
          }
        }
        
        // Convert to data URL and trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        
        toast({
          title: "Image Downloaded",
          description: "Your edited image has been downloaded",
        });
      };
      
      img.onerror = () => {
        toast({
          variant: "destructive",
          title: "Download Error",
          description: "Failed to process image for download. Try saving instead.",
        });
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Error",
        description: "Failed to download image. Please try again.",
      });
    }
  };
  
  // Filter functions for canvas
  const applyGrayscale = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
  };
  
  const applySepia = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
    ctx.putImageData(imageData, 0, 0);
  };
  
  const applyInvert = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
  };
  
  const applySaturate = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const saturationFactor = 1.5; // Increase saturation by 50%
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to HSL, adjust saturation, convert back to RGB
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          default: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
      }
      
      // Adjust saturation
      s = Math.min(1, s * saturationFactor);
      
      // Convert back to RGB
      let r1, g1, b1;
      
      if (s === 0) {
        r1 = g1 = b1 = l; // achromatic
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r1 = hue2rgb(p, q, h + 1/3);
        g1 = hue2rgb(p, q, h);
        b1 = hue2rgb(p, q, h - 1/3);
      }
      
      // Convert back to 0-255 range
      data[i] = Math.round(r1 * 255);
      data[i + 1] = Math.round(g1 * 255);
      data[i + 2] = Math.round(b1 * 255);
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  const applyHueRotate = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const hueRotation = 60; // 60 degrees hue rotation
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to HSL, adjust hue, convert back to RGB
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          default: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
      }
      
      // Adjust hue (rotate)
      h = (h + hueRotation / 360) % 1;
      
      // Convert back to RGB
      let r1, g1, b1;
      
      if (s === 0) {
        r1 = g1 = b1 = l; // achromatic
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r1 = hue2rgb(p, q, h + 1/3);
        g1 = hue2rgb(p, q, h);
        b1 = hue2rgb(p, q, h - 1/3);
      }
      
      // Convert back to 0-255 range
      data[i] = Math.round(r1 * 255);
      data[i + 1] = Math.round(g1 * 255);
      data[i + 2] = Math.round(b1 * 255);
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const openShareDialog = () => {
    if (!imageUrl || !currentImageId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No image to share",
      });
      return;
    }
    setShowQrDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-editor-dark to-gray-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-editor-primary-purple">Photo Editor</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadImage}
              disabled={!imageUrl}
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={saveImage}
              disabled={!imageUrl}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
        
        {!imageUrl && source === 'search' && (
          <div className="flex flex-col items-center justify-center py-10">
            <h2 className="text-xl font-bold mb-4">Search for Images</h2>
            <div className="flex w-full max-w-md mb-6">
              <Input
                type="text"
                placeholder="Search for images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 mr-2"
                onKeyPress={(e) => e.key === 'Enter' && searchImagesHandler()}
              />
              <Button onClick={searchImagesHandler} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {loading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-editor-primary-purple"></div>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {searchResults.map((image) => (
                  <div 
                    key={image.id} 
                    className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-editor-primary-purple cursor-pointer"
                    onClick={() => selectSearchImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.title || `Search result`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {imageUrl ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 rounded-lg p-4 mb-4 lg:mb-0">
              <div 
                ref={imageContainerRef} 
                className="relative w-full h-64 sm:h-96 flex items-center justify-center"
              >
                <img
                  src={imageUrl}
                  alt="Editing image"
                  className={`max-h-full max-w-full object-contain ${activeFilter}`}
                  style={{ 
                    transform: `rotate(${rotation}deg) rotate3d(1, 0, 0, ${tilt}deg)` 
                  }}
                />
              </div>
              
              <div className="flex mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openShareDialog} 
                  disabled={!imageUrl}
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  Share via QR
                </Button>
              </div>
            </div>
            
            <div className="w-full lg:w-80 bg-editor-dark rounded-lg p-4">
              <Tabs 
                defaultValue="filter" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="filter">
                    <Palette className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Filters</span>
                  </TabsTrigger>
                  <TabsTrigger value="rotate">
                    <RotateCw className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Rotate</span>
                  </TabsTrigger>
                  <TabsTrigger value="tilt">
                    <RotateCw className="h-4 w-4 mr-1 transform rotate-90" />
                    <span className="hidden sm:inline">Tilt</span>
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Type className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="stickers">
                    <Sticker className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Stickers</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="filter" className="space-y-4">
                  <h3 className="font-medium">Choose a filter</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {filters.map((filter) => (
                      <Button
                        key={filter.name}
                        variant={activeFilter === filter.class ? "default" : "outline"}
                        onClick={() => setActiveFilter(filter.class)}
                        className="h-12"
                      >
                        {filter.name}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="rotate" className="space-y-4">
                  <h3 className="font-medium">Rotate image</h3>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Button onClick={rotateImage} className="w-20 h-20 rounded-full">
                      <RotateCw size={32} />
                    </Button>
                    <div className="text-sm">{rotation}°</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tilt" className="space-y-4">
                  <TiltControl onChange={handleTiltChange} />
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <h3 className="font-medium">Add Text</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text">Text Content</Label>
                      <Input
                        id="text"
                        ref={textInputRef}
                        type="text"
                        placeholder="Enter your text"
                        onChange={(e) => setText(e.target.value)}
                        className="bg-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Text Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-10 h-10 rounded"
                        />
                        <span className="text-sm">{textColor}</span>
                      </div>
                    </div>
                    <Button onClick={addTextToImage} className="w-full">
                      Add Text
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="stickers" className="space-y-4">
                  <h3 className="font-medium">Add Stickers</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Button key={num} variant="outline" className="h-12 aspect-square">
                        {num}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">Sticker functionality would be implemented with actual sticker images in a real app.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          source !== 'search' && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-300 mb-6">No image selected</p>
              <div className="space-x-4">
                <Button onClick={takePicture}>
                  <CameraIcon className="w-5 h-5 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" onClick={selectFromGallery}>
                  <Search className="w-5 h-5 mr-2" />
                  Select from Gallery
                </Button>
              </div>
            </div>
          )
        )}
      </div>
      
      {/* QR Code Share Dialog */}
      <QRShareDialog 
        isOpen={showQrDialog}
        imageId={currentImageId}
        onClose={() => setShowQrDialog(false)}
      />
    </div>
  );
};

export default PhotoEditor;
