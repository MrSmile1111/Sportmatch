"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type SportMap from "@/components/map/sport-map";

const LazyMap = dynamic(() => import("@/components/map/sport-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary/40 text-sm text-muted-foreground">
      Đang tải bản đồ...
    </div>
  ),
});

export function MapView(props: ComponentProps<typeof SportMap>) {
  return <LazyMap {...props} />;
}
