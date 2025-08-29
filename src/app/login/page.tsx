"use client"

import { useEffect, useState } from "react"
import { getSession, signIn, signOut, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "antd"
import { otpStep } from "@/api/login";
export default function LoginPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [qrId, setQrId] = useState("") // 普通用户绑定二维码
  const [messageTip, setmessageTipTip] = useState("")
  const [messageApi, contextHolder] = message.useMessage()
  const handleOtpRequest = async () => {
    try {
      if (!email) return setmessageTipTip("请输入邮箱")
      // const res = await fetch("/api/auth/send-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // })
      const res = await otpStep({ email })
      console.log("res,res", res)
      setmessageTipTip(res.message)
    }
    catch (error) {
      console.log("error", error)
    }

  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setmessageTipTip("")

    // 登录前先把旧会话清掉
    await signOut({ redirect: false })
    if (isAdmin) {
      // Admin 登录
      const res = await signIn("admin-login", {
        email,
        password,
        redirect: false,
      })
      console.log(res)
      if (res?.error) setmessageTipTip("Admin 登录失败")
      else {
        setmessageTipTip("Admin 登录成功")
        router.replace("/admin/qrcode")
      }
    } else {
      // 普通用户 OTP 登录
      if (!email) {
        setmessageTipTip("请输入邮箱")
        return
      }
      if (!qrId) {
        setmessageTipTip("未填入二维码序号，请重新扫码，会自动填入")
        return
      }
      if (!code) {
        setmessageTipTip("请输入验证码")
        return
      }
      const res = await signIn("otp-login", {
        email,
        code,
        qrId,
        redirect: false,
      })
      if (res?.error) setmessageTipTip("登录失败")
      else {
        setmessageTipTip("登录成功")
        // 等待session 就绪
        const session = await getSession()   // 或者轮询 /api/auth/session
        if (session) {
          router.replace(`/qrcode/${qrId}/bind`)
        }
      }
    }
  }

  useEffect(() => {
    // 同步qrcode
    const qrcode = searchParams.get('code')
    if (!qrcode) return
    setQrId(qrcode)
    // 判断用户登录状态
    if (status !== "authenticated") return
    if (qrId) {
      messageApi.info('已登录，正在跳转至二维码管理页，请稍后')
      router.replace(`/qrcode/${qrId}/bind`)
    } else {
      messageApi.error('未携带有效二维码信息，请重新扫码登录')
    }
  }, [status, searchParams,messageApi, router])
  return (
    <>
      {contextHolder}
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-md rounded p-6">
          <h1 className="text-xl font-bold mb-4">登录</h1>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="mr-2"
              />
              Admin 登录
            </label>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded px-2 py-1"
              />
            </div>

            {isAdmin ? (
              <div>
                <label className="block mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full border rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={handleOtpRequest}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    获取验证码
                  </button>
                </div>

                <div>
                  <label className="block mb-1">二维码 ID (可选)</label>
                  <input
                    type="text"
                    value={qrId}
                    onChange={(e) => setQrId(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded"
            >
              登录
            </button>

            {messageTip && <p className="text-red-500 mt-2">{messageTip}</p>}
          </form>
        </div>
      </div></>

  )
}
