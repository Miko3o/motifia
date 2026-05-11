import { NextResponse } from "next/server";
import {
  deleteWord,
  getWordById,
  updateWord,
} from "@/lib/server/words-db";
import type { WordRecord, WordUpdatePayload } from "@/lib/server/words-types";
import { isSupabaseConfigError } from "@/lib/supabase/admin";

function isWordExistsError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "WORD_EXISTS"
  );
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id: raw } = await params;
    const id = Number.parseInt(raw, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }
    const word = await getWordById(id);
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

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const { id: raw } = await params;
    const id = Number.parseInt(raw, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    const patch: WordUpdatePayload = {};
    if (body.word !== undefined) patch.word = String(body.word);
    if (body.definition !== undefined) patch.definition =
      body.definition as WordRecord["definition"];
    if (body.example !== undefined) patch.example =
      body.example as WordRecord["example"];
    if (body.part_of_speech !== undefined) {
      patch.part_of_speech =
        body.part_of_speech as WordRecord["part_of_speech"];
    }
    if (body.motif !== undefined) patch.motif = body.motif as WordRecord["motif"];
    if (body.mnemonic !== undefined) {
      patch.mnemonic = body.mnemonic as WordRecord["mnemonic"];
    }
    if (body.status !== undefined) {
      patch.status = body.status as WordRecord["status"];
    }

    const updated = await updateWord(id, patch);
    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
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

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { id: raw } = await params;
    const id = Number.parseInt(raw, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }
    if (!(await deleteWord(id))) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isSupabaseConfigError(e)) {
      return NextResponse.json({ message: e.message }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}
