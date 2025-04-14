
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2ccaea4c857b400d9e098161f4ec2fad',
  appName: 'vibrant-image-craft',
  webDir: 'dist',
  server: {
    url: 'https://2ccaea4c-857b-400d-9e09-8161f4ec2fad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    }
  }
};

export default config;
