// src/libs/initAdmin.ts
import { prisma } from "./prisma";

export async function initAdmin() {
  const adminEmail = "adminexpiea==@yzbx.com";

  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: "Super Admin",
        role: "ADMIN",
      },
    });
    console.log("✅ 默认管理员已创建，", admin);
  } catch (error) {
    console.log("init admin user error：", error);
  }
}
