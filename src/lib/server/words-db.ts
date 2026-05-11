import { createAdminClient } from "@/lib/supabase/admin";
import type {
  WordRecord,
  WordUpdatePayload,
  WordStatus,
} from "@/lib/server/words-types";

const TABLE = "words";

type WordRow = {
  id: number;
  word: string;
  definition: string | null;
  example: string | null;
  part_of_speech: string | null;
  motif: string | null;
  mnemonic: string | null;
  status: string;
};

function rowToRecord(row: WordRow): WordRecord {
  return {
    id: row.id,
    word: row.word,
    definition: row.definition,
    example: row.example,
    part_of_speech: row.part_of_speech,
    motif: row.motif,
    mnemonic: row.mnemonic,
    status: row.status as WordStatus,
  };
}

function isUniqueViolation(err: { code?: string } | null): boolean {
  return err?.code === "23505";
}

export async function getAllWords(): Promise<WordRecord[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data as WordRow[] | null)?.map(rowToRecord) ?? [];
}

export async function getWordById(
  id: number
): Promise<WordRecord | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return rowToRecord(data as WordRow);
}

export async function getWordByText(
  wordSlug: string
): Promise<WordRecord | undefined> {
  const key = decodeURIComponent(wordSlug).toLowerCase();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("word", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return rowToRecord(data as WordRow);
}

export async function getWordByMotif(
  encodedMotif: string
): Promise<WordRecord | undefined> {
  const motifKey = decodeURIComponent(encodedMotif).trim();
  if (!motifKey) return undefined;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("motif", motifKey)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return rowToRecord(data as WordRow);
}

export async function wordExists(lowerWord: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("word", lowerWord.toLowerCase());
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function createWord(input: {
  word: string;
  part_of_speech: string;
  motif: string;
  mnemonic: string;
}): Promise<WordRecord> {
  const supabase = createAdminClient();
  const trimmed = input.word.trim().toLowerCase();
  const row = {
    word: trimmed,
    definition: null as string | null,
    example: null as string | null,
    part_of_speech: input.part_of_speech.trim() || null,
    motif: input.motif.trim() || null,
    mnemonic: input.mnemonic.trim() || null,
    status: "queued" as const,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select()
    .single();
  if (error) {
    if (isUniqueViolation(error)) {
      const exists = new Error("This word already exists");
      (exists as Error & { code: string }).code = "WORD_EXISTS";
      throw exists;
    }
    throw error;
  }
  return rowToRecord(data as WordRow);
}

export async function updateWord(
  id: number,
  body: WordUpdatePayload
): Promise<WordRecord | undefined> {
  const supabase = createAdminClient();
  const patch: Record<string, string | null | WordStatus> = {};
  if (body.definition !== undefined) patch.definition = body.definition;
  if (body.example !== undefined) patch.example = body.example;
  if (body.part_of_speech !== undefined) {
    patch.part_of_speech = body.part_of_speech;
  }
  if (body.motif !== undefined) patch.motif = body.motif;
  if (body.mnemonic !== undefined) patch.mnemonic = body.mnemonic;
  if (body.status !== undefined) patch.status = body.status;
  if (body.word !== undefined) patch.word = body.word.trim().toLowerCase();

  if (Object.keys(patch).length === 0) {
    return getWordById(id);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) {
    if (isUniqueViolation(error)) {
      const exists = new Error("This word already exists");
      (exists as Error & { code: string }).code = "WORD_EXISTS";
      throw exists;
    }
    throw error;
  }
  if (!data) return undefined;
  return rowToRecord(data as WordRow);
}

export async function deleteWord(id: number): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
