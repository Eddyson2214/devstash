import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

import { demoUser, seedCollections } from "./sampledata";
import { systemItemTypes } from "./typesystem";
import { PrismaClient } from "../src/generated/prisma/client";

const BCRYPT_ROUNDS = 12;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedItemTypes(): Promise<Record<string, string>> {
  const idByName: Record<string, string> = {};

  for (const itemType of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: itemType.name, userId: null },
    });

    const record = existing
      ? await prisma.itemType.update({
          where: { id: existing.id },
          data: { icon: itemType.icon, color: itemType.color, isSystem: true },
        })
      : await prisma.itemType.create({
          data: { ...itemType, isSystem: true, userId: null },
        });

    idByName[itemType.name] = record.id;
  }

  console.log(`Seeded ${systemItemTypes.length} system item types`);
  return idByName;
}

async function seedDemoUser(): Promise<string> {
  const passwordHash = await bcrypt.hash(demoUser.password, BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: demoUser.email },
    update: {},
    create: {
      email: demoUser.email,
      name: demoUser.name,
      password: passwordHash,
      isPro: demoUser.isPro,
      emailVerified: new Date(),
    },
  });

  console.log(`Seeded demo user (${user.email})`);
  return user.id;
}

async function seedCollectionsAndItems(userId: string, itemTypeIdByName: Record<string, string>) {
  const existingCollections = await prisma.collection.count({ where: { userId } });
  if (existingCollections > 0) {
    console.log("Demo user already has collections; skipping collection/item seed.");
    return;
  }

  await Promise.all(
    seedCollections.map(async (seedCollection) => {
      const collection = await prisma.collection.create({
        data: {
          name: seedCollection.name,
          description: seedCollection.description,
          userId,
        },
      });

      const items = await Promise.all(
        seedCollection.items.map((seedItem) => {
          const itemTypeId = itemTypeIdByName[seedItem.itemType];
          if (!itemTypeId) {
            throw new Error(`Unknown item type "${seedItem.itemType}" for item "${seedItem.title}"`);
          }

          return prisma.item.create({
            data: {
              title: seedItem.title,
              description: seedItem.description,
              contentType: seedItem.contentType,
              content: seedItem.content,
              url: seedItem.url,
              language: seedItem.language,
              userId,
              itemTypeId,
              tags: {
                connectOrCreate: seedItem.tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            },
          });
        }),
      );

      await prisma.itemCollection.createMany({
        data: items.map((item) => ({ itemId: item.id, collectionId: collection.id })),
      });
    }),
  );

  console.log(`Seeded ${seedCollections.length} collections`);
}

async function main() {
  const itemTypeIdByName = await seedItemTypes();
  const userId = await seedDemoUser();
  await seedCollectionsAndItems(userId, itemTypeIdByName);
}

main()
  .then(async () => {
    console.log("Seed complete");
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
