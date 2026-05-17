import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = "notagia@admin";
  const password = "2042001";

  console.log("🔍 Đang kiểm tra tài khoản admin...");
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("✅ Tài khoản admin đã tồn tại.");
      return;
    }

    console.log("🔐 Đang mã hóa mật khẩu...");
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("👤 Đang tạo tài khoản admin mới...");
    await prisma.user.create({
      data: {
        name: "Notagia Admin",
        email,
        password: hashedPassword,
        role: "ADMIN" as any,
      },
    });

    console.log("✨ Tạo tài khoản admin thành công!");
  } catch (err: any) {
    console.error("❌ Lỗi khi thực hiện seed:", err.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
