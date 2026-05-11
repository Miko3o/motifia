import { NextResponse } from "next/server";
import { getWordByText } from "@/lib/server/words-db";
import { isSupabaseConfigError } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ word: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { word: raw } = await params;
    const word = await getWordByText(raw);
    if (!word) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(word);
  } catch (e) {
    if (isSupabaseConfigError(e)) {
      return NextResponse.json({ message: e.message }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}
