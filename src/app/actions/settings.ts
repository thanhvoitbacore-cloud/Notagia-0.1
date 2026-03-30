"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  await prisma.user.update({
    where: { id: session.userId },
    data: { name },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const newPassword = formData.get("newPassword") as string;

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.userId },
    data: { password: hashedPassword },
  });

  return { success: true };
}
