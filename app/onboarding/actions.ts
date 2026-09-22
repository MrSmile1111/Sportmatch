"use server";

import { redirect } from "next/navigation";
import { completeOnboarding } from "@/lib/data/users";
import type { SkillLevel, Weekday } from "@/lib/types";

export async function completeOnboardingAction(input: {
  sportIds: string[];
  skillLevel: SkillLevel;
  area: string;
  avatar: string;
  availability: Weekday[];
}): Promise<{ error: string }> {
  try {
    await completeOnboarding({
      avatar: input.avatar,
      area: input.area,
      sports: input.sportIds.map((sportId) => ({
        sportId,
        skillLevel: input.skillLevel,
      })),
      availability: input.availability,
    });
  } catch (error) {
    console.error("completeOnboarding thất bại:", error);
    return { error: "Chưa lưu được hồ sơ, vui lòng thử lại." };
  }

  // redirect() ném lỗi điều hướng nên phải nằm ngoài try/catch.
  redirect("/discover");
}
