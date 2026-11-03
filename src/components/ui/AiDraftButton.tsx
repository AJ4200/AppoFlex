"use client";

import { useState, type RefObject } from "react";

type Props = {
  kind: "service-description" | "message";
  /** Form that holds the fields used as AI context and receives the draft */
  formRef: RefObject<HTMLFormElement | null>;
  targetName: string;
  /** Extra context sent to the model (e.g. appointment details) */
  context?: Record<string, string>;
  label?: string;
};

export default function AiDraftButton({ kind, formRef, targetName, context, label = "✨ Draft with AI" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function draft() {
    const form = formRef.current;
    if (!form) return;
    setLoading(true);
    setError("");
    try {
      const fields = Object.fromEntries(
        [...new FormData(form).entries()].filter(([, v]) => typeof v === "string"),
      ) as Record<string, string>;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, fields, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The AI assistant is unavailable.");
      const target = form.elements.namedItem(targetName) as HTMLTextAreaElement | HTMLInputElement | null;
      if (target) {
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), "value")?.set;
        setter?.call(target, data.text);
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row">
      <button type="button" className="btn-confirm btn-confirm--sm" onClick={draft} disabled={loading}>
        {loading ? "Thinking..." : label}
      </button>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
