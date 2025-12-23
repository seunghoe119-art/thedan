import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const youtubePosts = pgTable("youtube_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  youtube_id: text("youtube_id").notNull().unique(),
  youtube_url: text("youtube_url").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertYoutubePostSchema = createInsertSchema(youtubePosts).pick({
  title: true,
  description: true,
  youtube_id: true,
  youtube_url: true,
});

export type YoutubePost = typeof youtubePosts.$inferSelect;
export type InsertYoutubePost = z.infer<typeof insertYoutubePostSchema>;
