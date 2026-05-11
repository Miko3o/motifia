export type WordStatus = "queued" | "accepted";

export interface WordRecord {
  id: number;
  word: string;
  definition: string | null;
  example: string | null;
  part_of_speech: string | null;
  motif: string | null;
  mnemonic: string | null;
  status: WordStatus;
}

export type WordUpdatePayload = Partial<
  Pick<
    WordRecord,
    | "word"
    | "definition"
    | "example"
    | "part_of_speech"
    | "motif"
    | "mnemonic"
    | "status"
  >
>;
