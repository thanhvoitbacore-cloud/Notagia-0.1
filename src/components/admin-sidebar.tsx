"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Shield,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const navLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Activity", href: "/admin/activity", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-indigo-500/20 bg-indigo-950/30 p-5 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-base leading-tight">Admin Panel</div>
          <div className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Notagia</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1 mt-2">
        {navLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-indigo-500/20 pt-4">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Notagia Admin</span>
            <span className="text-xs text-zinc-500">notagia@admin</span>
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
