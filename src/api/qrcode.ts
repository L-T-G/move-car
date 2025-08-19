import request from "@/libs/request";
import { QRCodeListResponse } from "@/libs/types";
// 获取二维码列表
export async function fetchQRCodeList(
  page = 1,
  pageSize = 10,
  filters?: { phone?: string; code?: string; status?: string }
): Promise<QRCodeListResponse> {
  return request.get("/qrcode/list", {
    params: { page, pageSize, ...filters },
  });
}
// 修改单个二维码信息
export async function updateQRCode(
  id: number,
  data: {
    status?: string;
    ownerId?: string;
    phones?: string[];
  }
) {
  return request.patch(`/qrcode/by-id/${id}`, data);
}
// 获取单个二维码信息
export async function fetchQRCodeDetail(code: string) {
  return request.get(`/qrcode/by-code/${code}`);
}
// 绑定二维码（登录并绑定手机号）
export async function bindQRCode(data: {
  code: string;
  phone: string;
  smsCode: string;
}) {
  return request.post(`/qrcode/bind`, data);
}
