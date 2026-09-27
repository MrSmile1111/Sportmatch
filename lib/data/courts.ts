import "server-only";

import { distanceKm, type LatLng } from "@/lib/geo";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Court } from "@/lib/types";

const courtSelect = {
  id: true,
  name: true,
  area: true,
  address: true,
  pricePerHour: true,
  phone: true,
  isOpen: true,
  lat: true,
  lng: true,
  source: true,
  website: true,
  openingHours: true,
  sports: { select: { sportId: true } },
} as const;

type CourtRow = Prisma.CourtGetPayload<{ select: typeof courtSelect }>;

function toDomainCourt(row: CourtRow): Court {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    address: row.address,
    sportIds: row.sports.map((entry) => entry.sportId),
    pricePerHour: row.pricePerHour,
    phone: row.phone,
    isOpen: row.isOpen,
    lat: row.lat,
    lng: row.lng,
    source: row.source === "OSM" ? "osm" : "sportmatch",
    website: row.website,
    openingHours: row.openingHours,
  };
}

export async function getCourts(): Promise<Court[]> {
  const rows = await prisma.court.findMany({
    select: courtSelect,
    orderBy: { name: "asc" },
  });
  return rows.map(toDomainCourt);
}

export async function getCourtById(id: string): Promise<Court | null> {
  const row = await prisma.court.findUnique({
    where: { id },
    select: courtSelect,
  });
  return row ? toDomainCourt(row) : null;
}

/** Sân của các môn cho trước, trong bán kính `radiusKm` quanh `center`. */
export async function getCourtsNear(
  center: LatLng,
  radiusKm: number,
  sportIds: string[],
): Promise<Court[]> {
  // Lọc thô bằng khung toạ độ (dùng index lat/lng), rồi lọc chính xác theo khoảng cách.
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));

  const rows = await prisma.court.findMany({
    where: {
      lat: { gte: center.lat - dLat, lte: center.lat + dLat },
      lng: { gte: center.lng - dLng, lte: center.lng + dLng },
      sports: { some: { sportId: { in: sportIds } } },
    },
    select: courtSelect,
  });

  return rows
    .map(toDomainCourt)
    .filter((court) => distanceKm(center, court) <= radiusKm);
}
