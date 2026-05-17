import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { FileText, Brain, Globe, Lock } from "lucide-react";

export default async function AdminContentPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const [notes, tests] = await Promise.all([
    prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { tests: true } },
      },
    }),
    prisma.test.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    }),
  ]);

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-400" />
          Content Overview
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          All notes and tests across the platform.
        </p>
      </header>

      {/* Notes Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold">Notes ({notes.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Title</th>
                <th className="px-6 py-3 text-left font-medium">Author</th>
                <th className="px-6 py-3 text-center font-medium">Tests</th>
                <th className="px-6 py-3 text-right font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {notes.map((n) => (
                <tr key={n.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-3 text-zinc-300 max-w-[250px] truncate">{n.title}</td>
                  <td className="px-6 py-3 text-zinc-500">
                    {n.user.name || n.user.email}
                  </td>
                  <td className="px-6 py-3 text-center text-zinc-400">{n._count.tests}</td>
                  <td className="px-6 py-3 text-right text-zinc-600 text-xs">
                    {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tests Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold">Tests ({tests.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Title</th>
                <th className="px-6 py-3 text-left font-medium">Author</th>
                <th className="px-6 py-3 text-center font-medium">Questions</th>
                <th className="px-6 py-3 text-center font-medium">Attempts</th>
                <th className="px-6 py-3 text-center font-medium">Visibility</th>
                <th className="px-6 py-3 text-right font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-3 text-zinc-300 max-w-[220px] truncate">{t.title}</td>
                  <td className="px-6 py-3 text-zinc-500">
                    {t.user.name || t.user.email}
                  </td>
                  <td className="px-6 py-3 text-center text-zinc-400">{t._count.questions}</td>
                  <td className="px-6 py-3 text-center text-zinc-400">{t._count.attempts}</td>
                  <td className="px-6 py-3 text-center">
                    {t.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Globe className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-600 text-xs">
                    {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
