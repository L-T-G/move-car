export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface QRCode {
  id: number;
  code: string;
  status: string;
  createdAt: string;
  updateAt: string | null;
  imageUrl: string | null;
  owner?: {
    id: number;
    name: string | null;
    phones: { number: string }[];
  };
}
export interface QRCodeListResponse {
  success: string;
  data: QRCode[];
  pagination: Pagination;
}
export interface QRCodeFilterParams {
  phone?: string;
  code?: string;
  status?: string;
}
export interface UpdateQRCodePayload {
  status: string;
  phones?: string[];
}