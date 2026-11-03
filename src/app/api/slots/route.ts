import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/scheduling";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId") ?? "";
  const serviceId = searchParams.get("serviceId") ?? "";
  const date = searchParams.get("date") ?? "";
  const ignore = searchParams.get("ignore") ?? undefined;
  const uuid = /^[0-9a-f-]{36}$/i;
  if (!uuid.test(providerId) || !uuid.test(serviceId) || (ignore && !uuid.test(ignore))) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const slots = await getAvailableSlots({ providerId, serviceId, date, ignoreAppointmentId: ignore });
  return NextResponse.json({ slots });
}
