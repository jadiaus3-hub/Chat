import { Card, CardContent } from "@/components/ui/card";
import { Box, Brain, Sparkles, Key, Smartphone, Code, CheckCircle } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Box,
      title: "3D Interactive",
      description: "Immersive 3D experiences powered by React Three Fiber",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      icon: Brain,
      title: "AI Chat",
      description: "Advanced conversations with open-source AI models",
      gradient: "from-cyan-500 to-cyan-700",
      delay: "0.5s",
    },
    {
      icon: Sparkles,
      title: "Image Generation",
      description: "Create stunning visuals with Stable Diffusion",
      gradient: "from-pink-500 to-pink-700",
      delay: "1s",
    },
    {
      icon: Key,
      title: "No API Keys",
      description: "Everything works out of the box, no setup required",
      gradient: "from-green-500 to-green-700",
      delay: "1.5s",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Fully responsive design for all devices",
      gradient: "from-orange-500 to-orange-700",
      delay: "2s",
    },
    {
      icon: Code,
      title: "Open Source",
      description: "Built with modern open-source technologies",
      gradient: "from-blue-500 to-blue-700",
      delay: "2.5s",
    },
  ];

  const techStack = [
    { name: "React", icon: "⚛️" },
    { name: "Next.js", icon: "N" },
    { name: "Three.js", icon: "🎲" },
    { name: "Tailwind", icon: "TW" },
  ];

  return (
    <section className="min-h-screen bg-dark-purple">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* About Header */}
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                About AI Studio 3D
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              A revolutionary platform bringing together 3D interaction and AI capabilities
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="glass-morphism border-white/20 text-center floating-animation"
                  style={{ animationDelay: feature.delay || "0s" }}
                >
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Key Benefits */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-white">Why Choose AI Studio 3D?</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Free Forever</h4>
                  <p className="text-gray-400 text-sm">
                    No subscription fees, no hidden costs. Enjoy unlimited AI-powered features.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Privacy First</h4>
                  <p className="text-gray-400 text-sm">
                    Your conversations and generated images are handled with maximum privacy.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">No Setup Required</h4>
                  <p className="text-gray-400 text-sm">
                    Start using immediately - no API keys or complex configuration needed.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Latest Models</h4>
                  <p className="text-gray-400 text-sm">
                    Access cutting-edge AI models including LLaMA 3 and Stable Diffusion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <Card className="glass-morphism border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-white">Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {techStack.map((tech) => (
                  <div key={tech.name} className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-center mx-auto mb-2">
                      {tech.icon.startsWith("http") ? (
                        <img src={tech.icon} alt={tech.name} className="w-6 h-6" />
                      ) : (
                        <span className="text-white font-bold text-sm">{tech.icon}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-300">{tech.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
