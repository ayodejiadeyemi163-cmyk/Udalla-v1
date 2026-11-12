import { NextResponse } from "next/server";
import { runReminders } from "@/lib/reminders";

/**
 * Reminder cron. Protect with CRON_SECRET: send it as a bearer token or as
 * the secret query parameter. Nothing runs without it.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  }

  const header = request.headers.get("authorization");
  const url = new URL(request.url);
  const provided = header?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const sent = await runReminders();
  return NextResponse.json({ sent }, { headers: { "Cache-Control": "no-store" } });
}
