import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Database, Search, Send, Loader2, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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

const PathwayChatbot = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [relevantMemories, setRelevantMemories] = useState<Memory[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadMemories();
      createNewConversation();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMemories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      console.error("Error loading memories:", error);
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive",
      });
    }
  };

  const createNewConversation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: "New Conversation",
        })
        .select()
        .single();

      if (error) throw error;
      setConversationId(data.id);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!conversationId) return;

    try {
      await supabase.from("conversation_messages").insert({
        conversation_id: conversationId,
        role,
        content,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const performAgenticSearch = async (query: string) => {
    if (!user || !query.trim()) return [];

    setIsSearching(true);
    try {
      const response = await fetch("/api/agentic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          userId: user.id,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setRelevantMemories(data.results || []);
      return data.results || [];
    } catch (error) {
      console.error("Error in agentic search:", error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    if (memories.length === 0) {
      toast({
        title: "No memories available",
        description: "Please add some memories first to ask questions",
        variant: "destructive",
      });
      return;
    }

    // Save the question before clearing input
    const question = inputValue.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Save user message
    await saveMessage("user", question);

    try {
      // Perform agentic search to find relevant memories
      const relevant = await performAgenticSearch(question);

      const apiUrl = import.meta.env.VITE_API_URL || "/api/chat-with-memories";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          userId: user.id,
          conversationId: conversationId,
          useAgenticSearch: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message
      await saveMessage("assistant", assistantMessage.content);

      // Show relevant memories count
      if (data.relevantMemoriesCount) {
        toast({
          title: "Answer generated",
          description: `Used ${data.relevantMemoriesCount} relevant memories from your database`,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please check your API key configuration.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please make sure your Gemini API key is configured correctly.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await performAgenticSearch(searchQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
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
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Pathway Chatbot</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/neural-network")}
              className="border-border/50 hover:border-primary"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Neural Network
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Memories & Search */}
        <aside className="w-80 border-r border-border/50 bg-card/30 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Your Knowledge Base</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {memories.length} memories available
              </p>
            </div>

            {/* Agentic Search */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Agentic Search</h3>
                  </div>
                  <Input
                    placeholder="Search your memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Relevant Memories */}
            {relevantMemories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Relevant Memories ({relevantMemories.length})
                </h3>
                <div className="space-y-2">
                  {relevantMemories.map((memory) => (
                    <Card key={memory.id} className="border-primary/30 bg-primary/5">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{memory.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{memory.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {memory.content || memory.summary}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {memory.tags?.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Memories Summary */}
            <div>
              <h3 className="text-sm font-semibold mb-2">All Memories</h3>
              <Card className="border-dashed border-2 border-border/50">
                <CardContent className="p-4 text-center">
                  <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {memories.length} memories in database
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate("/memories")}
                  >
                    View All
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 max-w-md">
                    <Brain className="h-16 w-16 text-primary mx-auto opacity-50" />
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Ask questions about your memories
                      </h2>
                      <p className="text-muted-foreground">
                        The chatbot uses agentic search to find the most relevant memories from your database
                        and answers questions using Google Gemini AI.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-card/50 p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your memories..."
                disabled={isLoading || memories.length === 0}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim() || memories.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {memories.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Add memories to your database to start asking questions
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PathwayChatbot;
