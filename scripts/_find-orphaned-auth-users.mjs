// Lists every user in Supabase Auth and cross-references by email against
// the Prisma `User` table, reporting any Supabase Auth account with no
// matching Prisma row — i.e. an account left behind by a signup that
// succeeded in Supabase Auth but failed on the Prisma insert (see
// app/api/auth/signup/route.ts). Read-only: reports, does not delete.
//
// Usage: node scripts/_find-orphaned-auth-users.mjs
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
  const prismaUsers = await prisma.user.findMany({ select: { id: true, email: true } });
  const prismaEmails = new Set(prismaUsers.map((u) => u.email.toLowerCase()));
  console.log(`Prisma User table: ${prismaUsers.length} row(s).`);

  const authUsers = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    authUsers.push(...data.users);
    if (data.users.length < 200) break;
    page++;
  }
  console.log(`Supabase Auth: ${authUsers.length} user(s).`);

  const orphans = authUsers.filter((u) => !u.email || !prismaEmails.has(u.email.toLowerCase()));

  console.log(`\nOrphaned Supabase Auth accounts (no matching Prisma row): ${orphans.length}`);
  for (const o of orphans) {
    console.log(
      `  - ${o.email ?? "(no email)"} | id=${o.id} | created=${o.created_at} | confirmed=${o.email_confirmed_at ?? "NOT CONFIRMED"} | last_sign_in=${o.last_sign_in_at ?? "never"}`
    );
  }
} finally {
  await prisma.$disconnect();
}
