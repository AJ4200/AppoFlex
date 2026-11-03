import { db, notifications } from "@/db";

export async function notify(
  userId: string,
  { title, body = "", href }: { title: string; body?: string; href?: string },
) {
  // Alerts are best-effort: a failed notification must never fail the action that triggered it
  try {
    await db.insert(notifications).values({ userId, title, body, href });
  } catch (error) {
    console.error("Failed to create notification", error);
  }
}
