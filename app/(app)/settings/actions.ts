"use server";

import { revalidatePath } from "next/cache";
import { updateCurrentUser, type UserProfileInput } from "@/lib/data/users";

export async function saveProfileAction(input: UserProfileInput) {
  const user = await updateCurrentUser(input);
  revalidatePath("/settings");
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/discover");
}
