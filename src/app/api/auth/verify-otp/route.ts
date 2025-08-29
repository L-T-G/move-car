import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, code, qrId } = body;

  if (!email || !code)
    return NextResponse.json(
      { success: false, message: "参数错误" },
      { status: 400 }
    );

  const record = await prisma.emailOTP.findFirst({
    where: { email, code },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date())
    return NextResponse.json(
      { success: false, message: "验证码无效或已过期" },
      { status: 400 }
    );

  // 找到或创建用户
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, role: "USER" } });
  }

  // 如果有二维码 ID，绑定二维码
  if (qrId) {
    const qr = await prisma.qRCode.findUnique({ where: { id: Number(qrId) } });
    if (qr && !qr.ownerId) {
      await prisma.qRCode.update({
        where: { id: Number(qrId) },
        data: { ownerId: user.id },
      });
    }
  }

  return NextResponse.json({ success: true, userId: user.id });
}
