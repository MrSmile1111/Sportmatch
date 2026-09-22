import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Thiếu biến môi trường DATABASE_URL — xem hướng dẫn trong .env.example.",
    );
  }

  // Runtime dùng connection pooler của Supabase (port 6543);
  // migrate/seed dùng DIRECT_URL (xem prisma7.config.ts).
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Khởi tạo lười: client chỉ được tạo ở lần truy cập đầu tiên, để `next build`
 * không nổ khi prerender các trang tĩnh không đụng tới database.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getClient(), property, receiver);
  },
});
