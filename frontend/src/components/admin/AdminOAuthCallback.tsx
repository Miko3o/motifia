"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function AdminOAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        console.error("No code found in URL");
        router.replace("/admin");
        return;
      }

      try {
        const response = await authApi.google(code);

        if (response.ok) {
          router.replace("/admin");
        } else {
          await response.json().catch(() => null);
          router.replace("/admin");
        }
      } catch (err) {
        console.error("Error during authentication:", err);
        router.replace("/admin");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}
