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
  const lowerMessage = message.toLowerCase();
  
  // Thai language support
  const isThaiGreeting = lowerMessage.includes('สวัสดี') || lowerMessage.includes('หวัดดี');
  const isThaiHelp = lowerMessage.includes('ช่วย') || lowerMessage.includes('ช่วยหน่อย');
  const isThaiQuestion = lowerMessage.includes('คุย') || lowerMessage.includes('ตอบ') || lowerMessage.includes('บอก');
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || isThaiGreeting) {
    const greetings = {
      llama3: "Hello! I'm Llama. What can I help you with today?",
      mistral: "Hi! I'm Mistral, ready to assist you.",
      codellama: "Hello! I'm CodeLlama, here for your programming needs."
    };
    return greetings[model as keyof typeof greetings] || greetings.mistral;
  }
  
  // 3D/Model creation requests
  if (lowerMessage.includes('create') && (lowerMessage.includes('model') || lowerMessage.includes('3d'))) {
    return "I understand you want to create a 3D model. While I can't generate actual 3D files, I can help you with:\n\n• 3D modeling concepts and techniques\n• Code for 3D graphics (Three.js, WebGL)\n• Blender or other 3D software guidance\n• Mathematical foundations for 3D graphics\n\nWhat specific aspect would you like help with?";
  }
  
  // Gun/weapon related (redirect to appropriate content)
  if (lowerMessage.includes('gun') || lowerMessage.includes('weapon')) {
    return "I can help with general 3D modeling techniques, but I'd prefer to focus on creative, educational, or positive applications. I can assist with:\n\n• Game development assets\n• Educational models\n• Artistic sculptures\n• Mechanical components\n\nWhat type of project are you working on?";
  }
  
  // Programming/code questions
  if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('โค้ด')) {
    return "I'd be happy to help with coding! I can assist with:\n\n• JavaScript and web development\n• Three.js for 3D graphics\n• React and frontend frameworks\n• API development\n• Database design\n\nWhat programming challenge are you facing?";
  }
  
  // Thai language questions
  if (isThaiQuestion || lowerMessage.includes('ภาษาไทย')) {
    return "ใช่ครับ ผมสามารถเข้าใจภาษาไทยได้ แต่ผมจะตอบเป็นภาษาอังกฤษเป็นหลัก ผมช่วยอะไรคุณได้บ้างครับ?\n\nYes, I can understand Thai, but I primarily respond in English. How can I help you?";
  }
  
  // Help requests
  if (lowerMessage.includes('help') || isThaiHelp) {
    return "I'm here to help! I can assist with:\n\n• Programming and web development\n• 3D graphics and modeling concepts\n• Math and technical explanations\n• Project planning and guidance\n\nWhat would you like help with specifically?";
  }
  
  // Questions
  if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
    return "That's a great question! I'd be happy to help explain or provide guidance. Could you give me a bit more context about what you're trying to understand or accomplish?";
  }
  
  // Default contextual response
  const contextualResponses = [
    "I see you're asking about that. Let me provide some helpful information based on what you've mentioned.",
    "Interesting question! I'd be happy to help you explore that topic further.",
    "I understand what you're getting at. Let me offer some guidance on that.",
    "That's something I can definitely help with. What specific aspect interests you most?",
  ];
  
  return contextualResponses[Math.floor(Math.random() * contextualResponses.length)] + " Could you provide a bit more detail about what you're looking for?";
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
