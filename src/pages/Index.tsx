import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Sparkles, Network, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,200,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,230,200,0.1),transparent_50%)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12 animate-fade-in">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 animate-pulse-glow">
                <Brain className="h-24 w-24 text-primary animate-float" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              Project <span className="text-primary">Synapse</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your second brain that captures, organizes, and intelligently connects everything you save
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-2xl shadow-primary/30"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 border-border/50 hover:border-primary"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="space-y-4 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                <Network className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Neural Mind Map</h3>
              <p className="text-muted-foreground">
                Visualize connections between your thoughts in a beautiful, interactive mind map
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="p-3 bg-accent/10 rounded-xl w-fit mx-auto">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">AI Connections</h3>
              <p className="text-muted-foreground">
                Let AI discover hidden relationships between your ideas and memories
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Quick Capture</h3>
              <p className="text-muted-foreground">
                Save anything instantly - links, notes, images, or ideas with a single click
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
