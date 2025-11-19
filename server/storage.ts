import { type User, type InsertUser, type MembershipApplication, type InsertMembershipApplication, type ContactMessage, type InsertContactMessage, type YoutubePost, type InsertYoutubePost } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMembershipApplication(application: InsertMembershipApplication): Promise<MembershipApplication>;
  getMembershipApplications(): Promise<MembershipApplication[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  createYoutubePost(post: InsertYoutubePost): Promise<YoutubePost>;
  getYoutubePosts(): Promise<YoutubePost[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private membershipApplications: Map<string, MembershipApplication>;
  private contactMessages: Map<string, ContactMessage>;
  private youtubePosts: Map<number, YoutubePost>;

  constructor() {
    this.users = new Map();
    this.membershipApplications = new Map();
    this.contactMessages = new Map();
    this.youtubePosts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMembershipApplication(insertApplication: InsertMembershipApplication): Promise<MembershipApplication> {
    const id = randomUUID();
    const application: MembershipApplication = {
      ...insertApplication,
      id,
      agreeRules: insertApplication.agreeRules ?? "false",
      dataConsent: insertApplication.dataConsent ?? "false",
      createdAt: new Date(),
    };
    this.membershipApplications.set(id, application);
    return application;
  }

  async getMembershipApplications(): Promise<MembershipApplication[]> {
    return Array.from(this.membershipApplications.values());
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async createYoutubePost(insertPost: InsertYoutubePost): Promise<YoutubePost> {
    const id = Math.max(0, ...Array.from(this.youtubePosts.keys())) + 1;
    const post: YoutubePost = {
      ...insertPost,
      id,
      description: insertPost.description ?? null,
      created_at: new Date(),
    };
    this.youtubePosts.set(id, post);
    return post;
  }

  async getYoutubePosts(): Promise<YoutubePost[]> {
    return Array.from(this.youtubePosts.values());
  }
}

export const storage = new MemStorage();
