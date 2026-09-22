import "server-only";

import { requireUserId } from "@/lib/auth/session";
import {
  PARTICIPANT_FROM_DB,
  STATUS_FROM_DB,
  VISIBILITY_FROM_DB,
  VISIBILITY_TO_DB,
  dateTimeToString,
  skillRequirementFromDb,
  skillRequirementToDb,
} from "@/lib/db/mappers";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Match, MatchVisibility, SkillRequirement } from "@/lib/types";

const matchSelect = {
  id: true,
  sportId: true,
  hostId: true,
  title: true,
  courtName: true,
  address: true,
  dateTime: true,
  maxPlayers: true,
  skillRequirement: true,
  visibility: true,
  description: true,
  status: true,
  participants: {
    select: { userId: true, status: true },
    orderBy: { joinedAt: "asc" },
  },
} as const;

type MatchRow = Prisma.MatchGetPayload<{ select: typeof matchSelect }>;

function toDomainMatch(row: MatchRow): Match {
  return {
    id: row.id,
    sportId: row.sportId,
    hostId: row.hostId,
    title: row.title,
    courtName: row.courtName,
    address: row.address,
    dateTime: dateTimeToString(row.dateTime),
    maxPlayers: row.maxPlayers,
    skillRequirement: skillRequirementFromDb(row.skillRequirement),
    visibility: VISIBILITY_FROM_DB[row.visibility],
    description: row.description,
    status: STATUS_FROM_DB[row.status],
    participants: row.participants.map((participant) => ({
      userId: participant.userId,
      status: PARTICIPANT_FROM_DB[participant.status],
    })),
  };
}

/**
 * Trận hiển thị cho một người dùng: trận công khai, trận mình tạo, và trận
 * mình được mời / đã tham gia (khớp quy tắc "Quyền hiển thị" khi tạo trận).
 */
export async function getVisibleMatches(userId: string): Promise<Match[]> {
  const rows = await prisma.match.findMany({
    where: {
      OR: [
        { visibility: "PUBLIC" },
        { hostId: userId },
        { participants: { some: { userId } } },
      ],
    },
    select: matchSelect,
    orderBy: { dateTime: "asc" },
  });
  return rows.map(toDomainMatch);
}

export async function getMatches(): Promise<Match[]> {
  const userId = await requireUserId();
  return getVisibleMatches(userId);
}

export async function getMatchById(id: string): Promise<Match | null> {
  const row = await prisma.match.findUnique({
    where: { id },
    select: matchSelect,
  });
  return row ? toDomainMatch(row) : null;
}

/** Trận mà người dùng đã tham gia (dùng cho Lịch sử và Đánh giá). */
export async function getMatchesJoinedBy(userId: string): Promise<Match[]> {
  const rows = await prisma.match.findMany({
    where: { participants: { some: { userId, status: "JOINED" } } },
    select: matchSelect,
    orderBy: { dateTime: "desc" },
  });
  return rows.map(toDomainMatch);
}

export function countJoined(match: Match): number {
  return match.participants.filter((p) => p.status === "joined").length;
}

export type NewMatchInput = {
  sportId: string;
  title: string;
  courtName: string;
  address: string;
  dateTime: string;
  maxPlayers: number;
  skillRequirement: SkillRequirement;
  visibility: MatchVisibility;
  description: string;
  invitedUserIds: string[];
};

export async function createMatch(input: NewMatchInput): Promise<Match> {
  const hostId = await requireUserId();

  const match = await prisma.match.create({
    data: {
      sportId: input.sportId,
      hostId,
      title: input.title,
      courtName: input.courtName,
      address: input.address,
      dateTime: new Date(input.dateTime),
      maxPlayers: input.maxPlayers,
      skillRequirement: skillRequirementToDb(input.skillRequirement),
      visibility: VISIBILITY_TO_DB[input.visibility],
      description: input.description,
      participants: {
        create: [
          { userId: hostId, status: "JOINED" },
          ...input.invitedUserIds
            .filter((userId) => userId !== hostId)
            .map((userId) => ({ userId, status: "INVITED" as const })),
        ],
      },
      conversation: { create: {} },
    },
    select: matchSelect,
  });

  if (input.invitedUserIds.length > 0) {
    await prisma.notification.createMany({
      data: input.invitedUserIds
        .filter((userId) => userId !== hostId)
        .map((userId) => ({
          userId,
          type: "INVITE" as const,
          title: "Bạn có lời mời trận đấu mới",
          body: `${input.title} · ${input.courtName}`,
          payload: { matchId: match.id },
        })),
    });
  }

  return toDomainMatch(match);
}

/** Người dùng nhận lời mời hoặc xin vào trận công khai. */
export async function joinMatch(matchId: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.matchParticipant.upsert({
    where: { matchId_userId: { matchId, userId } },
    create: { matchId, userId, status: "JOINED" },
    update: { status: "JOINED" },
  });
}

export async function leaveMatch(matchId: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.matchParticipant.update({
    where: { matchId_userId: { matchId, userId } },
    data: { status: "LEFT" },
  });
}
