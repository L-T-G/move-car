// components/QRCodeThumbnail.tsx
import { Image, Popover } from "antd";
import { QRCode } from "@/libs/types";

interface QRCodeThumbnailProps {
  qrcode: QRCode;
  size?: number;
}

export default function QRCodeThumbnail({ qrcode, size = 64 }: QRCodeThumbnailProps) {
  if (!qrcode.imageUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-100 border border-dashed rounded"
           style={{ width: size, height: size }}>
        <span className="text-gray-400 text-xs">无图片</span>
      </div>
    );
  }

  return (
    <Popover
      content={
        <div className="p-2">
          <Image 
            src={qrcode.imageUrl} 
            alt={`二维码 ${qrcode.code}`}
            width={200}
            preview={false}
          />
          <div className="mt-2 text-center">
            <span className="font-mono text-sm">{qrcode.code}</span>
          </div>
        </div>
      }
      trigger="hover"
      placement="right"
    >
      <div className="cursor-pointer hover:shadow-md transition-shadow">
        <Image
          src={qrcode.imageUrl}
          alt={`二维码缩略图 ${qrcode.code}`}
          width={size}
          height={size}
          placeholder={
            <div className="bg-gray-100 flex items-center justify-center" 
                 style={{ width: size, height: size }}>
              <span className="text-gray-400">加载中</span>
            </div>
          }
        />
      </div>
    </Popover>
  );
}