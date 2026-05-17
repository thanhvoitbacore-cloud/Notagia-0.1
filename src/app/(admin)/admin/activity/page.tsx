import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Activity, Trophy } from "lucide-react";

export default async function AdminActivityPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const attempts = await prisma.leaderboardAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      test: { select: { title: true, _count: { select: { questions: true } } } },
    },
  });

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-amber-400" />
          Activity Log
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          All test attempts across the platform — most recent first.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left font-medium">User</th>
                <th className="px-6 py-4 text-left font-medium">Test</th>
                <th className="px-6 py-4 text-center font-medium">Score</th>
                <th className="px-6 py-4 text-center font-medium">Accuracy</th>
                <th className="px-6 py-4 text-center font-medium">Time</th>
                <th className="px-6 py-4 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attempts.map((a) => {
                const accuracy = Math.round(
                  (a.score / a.test._count.questions) * 100
                );
                return (
                  <tr key={a.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-3">
                      <div className="font-medium text-zinc-300">
                        {a.user.name || "—"}
                      </div>
                      <div className="text-zinc-600 text-xs">{a.user.email}</div>
                    </td>
                    <td className="px-6 py-3 text-zinc-400 max-w-[200px] truncate">
                      {a.test.title}
                    </td>
                    <td className="px-6 py-3 text-center font-bold text-indigo-400">
                      {a.score}
                      <span className="text-zinc-600 font-normal">
                        /{a.test._count.questions}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          accuracy >= 80
                            ? "bg-emerald-500/15 text-emerald-400"
                            : accuracy >= 50
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {accuracy}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-zinc-500 font-mono text-xs">
                      {a.timeTakenSeconds}s
                    </td>
                    <td className="px-6 py-3 text-right text-zinc-600 text-xs">
                      {new Date(a.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {attempts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Trophy className="h-10 w-10 mb-4 opacity-30" />
            <p>No activity recorded yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
