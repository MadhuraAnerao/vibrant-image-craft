
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const BiometricAuth = ({ onSuccess, onError }: BiometricAuthProps) => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the PublicKeyCredential API is available (WebAuthn)
    if (window.PublicKeyCredential) {
      setIsSupported(true);
    } else {
      console.warn("WebAuthn is not supported in this browser");
    }
  }, []);

  const authenticateUser = async () => {
    try {
      // This is a simplified simulation of biometric auth
      // In a real app, you would use the WebAuthn API
      // For now, we'll just simulate success
      
      toast({
        title: "Authentication",
        description: "Biometric verification in progress...",
      });

      // Simulate authentication delay
      setTimeout(() => {
        onSuccess();
        toast({
          title: "Authentication Successful",
          description: "Biometric verification completed",
        });
      }, 1500);
    } catch (error) {
      console.error("Authentication error:", error);
      onError("Biometric authentication failed");
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Biometric verification could not be completed",
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500 mb-4">Biometric authentication is not available on this device.</p>
        <Button onClick={() => onSuccess()}>Continue with Password</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <Button 
        onClick={authenticateUser} 
        variant="outline" 
        size="lg"
        className="h-20 w-20 rounded-full mb-4"
      >
        <Fingerprint className="h-10 w-10" />
      </Button>
      <p className="text-center text-sm text-gray-500">
        Use biometric authentication to access your vault
      </p>
    </div>
  );
};

export default BiometricAuth;
