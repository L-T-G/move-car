"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            message.error("请输入邮箱");
        }
        setIsLoading(true)
        try {
            await signIn("email", {
                email,
                callbackUrl: "/admin/qrcode", // 登录成功后跳转
            });
            setIsLoading(false)
        } catch (error) {
            console.log("登录失败", error);
            setIsLoading(false)
        }

    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <form className="w-full max-w-md bg-white shadow-md rounded-xl p-6" onSubmit={handleLogin}>
                <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">管理员登录</h1>
                <input
                    type="email"
                    placeholder="请输入管理员邮箱"
                    className="w-full px-4 py-2 border rounded-lg mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    登录
                </button>
            </form>
        </div>

    );
}
