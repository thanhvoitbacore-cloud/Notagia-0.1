import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#0a0a12] text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
