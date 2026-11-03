import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { findValidResetToken } from "@/lib/password-reset";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const valid = await findValidResetToken(token);

  if (!valid) {
    return (
      <div className="form">
        <div className="title">
          Link expired
          <br />
          <span>this reset link is invalid or already used</span>
        </div>
        <Link href="/forgot-password" className="btn-confirm">
          Request a new link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
