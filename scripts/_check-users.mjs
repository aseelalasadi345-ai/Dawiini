import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const users = await prisma.user.findMany();
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
