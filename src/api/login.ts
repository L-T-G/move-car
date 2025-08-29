import request from "@/libs/request";

interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}
// 发送OTP
export async function otpStep(data: { email: string }) {
  const res = await request.post<BaseResponse>("/auth/send-otp", data);
  return res as any; //暂时这样解决
}
//验证OTP
export async function OtpVerify(data: {
  email: string;
  code: string;
  qrId: string | number;
}) {
  return request.post("/auth/verify-otp", data);
}
