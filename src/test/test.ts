import * as path from "path";
import { promises as fs } from "fs";
import * as QRCode from "qrcode";
import storage from '@/libs/storage';
export async function generateAndUploadQRCodes(count = 5) {
  const tempDir = path.join(process.cwd(), "temp-qrcodes");
  await fs.mkdir(tempDir, { recursive: true });

  const urls: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = `QR-${Date.now()}-${i}`;
    const localPath = path.join(tempDir, `${code}.png`);
    await QRCode.toFile(localPath, code, { width: 300, margin: 2 });

    const cosKey = `qrcodes/${code}.png`;
    const url = await storage.uploadFile(localPath, cosKey);
    urls.push(url);

    // 可选：上传完成后删除本地临时文件
    await fs.unlink(localPath);
  }
  return urls;
}
