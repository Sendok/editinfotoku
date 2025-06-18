import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PremiumFeatureLockProps {
  featureName: string;
}

export function PremiumFeatureLock({ featureName }: PremiumFeatureLockProps) {
  return (
    <div className="flex items-center space-x-2 p-2 rounded-md bg-secondary/50 border border-secondary text-sm text-secondary-foreground/70">
      <Lock className="w-4 h-4 text-primary" />
      <span>{featureName}</span>
      <Badge variant="outline" className="ml-auto text-primary border-primary">Premium</Badge>
    </div>
  );
}
