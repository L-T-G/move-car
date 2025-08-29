import { sendVerificationCode } from "@/libs/email";
import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

async function testSMTPConnection() {
  console.log("SMTP connection Test");
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log("SMTP connection successful");
  } catch (error) {
    console.log("SMTP connection failed:", error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;
  if (!email)
    return NextResponse.json(
      { success: false, message: "参数错误或缺失" },
      { status: 400 }
    );
  // 生成OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 分钟
  // 存入数据库
  await prisma.emailOTP.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });
  await sendVerificationCode(email, code);
  return NextResponse.json(
    { success: true, message: "验证码已发送" },
    { status: 200 }
  );
}
