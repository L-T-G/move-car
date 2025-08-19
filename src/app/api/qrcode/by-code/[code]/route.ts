import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
/**
 * 获取单个二维码信息
 * */
export async function GET(
  _req: NextRequest, // 用不到时加下划线避免 eslint 警告
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const qr = await prisma.qRCode.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        status: true,
        createdAt: true,
        updateAt: true,
        imageUrl: true,
        owner: {
          select: {
            id: true,
            name: true,
            phones: {
              select: {
                number: true,
              },
            },
          },
        },
      },
    });
    if (!qr) {
      return NextResponse.json(
        { success: false, message: "二维码不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: qr });
  } catch (error) {
    console.error("获取二维码失败:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
