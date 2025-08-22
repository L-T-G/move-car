"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session) {
    return (
      <div>
        <p>未登录</p>
        <button
          onClick={() => {
            router.push("/admin/login")
          }
          }
        >
          邮箱登录
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>已登录用户：{session.user?.email}</p>
      <p>角色：{session.user?.role}</p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>退出登录</button>
      <button onClick={() => router.push("/admin/login")}>二维码管理</button>
    </div>
  );
}