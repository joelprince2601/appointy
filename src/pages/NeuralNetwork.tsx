import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Brain, Network, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface Node {
  id: string;
  x: number;
  y: number;
  memory: Memory;
  vx: number;
  vy: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

const NeuralNetwork = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
    if (memories.length > 0) {
      initializeNetwork();
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [memories]);

  const loadMemories = async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      console.error("Error loading memories:", error);
    } finally {
      setLoadingMemories(false);
    }
  };

  const initializeNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create nodes from memories
    const nodes: Node[] = memories.map((memory, index) => {
      const angle = (index / memories.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.3;
      return {
        id: memory.id,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        memory,
        vx: 0,
        vy: 0,
      };
    });

    // Create links based on tags and connections
    const links: Link[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        // Check for shared tags
        const sharedTags = nodeA.memory.tags?.filter(tag => 
          nodeB.memory.tags?.includes(tag)
        ) || [];
        
        // Check for connections in metadata
        const hasConnection = nodeA.memory.connections && 
          Array.isArray(nodeA.memory.connections) &&
          nodeA.memory.connections.includes(nodeB.id);

        if (sharedTags.length > 0 || hasConnection) {
          links.push({
            source: nodeA.id,
            target: nodeB.id,
            strength: sharedTags.length * 0.1 + (hasConnection ? 0.2 : 0),
          });
        }
      }
    }

    nodesRef.current = nodes;
    linksRef.current = links;
  };

  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Apply physics simulation
      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Update node positions with force simulation
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (distance - 150) * link.strength * 0.01;

        source.vx += (dx / distance) * force;
        source.vy += (dy / distance) * force;
        target.vx -= (dx / distance) * force;
        target.vy -= (dy / distance) * force;
      });

      // Apply repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -100 / (distance * distance);

          nodes[i].vx += (dx / distance) * force;
          nodes[i].vy += (dy / distance) * force;
          nodes[j].vx -= (dx / distance) * force;
          nodes[j].vy -= (dy / distance) * force;
        }
      }

      // Update positions
      nodes.forEach(node => {
        node.vx *= 0.9; // Damping
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        const padding = 50;
        if (node.x < padding) { node.x = padding; node.vx = 0; }
        if (node.x > width - padding) { node.x = width - padding; node.vx = 0; }
        if (node.y < padding) { node.y = padding; node.vy = 0; }
        if (node.y > height - padding) { node.y = height - padding; node.vy = 0; }
      });

      // Draw links
      ctx.strokeStyle = "rgba(124, 58, 237, 0.2)";
      ctx.lineWidth = 2;
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const isSelected = selectedNode?.id === node.id;
        
        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 25 : 20, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "rgba(124, 58, 237, 0.8)" : "rgba(124, 58, 237, 0.6)";
        ctx.fill();
        ctx.strokeStyle = isSelected ? "rgba(124, 58, 237, 1)" : "rgba(124, 58, 237, 0.8)";
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Draw emoji
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.memory.emoji, node.x, node.y);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width) / 2;
    const y = (e.clientY - rect.top) * (canvas.height / rect.height) / 2;

    // Find clicked node
    const clickedNode = nodesRef.current.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    setSelectedNode(clickedNode || null);
  };

  if (loading || loadingMemories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading neural network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/pathway-chatbot")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Network className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Neural Network</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(zoom * 1.1)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(zoom * 0.9)}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                initializeNetwork();
                setSelectedNode(null);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Network Visualization */}
        <main className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer"
            style={{ background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.05) 0%, transparent 70%)" }}
          />
          
          {memories.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground">No memories to visualize</p>
                <Button onClick={() => navigate("/dashboard")}>
                  Add Memories
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar - Node Details */}
        {selectedNode && (
          <aside className="w-80 border-l border-border/50 bg-card/30 p-4 overflow-y-auto">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                    className="mb-4"
                  >
                    Close
                  </Button>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{selectedNode.memory.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedNode.memory.title}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {selectedNode.memory.type}
                          </Badge>
                        </div>
                      </div>
                      
                      {selectedNode.memory.content && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedNode.memory.content}
                        </p>
                      )}
                      
                      {selectedNode.memory.summary && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold mb-2">Summary</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedNode.memory.summary}
                          </p>
                        </div>
                      )}
                      
                      {selectedNode.memory.tags && selectedNode.memory.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedNode.memory.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-4">
                        Created: {new Date(selectedNode.memory.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Connected Nodes */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Connected Memories</h3>
                  <div className="space-y-2">
                    {linksRef.current
                      .filter(link => 
                        link.source === selectedNode.id || link.target === selectedNode.id
                      )
                      .map(link => {
                        const connectedId = link.source === selectedNode.id 
                          ? link.target 
                          : link.source;
                        const connectedNode = nodesRef.current.find(n => n.id === connectedId);
                        if (!connectedNode) return null;
                        
                        return (
                          <Card key={connectedId} className="border-primary/20">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{connectedNode.memory.emoji}</span>
                                <p className="text-sm font-medium truncate">
                                  {connectedNode.memory.title}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
};

export default NeuralNetwork;

