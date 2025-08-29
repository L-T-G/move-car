import prisma from "@/libs/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/* ---------------------------------- 工具 ---------------------------------- */
function validateOwner(qr: any, ownerIdParam: string | null) {
  if (!ownerIdParam || qr.ownerId !== parseInt(ownerIdParam, 10)) {
    return NextResponse.json(
      { success: false, message: "请以二维码绑定用户进行操作" },
      { status: 403 }
    );
  }
  return null;
}

function validatePhones(phones: unknown) {
  if (!Array.isArray(phones) || phones.length === 0) {
    return NextResponse.json(
      { success: false, message: "请提供至少一个手机号" },
      { status: 400 }
    );
  }
  return null;
}
type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};
/**
 * 根据二维码获取手机号（同时校验owner）
 * */

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json(
        { success: false, message: "无效的二维码 ID" },
        { status: 400 }
      );
    }
    //   查找二维码，并带出手机号绑定
    const qr = await prisma.qRCode.findUnique({
      where: { code: code },
      include: {
        QRCodePhoneBinding: true,
        owner: true,
      },
    });
    if (!qr) {
      return NextResponse.json(
        { success: false, message: "二维码不存在" },
        { status: 404 }
      );
    }
    const ownerErr = validateOwner(qr, qr.ownerId + "");
    if (ownerErr) return ownerErr;

    return NextResponse.json({
      success: true,
      data: {
        qrId: qr.id,
        code: qr.code,
        ownerId: qr.ownerId,
        owner: qr.owner?.email,
        phones: qr.QRCodePhoneBinding.map((b) => b.phone),
      },
    });
  } catch (error) {
    console.error("Get Qrcode Info error", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/**
 * 根据二维码绑定手机号（同时校验owner）
 * */

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = await params;
    const { ownerId, phones } = await req.json();
    const qr = await prisma.qRCode.findUnique({
      where: { code: code },
      include: { owner: true },
    });

    if (!qr) {
      return NextResponse.json(
        { success: false, message: "二维码不存在" },
        { status: 404 }
      );
    }
    const ownerErr = validateOwner(qr, ownerId);
    if (ownerErr) return ownerErr;
    // 校验手机号格式
    const phoneErr = validatePhones(phones);
    if (phoneErr) return phoneErr;
    //   开启事务:清空
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 删除旧的绑定
        await tx.qRCodePhoneBinding.deleteMany({
          where: { qrcodeId: qr.id },
        });
        // 插入新的绑定
        const created = await Promise.all(
          phones.map((phone: string) =>
            tx.qRCodePhoneBinding.create({
              data: {
                qrcodeId: qr.id,
                phone,
              },
            })
          )
        );
      }
    );
    return NextResponse.json({ success: true, data: qr },{status:200});
  } catch (error) {
    console.log("Bind phones error", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = await params;
    const { ownerId, phones } = await req.json();

    const qr = await prisma.qRCode.findUnique({
      where: { code: code },
      include: { owner: true },
    });
    if (!qr)
      return NextResponse.json(
        { success: false, message: "二维码不存在" },
        { status: 404 }
      );

    const ownerErr = validateOwner(qr, ownerId);
    if (ownerErr) return ownerErr;

    const phoneErr = validatePhones(phones);
    if (phoneErr) return phoneErr;

    /* 事务：先删后增，保证最终一致 */
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. 清除旧绑定
        await tx.qRCodePhoneBinding.deleteMany({
          where: { qrcodeId: qr.id },
        });
        // 2. 写入新绑定
        await tx.qRCodePhoneBinding.createMany({
          data: phones.map((phone: string) => ({
            qrcodeId: qr.id,
            phone,
          })),
        });
      }
    );

    return NextResponse.json({ success: true, data: qr }, { status: 200 });
  } catch (error) {
    console.error("PATCH bind phones error", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/* --------------------------------- DELETE --------------------------------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const phonesRaw = searchParams.get("phones"); // "138,139"
    const phones = phonesRaw?.split(",").filter(Boolean) ?? [];

    const qr = await prisma.qRCode.findUnique({
      where: { code: qrId },
      include: { owner: true },
    });
    if (!qr)
      return NextResponse.json(
        { success: false, message: "二维码不存在" },
        { status: 404 }
      );

    const ownerErr = validateOwner(qr, ownerId);
    if (ownerErr) return ownerErr;

    const phoneErr = validatePhones(phones);
    if (phoneErr) return phoneErr;

    // 仅删除指定的手机
    const result = await prisma.qRCodePhoneBinding.deleteMany({
      where: {
        qrcodeId: qr.id,
        phone: { in: phones },
      },
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("DELETE bind phones error", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
