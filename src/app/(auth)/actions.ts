"use server";

import { randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { availability, db, passwordResetTokens, providers, users } from "@/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { sendPasswordChangedEmail, sendPasswordResetEmail } from "@/lib/email";
import { findValidResetToken, hashToken } from "@/lib/password-reset";
import { isValidTimeZone } from "@/lib/time";

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

const signupSchema = z
  .object({
    role: z.enum(["client", "provider"]),
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: emailSchema,
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string(),
    businessName: z.string().trim().max(80).optional(),
    businessType: z.string().trim().max(60).optional(),
    timezone: z.string().optional(),
    acceptEula: z.literal("on", { error: "You must accept the EULA to create an account" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
    }
    if (data.role === "provider") {
      if (!data.businessName || data.businessName.length < 2) {
        ctx.addIssue({ code: "custom", path: ["businessName"], message: "Enter your business name" });
      }
      if (!data.businessType) {
        ctx.addIssue({ code: "custom", path: ["businessType"], message: "Choose a business type" });
      }
    }
  });

function fieldErrorsFrom(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

function safeValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.toLowerCase().includes("password")) values[key] = value;
  }
  return values;
}

export async function signinAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = safeValues(formData);
  const parsed = signinSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const valid = user && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!user || !valid) return { error: "Incorrect email or password.", values };

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = safeValues(formData);
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };
  const data = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists" }, values };
  }

  const passwordHash = await hashPassword(data.password);
  const [user] = await db
    .insert(users)
    .values({ email: data.email, name: data.name, role: data.role, passwordHash, eulaAcceptedAt: new Date() })
    .returning({ id: users.id });

  if (data.role === "provider") {
    const timezone = data.timezone && isValidTimeZone(data.timezone) ? data.timezone : "UTC";
    await db.insert(providers).values({
      userId: user.id,
      businessName: data.businessName!,
      businessType: data.businessType!,
      timezone,
    });
    // Monday to Friday, 09:00 - 17:00 by default
    await db.insert(availability).values(
      [1, 2, 3, 4, 5].map((weekday) => ({
        providerId: user.id,
        weekday,
        startMinute: 9 * 60,
        endMinute: 17 * 60,
      })),
    );
  }

  await createSession(user.id);
  redirect(data.role === "provider" ? "/dashboard/services" : "/providers");
}

export async function signoutAction() {
  await destroySession();
  redirect("/");
}

const RESET_MINUTES = 60;
const RESET_COOLDOWN_SECONDS = 60;

export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = safeValues(formData);
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: "Enter a valid email address" }, values };

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data)).limit(1);
  if (user) {
    const [recent] = await db
      .select({ id: passwordResetTokens.id })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          gt(passwordResetTokens.createdAt, new Date(Date.now() - RESET_COOLDOWN_SECONDS * 1000)),
        ),
      )
      .limit(1);

    if (!recent) {
      const token = randomBytes(32).toString("hex");
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_MINUTES * 60 * 1000),
      });
      try {
        await sendPasswordResetEmail(user.email, user.name, token, RESET_MINUTES);
      } catch (error) {
        console.error("Failed to send password reset email", error);
      }
    }
  }

  // Same answer whether or not the account exists, so emails can't be probed
  return {
    success: "If an account exists for that email, we've sent a link to reset the password. It expires in 60 minutes.",
    values,
  };
}

const resetSchema = z
  .object({
    token: z.string().min(20),
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const record = await findValidResetToken(parsed.data.token);
  if (!record) return { error: "This reset link is invalid or has expired. Request a new one." };

  const passwordHash = await hashPassword(parsed.data.password);
  const [user] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, record.userId))
    .returning({ id: users.id, email: users.email, name: users.name });
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, record.userId));

  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (error) {
    console.error("Failed to send password changed email", error);
  }

  await createSession(user.id);
  redirect("/dashboard");
}

// Only allow same-site relative redirects
function safeNext(value: FormDataEntryValue | null) {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}
