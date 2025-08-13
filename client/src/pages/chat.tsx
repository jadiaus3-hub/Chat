import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("mistral");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; model: string; role: "user" }) => {
      const response = await apiRequest("POST", "/api/chat/message", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      content: message,
      model: selectedModel,
      role: "user",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <section className="min-h-screen bg-dark-purple">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Chat
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Chat with powerful open-source AI models powered by HuggingFace
            </p>
          </div>

          {/* Model Selection */}
          <Card className="glass-morphism border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-gray-300">AI Model:</span>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="mistral">Mistral 7B</SelectItem>
                      <SelectItem value="llama3">LLaMA 3 (Meta)</SelectItem>
                      <SelectItem value="codellama">Code Llama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Container */}
          <Card className="glass-morphism border-white/20">
            <CardContent className="p-0">
              {/* Chat Messages */}
              <ScrollArea className="h-96 p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                      <div className="flex items-start space-x-3 chat-message">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="text-white h-4 w-4" />
                        </div>
                        <div className="bg-white/10 rounded-2xl rounded-tl-md p-4 max-w-xs lg:max-w-md">
                          <p className="text-white">
                            Hello! I'm your AI assistant powered by open-source models. How can I help you today?
                          </p>
                        </div>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 chat-message ${
                          msg.role === "user" ? "justify-end" : ""
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="text-white h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-4 max-w-xs lg:max-w-md ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 rounded-tr-md"
                              : "bg-white/10 rounded-tl-md"
                          }`}
                        >
                          <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="text-white h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}

                    {sendMessageMutation.isPending && (
                      <div className="flex items-start space-x-3 chat-message">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="text-white h-4 w-4" />
                        </div>
                        <div className="bg-white/10 rounded-2xl rounded-tl-md p-4">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                            <span className="text-gray-300">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t border-white/20 p-6">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                    maxLength={1000}
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                  <span>Press Enter to send</span>
                  <span>{message.length}/1000 characters</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
