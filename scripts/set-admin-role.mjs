// Promotes (or demotes) a user to/from the admin role by email.
//
// Usage:
//   npm run admin:set -- someone@example.com
//   npm run admin:set -- someone@example.com --revoke
//
// This is the intended way to grant the first (and every later) admin: role
// is not editable from any in-app UI or API route on purpose (see
// prisma/schema.prisma's Role enum comment and app/api/admin/pharmacies/route.ts) —
// granting admin should be an out-of-band operation run by someone with DB
// access, not a feature the app exposes to itself.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const [, , email, flag] = process.argv;

if (!email) {
  console.error("Usage: npm run admin:set -- <email> [--revoke]");
  process.exitCode = 1;
  process.exit();
}

const revoke = flag === "--revoke";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exitCode = 1;
  } else {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: revoke ? "user" : "admin" },
    });
    console.log(
      `${updated.email} is now role="${updated.role}" (was "${user.role}").`
    );
  }
} finally {
  await prisma.$disconnect();
}
