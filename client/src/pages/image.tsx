import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, Download, Share2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { GeneratedImage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ImageGen() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("sd2.1");
  const [style, setStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: images = [], isLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
  });

  const generateImageMutation = useMutation({
    mutationFn: async (imageData: {
      prompt: string;
      model: string;
      settings: { style: string; aspectRatio: string };
    }) => {
      const response = await apiRequest("POST", "/api/images/generate", imageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      setPrompt("");
      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
      console.error("Image generation error:", error);
    },
  });

  const handleGenerateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generateImageMutation.isPending) return;

    generateImageMutation.mutate({
      prompt: prompt.trim(),
      model,
      settings: { style, aspectRatio },
    });
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ai-image-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Downloaded",
        description: "Image downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (imageUrl: string, prompt: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Image',
          text: `Generated with prompt: ${prompt}`,
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Copied",
          description: "Image URL copied to clipboard!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share image.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="min-h-screen bg-dark-navy">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Image Generator
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Create stunning images with Stable Diffusion - completely free
            </p>
          </div>

          {/* Generation Controls */}
          <Card className="glass-morphism border-white/20 mb-8">
            <CardContent className="p-8">
              <form onSubmit={handleGenerateImage} className="space-y-6">
                {/* Prompt Input */}
                <div>
                  <Label htmlFor="prompt" className="text-sm font-semibold text-gray-300 mb-2">
                    Describe your image
                  </Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A futuristic city with flying cars at sunset, cyberpunk style, highly detailed..."
                    className="w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                    maxLength={500}
                  />
                </div>

                {/* Generation Settings */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-300 mb-2">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        <SelectItem value="sd2.1">Stable Diffusion 2.1</SelectItem>
                        <SelectItem value="sd1.5">Stable Diffusion 1.5</SelectItem>
                        <SelectItem value="sdxl">SDXL Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-300 mb-2">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-300 mb-2">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                        <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                        <SelectItem value="4:3">Classic (4:3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={!prompt.trim() || generateImageMutation.isPending}
                    size="lg"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 font-semibold transition-all duration-300 transform hover:scale-105 pulse-glow"
                  >
                    {generateImageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Generated Images Grid */}
          <div className="space-y-8">
            {/* Loading State */}
            {generateImageMutation.isPending && (
              <Card className="glass-morphism border-white/20">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center space-x-3">
                    <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
                    <span className="text-gray-300">Generating your image...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Images */}
            {images.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <Card
                    key={image.id}
                    className="glass-morphism border-white/20 group hover:scale-105 transition-transform duration-300"
                  >
                    <CardContent className="p-0">
                      <img
                        src={image.imageUrl}
                        alt={`Generated: ${image.prompt}`}
                        className="w-full h-64 object-cover rounded-t-xl"
                        loading="lazy"
                      />
                      <div className="p-4">
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                          {image.prompt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{image.model}</span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(image.imageUrl, image.prompt)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(image.imageUrl, image.prompt)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && images.length === 0 && !generateImageMutation.isPending && (
              <Card className="glass-morphism border-white/20">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                      <Wand2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">No images generated yet</h3>
                    <p className="text-gray-400">
                      Enter a prompt above and click "Generate Image" to create your first AI image!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
