import "server-only";

import { dateTimeToString } from "@/lib/db/mappers";
import { matchEndedWhere } from "@/lib/data/matches";
import { prisma } from "@/lib/prisma";

const personSelect = { id: true, name: true, avatar: true, image: true } as const;

export type RateablePeer = {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string | null;
  isHost: boolean;
  existingRating: { stars: number; comment: string } | null;
};

export type RateableMatch = {
  id: string;
  title: string;
  sportIcon: string;
  courtName: string;
  dateTime: string;
  peers: RateablePeer[];
};

export type UserReview = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerAvatarUrl: string | null;
  matchTitle: string;
  stars: number;
  comment: string;
  createdAt: string;
};

/** Trận đã hết giờ mà người dùng đã tham gia, kèm đồng đội và đánh giá đã gửi. */
export async function getRateableMatches(userId: string): Promise<RateableMatch[]> {
  const rows = await prisma.match.findMany({
    where: {
      ...matchEndedWhere(),
      participants: { some: { userId, status: "JOINED" } },
    },
    select: {
      id: true,
      title: true,
      hostId: true,
      courtName: true,
      dateTime: true,
      sport: { select: { icon: true } },
      participants: {
        where: { status: "JOINED", userId: { not: userId } },
        select: { user: { select: personSelect } },
        orderBy: { joinedAt: "asc" },
      },
      ratings: {
        where: { fromUserId: userId },
        select: { toUserId: true, stars: true, comment: true },
      },
    },
    orderBy: { dateTime: "desc" },
  });

  return rows
    .filter((row) => row.participants.length > 0)
    .map((row) => {
      const given = new Map(row.ratings.map((r) => [r.toUserId, r]));
      return {
        id: row.id,
        title: row.title,
        sportIcon: row.sport.icon,
        courtName: row.courtName,
        dateTime: dateTimeToString(row.dateTime),
        peers: row.participants.map(({ user }) => {
          const rating = given.get(user.id);
          return {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            avatarUrl: user.image,
            isHost: user.id === row.hostId,
            existingRating: rating
              ? { stars: rating.stars, comment: rating.comment }
              : null,
          };
        }),
      };
    });
}

/** Nhận xét gần đây đồng đội gửi cho người dùng (hiển thị trên Hồ sơ). */
export async function getUserRecentReviews(
  userId: string,
  limit = 10,
): Promise<UserReview[]> {
  const rows = await prisma.rating.findMany({
    where: { toUserId: userId },
    select: {
      id: true,
      stars: true,
      comment: true,
      createdAt: true,
      fromUser: { select: personSelect },
      match: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    reviewerId: row.fromUser.id,
    reviewerName: row.fromUser.name,
    reviewerAvatar: row.fromUser.avatar,
    reviewerAvatarUrl: row.fromUser.image,
    matchTitle: row.match.title,
    stars: row.stars,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  }));
}
