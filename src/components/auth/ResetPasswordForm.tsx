"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthState } from "@/app/(auth)/actions";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import SubmitButton from "@/components/ui/SubmitButton";

const initial: AuthState = {};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initial);

  return (
    <form className="form animate__animated animate__backInRight" action={action} noValidate>
      <div className="title">
        Choose a new password
        <br />
        <span>then you&apos;re back in</span>
      </div>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <Field
        label="New password"
        name="password"
        type="password"
        placeholder="New password"
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        required
      />
      <Field
        label="Reconfirm password"
        name="confirmPassword"
        type="password"
        placeholder="Reconfirm password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />
      <SubmitButton pendingLabel="Saving...">
        Reset password <Icon name="arrow" />
      </SubmitButton>
    </form>
  );
}
