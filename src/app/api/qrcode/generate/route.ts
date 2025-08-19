import { NextRequest } from "next/server";
import * as QRCode from "qrcode"; // ← 关键改这里
import prisma from "@/libs/prisma";
import storage from "@/libs/storage";
import { customAlphabet } from "nanoid";
import pLimit from "p-limit";
import fs from "fs/promises";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
const CONCURRENCY = 5;

export async function GET(req: NextRequest) {
  const count = Number(req.nextUrl.searchParams.get("count") ?? "10");
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(enc.encode(`event:${event}\n`));
        controller.enqueue(enc.encode(`data:${JSON.stringify(data)}\n\n`));
      };
      const limit = pLimit(CONCURRENCY);
      const successful: { code: string; cosKey: string }[] = [];
      let completed = 0;
      let running = 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tasks = Array.from({ length: count }).map((_, idx) => {
        return limit(async () => {
          const code = `QR-${nanoid(10)}`;
          const tmp = `/tmp/${code}.png`;
          const cosKey = `qrcodes/${code}.png`;
          // 任务开始
          running++;
          send("start", {
            running,
            completed,
            queued: count - completed - running,
            code,
          });
          try {
            const buf = await QRCode.toBuffer(
              `${
                process.env.APP_DOMAIN ?? "http://localhost:3001"
              }/qrcode/${code}`,
              {
                width: 300,
                margin: 2,
              }
            );
            await fs.writeFile(tmp, buf);
            const url = await storage.uploadFile(tmp, cosKey);
            await prisma.qRCode.create({
              data: { code, status: "available", imageUrl: url },
            });
            successful.push({ code, cosKey });
            completed += 1;
            send("progress", {
              completed,
              running: running - 1,
              queued: count - completed - (running - 1),
              code,
              url,
            });
          } catch (error) {
            throw { error, code, cosKey };
          } finally {
            running--; // 不管成功或失败都减少正在执行数
            // 清理临时文件
            try {
              await fs.unlink(tmp);
              // catch空语句，忽略非关键异常
            } catch (err) {
              console.error("clean temp png file err:", err);
            }
          }
        });
      });

      try {
        await Promise.all(tasks);
        send("done", { message: "全部二维码生成成功" });
      } catch (error) {
        send("error", { message: "有任务失败，开始回滚" });
        console.log("任务失败:", error);
        // 回滚：删 COS 文件 + 删 DB 记录
        await Promise.all(
          successful.map(async ({ code, cosKey }) => {
            try {
              await storage.deleteFile(cosKey);
              await prisma.qRCode.delete({ where: { code } });
            } catch {}
          })
        );
        send("error", { message: "回滚完成" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { count = 3 } = body;
//   const base = process.env.APP_DOMAIN ?? "http://localhost:3001";

//   if (!count || typeof count !== "number") {
//     return NextResponse.json({ error: "Invalid count" }, { status: 400 });
//   }
//   const results: Array<{ code: string; imageUrl: string }> = [];

//   const qrCodes = [];
//   for (let i = 0; i < count; i++) {
//     const codeData = `QR-${Date.now()}-${i}`; // 保证唯一
//     const buffer = await QRCode.toBuffer(codeData);

//     // 临时文件保存到本地
//     const tempFilePath = `/tmp/qrcode-${Date.now()}-${i}.png`;
//     await import("fs/promises").then((fs) =>
//       fs.writeFile(tempFilePath, buffer)
//     );

//     // 上传到腾讯云
//     const url = await storage.uploadFile(
//       tempFilePath,
//       `qrcodes/qrcode-${Date.now()}-${i}.png`
//     );

//     qrCodes.push({ id: i + 1, code: codeData, url });
//   }

//   return NextResponse.json({ data: qrCodes });
// }
