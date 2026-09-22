import type { Metadata } from "next";
import { PlayersMap, type PlayerPin } from "@/components/map/players-map";
import { getCurrentUser, getUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Bản đồ · SportMatch",
};

export default async function MapPage() {
  const [users, currentUser] = await Promise.all([getUsers(), getCurrentUser()]);

  const players: PlayerPin[] = users
    .filter((user) => user.id !== currentUser.id)
    .map((user) => ({
      id: user.id,
      name: user.name,
      area: user.area,
      lat: user.lat,
      lng: user.lng,
      isOnline: user.isOnline,
    }));

  return (
    <PlayersMap
      players={players}
      me={{ name: currentUser.name, lat: currentUser.lat, lng: currentUser.lng }}
    />
  );
}
