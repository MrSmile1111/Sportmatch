"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Locate, MapPin, MessageCircle, Phone } from "lucide-react";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/sport-map";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CourtCardData = {
  id: string;
  name: string;
  area: string;
  address: string;
  sportIds: string[];
  sportLabels: { id: string; name: string; icon: string }[];
  pricePerHour: number;
  phone: string;
  isOpen: boolean;
  lat: number;
  lng: number;
};

function distanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function CourtsBoard({
  courts,
  sports,
  origin,
}: {
  courts: CourtCardData[];
  sports: { id: string; name: string; icon: string }[];
  origin: { lat: number; lng: number };
}) {
  const [sportId, setSportId] = useState("all");
  const [position, setPosition] = useState(origin);
  const [locating, setLocating] = useState(false);

  const visible = useMemo(() => {
    return courts
      .filter((court) => sportId === "all" || court.sportIds.includes(sportId))
      .map((court) => ({ court, distance: distanceKm(position, court) }))
      .sort((a, b) => a.distance - b.distance)
      .map((entry) => entry.court);
  }, [courts, sportId, position]);

  const markers: MapMarker[] = visible.map((court) => ({
    id: court.id,
    lat: court.lat,
    lng: court.lng,
    variant: "court",
    title: court.name,
    subtitle: `${court.area} · ${formatPrice(court.pricePerHour)}`,
  }));

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Sân thể thao
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {visible.length} sân · Gọi điện hoặc nhắn tin để đặt sân
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Đang sắp xếp sân theo vị trí hiện tại.
          </p>
        </div>
        <button
          type="button"
          onClick={locateMe}
          className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          <Locate className="size-4" />
          {locating ? "Đang định vị..." : "Vị trí của tôi"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setSportId("all")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
            sportId === "all"
              ? "bg-brand-gradient text-white"
              : "border border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutGrid className="size-4" />
          Tất cả
        </button>
        {sports.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => setSportId(sport.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
              sportId === sport.id
                ? "bg-brand-gradient text-white"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{sport.icon}</span>
            {sport.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="h-[400px] overflow-hidden rounded-2xl border border-border lg:h-[760px]">
          <MapView
            markers={markers}
            center={[position.lat, position.lng]}
            zoom={12}
          />
        </div>

        <div className="space-y-4 lg:max-h-[760px] lg:overflow-y-auto lg:pr-1">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
              <p className="font-heading font-bold">Chưa có sân nào</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Thử chọn môn thể thao khác.
              </p>
            </div>
          ) : (
            visible.map((court) => (
              <article
                key={court.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <span className="bg-secondary flex size-11 shrink-0 items-center justify-center rounded-full text-lg">
                  {court.sportLabels[0]?.icon ?? "🏅"}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-heading leading-snug font-bold">
                        {court.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{court.area}</span>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={`tel:${court.phone}`}
                        aria-label={`Gọi ${court.name}`}
                        className="bg-brand/10 text-brand hover:bg-brand/20 flex size-9 items-center justify-center rounded-full transition-colors"
                      >
                        <Phone className="size-4" />
                      </a>
                      <a
                        href={`sms:${court.phone}`}
                        aria-label={`Nhắn tin ${court.name}`}
                        className="flex size-9 items-center justify-center rounded-full bg-chart-4/10 text-chart-4 transition-colors hover:bg-chart-4/20"
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {court.isOpen && (
                      <span className="bg-success-muted text-success rounded-full px-3 py-1 text-xs font-semibold">
                        Mở cửa
                      </span>
                    )}
                    <span className="bg-brand/10 text-brand rounded-full px-3 py-1 text-xs font-semibold">
                      {formatPrice(court.pricePerHour)}
                    </span>
                    {court.sportLabels.map((sport) => (
                      <span
                        key={sport.id}
                        className="bg-secondary flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        <span>{sport.icon}</span>
                        {sport.name}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
