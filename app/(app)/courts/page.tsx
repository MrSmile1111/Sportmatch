import type { Metadata } from "next";
import {
  CourtsBoard,
  type CourtCardData,
} from "@/components/courts/courts-board";
import { getCourts } from "@/lib/data/courts";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Sân bãi · SportMatch",
};

export default async function CourtsPage() {
  const [courts, sports, currentUser] = await Promise.all([
    getCourts(),
    getSports(),
    getCurrentUser(),
  ]);

  const sportMap = new Map(sports.map((sport) => [sport.id, sport]));

  const cards: CourtCardData[] = courts.map((court) => ({
    id: court.id,
    name: court.name,
    area: court.area,
    address: court.address,
    sportIds: court.sportIds,
    sportLabels: court.sportIds.map((id) => ({
      id,
      name: sportMap.get(id)?.name ?? id,
      icon: sportMap.get(id)?.icon ?? "🏅",
    })),
    pricePerHour: court.pricePerHour,
    phone: court.phone,
    isOpen: court.isOpen,
    lat: court.lat,
    lng: court.lng,
  }));

  return (
    <CourtsBoard
      courts={cards}
      sports={sports}
      origin={{ lat: currentUser.lat, lng: currentUser.lng }}
    />
  );
}
