// src/lib/storage.ts

import COS from "cos-nodejs-sdk-v5";

export interface StorageService {
  uploadFile(localFilePath: string, cosKey: string): Promise<string>;
  deleteFile(cosKey: string): Promise<void>;
  getUrl(cosKey: string): string;
}

export class TencentCOSStorage implements StorageService {
  private cos: COS;
  private bucket: string;
  private region: string;
  private domain: string;
  private appid: string;

  constructor() {
    const {
      COS_BUCKET,
      COS_REGION,
      COS_DOMAIN,
      COS_SECRET_ID,
      COS_SECRET_KEY,
      APPID,
    } = process.env;

    if (
      !COS_BUCKET ||
      !COS_REGION ||
      !COS_DOMAIN ||
      !COS_SECRET_ID ||
      !COS_SECRET_KEY ||
      !APPID
    ) {
      throw new Error(
        "COS 配置项未完整设置（Bucket, Region, Domain, SecretId, SecretKey）"
      );
    }
    this.appid = APPID;
    this.bucket = COS_BUCKET;
    this.region = COS_REGION;
    this.domain = COS_DOMAIN;
    this.cos = new COS({
      SecretId: COS_SECRET_ID,
      SecretKey: COS_SECRET_KEY,
    });
  }

  async uploadFile(localFilePath: string, cosKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cos.uploadFile(
        {
          Bucket: this.bucket + "-" + this.appid,
          Region: this.region,
          Key: cosKey,
          FilePath: localFilePath,
          SliceSize: 5 * 1024 * 1024, // 大于 5 MB 自动分片上传
          onProgress: (progress) => {
            console.log(`上传进度 (${cosKey}):`, progress);
          },
        },
        (err, data) => {
          if (err) {
            console.error("COS 上传错误:", err);
            return reject(err);
          }
          console.log("COS 上传成功:", data);
          resolve(this.getUrl(cosKey));
        }
      );
    });
  }

  async deleteFile(cosKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject(
        {
          Bucket: this.bucket + "-" + this.appid,
          Region: this.region,
          Key: cosKey,
        },
        (err, data) => {
          if (err) {
            console.error("COS 删除错误:", err);
            return reject(err);
          }
          console.log("COS 删除成功:", data);
          resolve();
        }
      );
    });
  }

  getUrl(cosKey: string): string {
    return `${this.domain}/${cosKey}`;
  }
}

// 默认导出一个单例，可直接引用
const storage = new TencentCOSStorage();
export default storage;
