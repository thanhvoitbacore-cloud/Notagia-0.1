"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore, Note, Question, Option } from "@/lib/store";

export function GenerateTestButton({ note }: { note: Note }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addTest } = useStore();

  async function handleGenerate() {
    try {
      setLoading(true);
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteTitle: note.title, noteContent: note.content }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to generate test");
      }

      const { test_title, questions } = json.data;

      // Transform the JSON data into our local store structure
      const letterMap = ["A", "B", "C", "D"];
      const generatedQuestions = questions.map((q: any, qIndex: number) => {
        const questionId = `q_${Math.random().toString(36).substr(2, 9)}`;
        const options: Option[] = q.options.map((optText: string, oIndex: number) => ({
          id: `${questionId}-${letterMap[oIndex]}`,
          questionId,
          optionText: optText,
        }));

        const correctAnswerId = `${questionId}-${q.correct_answer_id}`;

        return {
          id: questionId,
          testId: "", // Will be set when creating test, but we bundle it inside test directly
          questionText: q.question_text,
          correctAnswerId,
          explanation: q.explanation,
          options,
        };
      });

      const newTest = addTest({
        noteId: note.id,
        title: test_title,
        questions: generatedQuestions,
      });

      router.push(`/dashboard/tests/${newTest.id}`);
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
