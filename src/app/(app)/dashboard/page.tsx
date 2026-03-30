import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  if (!user) redirect("/login");

  // Fetch some stats (e.g., number of notes)
  const notesCount = await prisma.note.count({ where: { userId: session.userId } });
  const testsCount = await prisma.test.count({ where: { userId: session.userId } });

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Good {getGreeting()}, {user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Let's organize your knowledge for today.
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Total Notes", value: notesCount.toString() },
          { label: "Generated Tests", value: testsCount.toString() },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-2"
          >
            <span className="text-sm font-medium text-zinc-400">{label}</span>
            <span className="text-3xl font-bold">{value}</span>
          </div>
        ))}
      </div>

      {/* Empty state or quick actions */}
      <div className="flex flex-1 items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
        <div className="text-center p-8 max-w-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-indigo-500/10 border border-indigo-500/20">
            <FileText className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Write your first Note</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Start by creating a note. Then use our Gemini AI to instantly generate a study test based on your materials.
          </p>
          <Link 
            href="/dashboard/notes/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 font-medium text-black transition hover:bg-zinc-200 hover:scale-[1.02]"
          >
            Create Note
          </Link>
        </div>
      </div>
    </main>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
