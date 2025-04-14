
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
  // In a real app, this would create a unique shareable link
  // For now, we'll create a dummy URL
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared-image/${imageId}`;
};
