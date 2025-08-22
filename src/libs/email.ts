import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // 465端口用true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 发送验证码
export async function sendVerificationCode(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: `"Parking Pro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "您的验证码",
      text: `您的验证码是：${code}，10分钟内有效。`,
    });
    return true;
  } catch (error) {
    console.error("发送邮件失败:", error);
    return false;
  }
}
