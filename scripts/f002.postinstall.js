const { execSync } = require("child_process");

try {
  console.log("🔹 Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // 判断是否为生产环境
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  if (isProd) {
    console.log("🔹 Deploying Prisma migrations to production database...");
    // 生产环境安全部署迁移，不会交互
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } else {
    console.log("🔹 Skipping production migration in non-prod environment.");
  }

  console.log("✅ Postinstall finished successfully.");
} catch (error) {
  console.error("❌ Postinstall failed:", error);
  process.exit(1);
}