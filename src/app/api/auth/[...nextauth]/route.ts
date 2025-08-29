import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/libs/prisma";
import * as bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // admin 用户直接登录，无邮件验证
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          // 查找用户是否为管理员
          if (
            !process.env.ADMIN_EMAILS?.split(",").includes(credentials.email)
          ) {
            return null;
          }
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
          if (!user || user.role !== "ADMIN") return null;
          // 校验密码
          const adminHash = Buffer.from(
            process.env.ADMIN_PASSWORD_HASH!,
            "base64"
          ).toString("utf-8");
          if (!adminHash) return null;
          // 比对输入密码
          const isValid = await bcrypt.compare(credentials.password, adminHash);
          console.log(isValid, "isValid");

          if (!isValid) return null;
          // 只允许管理员进入管理页面
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Admin Authorization error:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "text" },
        qrId: { label: "QrCode Id", type: "text" },
      },
      async authorize(credentials) {
        if(!credentials) return null
        if (!credentials.email || !credentials.code) return null;
        console.log(credentials,"credentials");
        
        // 1. 查找 OTP
        const record = await prisma.emailOTP.findFirst({
          where: { email: credentials.email, code: credentials.code },
          orderBy: { createdAt: "desc" },
        });

        if (!record || record.expiresAt < new Date()) {
          return null; // 验证失败
        }

        // 2. 找到或创建用户
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          user = await prisma.user.create({
            data: { email: credentials.email, role: "USER" },
          });
        }

        // 3. 如果传了二维码 ID，绑定
        if (credentials.qrId) {
          const qr = await prisma.qRCode.findUnique({
            where: { code: credentials.qrId },
          });
          if (qr && !qr.ownerId) {
            await prisma.qRCode.update({
              where: { id: qr.id },
              data: { ownerId: user.id },
            });
          }
        }
        console.log("authorize return", {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          qrId: credentials.qrId,
        });
        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          qrId: credentials.qrId,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // async signIn({ user, account }) {
    //   // 区别不同登录
    //   if (account?.provider === "credentials") {
    //     return true;
    //   }
    //   if (account?.provider === "email") {
    //     if (!user.email) return false;
    //     console.log("user", user);
    //     const dbUser = await prisma.user.findUnique({
    //       where: { email: user.email },
    //     });
    //     console.log("dbUser", dbUser);
    //     // 判断角色是否是管理员
    //     if (dbUser?.role === "ADMIN") {
    //       return true; // 允许登录
    //     }
    //     return false; // 拒绝非管理员登录
    //   }
    //   return false;
    // },
    async jwt({ token, user }) {
      // 首次登录时，把 user 的数据塞进 token
      console.log("jwt callback", user);
      // if (user) {
      //   token.id = String(user.id);
      //   // 查询数据库，拿role
      //   const userInfo = await prisma.user.findUnique({
      //     where: {
      //       id: Number(user.id),
      //     },
      //   });
      //   token.role = userInfo?.role || "USER";
      // }
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.role = (user as any).role;
        token.qrId = (user as any).qrId as string;
      }
      // 复用时：user 为 undefined，直接返回已有 token
      return token;
    },
    async session({ session, token }) {
      console.log("session callback", token.user);
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // 自定义登录页
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
