"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { matchEndedWhere } from "@/lib/data/matches";
import { prisma } from "@/lib/prisma";

const ratingSchema = z.object({
  matchId: z.string().min(1),
  toUserId: z.string().min(1),
  stars: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500),
});

export async function submitRatingAction(input: {
  matchId: string;
  toUserId: string;
  stars: number;
  comment: string;
}): Promise<{ ok: boolean; error?: string }> {
  const fromUserId = await requireUserId();
  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu đánh giá không hợp lệ." };
  }
  const { matchId, toUserId, stars, comment } = parsed.data;
  if (fromUserId === toUserId) {
    return { ok: false, error: "Bạn không thể tự đánh giá chính mình." };
  }

  // Cả hai phải cùng tham gia trận và trận đã hết giờ.
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      ...matchEndedWhere(),
      AND: [fromUserId, toUserId].map((userId) => ({
        participants: { some: { userId, status: "JOINED" as const } },
      })),
    },
    select: { title: true },
  });
  if (!match) {
    return {
      ok: false,
      error: "Chỉ đánh giá được đồng đội cùng trận sau khi trận kết thúc.",
    };
  }

  const key = { fromUserId_toUserId_matchId: { fromUserId, toUserId, matchId } };
  const existing = await prisma.rating.findUnique({ where: key, select: { id: true } });
  await prisma.rating.upsert({
    where: key,
    create: { fromUserId, toUserId, matchId, stars, comment },
    update: { stars, comment },
  });

  // Chỉ báo ở lần đánh giá đầu tiên, sửa lại không gửi thêm thông báo.
  if (!existing) {
    const reviewer = await prisma.user.findUnique({
      where: { id: fromUserId },
      select: { name: true },
    });
    await prisma.notification.create({
      data: {
        userId: toUserId,
        type: "RATING",
        title: "Bạn có đánh giá mới",
        body: `${reviewer?.name ?? "Một đồng đội"} đã chấm ${stars}★ cho bạn sau trận "${match.title}".`,
        payload: { matchId },
      },
    });
  }

  revalidatePath("/ratings");
  revalidatePath(`/profile/${toUserId}`);
  return { ok: true };
}
