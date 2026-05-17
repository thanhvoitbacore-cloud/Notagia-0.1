"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { TestPlayer } from "@/components/test-player";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { use } from "react";

export default function PlayTestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { tests, deleteTest, isLoaded } = useStore();

  if (!isLoaded) return null;

  const test = tests.find((t) => t.id === id);

  if (!test) {
    router.replace("/dashboard/tests");
    return null;
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this test?")) {
      deleteTest(test.id);
      router.push("/dashboard/tests");
    }
  };

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
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium text-red-500/80 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete Test"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 w-full flex items-start justify-center">
        <TestPlayer test={test} />
      </div>
    </main>
  );
}
