"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, providers, users } from "@/db";
import { destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { BUSINESS_TYPES } from "@/lib/constants";
import { sendPasswordChangedEmail } from "@/lib/email";
import { isValidTimeZone } from "@/lib/time";

export type ProfileState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrorsFrom(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
  return fieldErrors;
}

async function passwordMatches(userId: string, password: string) {
  const [row] = await db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  return Boolean(row && password && (await verifyPassword(password, row.hash)));
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  currentPassword: z.string().optional(),
  businessName: z.string().trim().min(2, "Enter your business name").max(80).optional(),
  businessType: z
    .string()
    .refine((v) => (BUSINESS_TYPES as readonly string[]).includes(v), "Choose a business type")
    .optional(),
  timezone: z.string().optional(),
});

export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = parsed.data;

  const emailChanged = data.email !== user.email;
  if (emailChanged) {
    if (!(await passwordMatches(user.id, data.currentPassword ?? ""))) {
      return { fieldErrors: { currentPassword: "Enter your current password to change your email" } };
    }
    const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
    if (taken && taken.id !== user.id) {
      return { fieldErrors: { email: "An account with this email already exists" } };
    }
  }

  await db.update(users).set({ name: data.name, email: data.email }).where(eq(users.id, user.id));

  if (user.role === "provider" && user.provider) {
    const timezone = data.timezone && isValidTimeZone(data.timezone) ? data.timezone : user.provider.timezone;
    await db
      .update(providers)
      .set({
        businessName: data.businessName ?? user.provider.businessName,
        businessType: data.businessType ?? user.provider.businessType,
        timezone,
      })
      .where(eq(providers.userId, user.id));
  }

  revalidatePath("/", "layout");
  return { success: "Profile saved" };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((d) => d.password !== d.currentPassword, {
    path: ["password"],
    message: "Choose a different password from the current one",
  });

export async function changePasswordAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  if (!(await passwordMatches(user.id, parsed.data.currentPassword))) {
    return { fieldErrors: { currentPassword: "That isn't your current password" } };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password) })
    .where(eq(users.id, user.id));

  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (error) {
    console.error("Failed to send password changed email", error);
  }
  return { success: "Password updated" };
}

export async function deleteAccountAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser();
  if (String(formData.get("confirm") ?? "").trim().toLowerCase() !== "delete") {
    return { fieldErrors: { confirm: "Type DELETE to confirm" } };
  }
  if (!(await passwordMatches(user.id, String(formData.get("currentPassword") ?? "")))) {
    return { fieldErrors: { currentPassword: "That isn't your current password" } };
  }

  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  redirect("/");
}
