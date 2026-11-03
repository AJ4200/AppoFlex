import type { Metadata } from "next";
import Link from "next/link";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/profile/ProfileForms";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <div className="page-title">
        <h1>Your profile</h1>
        <p>
          Manage your details, password and account. You agreed to the{" "}
          <Link href="/legal/eula" className="accent">EULA</Link> when you joined.
        </p>
      </div>

      <div className="stack profile-stack">
        <ProfileForm
          account={{
            name: user.name,
            email: user.email,
            role: user.role,
            provider: user.provider
              ? {
                  businessName: user.provider.businessName,
                  businessType: user.provider.businessType,
                  timezone: user.provider.timezone,
                }
              : null,
          }}
        />
        <PasswordForm />
        <DeleteAccountForm />
      </div>
    </>
  );
}
