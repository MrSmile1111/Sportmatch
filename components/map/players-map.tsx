"use client";

import { useState } from "react";
import { Locate, Map as MapIcon, RefreshCw } from "lucide-react";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/sport-map";

export type PlayerPin = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  isOnline: boolean;
};

export function PlayersMap({
  players,
  me,
}: {
  players: PlayerPin[];
  me: { name: string; lat: number; lng: number };
}) {
  const [center, setCenter] = useState<[number, number]>([me.lat, me.lng]);
  const [mapKey, setMapKey] = useState(0);

  const markers: MapMarker[] = [
    ...players.map((player) => ({
      id: player.id,
      lat: player.lat,
      lng: player.lng,
      variant: player.isOnline ? ("online" as const) : ("offline" as const),
      title: player.name,
      subtitle: `${player.area} · ${player.isOnline ? "Đang online" : "Offline"}`,
    })),
    {
      id: "me",
      lat: center[0],
      lng: center[1],
      variant: "me" as const,
      title: "Vị trí của tôi",
      subtitle: me.name,
    },
  ];

  const [locateError, setLocateError] = useState<string | null>(null);

  function locateMe() {
    if (!navigator.geolocation) {
      setLocateError("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setCenter([result.coords.latitude, result.coords.longitude]);
        setMapKey((value) => value + 1);
      },
      (failure) =>
        setLocateError(
          failure.code === failure.PERMISSION_DENIED
            ? "Bạn đã chặn quyền vị trí. Hãy cho phép trong cài đặt trình duyệt rồi thử lại."
            : "Không lấy được vị trí hiện tại, thử lại sau.",
        ),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <MapIcon className="text-brand size-5" />
            Bản đồ người chơi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {players.length} người chơi gần bạn có vị trí
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={locateMe}
            className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <Locate className="size-4" />
            Vị trí của tôi
          </button>
          <button
            type="button"
            onClick={() => setMapKey((value) => value + 1)}
            className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <RefreshCw className="size-4" />
            Làm mới
          </button>
          {locateError ? (
            <p role="alert" className="text-destructive w-full text-right text-xs">
              {locateError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative flex-1">
        <MapView key={mapKey} markers={markers} center={center} zoom={12} />

        <div className="pointer-events-none absolute bottom-6 left-6 z-[1000] rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm font-bold">Chú thích</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: "#22c55e" }}
              />
              Người chơi online
            </li>
            <li className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: "#f97316" }}
              />
              Người chơi offline
            </li>
            <li className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: "#2dd4bf" }}
              />
              Vị trí của tôi
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
