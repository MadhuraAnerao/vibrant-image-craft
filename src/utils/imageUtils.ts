
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toBlob } from 'html-to-image';

// Take a photo with the device camera
export const takePhoto = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    
    return image.webPath || null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

// Select a photo from the device gallery
export const selectFromGallery = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });
    
    return image.webPath || null;
  } catch (error) {
    console.error('Error selecting from gallery:', error);
    return null;
  }
};

// Save an image to the device gallery
export const saveToGallery = async (element: HTMLElement): Promise<boolean> => {
  try {
    // Convert the DOM element to a blob
    const blob = await toBlob(element);
    if (!blob) {
      throw new Error('Failed to convert element to blob');
    }

    // Convert blob to base64
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        // Save the file to the filesystem
        const fileName = `photo_edit_${Date.now()}.jpeg`;
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data.split(',')[1], // Remove the data URL prefix
          directory: Directory.Cache
        });

        // Save to gallery
        await Filesystem.getUri({
          directory: Directory.Cache,
          path: fileName
        });

        // In a real app, you would move the file to the gallery
        // This is a mock implementation
        console.log('Image saved:', savedFile);
        
        resolve(true);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error saving image:', error);
    return false;
  }
};

// Fetch random images from an API
export const fetchRandomImages = async (count: number = 10): Promise<string[]> => {
  try {
    // For demo purposes, we'll use some placeholder URLs
    // In a real app, you would fetch from an actual API
    const placeholderImages = [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MTEzNDYxOA&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzI0OQ&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzMwMQ&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzI5NQ&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzI5Ng&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzMwMg&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzMwNA&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzMwNQ&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzMwNg&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxNzM5MzMwNw&ixlib=rb-4.0.3&q=80&w=1080'
    ];
    
    // Return a random selection of images
    return placeholderImages.slice(0, count);
  } catch (error) {
    console.error('Error fetching random images:', error);
    return [];
  }
};

// Get available filters
export const getAvailableFilters = () => {
  return [
    { name: 'Normal', class: '' },
    { name: 'Grayscale', class: 'filter-grayscale' },
    { name: 'Sepia', class: 'filter-sepia' },
    { name: 'Invert', class: 'filter-invert' },
    { name: 'Hue Rotate', class: 'filter-hue-rotate' },
    { name: 'Saturate', class: 'filter-saturate' }
  ];
};

// Get available stickers
export const getAvailableStickers = () => {
  return [
    { 
      id: 'sticker-1', 
      url: 'https://cdn-icons-png.flaticon.com/512/742/742751.png', 
      name: 'Heart' 
    },
    { 
      id: 'sticker-2', 
      url: 'https://cdn-icons-png.flaticon.com/512/742/742920.png', 
      name: 'Star' 
    },
    { 
      id: 'sticker-3', 
      url: 'https://cdn-icons-png.flaticon.com/512/742/742822.png', 
      name: 'Smile' 
    },
    { 
      id: 'sticker-4', 
      url: 'https://cdn-icons-png.flaticon.com/512/742/742808.png', 
      name: 'Sunglasses' 
    },
    { 
      id: 'sticker-5', 
      url: 'https://cdn-icons-png.flaticon.com/512/742/742850.png', 
      name: 'Crown' 
    }
  ];
};
