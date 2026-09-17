import { db } from "@/lib/db";
import { users, type User } from "@/lib/schema";
import { ensureCorePlan } from "@/lib/seed";
import { eq } from "drizzle-orm";

const DEFAULT_USER_ID = "local";

// Single-user mode: no login. The app runs as one auto-provisioned
// local user, created on first use.
export async function getDefaultUser(): Promise<User> {
  await ensureCorePlan();
  const existing = await db.select().from(users).where(eq(users.id, DEFAULT_USER_ID)).get();
  if (existing) return existing;

  await db.insert(users).values({
    id: DEFAULT_USER_ID,
    email: "local@intellgnce",
    passwordHash: "local",
    timezone: "UTC",
  });

  const created = await db.select().from(users).where(eq(users.id, DEFAULT_USER_ID)).get();
  if (!created) throw new Error("Failed to provision local user.");
  return created;
}
