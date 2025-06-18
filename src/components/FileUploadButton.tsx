'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  className?: string;
  disabled?: boolean;
}

export function FileUploadButton({ onFileSelect, className, disabled }: FileUploadButtonProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <Button onClick={handleButtonClick} className={className} disabled={disabled}>
        <UploadCloud className="mr-2 h-5 w-5" />
        Upload Image
      </Button>
    </>
  );
}
