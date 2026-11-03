"use client";

import { useActionState, useRef } from "react";
import { sendMessageAction, type AppointmentState } from "@/app/(app)/appointments/actions";
import AiDraftButton from "@/components/ui/AiDraftButton";
import SubmitButton from "@/components/ui/SubmitButton";

const initial: AppointmentState = {};

export default function MessageComposer({ appointmentId, summary }: { appointmentId: string; summary: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(async (prev: AppointmentState, formData: FormData) => {
    const result = await sendMessageAction(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, initial);

  return (
    <form ref={formRef} action={action} className="stack">
      <input type="hidden" name="id" value={appointmentId} />
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <label className="sr-only" htmlFor="message-body">Message</label>
      <textarea id="message-body" name="body" className="input" style={{ width: "100%" }} maxLength={1000} placeholder="Write a message..." required />
      <div className="row row--between">
        <AiDraftButton kind="message" formRef={formRef} targetName="body" context={{ summary }} label="Polish with AI" />
        <SubmitButton className="btn-confirm--sm" pendingLabel="Sending...">Send</SubmitButton>
      </div>
    </form>
  );
}
