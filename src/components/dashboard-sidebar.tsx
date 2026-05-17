"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Brain, Settings } from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notes", href: "/dashboard/notes", icon: FileText },
    { name: "Tests", href: "/dashboard/tests", icon: Brain },
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
    </aside>
  );
}
