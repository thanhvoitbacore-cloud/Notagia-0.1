import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Brain, Trophy } from "lucide-react";

export default async function AdminUserDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<any>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { id } = await props.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 10 },
      tests: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { questions: true } } },
      },
      leaderboardAttempts: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { test: { select: { title: true } } },
      },
    },
  });

  if (!user) redirect("/admin/users");

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="inline-flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{user.name || "Unnamed User"}</h1>
          <p className="text-zinc-400 text-sm">{user.email}</p>
        </div>
      </header>

      {/* Profile Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Notes", value: user.notes.length, icon: FileText },
          { label: "Tests", value: user.tests.length, icon: Brain },
          { label: "Attempts", value: user.leaderboardAttempts.length, icon: Trophy },
          { label: "Joined", value: new Date(user.createdAt).toLocaleDateString("vi-VN"), icon: null },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-indigo-400" />}
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            Recent Notes
          </h2>
          {user.notes.length === 0 ? (
            <p className="text-zinc-500 text-sm">No notes yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {user.notes.map((n) => (
                <li key={n.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <span className="truncate text-zinc-300">{n.title}</span>
                  <span className="text-zinc-600 text-xs shrink-0 ml-3">
                    {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tests */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-400" />
            Recent Tests
          </h2>
          {user.tests.length === 0 ? (
            <p className="text-zinc-500 text-sm">No tests yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {user.tests.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <span className="truncate text-zinc-300">{t.title}</span>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-indigo-400 text-xs">{t._count.questions} Qs</span>
                    {t.isPublic && (
                      <span className="text-emerald-400 text-xs font-medium">Public</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Attempt History */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          Attempt History
        </h2>
        {user.leaderboardAttempts.length === 0 ? (
          <p className="text-zinc-500 text-sm">No attempts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="pb-3 text-left font-medium">Test</th>
                  <th className="pb-3 text-center font-medium">Score</th>
                  <th className="pb-3 text-center font-medium">Time</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {user.leaderboardAttempts.map((a) => (
                  <tr key={a.id} className="hover:bg-white/5 transition">
                    <td className="py-2.5 text-zinc-300 truncate max-w-[200px]">{a.test.title}</td>
                    <td className="py-2.5 text-center font-bold text-indigo-400">{a.score}</td>
                    <td className="py-2.5 text-center text-zinc-400">{a.timeTakenSeconds}s</td>
                    <td className="py-2.5 text-right text-zinc-500 text-xs">
                      {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
