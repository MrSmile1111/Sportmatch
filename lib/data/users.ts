import "server-only";

import { requireUserId } from "@/lib/auth/session";
import {
  GENDER_FROM_DB,
  GENDER_TO_DB,
  SKILL_FROM_DB,
  SKILL_TO_DB,
  WEEKDAY_FROM_DB,
  WEEKDAY_TO_DB,
  dateToString,
} from "@/lib/db/mappers";
import type { Prisma } from "@/lib/generated/prisma/client";
import { distanceKm, roundKm, type LatLng } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import type { Gender, User, UserSport, Weekday } from "@/lib/types";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  bio: true,
  area: true,
  lat: true,
  lng: true,
  gender: true,
  birthday: true,
  trustScore: true,
  isOnline: true,
  isPro: true,
  communityVotes: true,
  createdAt: true,
  sports: {
    select: { sportId: true, skillLevel: true },
    orderBy: { sportId: "asc" },
  },
  availability: { select: { day: true } },
  ratingsGot: { select: { stars: true } },
  _count: {
    select: {
      participation: {
        where: { status: "JOINED", match: { status: "COMPLETED" } },
      },
    },
  },
} as const;

type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

/**
 * `matchCount`, `averageStars`, `ratingCount` là giá trị dẫn xuất (derived) —
 * tính từ Rating và MatchParticipant chứ không lưu cột riêng, đúng như mô tả
 * `RankingScore` trong data-model.
 */
function toDomainUser(row: UserRow, origin?: LatLng | null): User {
  const ratingCount = row.ratingsGot.length;
  const averageStars =
    ratingCount === 0
      ? 0
      : Math.round(
          (row.ratingsGot.reduce((sum, rating) => sum + rating.stars, 0) /
            ratingCount) *
            10,
        ) / 10;

  const hasCoords = row.lat !== null && row.lng !== null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    bio: row.bio,
    area: row.area,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    gender: row.gender ? GENDER_FROM_DB[row.gender] : "Khác",
    birthday: dateToString(row.birthday),
    trustScore: row.trustScore,
    isOnline: row.isOnline,
    isPro: row.isPro,
    distanceKm:
      origin && hasCoords
        ? roundKm(distanceKm(origin, { lat: row.lat!, lng: row.lng! }))
        : 0,
    sports: row.sports.map((sport) => ({
      sportId: sport.sportId,
      skillLevel: SKILL_FROM_DB[sport.skillLevel],
    })),
    availability: row.availability.map((entry) => WEEKDAY_FROM_DB[entry.day]),
    matchCount: row._count.participation,
    averageStars,
    ratingCount,
    communityVotes: row.communityVotes,
    createdAt: dateToString(row.createdAt),
  };
}

/**
 * @param origin toạ độ người xem — dùng để tính `distanceKm`. Bỏ trống thì
 *   khoảng cách trả về 0.
 */
export async function getUsers(origin?: LatLng | null): Promise<User[]> {
  const rows = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => toDomainUser(row, origin));
}

export async function getUserById(
  id: string,
  origin?: LatLng | null,
): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { id }, select: userSelect });
  return row ? toDomainUser(row, origin) : null;
}

export async function getCurrentUser(): Promise<User> {
  const userId = await requireUserId();
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!row) {
    throw new Error("Không tìm thấy người dùng của phiên đăng nhập hiện tại.");
  }

  return toDomainUser(row);
}

export type UserProfileInput = {
  name: string;
  avatar: string;
  area: string;
  gender: Gender;
  birthday: string;
  bio: string;
  sports: UserSport[];
  availability: Weekday[];
};

export async function updateCurrentUser(
  input: UserProfileInput,
): Promise<User> {
  const userId = await requireUserId();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        avatar: input.avatar,
        area: input.area,
        gender: GENDER_TO_DB[input.gender],
        birthday: input.birthday ? new Date(input.birthday) : null,
        bio: input.bio,
      },
    }),
    prisma.userSport.deleteMany({ where: { userId } }),
    prisma.userSport.createMany({
      data: input.sports.map((sport) => ({
        userId,
        sportId: sport.sportId,
        skillLevel: SKILL_TO_DB[sport.skillLevel],
      })),
    }),
    prisma.availability.deleteMany({ where: { userId } }),
    prisma.availability.createMany({
      data: input.availability.map((day) => ({
        userId,
        day: WEEKDAY_TO_DB[day],
      })),
    }),
  ]);

  return getCurrentUser();
}

export type OnboardingInput = {
  avatar: string;
  area: string;
  sports: UserSport[];
  availability: Weekday[];
};

/** Đánh dấu đã hoàn tất onboarding (dùng khi kết thúc wizard 5 bước). */
export async function completeOnboarding(
  input: OnboardingInput,
): Promise<void> {
  const userId = await requireUserId();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        avatar: input.avatar,
        area: input.area,
        onboardedAt: new Date(),
      },
    }),
    prisma.userSport.deleteMany({ where: { userId } }),
    prisma.userSport.createMany({
      data: input.sports.map((sport) => ({
        userId,
        sportId: sport.sportId,
        skillLevel: SKILL_TO_DB[sport.skillLevel],
      })),
    }),
    prisma.availability.deleteMany({ where: { userId } }),
    prisma.availability.createMany({
      data: input.availability.map((day) => ({
        userId,
        day: WEEKDAY_TO_DB[day],
      })),
    }),
  ]);
}
