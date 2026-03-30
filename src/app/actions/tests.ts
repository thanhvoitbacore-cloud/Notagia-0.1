"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitTestAttempt(testId: string, score: number, timeTakenSeconds: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error("Test not found");

  await prisma.leaderboardAttempt.create({
    data: {
      testId,
      userId: session.userId,
      score,
      timeTakenSeconds,
    },
  });

  revalidatePath(`/dashboard/tests/${testId}`);
  revalidatePath("/dashboard/community");
  return { success: true };
}

export async function toggleTestVisibility(testId: string, isPublic: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test || test.userId !== session.userId) throw new Error("Unauthorized");

  await prisma.$transaction(async (tx) => {
    await tx.test.update({
      where: { id: testId },
      data: { isPublic },
    });

    if (isPublic) {
      await tx.communityPost.upsert({
        where: { testId },
        update: {},
        create: { testId, userId: session.userId },
      });
    } else {
      await tx.communityPost.deleteMany({ where: { testId } });
    }
  });

  revalidatePath("/dashboard/tests");
  revalidatePath("/dashboard/community");
}

export async function deleteTest(testId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test || test.userId !== session.userId) throw new Error("Unauthorized");

  await prisma.test.delete({ where: { id: testId } });
  
  revalidatePath("/dashboard/tests");
  redirect("/dashboard/tests");
}
