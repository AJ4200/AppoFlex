import type { Metadata } from "next";
import SigninForm from "@/components/auth/SigninForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <SigninForm next={next} />;
}
