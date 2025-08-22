import NextAuth, { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/libs/prisma";

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
testSMTPConnection();
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // admin 用户直接登录，无邮件验证
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            return null;
          }
          // 查找用户是否为管理员
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
          // 只允许管理员进入管理页面
          if (user?.role === "ADMIN") {
            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
          // 非管理员 或 用户不存在
          return null;
        } catch (error) {
          console.error("Admin Authorization error:", error);
          return null;
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // 10分钟内有效
    }),
  ],
  session: {
    strategy: "jwt", // 用 JWT，不保存到数据库
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("Redirect called with:", { url, baseUrl });
      // 如果URL是baseUrl的子路径，直接返回
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // 默认返回仪表板
      return `${baseUrl}/admin`;
    },
    async signIn({ user, account }) {
      // 区别不同登录
      if (account?.provider === "credentials") {
        return true;
      }
      if (account?.provider === "email") {
        if (!user.email) return false;
        console.log("user", user);
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        console.log("dbUser", dbUser);
        // 判断角色是否是管理员
        if (dbUser?.role === "ADMIN") {
          return true; // 允许登录
        }
        return false; // 拒绝非管理员登录
      }
      return false;
    },
    async jwt({ token, user }) {
      // 首次登录时，把 user 的数据塞进 token
      if (user) {
        token.id = String(user.id);
        // 查询数据库，拿role
        const userInfo = await prisma.user.findUnique({
          where: {
            id: Number(user.id),
          },
        });
        token.role = userInfo?.role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login", // 自定义登录页
    error: "/admin/error", // 登录错误重定向页面
  },
  events: {
    async signIn({ user }) {
      console.log("signIn", user.email);
    },
    async signOut({ token }) {
      console.log("signOut", token.email);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
