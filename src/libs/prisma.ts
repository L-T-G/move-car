// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { initAdmin } from "./initAdmin";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV !== "development" ? ["query"] : [], // 开发模式下可以打开日志
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

async function setUp() {
  await initAdmin();
}
// 模块加载时，执行一次
setUp();

export default prisma;
