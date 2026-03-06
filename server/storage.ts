import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import {
  users, accounts, contentSources, generatedPosts, replyAngles,
  replyOpportunities, agentConfigs,
  type User, type InsertUser,
  type Account, type InsertAccount,
  type ContentSource, type InsertContentSource,
  type GeneratedPost, type InsertGeneratedPost,
  type ReplyAngle, type InsertReplyAngle,
  type ReplyOpportunity, type InsertReplyOpportunity,
  type AgentConfig, type InsertAgentConfig,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, data: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<void>;
  getAccountStats(): Promise<{ total: number; thriving: number; needsTuning: number; critical: number }>;

  getContentSources(): Promise<ContentSource[]>;
  getContentSource(id: number): Promise<ContentSource | undefined>;
  createContentSource(source: InsertContentSource): Promise<ContentSource>;
  updateContentSource(id: number, data: Partial<InsertContentSource>): Promise<ContentSource | undefined>;

  getGeneratedPosts(contentSourceId?: number): Promise<GeneratedPost[]>;
  getGeneratedPost(id: number): Promise<GeneratedPost | undefined>;
  createGeneratedPost(post: InsertGeneratedPost): Promise<GeneratedPost>;
  updateGeneratedPost(id: number, data: Partial<InsertGeneratedPost>): Promise<GeneratedPost | undefined>;
  getTopPosts(limit: number): Promise<GeneratedPost[]>;
  getScheduledPosts(): Promise<GeneratedPost[]>;

  getReplyAngles(contentSourceId?: number): Promise<ReplyAngle[]>;
  createReplyAngle(angle: InsertReplyAngle): Promise<ReplyAngle>;

  getReplyOpportunities(): Promise<ReplyOpportunity[]>;
  getReplyOpportunity(id: number): Promise<ReplyOpportunity | undefined>;
  createReplyOpportunity(opp: InsertReplyOpportunity): Promise<ReplyOpportunity>;
  updateReplyOpportunity(id: number, data: Partial<InsertReplyOpportunity>): Promise<ReplyOpportunity | undefined>;

  getAgentConfigs(): Promise<AgentConfig[]>;
  getAgentConfig(id: number): Promise<AgentConfig | undefined>;
  createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig>;
  updateAgentConfig(id: number, data: Partial<InsertAgentConfig>): Promise<AgentConfig | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getAccounts(): Promise<Account[]> {
    return db.select().from(accounts).orderBy(desc(accounts.impressions));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [created] = await db.insert(accounts).values(account).returning();
    return created;
  }

  async updateAccount(id: number, data: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updated] = await db.update(accounts).set(data).where(eq(accounts.id, id)).returning();
    return updated;
  }

  async deleteAccount(id: number): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }

  async getAccountStats() {
    const all = await db.select().from(accounts);
    return {
      total: all.length,
      thriving: all.filter(a => ['Excellent', 'Good', 'Viral'].includes(a.health)).length,
      needsTuning: all.filter(a => a.health === 'Needs Tuning').length,
      critical: all.filter(a => ['Critical', 'Shadowbanned'].includes(a.health)).length,
    };
  }

  async getContentSources(): Promise<ContentSource[]> {
    return db.select().from(contentSources).orderBy(desc(contentSources.createdAt));
  }

  async getContentSource(id: number): Promise<ContentSource | undefined> {
    const [source] = await db.select().from(contentSources).where(eq(contentSources.id, id));
    return source;
  }

  async createContentSource(source: InsertContentSource): Promise<ContentSource> {
    const [created] = await db.insert(contentSources).values(source).returning();
    return created;
  }

  async updateContentSource(id: number, data: Partial<InsertContentSource>): Promise<ContentSource | undefined> {
    const [updated] = await db.update(contentSources).set(data).where(eq(contentSources.id, id)).returning();
    return updated;
  }

  async getGeneratedPosts(contentSourceId?: number): Promise<GeneratedPost[]> {
    if (contentSourceId) {
      return db.select().from(generatedPosts).where(eq(generatedPosts.contentSourceId, contentSourceId)).orderBy(desc(generatedPosts.createdAt));
    }
    return db.select().from(generatedPosts).orderBy(desc(generatedPosts.createdAt));
  }

  async getGeneratedPost(id: number): Promise<GeneratedPost | undefined> {
    const [post] = await db.select().from(generatedPosts).where(eq(generatedPosts.id, id));
    return post;
  }

  async createGeneratedPost(post: InsertGeneratedPost): Promise<GeneratedPost> {
    const [created] = await db.insert(generatedPosts).values(post).returning();
    return created;
  }

  async updateGeneratedPost(id: number, data: Partial<InsertGeneratedPost>): Promise<GeneratedPost | undefined> {
    const [updated] = await db.update(generatedPosts).set(data).where(eq(generatedPosts.id, id)).returning();
    return updated;
  }

  async getTopPosts(limit: number): Promise<GeneratedPost[]> {
    return db.select().from(generatedPosts).orderBy(desc(generatedPosts.impressions)).limit(limit);
  }

  async getScheduledPosts(): Promise<GeneratedPost[]> {
    return db.select().from(generatedPosts)
      .where(sql`${generatedPosts.status} IN ('scheduled', 'pending_approval', 'draft')`)
      .orderBy(generatedPosts.scheduledFor);
  }

  async getReplyAngles(contentSourceId?: number): Promise<ReplyAngle[]> {
    if (contentSourceId) {
      return db.select().from(replyAngles).where(eq(replyAngles.contentSourceId, contentSourceId));
    }
    return db.select().from(replyAngles).orderBy(desc(replyAngles.createdAt));
  }

  async createReplyAngle(angle: InsertReplyAngle): Promise<ReplyAngle> {
    const [created] = await db.insert(replyAngles).values(angle).returning();
    return created;
  }

  async getReplyOpportunities(): Promise<ReplyOpportunity[]> {
    return db.select().from(replyOpportunities).orderBy(desc(replyOpportunities.createdAt));
  }

  async getReplyOpportunity(id: number): Promise<ReplyOpportunity | undefined> {
    const [opp] = await db.select().from(replyOpportunities).where(eq(replyOpportunities.id, id));
    return opp;
  }

  async createReplyOpportunity(opp: InsertReplyOpportunity): Promise<ReplyOpportunity> {
    const [created] = await db.insert(replyOpportunities).values(opp).returning();
    return created;
  }

  async updateReplyOpportunity(id: number, data: Partial<InsertReplyOpportunity>): Promise<ReplyOpportunity | undefined> {
    const [updated] = await db.update(replyOpportunities).set(data).where(eq(replyOpportunities.id, id)).returning();
    return updated;
  }

  async getAgentConfigs(): Promise<AgentConfig[]> {
    return db.select().from(agentConfigs).orderBy(agentConfigs.name);
  }

  async getAgentConfig(id: number): Promise<AgentConfig | undefined> {
    const [config] = await db.select().from(agentConfigs).where(eq(agentConfigs.id, id));
    return config;
  }

  async createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig> {
    const [created] = await db.insert(agentConfigs).values(config).returning();
    return created;
  }

  async updateAgentConfig(id: number, data: Partial<InsertAgentConfig>): Promise<AgentConfig | undefined> {
    const [updated] = await db.update(agentConfigs).set(data).where(eq(agentConfigs.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();