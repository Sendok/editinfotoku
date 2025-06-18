
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDisplayProps {
  imageUri: string | null;
  isLoading: boolean;
  altText?: string;
  isDraggingOver?: boolean;
}

export function ImageDisplay({ imageUri, isLoading, altText = "Processed image", isDraggingOver }: ImageDisplayProps) {
  return (
    <Card className={cn("aspect-square w-full shadow-lg overflow-hidden transition-all", isDraggingOver && "ring-2 ring-primary ring-offset-2")}>
      <CardContent className="p-2 h-full">
        <div className="relative w-full h-full flex items-center justify-center bg-muted/30 rounded-md">
          {isDraggingOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 border-2 border-dashed border-primary rounded-md z-20 pointer-events-none">
              <UploadCloud className="w-16 h-16 text-primary" />
              <p className="mt-2 text-lg text-primary font-semibold">Drop Image Here</p>
            </div>
          )}
          {isLoading && !isDraggingOver && ( // Ensure loading indicator is not shown if dragging over
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-2" />
              <p className="text-primary-foreground font-medium">Processing...</p>
            </div>
          )}
          {imageUri && !isLoading && !isDraggingOver ? (
            // Using <img> for data URIs as next/image can be tricky with them for frequent updates
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUri}
              alt={altText}
              className="object-contain w-full h-full max-w-full max-h-full"
            />
          ) : (
            !isLoading && !isDraggingOver && (
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="w-16 h-16 mb-2" />
                <p>Upload an image to get started</p>
                <p className="text-sm mt-1">or drag & drop it here</p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
