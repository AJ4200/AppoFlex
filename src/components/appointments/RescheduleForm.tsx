"use client";

import { useActionState } from "react";
import { rescheduleAppointmentAction, type AppointmentState } from "@/app/(app)/appointments/actions";
import SlotPicker from "@/components/booking/SlotPicker";
import SubmitButton from "@/components/ui/SubmitButton";

const initial: AppointmentState = {};

export default function RescheduleForm({
  appointmentId,
  providerId,
  serviceId,
  timezone,
}: {
  appointmentId: string;
  providerId: string;
  serviceId: string;
  timezone: string;
}) {
  const [state, action] = useActionState(rescheduleAppointmentAction, initial);

  return (
    <details className="panel glass">
      <summary style={{ cursor: "pointer" }}>Reschedule</summary>
      <form action={action} className="stack" style={{ marginTop: "1rem" }}>
        <input type="hidden" name="id" value={appointmentId} />
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        {state.success && <p className="form-success" role="status">{state.success}</p>}
        <SlotPicker providerId={providerId} serviceId={serviceId} timezone={timezone} ignoreAppointmentId={appointmentId} />
        <SubmitButton className="btn-confirm--sm" pendingLabel="Moving...">Move appointment</SubmitButton>
      </form>
    </details>
  );
}
