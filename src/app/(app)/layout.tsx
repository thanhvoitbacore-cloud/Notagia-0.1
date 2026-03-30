import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-[100dvh] bg-black text-white">
      <DashboardSidebar user={user} />
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
