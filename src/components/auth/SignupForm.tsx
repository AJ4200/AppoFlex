"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { signupAction, type AuthState } from "@/app/(auth)/actions";
import Icon from "@/components/ui/Icon";
import Field from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import { BUSINESS_TYPES } from "@/lib/constants";

const initial: AuthState = {};

export default function SignupForm() {
  const [state, action] = useActionState(signupAction, initial);
  const [role, setRole] = useState<"client" | "provider">(
    state.values?.role === "provider" ? "provider" : "client",
  );
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  return (
    <form className="form animate__animated animate__backInRight" action={action} noValidate>
      <div className="title">
        Welcome,
        <br />
        <span>sign up to continue</span>
      </div>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <fieldset className="segmented" style={{ padding: 0, margin: 0 }}>
        <legend className="sr-only">I am a</legend>
        {(["client", "provider"] as const).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="role"
              value={value}
              checked={role === value}
              onChange={() => setRole(value)}
            />
            <span>{value === "client" ? "I book appointments" : "I offer services"}</span>
          </label>
        ))}
      </fieldset>

      <Field
        label="Full name"
        name="name"
        placeholder="Full name"
        autoComplete="name"
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
        required
      />
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
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        required
      />
      <Field
        label="Reconfirm password"
        name="confirmPassword"
        type="password"
        placeholder="Reconfirm Password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />

      {role === "provider" && (
        <>
          <Field
            label="Business name"
            name="businessName"
            placeholder="Business Name"
            defaultValue={state.values?.businessName}
            error={state.fieldErrors?.businessName}
            required
          />
          <div className="field">
            <label className="field-label" htmlFor="businessType">
              Business type
            </label>
            <select
              id="businessType"
              name="businessType"
              className="input"
              defaultValue={state.values?.businessType ?? ""}
              aria-invalid={state.fieldErrors?.businessType ? true : undefined}
              required
            >
              <option value="" disabled>
                Choose a type
              </option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {state.fieldErrors?.businessType && (
              <span className="field-error">{state.fieldErrors.businessType}</span>
            )}
          </div>
          <input type="hidden" name="timezone" value={timezone} />
        </>
      )}

      <SubmitButton pendingLabel="Creating account...">Sign up →</SubmitButton>
      <p className="form-footer">
        Already have an account? <Link href="/signin">Sign in</Link>
      </p>
    </form>
  );
}
