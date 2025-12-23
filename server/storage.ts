import { type YoutubePost, type InsertYoutubePost } from "@shared/schema";

export interface IStorage {
  createYoutubePost(post: InsertYoutubePost): Promise<YoutubePost>;
  getYoutubePosts(): Promise<YoutubePost[]>;
}

export class MemStorage implements IStorage {
  private youtubePosts: Map<number, YoutubePost>;

  constructor() {
    this.youtubePosts = new Map();
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
