import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const guestApplications = pgTable("guest_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  age: text("age").notNull(),
  position: text("position").notNull(),
  height: text("height").notNull(),
  phone: text("phone").notNull(),
  applied_at: timestamp("applied_at", { withTimezone: true }).defaultNow(),
});

export const insertGuestApplicationSchema = createInsertSchema(guestApplications).omit({
  id: true,
  applied_at: true,
});

export type GuestApplication = typeof guestApplications.$inferSelect;
export type InsertGuestApplication = z.infer<typeof insertGuestApplicationSchema>;

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
