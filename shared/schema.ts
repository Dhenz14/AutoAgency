import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  handle: text("handle").notNull(),
  platform: text("platform").notNull().default("x"),
  niche: text("niche").notNull().default("General"),
  status: text("status").notNull().default("Active"),
  health: text("health").notNull().default("Good"),
  impressions: integer("impressions").notNull().default(0),
  growth: text("growth").notNull().default("+0%"),
  connected: boolean("connected").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const contentSources = pgTable("content_sources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sourceType: text("source_type").notNull().default("url"),
  sourceUrl: text("source_url"),
  rawText: text("raw_text"),
  status: text("status").notNull().default("pending"),
  shortFormPct: integer("short_form_pct").notNull().default(40),
  replyOpsPct: integer("reply_ops_pct").notNull().default(40),
  longFormPct: integer("long_form_pct").notNull().default(20),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const generatedPosts = pgTable("generated_posts", {
  id: serial("id").primaryKey(),
  contentSourceId: integer("content_source_id").references(() => contentSources.id, { onDelete: "cascade" }),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "set null" }),
  platform: text("platform").notNull().default("x"),
  postType: text("post_type").notNull().default("short"),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"),
  scheduledFor: timestamp("scheduled_for"),
  impressions: integer("impressions").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const replyAngles = pgTable("reply_angles", {
  id: serial("id").primaryKey(),
  contentSourceId: integer("content_source_id").references(() => contentSources.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull(),
  angle: text("angle").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const replyOpportunities = pgTable("reply_opportunities", {
  id: serial("id").primaryKey(),
  targetHandle: text("target_handle").notNull(),
  targetFollowers: text("target_followers").notNull().default("0"),
  tweetContent: text("tweet_content").notNull(),
  tweetViews: text("tweet_views").notNull().default("0"),
  niche: text("niche").notNull().default("General"),
  sentiment: text("sentiment").notNull().default("Neutral"),
  aiReply: text("ai_reply"),
  suggestedAccountId: integer("suggested_account_id").references(() => accounts.id, { onDelete: "set null" }),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const agentConfigs = pgTable("agent_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("bot"),
  status: text("status").notNull().default("Active"),
  systemPrompt: text("system_prompt"),
  config: jsonb("config").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export const insertContentSourceSchema = createInsertSchema(contentSources).omit({ id: true, createdAt: true });
export const insertGeneratedPostSchema = createInsertSchema(generatedPosts).omit({ id: true, createdAt: true });
export const insertReplyAngleSchema = createInsertSchema(replyAngles).omit({ id: true, createdAt: true });
export const insertReplyOpportunitySchema = createInsertSchema(replyOpportunities).omit({ id: true, createdAt: true });
export const insertAgentConfigSchema = createInsertSchema(agentConfigs).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type ContentSource = typeof contentSources.$inferSelect;
export type InsertContentSource = z.infer<typeof insertContentSourceSchema>;
export type GeneratedPost = typeof generatedPosts.$inferSelect;
export type InsertGeneratedPost = z.infer<typeof insertGeneratedPostSchema>;
export type ReplyAngle = typeof replyAngles.$inferSelect;
export type InsertReplyAngle = z.infer<typeof insertReplyAngleSchema>;
export type ReplyOpportunity = typeof replyOpportunities.$inferSelect;
export type InsertReplyOpportunity = z.infer<typeof insertReplyOpportunitySchema>;
export type AgentConfig = typeof agentConfigs.$inferSelect;
export type InsertAgentConfig = z.infer<typeof insertAgentConfigSchema>;