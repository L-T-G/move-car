
"use client";

import { AdminGuard } from "@/components/AdminGuard";
export default function AdminHomePage() {


  return (
    <AdminGuard><h1>欢迎管理员</h1>;</AdminGuard>

  )
}
