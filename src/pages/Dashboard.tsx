import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Plus, LogOut, List, MessageSquare, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MindMap } from "@/components/MindMap";
import { AddMemoryModal } from "@/components/AddMemoryModal";
import { QuickSaveWidget } from "@/components/QuickSaveWidget";

interface Memory {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  type: string;
  emoji: string;
  tags: string[];
  connections: any;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loadingMemories, setLoadingMemories] = useState(true);

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

  const loadMemories = async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMemories(data || []);
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
          <p className="text-muted-foreground">Loading your neural network...</p>
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
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Project Synapse</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/pathway-chatbot")}
              className="border-border/50 hover:border-primary"
              title="Pathway Chatbot"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/neural-network")}
              className="border-border/50 hover:border-primary"
              title="Neural Network"
            >
              <Network className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/memories")}
              className="border-border/50 hover:border-primary"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={signOut}
              className="border-border/50 hover:border-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {memories.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md animate-fade-in">
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 inline-block">
                <Brain className="h-20 w-20 text-primary mx-auto animate-float" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Welcome to Your Mind</h2>
                <p className="text-muted-foreground">
                  Start building your second brain by capturing your first memory
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Memory
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Neural Network</h2>
                <p className="text-muted-foreground">{memories.length} memories connected</p>
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </Button>
            </div>
            <MindMap memories={memories} />
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <QuickSaveWidget onSave={() => setIsAddModalOpen(true)} />

      {/* Add Memory Modal */}
      <AddMemoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onMemoryAdded={loadMemories}
      />
    </div>
  );
};

export default Dashboard;
