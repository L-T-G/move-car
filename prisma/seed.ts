import { initAdmin } from "@/libs/initAdmin";
import prisma from "@/libs/prisma";
async function main() {
  await initAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
