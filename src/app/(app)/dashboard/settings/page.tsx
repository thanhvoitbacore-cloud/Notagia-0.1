"use client";

import { useStore } from "@/lib/store";
import { Download, Upload, Trash2, FileText, HardDrive, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";

export default function SettingsPage() {
  const { notes, tests, exportWorkspace, importWorkspace, exportNoteAsMarkdown, clearWorkspace } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importWorkspace(content);
      if (result.success) {
        setNotification(`Successfully imported ${result.notesCount} notes and ${result.testsCount} tests!`);
      } else {
        alert(`Failed to import workspace: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all active notes and tests in this session? Make sure to export your backup first!")) {
      clearWorkspace();
      setNotification("Session workspace cleared.");
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8 bg-black min-h-screen">
      <header>
        <h1 className="text-2xl font-bold text-white">Workspace & Data Backup</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Export your notes and AI tests to a local file or import an existing workspace backup.
        </p>
      </header>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Session Overview Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Active Session Memory</h2>
            <p className="text-xs text-zinc-400">Fresh memory state — resets on full browser reload</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="text-xs text-zinc-400">Active Notes</span>
            <p className="text-2xl font-bold text-white mt-1">{notes.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="text-xs text-zinc-400">AI Tests</span>
            <p className="text-2xl font-bold text-white mt-1">{tests.length}</p>
          </div>
        </div>
      </div>

      {/* Import / Export Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-emerald-400" />
              Export Full Workspace
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Download all your current notes, AI tests, questions, and explanations into a single JSON file.
            </p>
          </div>
          <button
            onClick={exportWorkspace}
            disabled={notes.length === 0 && tests.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download Workspace (.json)
          </button>
        </div>

        {/* Import Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-400" />
              Import Workspace File
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Upload a previously exported `.json` workspace file to instantly restore your notes and quizzes.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Select File & Import
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.notagia.json"
            className="hidden"
          />
        </div>
      </div>

      {/* Export Individual Notes to Markdown */}
      {notes.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Export Notes to Markdown (.md)
          </h3>
          <div className="divide-y divide-white/10">
            {notes.map((note) => (
              <div key={note.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">{note.title}</h4>
                  <p className="text-xs text-zinc-500">{new Date(note.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => exportNoteAsMarkdown(note.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  .md
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone: Clear Workspace */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-400">Clear Current Session</h3>
          <p className="text-xs text-zinc-400 mt-1">Reset active in-memory notes and tests for this session.</p>
        </div>
        <button
          onClick={handleClear}
          disabled={notes.length === 0 && tests.length === 0}
          className="flex items-center gap-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-4 py-2 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Workspace
        </button>
      </div>
    </main>
  );
}
