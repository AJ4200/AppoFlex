"use client";

import { useFormStatus } from "react-dom";
import Loader from "./Loader";

export default function SubmitButton({
  children,
  pendingLabel = "Please wait",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`btn-confirm ${className}`} disabled={pending} aria-busy={pending}>
      {pending ? <Loader label={pendingLabel} /> : children}
    </button>
  );
}
