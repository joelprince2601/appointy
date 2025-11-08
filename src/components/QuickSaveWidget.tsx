import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickSaveWidgetProps {
  onSave: () => void;
}

export const QuickSaveWidget = ({ onSave }: QuickSaveWidgetProps) => {
  return (
    <Button
      onClick={onSave}
      size="lg"
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/50 bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow z-50"
    >
      <Plus className="h-8 w-8" />
    </Button>
  );
};
