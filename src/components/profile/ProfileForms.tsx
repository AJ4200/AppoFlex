"use client";

import { useActionState, useState } from "react";
import {
  changePasswordAction,
  deleteAccountAction,
  updateProfileAction,
  type ProfileState,
} from "@/app/(app)/profile/actions";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import SubmitButton from "@/components/ui/SubmitButton";
import { BUSINESS_TYPES } from "@/lib/constants";

const initial: ProfileState = {};

function Status({ state }: { state: ProfileState }) {
  return (
    <>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-success" role="status">{state.success}</p>}
    </>
  );
}

type Account = {
  name: string;
  email: string;
  role: "client" | "provider";
  provider: { businessName: string; businessType: string; timezone: string } | null;
};

export function ProfileForm({ account }: { account: Account }) {
  const [state, action] = useActionState(updateProfileAction, initial);
  const [email, setEmail] = useState(account.email);
  const emailChanged = email.trim().toLowerCase() !== account.email;

  return (
    <form className="form" action={action} noValidate>
      <div className="title">
        Your details
        <br />
        <span>{account.role === "provider" ? "service provider account" : "client account"}</span>
      </div>
      <Status state={state} />
      <div className="form-row">
        <Field label="Full name" name="name" defaultValue={account.name} autoComplete="name" error={state.fieldErrors?.name} required />
        <Field
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={state.fieldErrors?.email}
          required
        />
      </div>

      {account.provider && (
        <>
          <div className="form-row">
            <Field label="Business name" name="businessName" defaultValue={account.provider.businessName} error={state.fieldErrors?.businessName} required />
            <div className="field">
              <label className="field-label" htmlFor="businessType">Business type</label>
              <select id="businessType" name="businessType" className="input" defaultValue={account.provider.businessType}>
                {!(BUSINESS_TYPES as readonly string[]).includes(account.provider.businessType) && (
                  <option value={account.provider.businessType}>{account.provider.businessType}</option>
                )}
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {state.fieldErrors?.businessType && <span className="field-error">{state.fieldErrors.businessType}</span>}
            </div>
          </div>
          <Field label="Time zone" name="timezone" defaultValue={account.provider.timezone} placeholder="e.g. Africa/Johannesburg" />
        </>
      )}

      {emailChanged && (
        <Field
          label="Current password (needed to change email)"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          error={state.fieldErrors?.currentPassword}
          wide
        />
      )}

      <SubmitButton pendingLabel="Saving...">Save profile <Icon name="check" /></SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initial);

  return (
    <form className="form" action={action} noValidate key={state.success ? "done" : "form"}>
      <div className="title">
        Password
        <br />
        <span>we&apos;ll email you when it changes</span>
      </div>
      <Status state={state} />
      <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" error={state.fieldErrors?.currentPassword} required />
      <Field label="New password" name="password" type="password" autoComplete="new-password" error={state.fieldErrors?.password} required />
      <Field label="Reconfirm new password" name="confirmPassword" type="password" autoComplete="new-password" error={state.fieldErrors?.confirmPassword} required />
      <SubmitButton pendingLabel="Updating...">Change password <Icon name="lock" /></SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, initial);

  return (
    <form className="form" action={action} noValidate>
      <div className="title">
        Delete account
        <br />
        <span>removes your data, appointments and messages for good</span>
      </div>
      <Status state={state} />
      <Field label="Type DELETE to confirm" name="confirm" autoComplete="off" error={state.fieldErrors?.confirm} required />
      <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" error={state.fieldErrors?.currentPassword} required />
      <SubmitButton className="btn-confirm--danger" pendingLabel="Deleting...">Delete my account</SubmitButton>
    </form>
  );
}
