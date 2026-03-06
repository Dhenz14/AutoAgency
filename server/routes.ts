import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateContentFromSource, generateReply, analyzeAccountPerformance } from "./ai";
import {
  insertAccountSchema,
  insertContentSourceSchema,
  insertGeneratedPostSchema,
  insertReplyOpportunitySchema,
  insertAgentConfigSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Accounts ──
  app.get("/api/accounts", async (_req, res) => {
    const accs = await storage.getAccounts();
    res.json(accs);
  });

  app.get("/api/accounts/stats", async (_req, res) => {
    const stats = await storage.getAccountStats();
    res.json(stats);
  });

  app.post("/api/accounts", async (req, res) => {
    const parsed = insertAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const account = await storage.createAccount(parsed.data);
    res.status(201).json(account);
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid account ID" });
    const parsed = insertAccountSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const updated = await storage.updateAccount(id, parsed.data);
    if (!updated) return res.status(404).json({ error: "Account not found" });
    res.json(updated);
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteAccount(id);
    res.status(204).send();
  });

  app.post("/api/accounts/:id/analyze", async (req, res) => {
    const id = parseInt(req.params.id);
    const account = await storage.getAccount(id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    try {
      const analysis = await analyzeAccountPerformance(
        account.handle, account.niche, account.impressions, account.growth
      );
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Content Sources & AI Generation ──
  app.get("/api/content-sources", async (_req, res) => {
    const sources = await storage.getContentSources();
    res.json(sources);
  });

  app.post("/api/content-sources", async (req, res) => {
    const parsed = insertContentSourceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const source = await storage.createContentSource(parsed.data);
    res.status(201).json(source);
  });

  app.post("/api/content-sources/:id/generate", async (req, res) => {
    const id = parseInt(req.params.id);
    const source = await storage.getContentSource(id);
    if (!source) return res.status(404).json({ error: "Content source not found" });

    const accounts = await storage.getAccounts();
    const handles = accounts.map(a => a.handle);
    const text = source.rawText || source.sourceUrl || "";

    try {
      const generated = await generateContentFromSource(
        text, source.title, source.shortFormPct, source.replyOpsPct, source.longFormPct, handles
      );

      const createdPosts = [];
      for (const post of generated.shortFormPosts) {
        const matchedAccount = accounts.find(a => a.handle === post.suggestedAccount);
        const created = await storage.createGeneratedPost({
          contentSourceId: id,
          accountId: matchedAccount?.id ?? null,
          platform: "x",
          postType: "short",
          content: post.text,
          status: "draft",
          scheduledFor: null,
          impressions: 0,
        });
        createdPosts.push(created);
      }

      for (const lf of generated.longFormDrafts) {
        await storage.createGeneratedPost({
          contentSourceId: id,
          accountId: null,
          platform: "medium",
          postType: "long",
          content: `# ${lf.title}\n\n${lf.content}`,
          status: "draft",
          scheduledFor: null,
          impressions: 0,
        });
      }

      for (const angle of generated.replyAngles) {
        await storage.createReplyAngle({
          contentSourceId: id,
          trigger: angle.trigger,
          angle: angle.angle,
        });
      }

      await storage.updateContentSource(id, { status: "processed" });

      res.json({
        posts: createdPosts.length,
        replyAngles: generated.replyAngles.length,
        longFormDrafts: generated.longFormDrafts.length,
        generated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Generated Posts ──
  app.get("/api/posts", async (req, res) => {
    const sourceId = req.query.contentSourceId ? parseInt(req.query.contentSourceId as string) : undefined;
    const posts = await storage.getGeneratedPosts(sourceId);
    res.json(posts);
  });

  app.get("/api/posts/top", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const posts = await storage.getTopPosts(limit);
    res.json(posts);
  });

  app.get("/api/posts/scheduled", async (_req, res) => {
    const posts = await storage.getScheduledPosts();
    res.json(posts);
  });

  app.patch("/api/posts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid post ID" });
    const parsed = insertGeneratedPostSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const updated = await storage.updateGeneratedPost(id, parsed.data);
    if (!updated) return res.status(404).json({ error: "Post not found" });
    res.json(updated);
  });

  // ── Reply Angles ──
  app.get("/api/reply-angles", async (req, res) => {
    const sourceId = req.query.contentSourceId ? parseInt(req.query.contentSourceId as string) : undefined;
    const angles = await storage.getReplyAngles(sourceId);
    res.json(angles);
  });

  // ── Reply Opportunities ──
  app.get("/api/reply-opportunities", async (_req, res) => {
    const opps = await storage.getReplyOpportunities();
    res.json(opps);
  });

  app.post("/api/reply-opportunities", async (req, res) => {
    const parsed = insertReplyOpportunitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const opp = await storage.createReplyOpportunity(parsed.data);
    res.status(201).json(opp);
  });

  app.post("/api/reply-opportunities/:id/generate-reply", async (req, res) => {
    const id = parseInt(req.params.id);
    const opp = await storage.getReplyOpportunity(id);
    if (!opp) return res.status(404).json({ error: "Opportunity not found" });

    try {
      const reply = await generateReply(opp.tweetContent, opp.targetHandle, opp.niche);
      await storage.updateReplyOpportunity(id, { aiReply: reply });
      res.json({ reply });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/reply-opportunities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid opportunity ID" });
    const parsed = insertReplyOpportunitySchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const updated = await storage.updateReplyOpportunity(id, parsed.data);
    if (!updated) return res.status(404).json({ error: "Opportunity not found" });
    res.json(updated);
  });

  // ── Agent Configs ──
  app.get("/api/agents", async (_req, res) => {
    const configs = await storage.getAgentConfigs();
    res.json(configs);
  });

  app.post("/api/agents", async (req, res) => {
    const parsed = insertAgentConfigSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const config = await storage.createAgentConfig(parsed.data);
    res.status(201).json(config);
  });

  app.patch("/api/agents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid agent ID" });
    const parsed = insertAgentConfigSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const updated = await storage.updateAgentConfig(id, parsed.data);
    if (!updated) return res.status(404).json({ error: "Agent not found" });
    res.json(updated);
  });

  // ── Dashboard Stats ──
  app.get("/api/dashboard/stats", async (_req, res) => {
    const accountStats = await storage.getAccountStats();
    const posts = await storage.getGeneratedPosts();
    const totalImpressions = posts.reduce((sum, p) => sum + p.impressions, 0);
    res.json({
      totalEngagement: totalImpressions,
      aiGeneratedPosts: posts.length,
      activeAgents: (await storage.getAgentConfigs()).filter(a => a.status === "Active").length,
      totalAccounts: accountStats.total,
      accountStats,
    });
  });

  // ── Health Check ──
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      aiConfigured: !!process.env.ANTHROPIC_API_KEY,
    });
  });

  return httpServer;
}