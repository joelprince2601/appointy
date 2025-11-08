import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Memory {
  id: string;
  title: string;
  emoji: string;
  type: string;
  tags: string[];
  created_at: string;
}

interface MindMapProps {
  memories: Memory[];
}

export const MindMap = ({ memories }: MindMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      drawConnections();
    };

    const drawConnections = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle connection lines between nodes
      const nodes = document.querySelectorAll("[data-node-id]");
      const nodePositions: { x: number; y: number }[] = [];

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        nodePositions.push({
          x: rect.left - canvasRect.left + rect.width / 2,
          y: rect.top - canvasRect.top + rect.height / 2,
        });
      });

      // Draw connections
      ctx.strokeStyle = "rgba(0, 200, 255, 0.1)";
      ctx.lineWidth = 1;

      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < Math.min(i + 3, nodePositions.length); j++) {
          ctx.beginPath();
          ctx.moveTo(nodePositions[i].x, nodePositions[i].y);
          ctx.lineTo(nodePositions[j].x, nodePositions[j].y);
          ctx.stroke();
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [memories]);

  return (
    <div className="relative min-h-[600px] w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {memories.map((memory, index) => (
          <Card
            key={memory.id}
            data-node-id={memory.id}
            className="group hover:scale-105 transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/20 animate-fade-in cursor-pointer"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                      {memory.emoji}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {memory.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(memory.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {memory.type}
                  </Badge>
                  {memory.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-primary/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
