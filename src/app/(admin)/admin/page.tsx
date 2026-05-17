import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Users, FileText, Brain, Activity, TrendingUp, Trophy } from "lucide-react";
import { AdminAreaChart, AdminBarChart } from "@/components/admin-chart";

function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d;
  });
}

function formatDay(d: Date) {
  return d.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
}

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const days = getLast30Days();
  const thirtyDaysAgo = days[0];

  const [
    totalUsers,
    totalNotes,
    totalTests,
    totalAttempts,
    recentUsers,
    recentNotes,
    recentAttempts,
    topUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.note.count(),
    prisma.test.count(),
    prisma.leaderboardAttempt.count(),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, role: "USER" },
      select: { createdAt: true },
    }),
    prisma.note.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.leaderboardAttempt.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { role: "USER" },
      take: 5,
      orderBy: { notes: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { notes: true, tests: true, leaderboardAttempts: true } },
      },
    }),
  ]);

  // Build daily chart data
  function buildDailyData(dates: { createdAt: Date }[]) {
    return days.map((day) => ({
      label: formatDay(day),
      value: dates.filter((d) => {
        const cd = new Date(d.createdAt);
        return (
          cd.getFullYear() === day.getFullYear() &&
          cd.getMonth() === day.getMonth() &&
          cd.getDate() === day.getDate()
        );
      }).length,
    }));
  }

  const userChartData = buildDailyData(recentUsers);
  const noteChartData = buildDailyData(recentNotes);
  const attemptChartData = buildDailyData(recentAttempts);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Total Notes", value: totalNotes, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Total Tests", value: totalTests, icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Test Attempts", value: totalAttempts, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-400" />
          Overview
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Platform statistics and health at a glance.</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 flex flex-col gap-3 ${bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <span className="text-3xl font-bold">{value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            New Users (Last 30 Days)
          </h2>
          <AdminAreaChart data={userChartData} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            Notes Created (Last 30 Days)
          </h2>
          <AdminAreaChart data={noteChartData} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            Test Attempts (Last 30 Days)
          </h2>
          <AdminBarChart data={attemptChartData} />
        </div>
      </div>

      {/* Most Active Users */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          Most Active Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="pb-3 text-left font-medium">User</th>
                <th className="pb-3 text-center font-medium">Notes</th>
                <th className="pb-3 text-center font-medium">Tests</th>
                <th className="pb-3 text-center font-medium">Attempts</th>
                <th className="pb-3 text-right font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  <td className="py-3">
                    <div className="font-medium">{u.name || "—"}</div>
                    <div className="text-zinc-500 text-xs">{u.email}</div>
                  </td>
                  <td className="py-3 text-center text-zinc-300">{u._count.notes}</td>
                  <td className="py-3 text-center text-zinc-300">{u._count.tests}</td>
                  <td className="py-3 text-center text-zinc-300">{u._count.leaderboardAttempts}</td>
                  <td className="py-3 text-right text-zinc-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
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
