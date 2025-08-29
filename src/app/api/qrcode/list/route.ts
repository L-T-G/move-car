import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { QRCodeStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // 获取分页
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    // 查询条件参数
    const phone = searchParams.get("phone") || undefined;
    const code = searchParams.get("code") || undefined;
    const status = searchParams.get("status") || undefined;
    // 拼接 where 条件
    const where: Prisma.QRCodeWhereInput = {};
    if (code) {
      where.code = { contains: code }; // 模糊查询
    }

    if (
      status &&
      Object.values(QRCodeStatus).includes(status as QRCodeStatus)
    ) {
      where.status = status as QRCodeStatus; // 精确匹配
    }
    if (phone) {
      where.QRCodePhoneBinding = {
        some: {
          phone: { contains: phone } //模糊匹配手机号
        },
      };
    }
    // 按时间倒序
    const total = await prisma.qRCode.count({ where });
    const qrList = await prisma.qRCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        code: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        imageUrl: true,
        ownerId: true,
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
    return NextResponse.json({
      success: true,
      data: qrList,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("get qrlist error",error);
    return NextResponse.json(
      { success: false, message: "查询二维码失败" },
      { status: 500 }
    );
  }
}
