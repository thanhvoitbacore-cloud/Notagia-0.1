import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Form from "next/form";
import { FileText, Plus, Search } from "lucide-react";

export default async function NotesIndexPage(props: {
  params: Promise<any>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedSearchParams = await props.searchParams;
  const queryParam = resolvedSearchParams?.q;
  const query = typeof queryParam === "string" ? queryParam : "";

  const notes = await prisma.note.findMany({
    where: {
      userId: session.userId,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
      _count: { select: { tests: true } },
    },
  });

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Notes</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your knowledge base.</p>
        </div>
        <Link
          href="/dashboard/notes/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Link>
      </header>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Form action="/dashboard/notes">
          <input
            type="search"
            name="q"
            placeholder="Search notes..."
            defaultValue={query}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </Form>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02] py-20 mt-4">
          <div className="text-center">
            <FileText className="mx-auto h-10 w-10 text-zinc-600 mb-4" />
            <p className="text-zinc-400 font-medium">No notes found.</p>
            {query && <p className="text-zinc-500 text-sm mt-1">Try a different search term.</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-indigo-500/50 hover:bg-white/10"
            >
              <h3 className="font-semibold text-lg truncate group-hover:text-indigo-400 transition-colors">
                {note.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-400 line-clamp-3 leading-relaxed flex-1">
                {note.content}
              </p>
              <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                {note._count.tests > 0 && (
                  <span className="flex items-center gap-1 text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    {note._count.tests} test{note._count.tests > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
