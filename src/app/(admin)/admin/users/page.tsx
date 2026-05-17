import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import { deleteUser } from "@/app/actions/admin";

export default async function AdminUsersPage(props: {
  params: Promise<any>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { notes: true, tests: true, leaderboardAttempts: true } },
    },
  });

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-400" />
          User Management
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{users.length} registered users.</p>
      </header>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <form>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 text-left font-medium">User</th>
                <th className="px-6 py-4 text-center font-medium">Notes</th>
                <th className="px-6 py-4 text-center font-medium">Tests</th>
                <th className="px-6 py-4 text-center font-medium">Attempts</th>
                <th className="px-6 py-4 text-right font-medium">Joined</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition group">
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${u.id}`} className="block">
                      <div className="font-medium group-hover:text-indigo-400 transition-colors">
                        {u.name || <span className="text-zinc-500 italic">No name</span>}
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">{u.email}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-300">{u._count.notes}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{u._count.tests}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{u._count.leaderboardAttempts}</td>
                  <td className="px-6 py-4 text-right text-zinc-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-white/5 text-zinc-300 hover:bg-white/10 transition"
                      >
                        View
                      </Link>
                      <form action={deleteUser.bind(null, u.id)}>
                        <button
                          type="submit"
                          className="rounded-lg px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          onClick={(e) => {
                            if (!confirm(`Delete user "${u.email}"? This is irreversible.`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-16 text-zinc-500">No users found.</div>
        )}
      </div>
    </main>
  );
}
