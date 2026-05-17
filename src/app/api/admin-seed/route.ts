import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  const email = "notagia@admin";
  const password = "2042001";

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new NextResponse("Admin account already exists", { status: 200 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: "Notagia Admin",
        email,
        password: hashedPassword,
        role: "ADMIN" as any,
      },
    });

    return new NextResponse("Admin account created successfully!", { status: 200 });
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
