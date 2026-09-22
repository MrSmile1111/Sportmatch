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
}): Promise<void> {
  await completeOnboarding({
    avatar: input.avatar,
    area: input.area,
    sports: input.sportIds.map((sportId) => ({
      sportId,
      skillLevel: input.skillLevel,
    })),
    availability: input.availability,
  });

  redirect("/discover");
}
