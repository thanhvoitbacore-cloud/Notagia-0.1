"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function NewNotePage() {
  const router = useRouter();
  const { addNote } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    addNote({ title, content });
    router.push("/dashboard/notes");
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-black">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard/notes"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !title || !content}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Note"}
          </button>
        </header>

        <div className="flex-1 flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            required
            autoComplete="off"
            className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-zinc-600 focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your note here... Markdown is supported."
            required
            className="w-full flex-1 resize-none bg-transparent text-base text-zinc-300 placeholder:text-zinc-600 focus:outline-none leading-relaxed"
          ></textarea>
        </div>
      </form>
    </main>
  );
}
