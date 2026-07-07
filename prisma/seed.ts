import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";

import { systemItemTypes } from "../db/typesystem";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const itemType of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: itemType.name, userId: null },
    });

    if (existing) {
      await prisma.itemType.update({
        where: { id: existing.id },
        data: { icon: itemType.icon, color: itemType.color, isSystem: true },
      });
    } else {
      await prisma.itemType.create({
        data: { ...itemType, isSystem: true, userId: null },
      });
    }
  }
}

main()
  .then(async () => {
    console.log(`Seeded ${systemItemTypes.length} system item types`);
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
