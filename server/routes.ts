import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMembershipApplicationSchema, insertContactMessageSchema, insertYoutubePostSchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Membership application endpoint
  app.post("/api/membership-applications", async (req, res) => {
    try {
      const validatedData = insertMembershipApplicationSchema.parse(req.body);
      const application = await storage.createMembershipApplication(validatedData);
      res.json({ success: true, application });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all membership applications (for admin purposes)
  app.get("/api/membership-applications", async (req, res) => {
    try {
      const applications = await storage.getMembershipApplications();
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Contact message endpoint
  app.post("/api/contact-messages", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json({ success: true, message });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all contact messages (for admin purposes)
  app.get("/api/contact-messages", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // YouTube posts endpoints
  app.post("/api/youtube-posts", async (req, res) => {
    try {
      const validatedData = insertYoutubePostSchema.parse(req.body);
      const post = await storage.createYoutubePost(validatedData);
      res.json({ success: true, post });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/youtube-posts", async (req, res) => {
    try {
      const posts = await storage.getYoutubePosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI assist endpoint for writing help
  app.post("/api/ai-assist", async (req, res) => {
    try {
      const { title, content, category, topic } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `당신은 축구 동호회 카페 글쓰기 도우미입니다. 다음 정보를 바탕으로 글을 더 풍부하고 매력적으로 작성할 수 있도록 도와주세요.

카테고리: ${category || '없음'}
주제: ${topic || '없음'}
제목: ${title || '없음'}
현재 내용: ${content || '없음'}

위 정보를 바탕으로 다음 중 하나를 제공해주세요:
1. 내용이 없다면: 제목에 맞는 초안 작성
2. 내용이 있다면: 내용을 보완하거나 개선할 수 있는 추가 문단 제안

친근하고 따뜻한 톤으로 작성해주시고, 축구 동호회 활동에 맞는 내용으로 작성해주세요.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "당신은 친근하고 도움이 되는 축구 동호회 카페 글쓰기 도우미입니다.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const suggestion = completion.choices[0]?.message?.content || "";

      res.json({ suggestion });
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: error.message || "AI 도움 요청 실패" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
