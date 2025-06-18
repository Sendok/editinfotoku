import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function AdPlaceholder() {
  return (
    <Card className="mt-6 border-dashed border-accent">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center text-center text-sm text-accent-foreground/80">
          <Zap className="w-8 h-8 mb-2 text-accent" />
          <p className="font-semibold">Advertisement</p>
          <p>Support FotoClear by viewing ads!</p>
        </div>
      </CardContent>
    </Card>
  );
}
