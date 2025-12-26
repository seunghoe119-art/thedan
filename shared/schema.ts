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

export const guestRecruitmentStatus = pgTable("guest_recruitment_status", {
  id: uuid("id").primaryKey().defaultRandom(),
  is_closed: text("is_closed").notNull().default('false'),
  closed_at: timestamp("closed_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertGuestApplicationSchema = createInsertSchema(guestApplications).omit({
  id: true,
  applied_at: true,
});

export type GuestApplication = typeof guestApplications.$inferSelect;
export type InsertGuestApplication = z.infer<typeof insertGuestApplicationSchema>;

export const membershipApplications = pgTable("membership_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  age: text("age").notNull(),
  position: text("position").notNull(),
  uniform_size: text("uniform_size").notNull(),
  height_range: text("height_range").notNull(),
  plan: text("plan").notNull(),
  payment_status: text("payment_status").notNull().default('pending'),
  target_month: text("target_month").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertMembershipApplicationSchema = createInsertSchema(membershipApplications).omit({
  id: true,
  created_at: true,
});

export type MembershipApplication = typeof membershipApplications.$inferSelect;
export type InsertMembershipApplication = z.infer<typeof insertMembershipApplicationSchema>;

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
