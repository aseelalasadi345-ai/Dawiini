// Deletes every throwaway account the Playwright e2e suite created (see
// tests/e2e/fixtures.ts — email pattern csrawand+dawiinie2e<timestamp>@gmail.com),
// both the Prisma User row and the Supabase Auth user. Run after the suite:
//   npx tsx scripts/_cleanup_e2e_user.mjs
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { createClient } from "@supabase/supabase-js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

try {
  const users = await prisma.user.findMany({
    where: { email: { contains: "dawiinie2e" } },
  });
  console.log(`Found ${users.length} e2e test user(s) to clean up.`);
  for (const user of users) {
    await prisma.user.delete({ where: { id: user.id } });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) console.error(`  supabase delete error for ${user.email}:`, error.message);
    else console.log(`  cleaned up ${user.email}`);
  }
} finally {
  await prisma.$disconnect();
}
