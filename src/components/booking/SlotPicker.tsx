"use client";

import { useEffect, useState } from "react";
import { BOOKING_HORIZON_DAYS } from "@/lib/constants";
import Loader from "@/components/ui/Loader";

type Slot = { startsAt: string; endsAt: string };

type Props = {
  providerId: string;
  serviceId: string;
  timezone: string;
  ignoreAppointmentId?: string;
  initialDate?: string;
  /** Preferred part of the day to highlight, e.g. from the AI assistant */
  partOfDay?: "morning" | "afternoon" | "evening" | null;
  name?: string;
};

function todayIn(timezone: string, offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(d);
}

function hourIn(iso: string, timezone: string) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", hourCycle: "h23" }).format(new Date(iso)),
  );
}

export default function SlotPicker({
  providerId,
  serviceId,
  timezone,
  ignoreAppointmentId,
  initialDate,
  partOfDay,
  name = "startsAt",
}: Props) {
  const [date, setDate] = useState(initialDate ?? todayIn(timezone));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!date || !serviceId) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ providerId, serviceId, date });
    if (ignoreAppointmentId) params.set("ignore", ignoreAppointmentId);

    setStatus("loading");
    setSelected("");
    fetch(`/api/slots?${params}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data) => {
        setSlots(data.slots);
        setStatus("idle");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [providerId, serviceId, date, ignoreAppointmentId]);

  const inPart = (iso: string) => {
    if (!partOfDay) return true;
    const h = hourIn(iso, timezone);
    return partOfDay === "morning" ? h < 12 : partOfDay === "afternoon" ? h >= 12 && h < 17 : h >= 17;
  };
  const preferred = slots.filter((s) => inPart(s.startsAt));
  const visible = preferred.length ? preferred : slots;

  const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit" });

  return (
    <div className="stack">
      <div className="field">
        <label className="field-label" htmlFor="slot-date">
          Date
        </label>
        <input
          id="slot-date"
          type="date"
          className="input"
          value={date}
          min={todayIn(timezone)}
          max={todayIn(timezone, BOOKING_HORIZON_DAYS)}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div aria-live="polite">
        {status === "loading" && <Loader label="Finding free times" />}
        {status === "error" && <p className="form-error">Could not load times. Try again.</p>}
        {status === "idle" && slots.length === 0 && (
          <p className="muted">No free times on this day. Try another date.</p>
        )}
        {partOfDay && preferred.length === 0 && slots.length > 0 && (
          <p className="muted">Nothing free in the {partOfDay}, showing all times.</p>
        )}
        <div className="slots" role="group" aria-label="Available times">
          {visible.map((slot) => (
            <button
              key={slot.startsAt}
              type="button"
              className="slot"
              aria-pressed={selected === slot.startsAt}
              onClick={() => setSelected(slot.startsAt)}
            >
              {timeFormat.format(new Date(slot.startsAt))}
            </button>
          ))}
        </div>
      </div>
      <input type="hidden" name={name} value={selected} />
    </div>
  );
}
