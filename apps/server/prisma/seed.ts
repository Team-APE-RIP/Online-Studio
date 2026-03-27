import {
  GlobalRole,
  PrismaClient,
  UserAccountStatus,
  UserEmailStatus,
} from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function main() {
  const user = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {
      displayName: "Administrator",
      globalRole: GlobalRole.admin,
      accountStatus: UserAccountStatus.active,
      passwordHash: hashPassword("Admin0924"),
    },
    create: {
      username: "admin",
      displayName: "Administrator",
      globalRole: GlobalRole.admin,
      accountStatus: UserAccountStatus.active,
      passwordHash: hashPassword("Admin0924"),
    },
  });

  const primaryEmail = await prisma.userEmail.upsert({
    where: {
      email: "admin@ape-rip.local",
    },
    update: {
      userId: user.id,
      status: UserEmailStatus.verified,
      isPrimary: true,
      verifiedAt: new Date(),
    },
    create: {
      userId: user.id,
      email: "admin@ape-rip.local",
      status: UserEmailStatus.verified,
      isPrimary: true,
      verifiedAt: new Date(),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      primaryEmailId: primaryEmail.id,
      lastLoginAt: new Date(),
    },
  });

  console.log("Seed completed successfully.");
  console.log({
    user: {
      username: "admin",
      email: "admin@ape-rip.local",
      password: "Admin0924",
      globalRole: "admin",
    },
    templatesRemoved: true,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });