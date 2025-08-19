import prisma from "@/libs/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * 修改二维码记录
 * */
interface UpdateData {
  status?: string;
  ownerId?: number;
}
type RouteContext = {
  params: Promise<{ id: string }>;
};
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    const body = await req.json();
    const { status, ownerId, phones } = body;

    const qr = await prisma.qRCode.findUnique({
      where: { id: numericId },
      include: { owner: true },
    });
    if (!qr) {
      return NextResponse.json(
        { success: false, message: "二维码不存在" },
        { status: 404 }
      );
    }
    // 如果二维码已经存在owner，不允许更换owner
    if (qr.ownerId && ownerId && qr.ownerId !== ownerId) {
      return NextResponse.json(
        { success: false, message: "二维码已绑定用户，不能更换！" },
        { status: 400 }
      );
    }
    // 更新数据容器
    const updateData: UpdateData = {};
    if (status) updateData.status = status;
    //  如果二维码处于 available 且传了 ownerId，允许绑定 owner
    if (!qr.ownerId && ownerId) {
      updateData.ownerId = ownerId;
      updateData.status = "bound"; // 绑定后状态改为 bound
    }
    // 开启事务，保证一致
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const updatedQr = await tx.qRCode.update({
          where: { id: numericId },
          data: updateData,
        });
        if (
          updatedQr.status === "bound" &&
          Array.isArray(phones) &&
          updatedQr.ownerId
        ) {
          await tx.phone.deleteMany({
            where: { userId: updatedQr.ownerId },
          });
          if (phones.length > 0) {
            await tx.phone.createMany({
              data: phones.map((number: string) => ({
                number,
                userId: updatedQr.ownerId!,
              })),
            });
          }
        }
        return updatedQr;
      }
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "更新二维码失败" },
      { status: 500 }
    );
  }
}
