import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertGeneratedImageSchema } from "@shared/schema";
import { z } from "zod";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "hf_your_token_here";

async function chatWithHuggingFace(message: string, model: string = "microsoft/DialoGPT-large") {
  try {
    const modelMap: Record<string, string> = {
      "llama3": "meta-llama/Llama-2-7b-chat-hf",
      "mistral": "mistralai/Mistral-7B-Instruct-v0.1",
      "codellama": "codellama/CodeLlama-7b-Instruct-hf"
    };
    
    const actualModel = modelMap[model] || modelMap["mistral"];
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${actualModel}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text.replace(message, "").trim();
    }
    
    return "I'm sorry, I couldn't generate a response at the moment. Please try again.";
  } catch (error) {
    console.error("HuggingFace chat error:", error);
    return "I'm experiencing some technical difficulties. Please try again later.";
  }
}

async function generateImageWithHuggingFace(prompt: string, model: string = "sd2.1") {
  try {
    const modelMap: Record<string, string> = {
      "sd2.1": "stabilityai/stable-diffusion-2-1",
      "sd1.5": "runwayml/stable-diffusion-v1-5",
      "sdxl": "stabilityai/stable-diffusion-xl-base-1.0"
    };
    
    const actualModel = modelMap[model] || modelMap["sd2.1"];
    
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
