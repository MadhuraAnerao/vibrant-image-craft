
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateQRCode, createShareableUrl } from '@/utils/qrCodeUtils';
import { Copy, Download, Mail, Share2, WhatsApp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

interface QRShareDialogProps {
  isOpen: boolean;
  imageId: string;
  imageUrl?: string;
  onClose: () => void;
}

const QRShareDialog = ({ isOpen, imageId, imageUrl, onClose }: QRShareDialogProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('qr');
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

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Check out this image: ' + shareableUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out this image');
    const body = encodeURIComponent(`I wanted to share this image with you: ${shareableUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaNavigator = async () => {
    if (!navigator.share) {
      toast({
        variant: "destructive",
        title: "Not supported",
        description: "Web Share API is not supported on your device",
      });
      return;
    }

    try {
      await navigator.share({
        title: 'Shared Image',
        text: 'Check out this image!',
        url: shareableUrl,
      });
      toast({
        title: "Shared!",
        description: "Content shared successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to share content",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Image</DialogTitle>
          <DialogDescription>
            Share your image with others using these options
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="share">Share Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qr">
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
                  
                  <Button 
                    variant="outline" 
                    onClick={downloadQRCode}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center py-4">Failed to generate QR code</p>
            )}
          </TabsContent>
          
          <TabsContent value="share">
            <div className="py-4">
              {imageUrl && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-40 rounded-md object-contain"
                  />
                </div>
              )}
              
              <Label className="mb-2 block">Share via:</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" onClick={shareViaWhatsApp} className="flex items-center justify-center">
                  <WhatsApp className="h-4 w-4 mr-2 text-green-500" />
                  WhatsApp
                </Button>
                
                <Button variant="outline" onClick={shareViaEmail} className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  Email
                </Button>
                
                <Button onClick={copyToClipboard} className="flex items-center justify-center">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                
                <Button onClick={shareViaNavigator} className="flex items-center justify-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default QRShareDialog;
