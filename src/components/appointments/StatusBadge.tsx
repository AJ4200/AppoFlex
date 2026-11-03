import type { AppointmentStatus } from "@/db/schema";

const LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`badge badge--${status}`}>{LABELS[status]}</span>;
}
