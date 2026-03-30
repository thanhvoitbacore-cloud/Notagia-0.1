import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Globe2, Brain, Play, Trophy } from "lucide-react";

export default async function CommunityPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const posts = await prisma.communityPost.findMany({
    orderBy: { likes: "desc" }, // Sort by most liked, could also sort by recent
    include: {
      user: { select: { name: true, email: true } },
      test: {
        include: {
          _count: { select: { questions: true } },
          attempts: {
            orderBy: [
              { score: "desc" },
              { timeTakenSeconds: "asc" },
            ],
            take: 3, // Top 3 for the leaderboard preview
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-indigo-400" />
            Community Hub
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Discover, play, and compete on public tests created by other students.
          </p>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02] py-20 mt-4">
          <div className="text-center p-6 max-w-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/5 border border-white/10">
              <Users className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-white font-semibold text-lg mb-2">It's quiet here.</p>
            <p className="text-zinc-400 text-sm mb-6">No one has made their tests public yet. Be the first to share your knowledge!</p>
            <Link href="/dashboard/tests" className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200">
              Share a Test
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {posts.map((post) => {
            const authorName = post.user.name || "A Student";
            return (
              <div
                key={post.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-xl leading-tight mb-2">
                        {post.test.title}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Created by <span className="text-indigo-400">{authorName}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
                      <Brain className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-300">
                        {post.test._count.questions} Qs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="p-6 bg-black/20 flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    Top Scores
                  </h4>
                  
                  {post.test.attempts.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {post.test.attempts.map((attempt, idx) => (
                        <div key={attempt.id} className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold w-4 text-center ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-zinc-300" : "text-amber-700"}`}>
                              #{idx + 1}
                            </span>
                            <span className="truncate max-w-[120px] md:max-w-xs">{attempt.user.name || "Student"}</span>
                          </div>
                          <div className="flex gap-4 font-mono">
                            <span className="text-indigo-400 font-bold">{attempt.score}/{post.test._count.questions}</span>
                            <span className="text-zinc-500 w-12 text-right">{attempt.timeTakenSeconds}s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 italic py-2">No attempts yet. Be the first to set the high score!</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
                  <Link
                    href={`/dashboard/tests/${post.testId}`}
                    className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.3)] transition hover:bg-indigo-400 hover:scale-105"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Play & Compete
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
