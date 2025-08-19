'use client'
import Link from "next/link";
import React, { useState } from "react";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

export default function AdminLayout({ children, }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-500">
            {/* 移动端顶部导航 */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-blue shadow flex items-center justify-between px-4 py-3">
                <h2 className="text-lg font-bold">管理后台</h2>
                <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <CloseOutlined size={24} /> : <MenuOutlined size={24} />}
                </button>
            </div>


            {/* 侧边栏 */}
            <aside
                className={`
          fixed md:static z-30 top-0 left-0 h-full w-50 bg-gray-500 p-5 shadow-md
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* PC端标题 */}
                <h2 className="hidden md:block text-xl font-bold mb-6 mt-6">帮挪车管理后台</h2>
                <nav className="flex flex-col gap-3 mt-8 md:mt-0">
                    <Link href="/admin" className="hover:text-blue-600" onClick={() => setIsOpen(false)}>首页</Link>
                    <Link href="/admin/mobile" className="hover:text-blue-600" onClick={() => setIsOpen(false)}>Mobile Call</Link>
                    <Link href="/admin/qrcode" className="hover:text-blue-600" onClick={() => setIsOpen(false)}>二维码管理</Link>
                </nav>
            </aside>

            {/* 右侧内容 */}
            <main className="flex-1 p-6 md:ml-0 ml-0 w-full md:mt-0 mt-14">
                {children}
            </main>
        </div>
    )
}