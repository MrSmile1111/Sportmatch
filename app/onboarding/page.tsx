import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireUserId } from "@/lib/auth/session";
import { getSports } from "@/lib/data/sports";

export const metadata: Metadata = {
  title: "Bắt đầu · SportMatch",
};

export default async function OnboardingPage() {
  await requireUserId();
  const sports = await getSports();

  return <OnboardingWizard sportOptions={sports} />;
}
