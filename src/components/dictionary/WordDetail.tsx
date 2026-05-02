"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { wordsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Notation from "./Notation";

interface Word {
  id: number;
  word: string;
  part_of_speech: string | null;
  motif: string | null;
  mnemonic: string | null;
}

export default function WordDetail() {
  const params = useParams();
  const rawWord = params.word;
  const wordParam = Array.isArray(rawWord)
    ? rawWord[0] ?? ""
    : rawWord ?? "";
  const router = useRouter();
  const { isAdmin, checkAuth } = useAuth();
  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWord, setEditedWord] = useState<Word | null>(null);
  const [invalidMotif, setInvalidMotif] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!wordParam) return;
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await wordsApi.getByWord(wordParam);

        if (!response.ok) {
          throw new Error("Word not found");
        }

        const data = await response.json();
        if (!cancelled) {
          setWord(data);
        }
      } catch (err) {
        console.error("Error fetching word details:", err);
        if (!cancelled) {
          setError("Failed to load word details");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wordParam]);

  useEffect(() => {
    if (word) {
      setEditedWord(word);
    }
  }, [word]);

  const validateMotif = (value: string) => {
    const validPattern = /^[A-G#*" ]*$/;
    return validPattern.test(value);
  };

  const handleMotifChange = (value: string) => {
    if (editedWord) {
      setEditedWord({ ...editedWord, motif: value });
      setInvalidMotif(!validateMotif(value));
    }
  };

  const handleSave = async () => {
    if (!editedWord || !word) return;
    if (invalidMotif) {
      alert("Please fix the musical motif format");
      return;
    }

    try {
      const response = await wordsApi.update(word.id, editedWord);
      if (!response.ok) {
        throw new Error("Failed to update word");
      }

      const updatedWord = await response.json();
      setWord(updatedWord);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating word:", err);
      setError("Failed to update word");
    }
  };

  const handleBack = () => {
    router.push("/dictionary");
  };

  const handleDelete = async () => {
    if (!word) return;

    try {
      const response = await wordsApi.delete(word.id);
      if (response.ok) {
        router.push("/dictionary");
      } else {
        console.error("Failed to delete word");
      }
    } catch (err) {
      console.error("Error deleting word:", err);
    }
  };

  if (isLoading || !editedWord) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-red-600">
          {error || "Word not found"}
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 mx-auto block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Dictionary
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          <span>←</span> Back to Dictionary
        </button>
        {isAdmin && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedWord(word);
                    setInvalidMotif(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="mb-6">
          {isEditing ? (
            <input
              type="text"
              value={editedWord.word}
              onChange={(e) =>
                setEditedWord({ ...editedWord, word: e.target.value })
              }
              className="text-4xl font-bold mb-2 border rounded-md px-2 py-1 w-full"
            />
          ) : (
            <h1 className="text-4xl font-bold mb-2">{word.word}</h1>
          )}
          {isEditing ? (
            <select
              value={editedWord.part_of_speech || ""}
              onChange={(e) =>
                setEditedWord({
                  ...editedWord,
                  part_of_speech: e.target.value,
                })
              }
              className="border rounded-md px-3 py-2 w-full"
            >
              <option value="">Select part of speech</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="pronoun">Pronoun</option>
              <option value="preposition">Preposition</option>
              <option value="conjunction">Conjunction</option>
            </select>
          ) : (
            word.part_of_speech && (
              <span className="text-gray-600 italic">{word.part_of_speech}</span>
            )
          )}
        </div>

        {isEditing ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Musical Motif
            </label>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={editedWord.motif || "C"}
                onChange={(e) => handleMotifChange(e.target.value)}
                className={`border rounded-md px-3 py-2 w-full ${invalidMotif ? "border-red-500" : ""}`}
                placeholder="Enter musical notation (e.g., CDEF*G)"
              />
              <p className="text-sm text-gray-500">
                Use letters A-G for notes, # for sharp, * for octave up, &quot;
                for octave down
              </p>
              {invalidMotif && (
                <p className="text-red-500 text-sm">
                  Only use letters A-G, #, *, and &quot; for notation
                </p>
              )}
            </div>
          </div>
        ) : (
          <Notation notes={word.motif || "C"} />
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mnemonic
          </label>
          {isEditing ? (
            <textarea
              value={editedWord.mnemonic || ""}
              onChange={(e) =>
                setEditedWord({ ...editedWord, mnemonic: e.target.value })
              }
              className="border rounded-md px-3 py-2 w-full"
              rows={2}
              placeholder="Enter a memory aid or description"
            />
          ) : (
            word.mnemonic && <p className="text-gray-700">{word.mnemonic}</p>
          )}
        </div>
      </div>
    </div>
  );
}
