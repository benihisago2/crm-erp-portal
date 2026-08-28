import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  crmActivities,
  crmCompanies,
  crmContacts,
  crmDeals,
  crmDocuments,
  crmNotifications,
  crmTasks,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getCrmSnapshot() {
  const db = await getDb();
  if (!db) return null;
  const [companies, contacts, deals, documents, tasks, activities, notifications] = await Promise.all([
    db.select().from(crmCompanies),
    db.select().from(crmContacts),
    db.select().from(crmDeals),
    db.select().from(crmDocuments),
    db.select().from(crmTasks),
    db.select().from(crmActivities),
    db.select().from(crmNotifications),
  ]);
  return { companies, contacts, deals, documents, tasks, activities, notifications };
}

export async function listCompanies() {
  const db = await getDb();
  return db ? db.select().from(crmCompanies) : [];
}
export async function createCompany(input: typeof crmCompanies.$inferInsert) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.insert(crmCompanies).values(input);
  return { success: true as const };
}
export async function updateCompany(id: number, input: Partial<typeof crmCompanies.$inferInsert>) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.update(crmCompanies).set(input).where(eq(crmCompanies.id, id));
  return { success: true as const };
}

export async function listContacts() {
  const db = await getDb();
  return db ? db.select().from(crmContacts) : [];
}
export async function createContact(input: typeof crmContacts.$inferInsert) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.insert(crmContacts).values(input);
  return { success: true as const };
}
export async function updateContact(id: number, input: Partial<typeof crmContacts.$inferInsert>) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.update(crmContacts).set(input).where(eq(crmContacts.id, id));
  return { success: true as const };
}

export async function listDeals() {
  const db = await getDb();
  return db ? db.select().from(crmDeals) : [];
}
export async function createDeal(input: typeof crmDeals.$inferInsert) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.insert(crmDeals).values(input);
  return { success: true as const };
}
export async function updateDeal(id: number, input: Partial<typeof crmDeals.$inferInsert>) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.update(crmDeals).set(input).where(eq(crmDeals.id, id));
  return { success: true as const };
}

export async function listDocuments() {
  const db = await getDb();
  return db ? db.select().from(crmDocuments) : [];
}
export async function createDocument(input: typeof crmDocuments.$inferInsert) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.insert(crmDocuments).values(input);
  return { success: true as const };
}
export async function updateDocument(id: number, input: Partial<typeof crmDocuments.$inferInsert>) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.update(crmDocuments).set(input).where(eq(crmDocuments.id, id));
  return { success: true as const };
}

export async function listTasks() {
  const db = await getDb();
  return db ? db.select().from(crmTasks) : [];
}
export async function createTask(input: typeof crmTasks.$inferInsert) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.insert(crmTasks).values(input);
  return { success: true as const };
}
export async function updateTask(id: number, input: Partial<typeof crmTasks.$inferInsert>) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.update(crmTasks).set(input).where(eq(crmTasks.id, id));
  return { success: true as const };
}

export async function listActivities() {
  const db = await getDb();
  return db ? db.select().from(crmActivities) : [];
}
export async function createActivity(input: typeof crmActivities.$inferInsert) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.insert(crmActivities).values(input);
  return { success: true as const };
}

export async function listNotifications() {
  const db = await getDb();
  return db ? db.select().from(crmNotifications) : [];
}
export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return { success: false as const, reason: "database-unavailable" };
  await db.update(crmNotifications).set({ isRead: 1 }).where(eq(crmNotifications.id, id));
  return { success: true as const };
}
