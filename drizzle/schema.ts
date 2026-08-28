import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const crmCompanies = mysqlTable("crmCompanies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  segment: varchar("segment", { length: 64 }).notNull(),
  industry: varchar("industry", { length: 96 }),
  location: varchar("location", { length: 120 }),
  ownerName: varchar("ownerName", { length: 120 }),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const crmContacts = mysqlTable("crmContacts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId"),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 240 }),
  phone: varchar("phone", { length: 48 }),
  role: varchar("role", { length: 120 }),
  ownerName: varchar("ownerName", { length: 120 }),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  lastContactAt: timestamp("lastContactAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const crmDeals = mysqlTable("crmDeals", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId"),
  contactId: int("contactId"),
  title: varchar("title", { length: 180 }).notNull(),
  stage: varchar("stage", { length: 48 }).default("qualification").notNull(),
  amount: int("amount").default(0).notNull(),
  probability: int("probability").default(10).notNull(),
  ownerName: varchar("ownerName", { length: 120 }).notNull(),
  nextAction: varchar("nextAction", { length: 180 }),
  closeDate: timestamp("closeDate"),
  status: varchar("status", { length: 32 }).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const crmDocuments = mysqlTable("crmDocuments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId"),
  dealId: int("dealId"),
  type: varchar("type", { length: 32 }).notNull(),
  number: varchar("number", { length: 48 }).notNull(),
  status: varchar("status", { length: 32 }).default("draft").notNull(),
  amount: int("amount").default(0).notNull(),
  dueDate: timestamp("dueDate"),
  issuedAt: timestamp("issuedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const crmTasks = mysqlTable("crmTasks", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId"),
  dealId: int("dealId"),
  title: varchar("title", { length: 180 }).notNull(),
  assignee: varchar("assignee", { length: 120 }).notNull(),
  status: varchar("status", { length: 32 }).default("open").notNull(),
  priority: varchar("priority", { length: 24 }).default("normal").notNull(),
  kind: varchar("kind", { length: 48 }).default("follow-up").notNull(),
  dueAt: timestamp("dueAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const crmActivities = mysqlTable("crmActivities", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId"),
  dealId: int("dealId"),
  contactId: int("contactId"),
  type: varchar("type", { length: 32 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body"),
  ownerName: varchar("ownerName", { length: 120 }),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const crmNotifications = mysqlTable("crmNotifications", {
  id: int("id").autoincrement().primaryKey(),
  kind: varchar("kind", { length: 32 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body"),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Company = typeof crmCompanies.$inferSelect;
export type Contact = typeof crmContacts.$inferSelect;
export type Deal = typeof crmDeals.$inferSelect;
export type Document = typeof crmDocuments.$inferSelect;
export type Task = typeof crmTasks.$inferSelect;
export type Activity = typeof crmActivities.$inferSelect;
export type Notification = typeof crmNotifications.$inferSelect;
