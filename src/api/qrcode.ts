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
export async function bindQRCode(
  code: string,
  data: {
    ownerId: string;
    phones: string[];
  }
) {
  return request.post(`/qrcode/bind/${code}`, data);
}
// 根据二维码获取手机号
export async function fetchPhonesByQrcode(qrId: string) {
  return request.get(`/qrcode/bind/${qrId}`);
}

// 修改二维码绑定的手机号
export async function updateQRCodePhones(
  code: string,
  data: {
    ownerId: string;
    phones: string[];
  }
) {
  return request.patch(`/qrcode/bind/${code}`, data);
}
// 删除二维码绑定的手机号
export async function deleteQRCodePhones(
  qrId: string,
  data: {
    ownerId: string;
    phones: string[];
  }
) {
  const params = new URLSearchParams({
    ownerId: data.ownerId,
    phones: data.phones.join(","),
  });
  return request.delete(`/qrcode/bind/${qrId}?${params}`);
}
