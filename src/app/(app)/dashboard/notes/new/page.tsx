import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { createNote } from "@/app/actions/notes";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubmitNoteButton } from "@/components/submit-note-button";

export default async function NewNotePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="flex-1 flex flex-col h-full bg-black">
      <form action={createNote} className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard/notes"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <SubmitNoteButton />
        </header>

        <div className="flex-1 flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="Note Title"
            required
            autoComplete="off"
            className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-zinc-600 focus:outline-none"
          />
          <textarea
            name="content"
            placeholder="Start typing your note here... Markdown is supported."
            required
            className="w-full flex-1 resize-none bg-transparent text-base text-zinc-300 placeholder:text-zinc-600 focus:outline-none leading-relaxed"
          ></textarea>
        </div>
      </form>
    </main>
  );
}
