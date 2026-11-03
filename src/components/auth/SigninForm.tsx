"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signinAction, type AuthState } from "@/app/(auth)/actions";
import Icon from "@/components/ui/Icon";
import Field from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

const initial: AuthState = {};

export default function SigninForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signinAction, initial);

  return (
    <form className="form animate__animated animate__backInLeft" action={action} noValidate>
      <div className="title">
        Welcome back,
        <br />
        <span>sign in to continue</span>
      </div>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {next && <input type="hidden" name="next" value={next} />}
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
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        required
      />
      <Link href="/forgot-password" className="form-aside">Forgot password?</Link>
      <SubmitButton pendingLabel="Signing in...">Sign in <Icon name="arrow" /></SubmitButton>
      <p className="form-footer">
        New to AppoFlex? <Link href="/signup">Create an account</Link>
      </p>
    </form>
  );
}
