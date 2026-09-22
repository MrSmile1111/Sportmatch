"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import { divIcon, latLngBounds } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  variant: "court" | "online" | "offline" | "me";
  title: string;
  subtitle?: string;
};

const COLORS: Record<MapMarker["variant"], string> = {
  court: "#f97316",
  online: "#22c55e",
  offline: "#f97316",
  me: "#2dd4bf",
};

function markerIcon(variant: MapMarker["variant"]) {
  const color = COLORS[variant];

  if (variant === "court") {
    return divIcon({
      className: "",
      html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.8 12.36 22.68 12.89 23.23a1.54 1.54 0 0 0 2.22 0C15.64 36.68 28 23.8 28 14 28 6.27 21.73 0 14 0z" fill="${color}"/><circle cx="14" cy="14" r="5.2" fill="#ffffff" fill-opacity="0.92"/></svg>`,
      iconSize: [28, 38],
      iconAnchor: [14, 38],
      popupAnchor: [0, -34],
    });
  }

  const size = variant === "me" ? 18 : 16;
  return divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};box-shadow:0 0 0 3px rgba(255,255,255,.85),0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 13);
      return;
    }
    map.fitBounds(
      latLngBounds(markers.map((marker) => [marker.lat, marker.lng])),
      { padding: [48, 48] },
    );
  }, [map, markers]);

  return null;
}

export default function SportMap({
  markers,
  center = [21.0285, 105.8542],
  zoom = 12,
  className,
}: {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds markers={markers} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={markerIcon(marker.variant)}
        >
          <Popup>
            <span className="font-semibold">{marker.title}</span>
            {marker.subtitle ? (
              <>
                <br />
                {marker.subtitle}
              </>
            ) : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
