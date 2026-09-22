import "server-only";

import { prisma } from "@/lib/prisma";
import type { Sport } from "@/lib/types";

const sportSelect = {
  id: true,
  slug: true,
  name: true,
  icon: true,
} as const;

export async function getSports(): Promise<Sport[]> {
  return prisma.sport.findMany({
    where: { isActive: true },
    select: sportSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getSportById(id: string): Promise<Sport | null> {
  return prisma.sport.findUnique({ where: { id }, select: sportSelect });
}

export async function getSportBySlug(slug: string): Promise<Sport | null> {
  return prisma.sport.findUnique({ where: { slug }, select: sportSelect });
}
