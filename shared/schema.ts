import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  role: text("role"),
  stack: text("stack").array(),
  links: jsonb("links"),
  featured: text("featured").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolioContent = pgTable("portfolio_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'about', 'contact', 'resume'
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertContentSchema = createInsertSchema(portfolioContent).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type PortfolioContent = typeof portfolioContent.$inferSelect;

export interface CommandOutput {
  command: string;
  output: string;
  timestamp: Date;
}

export interface ThemeConfig {
  name: string;
  colors: {
    background: string;
    foreground: string;
    border: string;
    primary: string;
    accent: string;
  };
}
