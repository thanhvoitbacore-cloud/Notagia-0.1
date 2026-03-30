"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, FileText, Brain, Users, Settings } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function DashboardSidebar({ user }: { user: { name: string | null; email: string } }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notes", href: "/dashboard/notes", icon: FileText },
    { name: "Tests", href: "/dashboard/tests", icon: Brain },
    { name: "Community", href: "/dashboard/community", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/10 p-5 gap-6">
      <div className="flex items-center gap-2.5 font-bold text-xl px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black text-sm">
          N
        </div>
        Notagia
      </div>

      <nav className="flex flex-col gap-1.5 mt-2 flex-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold border border-indigo-500/30">
            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user.name || "Student"}</span>
            <span className="text-xs text-zinc-500 truncate">{user.email}</span>
          </div>
        </div>
        
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
