import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("query result:", result);

  const userCount = await prisma.user.count();
  console.log("user count:", userCount);

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log("DB verification succeeded");
    process.exit(0);
  })
  .catch((err) => {
    console.error("DB verification failed:", err);
    process.exit(1);
  });
