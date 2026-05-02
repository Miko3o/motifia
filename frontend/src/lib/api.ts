function getApiBase(): string {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (v) {
    return v.startsWith("http")
      ? v.replace(/\/$/, "")
      : `https://${v.replace(/\/$/, "")}`;
  }
  return "";
}

const apiBase = getApiBase();

export const fetchWithCredentials = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${apiBase}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const authApi = {
  check: () => fetchWithCredentials("/api/auth/check"),
  google: (code: string) =>
    fetchWithCredentials("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  logout: () =>
    fetchWithCredentials("/api/auth/logout", {
      method: "POST",
    }),
};

export const wordsApi = {
  getAll: () => fetchWithCredentials("/api/words"),
  getById: (id: number) => fetchWithCredentials(`/api/words/${id}`),
  getByWord: (word: string) =>
    fetchWithCredentials(`/api/words/word/${encodeURIComponent(word)}`),
  getByMotif: (motif: string) =>
    fetchWithCredentials(`/api/words/motif/${encodeURIComponent(motif)}`),
  create: (word: object) =>
    fetchWithCredentials("/api/words", {
      method: "POST",
      body: JSON.stringify(word),
    }),
  update: (id: number, word: object) =>
    fetchWithCredentials(`/api/words/${id}`, {
      method: "PUT",
      body: JSON.stringify(word),
    }),
  delete: (id: number) =>
    fetchWithCredentials(`/api/words/${id}`, {
      method: "DELETE",
    }),
};
