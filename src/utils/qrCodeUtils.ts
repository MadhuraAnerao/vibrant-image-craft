
import QRCode from 'qrcode';

/**
 * Generate a QR code from a URL or text
 * @param text The URL or text to encode in the QR code
 * @returns Promise resolving to a data URL for the QR code
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H' // High error correction for better scanning
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Create a shareable URL for an image
 * @param imageId The ID or path of the image to share
 * @returns A shareable URL
 */
export const createShareableUrl = (imageId: string): string => {
  // Create a real URL that points to the current app instead of a non-existent route
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/editor?image=${imageId}`;
  return shareUrl;
};
