"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNote(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const note = await prisma.note.create({
    data: {
      userId: session.userId,
      title,
      content,
    },
  });

  revalidatePath("/dashboard/notes");
  redirect(`/dashboard/notes/${note.id}`);
}

export async function updateNote(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  // Ensure user owns the note
  const existingNote = await prisma.note.findUnique({ where: { id } });
  if (existingNote?.userId !== session.userId) {
    throw new Error("Unauthorized");
  }

  await prisma.note.update({
    where: { id },
    data: { title, content },
  });

  revalidatePath(`/dashboard/notes/${id}`);
  revalidatePath("/dashboard/notes");
}

export async function deleteNote(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const existingNote = await prisma.note.findUnique({ where: { id } });
  if (existingNote?.userId !== session.userId) {
    throw new Error("Unauthorized");
  }

  await prisma.note.delete({ where: { id } });

  revalidatePath("/dashboard/notes");
  redirect("/dashboard/notes");
}
