
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const BiometricAuth = ({ onSuccess, onError }: BiometricAuthProps) => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the PublicKeyCredential API is available (WebAuthn)
    if (window.PublicKeyCredential) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsSupported(available);
          if (!available) {
            console.warn("Platform authenticator is not available");
          }
        })
        .catch(error => {
          console.error("Error checking authenticator availability:", error);
          setIsSupported(false);
        });
    } else {
      console.warn("WebAuthn is not supported in this browser");
      setIsSupported(false);
    }
  }, []);

  const authenticateUser = async () => {
    try {
      if (isSupported) {
        // In a real app, we would use the WebAuthn API here
        // For demo purposes, we'll simulate a successful biometric auth
        
        toast({
          title: "Biometric Authentication",
          description: "Verifying your fingerprint...",
        });

        // Simulate biometric verification delay
        setTimeout(() => {
          onSuccess();
          toast({
            title: "Authentication Successful",
            description: "Your identity has been verified",
          });
        }, 1500);
      } else {
        // Fallback for unsupported browsers
        onSuccess();
        toast({
          title: "Authentication Notice",
          description: "Biometric authentication not available, using fallback method",
        });
      }
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

  return (
    <div className="flex flex-col items-center p-6">
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button 
            onClick={() => isSupported ? authenticateUser() : setShowPopover(true)} 
            variant="outline" 
            size="lg"
            className="h-20 w-20 rounded-full mb-4 bg-gradient-to-br from-blue-400 to-indigo-600 hover:from-blue-500 hover:to-indigo-700 text-white border-0"
          >
            <Fingerprint className="h-10 w-10" />
          </Button>
        </PopoverTrigger>
        
        {!isSupported && (
          <PopoverContent className="w-80">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-amber-500">
                <AlertCircle className="h-4 w-4 mr-2" />
                <h4 className="font-medium">Not Available</h4>
              </div>
              <p className="text-sm text-gray-600">
                Biometric authentication is not available on this device. In a real app, we would provide alternative authentication methods.
              </p>
              <Button 
                onClick={() => {
                  onSuccess();
                  setShowPopover(false);
                  toast({
                    title: "Authentication Bypassed",
                    description: "Using alternative authentication method",
                  });
                }}
                className="mt-2"
              >
                Continue with Alternative Method
              </Button>
            </div>
          </PopoverContent>
        )}
      </Popover>
      
      <div className="text-center mt-2">
        <h3 className="text-lg font-medium mb-1">Fingerprint Authentication</h3>
        <p className="text-sm text-gray-500 mb-4">
          Use your fingerprint to securely access your private vault
        </p>
        {!isSupported && (
          <div className="flex items-center justify-center text-sm text-amber-600">
            <Lock className="h-4 w-4 mr-1" />
            <span>Biometrics not available on this device</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricAuth;
