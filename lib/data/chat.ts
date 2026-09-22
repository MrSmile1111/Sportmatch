import "server-only";

import { prisma } from "@/lib/prisma";
import type { ChatConversation, ChatMessage } from "@/lib/types";

export async function getConversations(
  userId: string,
): Promise<ChatConversation[]> {
  const rows = await prisma.chatConversation.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      matchId: true,
      lastMessageAt: true,
      members: { select: { userId: true } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    matchId: row.matchId,
    participantIds: row.members.map((member) => member.userId),
    lastMessageAt: row.lastMessageAt.toISOString(),
  }));
}

export async function getMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return rows.map((row) => ({
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  }));
}

/**
 * Số hội thoại có tin nhắn mới hơn mốc `lastReadAt` của người dùng.
 * Việc đẩy realtime sẽ nối sau (Supabase Realtime trên bảng ChatMessage).
 */
export async function countUnreadMessages(userId: string): Promise<number> {
  const members = await prisma.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });

  if (members.length === 0) return 0;

  const counts = await Promise.all(
    members.map((member) =>
      prisma.chatMessage.count({
        where: {
          conversationId: member.conversationId,
          senderId: { not: userId },
          ...(member.lastReadAt ? { createdAt: { gt: member.lastReadAt } } : {}),
        },
      }),
    ),
  );

  return counts.filter((count) => count > 0).length;
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<void> {
  await prisma.$transaction([
    prisma.chatMessage.create({ data: input }),
    prisma.chatConversation.update({
      where: { id: input.conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);
}
