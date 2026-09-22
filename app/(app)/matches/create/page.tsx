import type { Metadata } from "next";
import {
  CreateMatchForm,
  type InvitableUser,
} from "@/components/matches/create-match-form";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser, getUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Tạo trận đấu · SportMatch",
};

export default async function CreateMatchPage() {
  const [sports, users, currentUser] = await Promise.all([
    getSports(),
    getUsers(),
    getCurrentUser(),
  ]);

  const invitable: InvitableUser[] = users
    .filter((user) => user.id !== currentUser.id)
    .map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      area: user.area,
      sportIds: user.sports.map((sport) => sport.sportId),
      skillLabel: user.sports.map((sport) => sport.skillLevel).join(" · "),
    }));

  return <CreateMatchForm sports={sports} users={invitable} />;
}
