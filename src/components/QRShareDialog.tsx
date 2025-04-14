
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateQRCode, createShareableUrl } from '@/utils/qrCodeUtils';
import { Copy, Download, Link } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QRShareDialogProps {
  isOpen: boolean;
  imageId: string;
  onClose: () => void;
}

const QRShareDialog = ({ isOpen, imageId, onClose }: QRShareDialogProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && imageId) {
      generateQR();
    }
  }, [isOpen, imageId]);

  const generateQR = async () => {
    try {
      setLoading(true);
      const url = createShareableUrl(imageId);
      setShareableUrl(url);
      
      const qrCode = await generateQRCode(url);
      setQrCodeUrl(qrCode);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link",
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-share-${imageId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Image</DialogTitle>
          <DialogDescription>
            Scan this QR code to view the image on another device
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-editor-primary-purple"></div>
          </div>
        ) : qrCodeUrl ? (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            <div className="w-full flex flex-col space-y-2">
              <div className="flex w-full items-center space-x-2">
                <input 
                  type="text" 
                  value={shareableUrl} 
                  readOnly
                  className="flex-1 py-2 px-3 rounded bg-gray-100 text-sm text-gray-800"
                />
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={downloadQRCode}
                  className="flex-1 mr-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
                <Button 
                  variant="default" 
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4">Failed to generate QR code</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QRShareDialog;
