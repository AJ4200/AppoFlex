import { createHash } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, passwordResetTokens } from "@/db";

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function findValidResetToken(token: string) {
  const [row] = await db
    .select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}
