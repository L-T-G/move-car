import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
/**
 * 获取单个二维码信息
 * */
type RouteContext = {
  params: Promise<{ code: string }>;
};
export async function GET(
  _req: NextRequest, // 用不到时加下划线避免 eslint 警告
  { params }: RouteContext
) {
  try {
    const { code } = await params;
    const qr = await prisma.qRCode.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        imageUrl: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        QRCodePhoneBinding: {
          select: {
            phone: true,
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
    return NextResponse.json({
      success: true,
      data: { ...qr, phones: qr.QRCodePhoneBinding.map((p) => p.phone) },
    });
  } catch (error) {
    console.error("get qrcode error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
