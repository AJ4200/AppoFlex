"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { availability, db, providers, users } from "@/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { isValidTimeZone } from "@/lib/time";

export type AuthState = {
  error?: string;
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
    .values({ email: data.email, name: data.name, role: data.role, passwordHash })
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

// Only allow same-site relative redirects
function safeNext(value: FormDataEntryValue | null) {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}
