"use client";

import { useActionState, useState } from "react";
import { bookAppointmentAction, type AppointmentState } from "@/app/(app)/appointments/actions";
import Icon from "@/components/ui/Icon";
import SubmitButton from "@/components/ui/SubmitButton";
import { formatPrice } from "@/lib/time";
import SlotPicker from "./SlotPicker";

type ServiceOption = { id: string; name: string; durationMinutes: number; priceCents: number; description: string };

type Intent = { serviceId: string | null; date: string | null; partOfDay: "morning" | "afternoon" | "evening" | null; reply: string };

const initial: AppointmentState = {};

export default function BookingPanel({
  providerId,
  timezone,
  services,
  today,
}: {
  providerId: string;
  timezone: string;
  services: ServiceOption[];
  today: string;
}) {
  const [state, action] = useActionState(bookAppointmentAction, initial);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState<string | undefined>();
  const [partOfDay, setPartOfDay] = useState<Intent["partOfDay"]>(null);
  const [ask, setAsk] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  async function askAssistant() {
    if (!ask.trim()) return;
    setAiBusy(true);
    setAiNote("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "booking-intent",
          fields: { text: ask },
          context: { today, services: JSON.stringify(services.map((s) => ({ id: s.id, name: s.name, minutes: s.durationMinutes }))) },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const intent: Intent = data.intent;
      if (intent.serviceId && services.some((s) => s.id === intent.serviceId)) setServiceId(intent.serviceId);
      if (intent.date && /^\d{4}-\d{2}-\d{2}$/.test(intent.date) && intent.date >= today) setDate(intent.date);
      setPartOfDay(intent.partOfDay ?? null);
      setAiNote(intent.reply ?? "");
    } catch (e) {
      setAiNote(e instanceof Error ? e.message : "The assistant is unavailable.");
    } finally {
      setAiBusy(false);
    }
  }

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div className="stack">
      <section className="panel glass">
        <h2><Icon name="sparkle" /> Ask the assistant</h2>
        <p className="muted">Describe what you need, e.g. &ldquo;a trim next Tuesday afternoon&rdquo;.</p>
        <div className="row">
          <input
            className="input"
            style={{ flex: "1 1 16rem" }}
            value={ask}
            maxLength={300}
            onChange={(e) => setAsk(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                askAssistant();
              }
            }}
            placeholder="What would you like to book?"
            aria-label="Describe what you want to book"
          />
          <button type="button" className="btn-confirm btn-confirm--sm" onClick={askAssistant} disabled={aiBusy}>
            {aiBusy ? "Thinking..." : "Suggest"}
          </button>
        </div>
        {aiNote && <p className="timeline-note" role="status">{aiNote}</p>}
      </section>

      <form className="form" action={action}>
        <div className="title">
          Book an appointment
          <br />
          <span>pick a service, a day and a time</span>
        </div>
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        <input type="hidden" name="providerId" value={providerId} />

        <div className="field field--wide">
          <label className="field-label" htmlFor="serviceId">Service</label>
          <select id="serviceId" name="serviceId" className="input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.durationMinutes} min · {formatPrice(s.priceCents)}
              </option>
            ))}
          </select>
          {selectedService?.description && <span className="muted">{selectedService.description}</span>}
        </div>

        <SlotPicker key={`${date ?? ""}-${partOfDay ?? ""}`} providerId={providerId} serviceId={serviceId} timezone={timezone} initialDate={date} partOfDay={partOfDay} />

        <div className="field field--wide">
          <label className="field-label" htmlFor="notes">Notes for the provider (optional)</label>
          <textarea id="notes" name="notes" className="input" maxLength={500} placeholder="Anything we should know?" />
        </div>
        <SubmitButton pendingLabel="Booking...">Confirm booking</SubmitButton>
      </form>
    </div>
  );
}
