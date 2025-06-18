import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, Loader2 } from 'lucide-react';

interface ImageDisplayProps {
  imageUri: string | null;
  isLoading: boolean;
  altText?: string;
}

export function ImageDisplay({ imageUri, isLoading, altText = "Processed image" }: ImageDisplayProps) {
  return (
    <Card className="aspect-square w-full shadow-lg overflow-hidden">
      <CardContent className="p-2 h-full">
        <div className="relative w-full h-full flex items-center justify-center bg-muted/30 rounded-md">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-2" />
              <p className="text-primary-foreground font-medium">Processing...</p>
            </div>
          )}
          {imageUri && !isLoading ? (
            // Using <img> for data URIs as next/image can be tricky with them for frequent updates
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUri}
              alt={altText}
              className="object-contain w-full h-full max-w-full max-h-full"
            />
          ) : (
            !isLoading && (
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="w-16 h-16 mb-2" />
                <p>Upload an image to get started</p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
