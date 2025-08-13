import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle, Image, CheckCircle, Brain, Sparkles } from "lucide-react";
import ThreeScene from "@/components/three-scene";

export default function Home() {
  return (
    <section className="min-h-screen relative overflow-hidden gradient-mesh">
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Studio
                </span>
                <br />
                <span className="text-white">Reimagined</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-lg">
                Experience the future of AI with our interactive 3D platform. Chat with advanced models and generate stunning images—all for free.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/chat">
                <Button size="lg" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 font-semibold transition-all duration-300 transform hover:scale-105 pulse-glow">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start AI Chat
                </Button>
              </Link>
              <Link href="/image">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-4 glass-morphism hover:bg-white/20 font-semibold transition-all duration-300 transform hover:scale-105 border-white/20"
                >
                  <Image className="mr-2 h-5 w-5" />
                  Generate Images
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>No API Keys Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>100% Free</span>
              </div>
            </div>
          </div>

          {/* 3D Scene Container */}
          <div className="relative">
            <div className="aspect-square glass-morphism rounded-3xl p-8 floating-animation">
              <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl relative overflow-hidden">
                <ThreeScene />
              </div>
            </div>

            {/* Feature Cards */}
            <div className="absolute -bottom-6 -left-6 glass-morphism rounded-2xl p-4 floating-animation" style={{animationDelay: '1s'}}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Brain className="text-white h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">LLaMA 3 Model</div>
                  <div className="text-xs text-gray-400">Advanced AI Chat</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 glass-morphism rounded-2xl p-4 floating-animation" style={{animationDelay: '2s'}}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Stable Diffusion</div>
                  <div className="text-xs text-gray-400">Image Generation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
