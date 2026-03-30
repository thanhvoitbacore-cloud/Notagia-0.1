"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerateTestButton({ noteId }: { noteId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    try {
      setLoading(true);
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate test");
      }

      router.push(`/dashboard/tests/${data.testId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {loading ? "Generating..." : "Generate Test"}
    </button>
  );
}
