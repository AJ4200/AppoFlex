"use client";

import { useActionState, useRef } from "react";
import { createServiceAction, type ActionState } from "@/app/(app)/dashboard/actions";
import AiDraftButton from "@/components/ui/AiDraftButton";
import Field from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

const initial: ActionState = {};

export default function ServiceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await createServiceAction(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, initial);

  return (
    <form ref={formRef} className="form" action={action}>
      <div className="title">
        Add a service
        <br />
        <span>clients choose from these when booking</span>
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-success" role="status">{state.success}</p>}
      <div className="form-row">
        <Field label="Name" name="name" placeholder="e.g. Haircut" required />
        <Field label="Duration (minutes)" name="durationMinutes" type="number" min={5} max={600} step={5} defaultValue={30} required />
        <Field label="Price (USD)" name="price" type="number" min={0} step="0.01" defaultValue={0} required />
      </div>
      <div className="field field--wide">
        <label className="field-label" htmlFor="service-description">Description</label>
        <textarea id="service-description" name="description" className="input" maxLength={500} placeholder="What does the client get?" />
        <AiDraftButton kind="service-description" formRef={formRef} targetName="description" />
      </div>
      <SubmitButton pendingLabel="Adding...">Add service</SubmitButton>
    </form>
  );
}
