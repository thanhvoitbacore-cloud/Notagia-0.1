import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  if (!user) redirect("/login");

  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 gap-8">
      <header>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your profile and security preferences.</p>
      </header>

      <SettingsForm user={user} />
    </main>
  );
}
