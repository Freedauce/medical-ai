import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }), // For email/password auth (nullable for Google OAuth users)
  clerkId: varchar({ length: 255 }),
  credits: integer().default(100),
  createdAt: timestamp().defaultNow(),
});

export const consultationsTable = pgTable("consultations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar({ length: 255 }).notNull(),
  transcript: text().notNull(),
  aiResponse: text().notNull(),
  symptoms: text(),
  createdAt: timestamp().defaultNow(),
});
