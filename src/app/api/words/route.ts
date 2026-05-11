import { NextResponse } from "next/server";
import {
  createWord,
  getAllWords,
  wordExists,
} from "@/lib/server/words-db";
import { isSupabaseConfigError } from "@/lib/supabase/admin";

function isWordExistsError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "WORD_EXISTS"
  );
}

export async function GET() {
  try {
    return NextResponse.json(await getAllWords());
  } catch (e) {
    if (isSupabaseConfigError(e)) {
      return NextResponse.json({ message: e.message }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const word = typeof body.word === "string" ? body.word.trim() : "";
    const part_of_speech =
      typeof body.part_of_speech === "string" ? body.part_of_speech : "";
    const motif = typeof body.motif === "string" ? body.motif : "";
    const mnemonic =
      typeof body.mnemonic === "string" ? body.mnemonic : "";

    if (!word || !part_of_speech || !motif) {
      return NextResponse.json(
        { message: "word, part_of_speech, and motif are required" },
        { status: 400 }
      );
    }

    if (await wordExists(word)) {
      return NextResponse.json(
        { message: "This word already exists" },
        { status: 409 }
      );
    }

    const record = await createWord({
      word,
      part_of_speech,
      motif,
      mnemonic,
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    if (isSupabaseConfigError(e)) {
      return NextResponse.json({ message: e.message }, { status: 503 });
    }
    if (isWordExistsError(e)) {
      return NextResponse.json(
        { message: "This word already exists" },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}
