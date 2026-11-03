"use client";

import { useActionState } from "react";
import { saveHoursAction, type ActionState } from "@/app/(app)/dashboard/actions";
import Field from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import type { Availability, Provider } from "@/db/schema";
import { formatMinutes, WEEKDAYS } from "@/lib/time";

const initial: ActionState = {};
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function HoursForm({ provider, hours }: { provider: Provider; hours: Availability[] }) {
  const [state, action] = useActionState(saveHoursAction, initial);
  const byDay = new Map(hours.map((h) => [h.weekday, h]));

  return (
    <form className="form" action={action}>
      <div className="title">
        Business profile &amp; hours
        <br />
        <span>times are in {provider.timezone}</span>
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-success" role="status">{state.success}</p>}

      <div className="form-row">
        <Field label="Business name" name="businessName" defaultValue={provider.businessName} required />
        <Field label="Gap between appointments (min)" name="bufferMinutes" type="number" min={0} max={120} step={5} defaultValue={provider.bufferMinutes} />
      </div>
      <div className="field field--wide">
        <label className="field-label" htmlFor="description">About your business</label>
        <textarea id="description" name="description" className="input" maxLength={600} defaultValue={provider.description} placeholder="Tell clients what you do" />
      </div>

      <div className="stack" style={{ width: "100%", maxWidth: "36rem" }}>
        {ORDER.map((day) => {
          const row = byDay.get(day);
          return (
            <div key={day} className="hours-row">
              <label>
                <input type="checkbox" name={`open_${day}`} defaultChecked={Boolean(row)} /> {WEEKDAYS[day].slice(0, 3)}
              </label>
              <input className="input" type="time" name={`start_${day}`} defaultValue={formatMinutes(row?.startMinute ?? 540)} aria-label={`${WEEKDAYS[day]} opens`} />
              <input className="input" type="time" name={`end_${day}`} defaultValue={formatMinutes(row?.endMinute ?? 1020)} aria-label={`${WEEKDAYS[day]} closes`} />
            </div>
          );
        })}
      </div>
      <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
    </form>
  );
}
