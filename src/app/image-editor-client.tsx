'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri, resizeImage, downloadImage } from '@/lib/imageUtils';
import { processImageWithAI } from '@/app/actions';
import type { ResizePreset, ResizeFitMode } from '@/types';
import { ImageDisplay } from '@/components/ImageDisplay';
import { FileUploadButton } from '@/components/FileUploadButton';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { PremiumFeatureLock } from '@/components/PremiumFeatureLock';
import { Wand2, Trash2, Download, ShoppingCart, ShoppingBag, Instagram, Loader2, RefreshCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const PRESETS: Record<string, ResizePreset> = {
  tokopedia: { id: 'tokopedia', name: 'Tokopedia', width: 800, height: 800, icon: ShoppingCart, aspectRatio: '1:1' },
  shopee: { id: 'shopee', name: 'Shopee', width: 1024, height: 1024, icon: ShoppingBag, aspectRatio: '1:1' },
  instagram_post: { id: 'instagram_post', name: 'Instagram Post', width: 1080, height: 1080, icon: Instagram, aspectRatio: '1:1' },
  instagram_story: { id: 'instagram_story', name: 'Instagram Story', width: 1080, height: 1920, icon: Instagram, aspectRatio: '9:16' },
};

export default function ImageEditorClient() {
  const [originalImageFile, setOriginalImageFile] = React.useState<File | null>(null);
  const [originalImageUri, setOriginalImageUri] = React.useState<string | null>(null);
  const [processedImageUri, setProcessedImageUri] = React.useState<string | null>(null); // After BG removal or generation
  const [finalImageUri, setFinalImageUri] = React.useState<string | null>(null); // After resizing

  const [isLoadingAi, setIsLoadingAi] = React.useState(false);
  const [isLoadingResize, setIsLoadingResize] = React.useState(false);
  
  const [customBgPrompt, setCustomBgPrompt] = React.useState('');
  const [selectedPresetKey, setSelectedPresetKey] = React.useState<string | null>(null);
  const [resizeFitMode, setResizeFitMode] = React.useState<ResizeFitMode>('contain');

  const { toast } = useToast();

  const activeImageForDisplay = finalImageUri || processedImageUri || originalImageUri;
  const activeImageForProcessing = processedImageUri || originalImageUri; // Image used for resizing

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid File", description: "Please upload an image file (PNG, JPG, WEBP).", variant: "destructive" });
      return;
    }
    setOriginalImageFile(file);
    setProcessedImageUri(null); // Reset downstream images
    setFinalImageUri(null); // Reset downstream images
    try {
      const dataUri = await fileToDataUri(file);
      setOriginalImageUri(dataUri);
      toast({ title: "Image Uploaded", description: file.name });
    } catch (error) {
      console.error("Error converting file to data URI:", error);
      toast({ title: "Upload Error", description: "Could not read the image file.", variant: "destructive" });
    }
  };

  const handleAiOperation = async (prompt: string, operationName: string) => {
    if (!originalImageUri) {
      toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsLoadingAi(true);
    setFinalImageUri(null); // Reset resize if AI op is done again
    try {
      const result = await processImageWithAI(originalImageUri, prompt);
      if (result.error) {
        toast({ title: `${operationName} Failed`, description: result.error, variant: "destructive" });
        setProcessedImageUri(null);
      } else if (result.imageDataUri) {
        setProcessedImageUri(result.imageDataUri);
        toast({ title: `${operationName} Successful`, description: "Image updated." });
      }
    } catch (error) {
      console.error(`${operationName} error:`, error);
      toast({ title: "AI Error", description: `An unexpected error occurred during ${operationName}.`, variant: "destructive" });
      setProcessedImageUri(null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const removeBackground = () => {
    handleAiOperation("product on a clean plain white background, maintaining original product shadows if possible, ensure the object is fully visible", "Background Removal");
  };

  const generateCustomBackground = () => {
    if (!customBgPrompt.trim()) {
      toast({ title: "Missing Prompt", description: "Please enter a description for the custom background.", variant: "destructive" });
      return;
    }
    handleAiOperation(customBgPrompt, "Custom Background Generation");
  };

  const handleResize = async () => {
    if (!activeImageForProcessing || !selectedPresetKey) {
      toast({ title: "Resize Error", description: "Please select an image and a preset.", variant: "destructive" });
      return;
    }
    setIsLoadingResize(true);
    const preset = PRESETS[selectedPresetKey];
    try {
      const resizedUri = await resizeImage(activeImageForProcessing, preset.width, preset.height, resizeFitMode);
      setFinalImageUri(resizedUri);
      toast({ title: "Image Resized", description: `Resized to ${preset.name} (${preset.width}x${preset.height}px).` });
    } catch (error) {
      console.error("Resize error:", error);
      toast({ title: "Resize Failed", description: "Could not resize the image.", variant: "destructive" });
    } finally {
      setIsLoadingResize(false);
    }
  };

  const handleDownload = () => {
    const imageToDownload = finalImageUri || processedImageUri || originalImageUri;
    if (imageToDownload && originalImageFile) {
      const fileExtension = originalImageFile.name.split('.').pop() || 'png';
      const presetName = selectedPresetKey ? PRESETS[selectedPresetKey].name.replace(/\s+/g, '_') : 'custom';
      downloadImage(imageToDownload, `FotoClear_${presetName}_${Date.now()}.${fileExtension}`);
    } else {
      toast({ title: "Download Error", description: "No image to download.", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImageUri(null);
    setProcessedImageUri(null);
    setFinalImageUri(null);
    setCustomBgPrompt('');
    setSelectedPresetKey(null);
    setResizeFitMode('contain');
    toast({ title: "Editor Reset", description: "All changes have been cleared." });
  };
  
  const isProcessing = isLoadingAi || isLoadingResize;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">FotoClear</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">AI Background Remover & Auto Resizer for Perfect Product Photos</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2">
          <ImageDisplay imageUri={activeImageForDisplay} isLoading={isLoadingAi || isLoadingResize} />
          {originalImageUri && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset All
              </Button>
            </div>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Edit Tools</CardTitle>
            <CardDescription>Upload, edit, and resize your image.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUploadButton onFileSelect={handleFileSelect} className="w-full" disabled={isProcessing}/>

            {originalImageUri && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 font-headline">Background Tools</h3>
                  <div className="space-y-3">
                    <Button onClick={removeBackground} className="w-full" disabled={isProcessing || !originalImageUri}>
                      {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Remove Background
                    </Button>
                    <div>
                      <Label htmlFor="customBgPrompt" className="mb-1 block">Custom Background (AI)</Label>
                      <Input
                        id="customBgPrompt"
                        type="text"
                        placeholder="e.g., on a wooden table, in a forest"
                        value={customBgPrompt}
                        onChange={(e) => setCustomBgPrompt(e.target.value)}
                        className="mb-2"
                        disabled={isProcessing || !originalImageUri}
                      />
                      <Button onClick={generateCustomBackground} variant="outline" className="w-full" disabled={isProcessing || !originalImageUri}>
                        {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Custom BG
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 font-headline">Resize & Crop</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="preset" className="mb-1 block">Platform Presets</Label>
                       <Select
                        value={selectedPresetKey || ""}
                        onValueChange={(value) => setSelectedPresetKey(value)}
                        disabled={isProcessing || !activeImageForProcessing}
                      >
                        <SelectTrigger id="preset">
                          <SelectValue placeholder="Select a preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRESETS).map(([key, preset]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center">
                                {preset.icon && <preset.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                                {preset.name} ({preset.width}x{preset.height}, {preset.aspectRatio})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1 block">Fit Mode</Label>
                      <RadioGroup
                        defaultValue="contain"
                        value={resizeFitMode}
                        onValueChange={(value: ResizeFitMode) => setResizeFitMode(value)}
                        className="flex space-x-4"
                        disabled={isProcessing || !activeImageForProcessing}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="contain" id="contain" />
                          <Label htmlFor="contain">Contain</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cover" id="cover" />
                          <Label htmlFor="cover">Cover (Crop)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button onClick={handleResize} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isProcessing || !activeImageForProcessing || !selectedPresetKey}>
                      {isLoadingResize ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" style={{transform: 'scaleX(-1) rotate(-90deg)'}}/>}
                      Apply Resize
                    </Button>
                  </div>
                </div>
                
                <Separator />
                <Button onClick={handleDownload} className="w-full text-lg py-6" disabled={isProcessing || !activeImageForDisplay}>
                  <Download className="mr-2 h-5 w-5" />
                  Download Image
                </Button>
              </>
            )}
            
            <Separator />
            <div>
                <h3 className="text-lg font-semibold mb-3 font-headline">Premium Features</h3>
                <div className="space-y-2">
                    <PremiumFeatureLock featureName="High-Resolution Downloads" />
                    <PremiumFeatureLock featureName="Batch Processing" />
                </div>
            </div>

            <AdPlaceholder />
          </CardContent>
        </Card>
      </div>
      
      <footer className="text-center mt-12 py-6 border-t">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FotoClear. All rights reserved.</p>
      </footer>
    </div>
  );
}
