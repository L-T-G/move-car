"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error"); // NextAuth 会通过 ?error= 错误类型传递

  // 可以根据 error 类型显示自定义消息
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "EmailSignin":
        return "邮箱登录失败，请检查邮箱地址并重试。";
      case "CredentialsSignin":
        return "用户名或密码错误。";
      case "OAuthSignin":
        return "第三方登录失败，请重试。";
      case "AccessDenied":
        return "你没有权限访问该页面。";
      default:
        return "发生未知错误，请重试。";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">登录错误</h1>
        <p className="text-red-600">{getErrorMessage(error)}</p>
        <a
          href="/admin/login"
          className="mt-6 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          返回登录
        </a>
      </div>
    </div>
  );
}
