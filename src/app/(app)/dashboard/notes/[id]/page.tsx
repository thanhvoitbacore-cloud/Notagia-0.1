import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateNote, deleteNote } from "@/app/actions/notes";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { GenerateTestButton } from "@/components/generate-test-button";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id },
    include: { tests: true },
  });

  if (!note || note.userId !== session.userId) {
    redirect("/dashboard/notes");
  }

  const updateAction = updateNote.bind(null, note.id);
  const deleteAction = deleteNote.bind(null, note.id);

  return (
    <main className="flex-1 flex flex-col h-full bg-black relative">
      <form action={updateAction} className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 md:p-8">
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
              formAction={deleteAction}
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
            <GenerateTestButton noteId={note.id} />
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-4">
          <input
            type="text"
            name="title"
            defaultValue={note.title}
            placeholder="Note Title"
            required
            autoComplete="off"
            className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-zinc-600 focus:outline-none"
          />
          <textarea
            name="content"
            defaultValue={note.content}
            placeholder="Start typing your note here... Markdown is supported."
            required
            className="w-full flex-1 resize-none bg-transparent text-base text-zinc-300 placeholder:text-zinc-600 focus:outline-none leading-relaxed"
          ></textarea>
        </div>
      </form>
    </main>
  );
}
