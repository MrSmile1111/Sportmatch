"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMatch, type NewMatchInput } from "@/lib/data/matches";

export async function createMatchAction(input: NewMatchInput) {
  await createMatch(input);
  revalidatePath("/matches");
  redirect("/matches");
}
