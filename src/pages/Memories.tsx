import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Grid, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddMemoryModal } from "@/components/AddMemoryModal";

interface Memory {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  type: string;
  emoji: string;
  tags: string[];
  created_at: string;
}

const Memories = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = memories.filter(
        (memory) =>
          memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMemories(filtered);
    } else {
      setFilteredMemories(memories);
    }
  }, [searchQuery, memories]);

  const loadMemories = async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMemories(data || []);
      setFilteredMemories(data || []);
    } catch (error: any) {
      console.error("Error loading memories:", error);
    } finally {
      setLoadingMemories(false);
    }
  };

  if (loading || loadingMemories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Brain className="h-16 w-16 text-primary mx-auto animate-pulse-glow" />
          <p className="text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Grid className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">All Memories</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search memories by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>

          {/* Memory Count */}
          <div className="text-center">
            <p className="text-muted-foreground">
              {filteredMemories.length} {filteredMemories.length === 1 ? "memory" : "memories"} found
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredMemories.map((memory, index) => (
              <Card
                key={memory.id}
                className="break-inside-avoid group hover:scale-[1.02] transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/20 animate-fade-in cursor-pointer"
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{memory.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {memory.title}
                        </h3>
                        {memory.content && (
                          <p className="text-sm text-muted-foreground line-clamp-4 mb-3">
                            {memory.content}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {memory.type}
                          </Badge>
                          {memory.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-primary/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          {new Date(memory.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMemories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No memories found</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Memory Modal */}
      <AddMemoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onMemoryAdded={loadMemories}
      />
    </div>
  );
};

export default Memories;
