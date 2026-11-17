import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import {
  CreateMatchForm,
  type InvitableUser,
} from "@/components/matches/create-match-form";
import { countMatchesCreatedToday } from "@/lib/data/matches";
import { getSports } from "@/lib/data/sports";
import { DAILY_LIMIT_MESSAGE, DAILY_MATCH_LIMIT } from "@/lib/limits";
import { getCurrentUser, getUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Tạo trận đấu · SportMatch",
};

const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 };

export default async function CreateMatchPage() {
  const currentUser = await getCurrentUser();
  if ((await countMatchesCreatedToday(currentUser.id)) >= DAILY_MATCH_LIMIT) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
          <Lock className="size-6" />
        </div>
        <p className="mt-4 text-lg font-semibold">{DAILY_LIMIT_MESSAGE}</p>
        <Link
          href="/matches"
          className="mt-6 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Quay lại Trận đấu
        </Link>
      </div>
    );
  }

  const [sports, users] = await Promise.all([getSports(), getUsers()]);

  const invitable: InvitableUser[] = users
    .filter((user) => user.id !== currentUser.id)
    .map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      area: user.area,
      sportIds: user.sports.map((sport) => sport.sportId),
      skillLabel: user.sports.map((sport) => sport.skillLevel).join(" · "),
    }));

  // Như trang Sân bãi: hồ sơ chưa có toạ độ → tạm dùng trung tâm Hà Nội,
  // trình duyệt sẽ tự định vị lại sau khi trang hiện ra.
  const hasCoords = currentUser.lat !== 0 || currentUser.lng !== 0;
  const origin = hasCoords
    ? { lat: currentUser.lat, lng: currentUser.lng }
    : DEFAULT_CENTER;

  return <CreateMatchForm sports={sports} users={invitable} origin={origin} />;
}
