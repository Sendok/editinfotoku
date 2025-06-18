import type { ResizeFitMode } from '@/types';

export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function resizeImage(
  imageDataUri: string,
  targetWidth: number,
  targetHeight: number,
  fitMode: ResizeFitMode = 'contain',
  backgroundColor: string = '#FFFFFF' // Default to white for 'contain' mode
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const hRatio = targetWidth / img.width;
      const vRatio = targetHeight / img.height;
      
      let ratio: number;
      if (fitMode === 'cover') {
        ratio = Math.max(hRatio, vRatio);
      } else { // 'contain'
        ratio = Math.min(hRatio, vRatio);
      }

      const centerShiftX = (targetWidth - img.width * ratio) / 2;
      const centerShiftY = (targetHeight - img.height * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShiftX,
        centerShiftY,
        img.width * ratio,
        img.height * ratio
      );

      resolve(canvas.toDataURL('image/png')); // Output as PNG to preserve transparency if any
    };
    img.onerror = reject;
    img.src = imageDataUri;
  });
}

export function downloadImage(dataUri: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
