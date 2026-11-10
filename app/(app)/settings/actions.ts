"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { searchCourts } from "@/lib/data/courts";
import {
  ProfileInputError,
  replaceUserImage,
  updateCurrentUser,
  type UserProfileInput,
} from "@/lib/data/users";
import { imageStorage } from "@/lib/storage/image-storage";
import { PLAY_PURPOSES, SKILL_LEVELS, WEEKDAYS } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên.").max(80),
  avatar: z.string().max(16),
  area: z.string().trim().max(120),
  gender: z.enum(["Nam", "Nữ", "Khác"]),
  birthday: z.string().max(10),
  bio: z.string().trim().max(500),
  sports: z
    .array(
      z.object({
        sportId: z.string().min(1),
        skillLevel: z.enum(SKILL_LEVELS),
        purposes: z.array(z.enum(PLAY_PURPOSES)).max(PLAY_PURPOSES.length),
        preferredAreas: z.array(z.string()).max(20),
        favoriteCourtIds: z.array(z.string()).max(20),
      }),
    )
    .max(10),
  availability: z
    .array(
      z.object({
        day: z.enum(WEEKDAYS),
        startMinute: z.number().int(),
        endMinute: z.number().int(),
      }),
    )
    .max(100),
  removeAvatarImage: z.boolean().optional(),
});

/**
 * Luôn ghi vào user của phiên đăng nhập (`updateCurrentUser` tự lấy userId từ
 * session) — không có đường nào sửa hồ sơ của người khác.
 *
 * `removeAvatarImage`: user chọn lại avatar hệ thống → gỡ ảnh đã upload để
 * avatar emoji được hiển thị.
 */
export async function saveProfileAction(
  input: UserProfileInput & { removeAvatarImage?: boolean },
): Promise<{ error: string | null }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  try {
    const user = await updateCurrentUser(parsed.data);
    if (parsed.data.removeAvatarImage) {
      const previous = await replaceUserImage(user.id, "avatar", null);
      if (previous) await imageStorage.remove(previous);
    }
    revalidatePath("/settings");
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/discover");
    return { error: null };
  } catch (error) {
    if (error instanceof ProfileInputError) return { error: error.message };
    console.error("saveProfileAction thất bại:", error);
    return { error: "Chưa lưu được thay đổi, vui lòng thử lại." };
  }
}

export async function searchCourtsAction(sportId: string, query: string) {
  await requireUserId();
  return searchCourts(String(sportId), String(query));
}
