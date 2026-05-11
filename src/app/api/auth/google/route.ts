import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message:
        "OAuth requires BACKEND_URL (separate API) or future Supabase Auth wiring in this app.",
    },
    { status: 503 }
  );
}
