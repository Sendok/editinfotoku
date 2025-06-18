import type { LucideIcon } from 'lucide-react';

export interface ResizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  icon?: LucideIcon;
  aspectRatio: string;
}

export type ResizeFitMode = 'contain' | 'cover';

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}
