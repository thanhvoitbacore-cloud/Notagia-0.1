"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { GenerateTestButton } from "@/components/generate-test-button";
import { use, useEffect, useState } from "react";

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { notes, updateNote, deleteNote, isLoaded } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const note = notes.find((n) => n.id === id);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  if (!isLoaded) return null;

  if (!note) {
    router.replace("/dashboard/notes");
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNote(id, { title, content });
    router.push("/dashboard/notes");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
      router.push("/dashboard/notes");
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-black relative">
      <form onSubmit={handleSave} className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notes"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium text-red-500/80 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <GenerateTestButton note={note} />
          </div>
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
