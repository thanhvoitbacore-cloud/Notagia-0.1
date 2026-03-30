import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TestPlayer } from "@/components/test-player";
import { deleteTest, toggleTestVisibility } from "@/app/actions/tests";
import Link from "next/link";
import { ArrowLeft, Trash2, Globe, Lock } from "lucide-react";

export default async function PlayTestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        include: { options: true }
      }
    }
  });

  if (!test) redirect("/dashboard/tests");

  // Allow playing public tests or own tests
  if (test.userId !== session.userId && !test.isPublic) {
    redirect("/dashboard/tests");
  }

  const isOwner = test.userId === session.userId;
  const deleteAction = deleteTest.bind(null, test.id);
  
  // Note: Toggle action only if owner
  const toggleAction = toggleTestVisibility.bind(null, test.id, !test.isPublic);

  return (
    <main className="flex-1 flex flex-col p-6 md:p-8 bg-black relative min-h-full">
      <header className="flex items-center justify-between mb-4 w-full max-w-4xl mx-auto">
        <Link
          href="/dashboard/tests"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Quit
        </Link>
        
        {isOwner && (
          <div className="flex items-center gap-2">
            <form action={toggleAction}>
              <button
                type="submit"
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                  test.isPublic 
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" 
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5"
                }`}
              >
                {test.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {test.isPublic ? "Publicly Listed" : "Make Public"}
              </button>
            </form>
            <form action={deleteAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium text-red-500/80 transition hover:bg-red-500/10 hover:text-red-400"
                title="Delete Test"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      <div className="flex-1 w-full flex items-start justify-center">
        <TestPlayer test={test} />
      </div>
    </main>
  );
}
