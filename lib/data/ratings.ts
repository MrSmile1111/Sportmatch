import "server-only";

import { prisma } from "@/lib/prisma";
import type { Rating } from "@/lib/types";

function toDomainRating(row: {
  id: string;
  fromUserId: string;
  toUserId: string;
  matchId: string;
  stars: number;
  comment: string;
  createdAt: Date;
}): Rating {
  return {
    id: row.id,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    matchId: row.matchId,
    stars: row.stars,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getRatingsForUser(userId: string): Promise<Rating[]> {
  const rows = await prisma.rating.findMany({
    where: { toUserId: userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDomainRating);
}

export async function getRatingsByUser(userId: string): Promise<Rating[]> {
  const rows = await prisma.rating.findMany({
    where: { fromUserId: userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDomainRating);
}

export async function rateTeammate(input: {
  fromUserId: string;
  toUserId: string;
  matchId: string;
  stars: number;
  comment: string;
}): Promise<void> {
  await prisma.rating.upsert({
    where: {
      fromUserId_toUserId_matchId: {
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        matchId: input.matchId,
      },
    },
    create: input,
    update: { stars: input.stars, comment: input.comment },
  });
}
