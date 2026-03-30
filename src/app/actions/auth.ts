"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
} | null;

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const fieldErrors: Exclude<AuthState, null>["fieldErrors"] = {};

  if (!name || name.length < 2)
    fieldErrors.name = "Name must be at least 2 characters.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fieldErrors.email = "Please enter a valid email.";
  if (!password || password.length < 8)
    fieldErrors.password = "Password must be at least 8 characters.";
  if (password !== confirmPassword)
    fieldErrors.confirmPassword = "Passwords do not match.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with this email already exists." };

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    await createSession(user.id);
  } catch (error: any) {
    return { error: `Signup failed: ${error?.message || error}` };
  }

  redirect("/dashboard");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required." };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
      return { error: "Invalid email or password." };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { error: "Invalid email or password." };

    await createSession(user.id);
  } catch (error: any) {
    return { error: `Login failed: ${error?.message || error}` };
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
