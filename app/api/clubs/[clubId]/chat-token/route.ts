import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseUserToken } from "@/lib/supabase/user-token";

type Context = { params: Promise<{ clubId: string }> };

export async function GET(request: Request, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Cần đăng nhập để chat." }, { status: 401 });

  const { clubId } = await params;
  const roomType = new URL(request.url).searchParams.get("roomType");
  if (roomType !== "admin_1on1" && roomType !== "club_group") {
    return Response.json({ error: "Phòng chat không hợp lệ." }, { status: 400 });
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, ownerId: true, owner: { select: { name: true } } },
  });
  if (!club) return Response.json({ error: "Không tìm thấy CLB." }, { status: 404 });
  if (!club.ownerId) return Response.json({ error: "CLB này chưa có chủ sở hữu để chat." }, { status: 409 });

  if (roomType === "club_group" && club.ownerId !== userId) {
    const membership = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { status: true },
    });
    if (membership?.status !== "APPROVED") {
      return Response.json({ error: "Chỉ thành viên đã được chủ CLB duyệt mới được vào kênh nội bộ." }, { status: 403 });
    }
  }

  try {
    return Response.json(
      { accessToken: createSupabaseUserToken(userId, session.user?.name ?? "Người chơi"), userId, ownerId: club.ownerId, ownerName: club.owner?.name ?? "Chủ CLB" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Máy chủ chưa cấu hình chữ ký truy cập Supabase." }, { status: 503 });
  }
}
