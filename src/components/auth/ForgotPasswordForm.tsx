"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction, type AuthState } from "@/app/(auth)/actions";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import SubmitButton from "@/components/ui/SubmitButton";

const initial: AuthState = {};

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initial);

  return (
    <form className="form animate__animated animate__backInLeft" action={action} noValidate>
      <div className="title">
        Forgot your password?
        <br />
        <span>we&apos;ll email you a reset link</span>
      </div>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="form-success" role="status">
          {state.success}
        </p>
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        required
      />
      <SubmitButton pendingLabel="Sending link...">
        Send reset link <Icon name="arrow" />
      </SubmitButton>
      <p className="form-footer">
        Remembered it? <Link href="/signin">Sign in</Link>
      </p>
    </form>
  );
}
