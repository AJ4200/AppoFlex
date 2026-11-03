import { db, notifications } from "@/db";

export async function notify(
  userId: string,
  { title, body = "", href }: { title: string; body?: string; href?: string },
) {
  await db.insert(notifications).values({ userId, title, body, href });
}
