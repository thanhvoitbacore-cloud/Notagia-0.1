"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Brain, HardDrive, Download, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRef } from "react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { notes, tests, exportWorkspace, importWorkspace } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notes", href: "/dashboard/notes", icon: FileText },
    { name: "Tests", href: "/dashboard/tests", icon: Brain },
    { name: "Workspace", href: "/dashboard/settings", icon: HardDrive },
  ];

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

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/10 p-5 gap-6 bg-zinc-950">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 font-bold text-xl px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black text-sm font-black">
          N
        </div>
        <span>Notagia</span>
        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-normal border border-indigo-500/30">
          Session Mode
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white font-semibold shadow-inner"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* File Import / Export Quick Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Workspace Session
        </div>
        <div className="text-xs text-zinc-400 flex justify-between">
          <span>Active Data:</span>
          <span className="text-white font-medium">{notes.length} Notes • {tests.length} Tests</span>
        </div>

        <button
          onClick={exportWorkspace}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-semibold text-white transition border border-white/10 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Export Workspace (.json)
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 px-3 py-2 text-xs font-semibold text-indigo-300 transition border border-indigo-500/30 cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          Import Backup File
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.notagia.json"
          className="hidden"
        />
      </div>
    </aside>
  );
}
