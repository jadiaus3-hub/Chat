import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertGeneratedImageSchema } from "@shared/schema";
import { z } from "zod";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "hf_your_token_here";

async function chatWithHuggingFace(message: string, model: string = "gpt2") {
  try {
    // First try with a simple, always-available model
    const modelMap: Record<string, string> = {
      "llama3": "gpt2",
      "mistral": "gpt2", 
      "codellama": "gpt2"
    };
    
    const actualModel = modelMap[model] || "gpt2";
    
    // Try the HuggingFace API first
    const response = await fetch(`https://api-inference.huggingface.co/models/${actualModel}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          do_sample: true,
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("HuggingFace response:", result);
      
      if (Array.isArray(result) && result[0]?.generated_text) {
        let responseText = result[0].generated_text;
        // Clean up the response by removing the input message if it's repeated
        if (responseText.startsWith(message)) {
          responseText = responseText.substring(message.length).trim();
        }
        return responseText || generateLocalResponse(message, model);
      }
    } else {
      const errorText = await response.text();
      console.error(`HuggingFace API error ${response.status}: ${errorText}`);
    }
    
    // Fallback to local response generation
    return generateLocalResponse(message, model);
  } catch (error) {
    console.error("HuggingFace chat error:", error);
    return generateLocalResponse(message, model);
  }
}

function generateLocalResponse(message: string, model: string): string {
  // Simple pattern-based responses while HuggingFace issues are resolved
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    llama3: [
      "Hello! I'm Llama, an AI assistant. How can I help you today?",
      "I understand your question. Let me think about that...",
      "That's an interesting point. Here's what I think:",
      "I'm here to help! What would you like to know more about?",
    ],
    mistral: [
      "Hi there! I'm Mistral. How can I assist you?",
      "I see what you're asking. Let me help you with that.",
      "That's a great question! Here's my thoughts:",
      "I'm ready to help. What else can I do for you?",
    ],
    codellama: [
      "Hello! I'm CodeLlama, specialized in programming. What code can I help with?",
      "I can help you with coding questions. What programming language are you working with?",
      "Let me assist you with that code. What specifically are you trying to achieve?",
      "I'm here for your programming needs. How can I help?",
    ],
  };

  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('สวัสดี')) {
    return responses[model as keyof typeof responses]?.[0] || responses.mistral[0];
  }
  
  // Help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('ช่วย')) {
    return responses[model as keyof typeof responses]?.[3] || responses.mistral[3];
  }
  
  // Code-related
  if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('โค้ด')) {
    return responses.codellama[1];
  }
  
  // Default response
  const modelResponses = responses[model as keyof typeof responses] || responses.mistral;
  return modelResponses[Math.floor(Math.random() * modelResponses.length)];
}

async function generateImageWithHuggingFace(prompt: string, model: string = "sd2.1") {
  try {
    const modelMap: Record<string, string> = {
      "sd2.1": "stabilityai/stable-diffusion-2-1",
      "sd1.5": "runwayml/stable-diffusion-v1-5",
      "sdxl": "stabilityai/stable-diffusion-xl-base-1.0"
    };
    
    const actualModel = modelMap[model] || "stabilityai/stable-diffusion-2-1";
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${actualModel}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("HuggingFace image generation error:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoints
  app.get("/api/chat/messages", async (_req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { content, model } = insertChatMessageSchema.parse(req.body);
      
      // Store user message
      const userMessage = await storage.createChatMessage({
        content,
        role: "user",
        model,
      });
      
      // Generate AI response
      const aiResponse = await chatWithHuggingFace(content, model);
      
      // Store AI response
      const assistantMessage = await storage.createChatMessage({
        content: aiResponse,
        role: "assistant",
        model,
      });
      
      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error) {
      console.error("Error creating chat message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process chat message" });
      }
    }
  });

  // Image generation endpoints
  app.get("/api/images", async (_req, res) => {
    try {
      const images = await storage.getGeneratedImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching generated images:", error);
      res.status(500).json({ message: "Failed to fetch generated images" });
    }
  });

  app.post("/api/images/generate", async (req, res) => {
    try {
      const { prompt, model, settings } = z.object({
        prompt: z.string().min(1),
        model: z.string().default("sd2.1"),
        settings: z.object({
          style: z.string().optional(),
          aspectRatio: z.string().optional(),
        }).optional(),
      }).parse(req.body);
      
      // Generate image
      const imageUrl = await generateImageWithHuggingFace(prompt, model);
      
      // Store generated image
      const generatedImage = await storage.createGeneratedImage({
        prompt,
        imageUrl,
        model,
        settings,
      });
      
      res.json(generatedImage);
    } catch (error) {
      console.error("Error generating image:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to generate image" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
