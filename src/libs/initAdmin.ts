// src/libs/initAdmin.ts
import { prisma } from "./prisma";
export async function initAdmin() {
  console.log('当前 DATABASE_URL =', process.env.POSTGRES_PRISMA_URL);
  const adminEmail = process.env.ADMIN_EMAIL!;
  const passwordHash = Buffer.from(
    process.env.ADMIN_PASSWORD_HASH!,
    "base64"
  ).toString("utf-8");
  if (!adminEmail || !passwordHash) {
    throw new Error("请在 .env 中设置 ADMIN_EMAIL 和 ADMIN_PASSWORD_HASH");
  }
  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: passwordHash },
      create: {
        email: adminEmail,
        name: "Super Admin",
        role: "ADMIN",
        password: passwordHash,
      },
    });
    console.log("✅ 默认管理员已创建，", admin);
  } catch (error) {
    console.log("init admin user error：", error);
  }
}
