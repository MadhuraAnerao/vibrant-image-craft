
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
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
  Camera as CameraIcon
} from 'lucide-react';
import { ImageFilter } from '@/types/editor';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('filter');
  const [text, setText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');

  // Get source from navigation state
  const source = location.state?.source || 'gallery';

  useEffect(() => {
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
  }, [source]);

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

  const searchImages = async () => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a search term",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call for image search
      // In a real app, you would use a real image search API like Unsplash or Pexel
      setTimeout(() => {
        // Dummy results
        const dummyResults = [
          'https://source.unsplash.com/random/300x300?sig=1&' + searchQuery,
          'https://source.unsplash.com/random/300x300?sig=2&' + searchQuery,
          'https://source.unsplash.com/random/300x300?sig=3&' + searchQuery,
          'https://source.unsplash.com/random/300x300?sig=4&' + searchQuery,
          'https://source.unsplash.com/random/300x300?sig=5&' + searchQuery,
          'https://source.unsplash.com/random/300x300?sig=6&' + searchQuery,
        ];
        setSearchResults(dummyResults);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search images. Please try again.",
      });
      setLoading(false);
    }
  };

  const selectSearchImage = (url: string) => {
    setImageUrl(url);
    setSearchResults([]);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
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

    // In a real app, you would need to capture the edited image with all modifications
    // This is a placeholder notification
    toast({
      title: "Image Saved",
      description: "Your edited image has been saved to your gallery",
    });

    // For a real implementation, you would use html-to-image to capture the DOM element
    // and then use Filesystem API to save it
    // Example:
    // const dataUrl = await htmlToImage.toPng(imageContainerRef.current);
    // const base64Data = dataUrl.split(',')[1];
    // await Filesystem.writeFile({
    //   path: `PixelCraft_${new Date().getTime()}.png`,
    //   data: base64Data,
    //   directory: Directory.Documents
    // });
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={saveImage}
            disabled={!imageUrl}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
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
              />
              <Button onClick={searchImages} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {loading && <p>Loading images...</p>}
            
            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {searchResults.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Search result ${index + 1}`}
                    className="rounded-lg cursor-pointer hover:ring-2 hover:ring-editor-primary-purple transition-all hover:scale-105"
                    onClick={() => selectSearchImage(url)}
                  />
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
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>
            </div>
            
            <div className="w-full lg:w-80 bg-editor-dark rounded-lg p-4">
              <Tabs 
                defaultValue="filter" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="filter">
                    <Palette className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Filters</span>
                  </TabsTrigger>
                  <TabsTrigger value="rotate">
                    <RotateCw className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Rotate</span>
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
    </div>
  );
};

export default PhotoEditor;
