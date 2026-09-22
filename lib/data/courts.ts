import "server-only";

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
  sports: { select: { sportId: true } },
} as const;

type CourtRow = {
  id: string;
  name: string;
  area: string;
  address: string;
  pricePerHour: number;
  phone: string;
  isOpen: boolean;
  lat: number;
  lng: number;
  sports: { sportId: string }[];
};

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
