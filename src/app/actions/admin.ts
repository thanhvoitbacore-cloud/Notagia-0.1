"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
