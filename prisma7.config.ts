import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI (db push / migrate) needs a direct connection, not the
    // pgbouncer pooler — so this points at DIRECT_URL, not DATABASE_URL.
    //
    // Was actually set to DATABASE_URL (the transaction-mode pooler) despite
    // this comment already saying otherwise — that pooler mode can't grant
    // the session-level advisory lock db push needs, which is why `prisma
    // db push` hung indefinitely rather than completing. Fixed to match
    // what the comment (and DIRECT_URL's own .env description: "session-mode
    // pooler, used for migrations") already said it should be.
    url: env("DIRECT_URL"),
  },
});
