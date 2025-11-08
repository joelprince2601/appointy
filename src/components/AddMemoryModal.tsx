import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface AddMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemoryAdded: () => void;
}

const memoryTypes = [
  { value: "note", emoji: "📝", label: "Note" },
  { value: "article", emoji: "📰", label: "Article" },
  { value: "todo", emoji: "✅", label: "Todo" },
  { value: "product", emoji: "🛍️", label: "Product" },
  { value: "quote", emoji: "💭", label: "Quote" },
  { value: "image", emoji: "🖼️", label: "Image" },
  { value: "other", emoji: "✨", label: "Other" },
];

export const AddMemoryModal = ({ open, onOpenChange, onMemoryAdded }: AddMemoryModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("note");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save memories");
      return;
    }
    
    setLoading(true);

    try {
      const selectedType = memoryTypes.find((t) => t.value === type);
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const { error } = await supabase.from("memories").insert({
        user_id: user.id,
        title,
        content,
        type: type as any,
        emoji: selectedType?.emoji || "💭",
        tags: tagsArray,
      });

      if (error) throw error;

      toast.success("Memory captured!", {
        description: "Your thought is now part of your neural network",
      });

      // Reset form
      setTitle("");
      setContent("");
      setType("note");
      setTags("");
      onOpenChange(false);
      onMemoryAdded();
    } catch (error: any) {
      toast.error("Failed to save memory", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Capture a Memory
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-secondary/50 border-border/50 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {memoryTypes.map((memType) => (
                  <SelectItem key={memType.value} value={memType.value}>
                    <span className="flex items-center gap-2">
                      <span>{memType.emoji}</span>
                      <span>{memType.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Add details, links, or notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="bg-secondary/50 border-border/50 focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="productivity, ideas, inspiration"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {loading ? "Saving..." : "Save Memory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
