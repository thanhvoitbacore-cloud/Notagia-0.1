"use client";

import { useStore } from "@/lib/store";
import { FileText, Sparkles, Download, Upload, Plus, Brain } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function DashboardPage() {
  const { notes, tests, isLoaded, exportWorkspace, importWorkspace } = useStore();
  const [greeting, setGreeting] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("morning");
    else if (hour < 18) setGreeting("afternoon");
    else setGreeting("evening");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importWorkspace(content);
      if (result.success) {
        alert(`Successfully imported ${result.notesCount} notes and ${result.testsCount} AI tests!`);
      } else {
        alert(`Failed to import workspace: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!isLoaded) return null;

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8 bg-black min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {greeting} 👋
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Session Workspace — your notes and AI quizzes are active in memory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/notes/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-sm font-medium">Active Notes</span>
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-bold text-white">{notes.length}</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-sm font-medium">Generated Tests</span>
            <Brain className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-3xl font-bold text-white">{tests.length}</span>
        </div>

        <button
          onClick={exportWorkspace}
          className="text-left rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-2 hover:bg-white/10 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-sm font-medium group-hover:text-white transition">Export Backup</span>
            <Download className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-xs text-zinc-400">Save workspace to JSON file</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-left rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 flex flex-col gap-2 hover:bg-indigo-500/20 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-indigo-300">
            <span className="text-sm font-medium">Import Backup</span>
            <Upload className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-xs text-indigo-300/80">Load backup file to session</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.notagia.json"
          className="hidden"
        />
      </div>

      {/* Main Workspace View */}
      {notes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02] py-16">
          <div className="text-center p-8 max-w-md">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Welcome to Notagia Session Workspace</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Create your study notes, generate instant AI tests, or import an existing backup file to resume where you left off.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link 
                href="/dashboard/notes/new"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Create First Note
              </Link>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Import File
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Notes</h2>
            <Link href="/dashboard/notes" className="text-xs text-indigo-400 hover:underline">
              View all ({notes.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.slice(0, 6).map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-indigo-500/50 hover:bg-white/10"
              >
                <h3 className="font-semibold text-lg text-white truncate group-hover:text-indigo-400 transition-colors">
                  {note.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 line-clamp-3 leading-relaxed flex-1 whitespace-pre-wrap">
                  {note.content}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
