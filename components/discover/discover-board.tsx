"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Clock,
  Crosshair,
  MapPin,
  MessageCircle,
  Shield,
  SlidersHorizontal,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";
import { WEEKDAYS, WEEKDAY_SHORT, type Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

export type DiscoverUser = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  area: string;
  distanceKm: number;
  isOnline: boolean;
  gender: string;
  age: number;
  trustScore: number;
  averageStars: number;
  matchCount: number;
  availability: Weekday[];
  sports: { id: string; name: string; icon: string; skillLevel: string }[];
};

const SKILL_FILTERS = ["Tất cả", "Mới chơi", "Trung cấp", "Chuyên nghiệp"];

const GENDER_FILTERS = [
  { value: "Tất cả", icon: "" },
  { value: "Nam", icon: "👦" },
  { value: "Nữ", icon: "👧" },
  { value: "Khác", icon: "🧑" },
];

const SORT_OPTIONS = [
  { id: "match", label: "Phù hợp nhất" },
  { id: "distance", label: "Gần nhất" },
  { id: "rating", label: "Đánh giá cao" },
];

const FREE_INVITES_PER_DAY = 20;

function useMidnightCountdown() {
  const [label, setLabel] = useState("--:--:--");

  useEffect(() => {
    function tick() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      setLabel(
        [hours, minutes, seconds]
          .map((value) => String(value).padStart(2, "0"))
          .join(":"),
      );
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return label;
}

export function DiscoverBoard({
  users,
  sports,
  myAvailability,
}: {
  users: DiscoverUser[];
  sports: { id: string; name: string; icon: string }[];
  myAvailability: Weekday[];
}) {
  const [showFilters, setShowFilters] = useState(true);
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState("all");
  const [skill, setSkill] = useState("Tất cả");
  const [gender, setGender] = useState("Tất cả");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [distance, setDistance] = useState(20);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [days, setDays] = useState<Weekday[]>([]);
  const [sort, setSort] = useState("match");
  const [index, setIndex] = useState(0);
  const [invitesUsed, setInvitesUsed] = useState(0);
  const [skipped, setSkipped] = useState<string[]>([]);

  const countdown = useMidnightCountdown();

  const matched = useMemo(() => {
    const query = name.trim().toLowerCase();

    const list = users.filter((user) => {
      if (skipped.includes(user.id)) return false;
      if (query && !user.name.toLowerCase().includes(query)) return false;
      if (sportId !== "all" && !user.sports.some((s) => s.id === sportId)) {
        return false;
      }
      if (
        skill !== "Tất cả" &&
        !user.sports.some((s) => s.skillLevel === skill)
      ) {
        return false;
      }
      if (gender !== "Tất cả" && user.gender !== gender) return false;
      if (ageFrom && user.age < Number(ageFrom)) return false;
      if (ageTo && user.age > Number(ageTo)) return false;
      if (user.distanceKm > distance) return false;
      if (onlineOnly && !user.isOnline) return false;
      if (
        days.length > 0 &&
        !days.some((day) => user.availability.includes(day))
      ) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "distance") return a.distanceKm - b.distanceKm;
      if (sort === "rating") return b.averageStars - a.averageStars;
      const score = (user: DiscoverUser) =>
        user.averageStars * 10 +
        user.trustScore / 10 -
        user.distanceKm +
        (user.isOnline ? 5 : 0);
      return score(b) - score(a);
    });
  }, [
    users,
    skipped,
    name,
    sportId,
    skill,
    gender,
    ageFrom,
    ageTo,
    distance,
    onlineOnly,
    days,
    sort,
  ]);

  const safeIndex =
    matched.length === 0 ? 0 : Math.min(index, matched.length - 1);
  const current = matched[safeIndex];
  const next = matched[safeIndex + 1];

  function toggleDay(day: Weekday) {
    setDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((value) => value !== day)
        : [...currentDays, day],
    );
    setIndex(0);
  }

  function skip() {
    if (!current) return;
    setSkipped((list) => [...list, current.id]);
    setIndex(0);
  }

  function invite() {
    if (!current || invitesUsed >= FREE_INVITES_PER_DAY) return;
    setInvitesUsed((value) => value + 1);
    setSkipped((list) => [...list, current.id]);
    setIndex(0);
  }

  const sharedDays = current
    ? current.availability.filter((day) => myAvailability.includes(day))
    : [];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_280px] xl:items-start">
        {showFilters ? (
          <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-heading flex items-center gap-2 text-lg font-bold">
                <span className="bg-brand-gradient flex size-8 items-center justify-center rounded-lg">
                  <SlidersHorizontal className="size-4 text-white" />
                </span>
                Bộ lọc
              </p>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                aria-label="Đóng bộ lọc"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Tìm theo tên
                </p>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setIndex(0);
                  }}
                  placeholder="Nhập tên người chơi..."
                  className="mt-3 h-11 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                />
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Môn thể thao
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <FilterChip
                    active={sportId === "all"}
                    onClick={() => {
                      setSportId("all");
                      setIndex(0);
                    }}
                  >
                    Tất cả
                  </FilterChip>
                  {sports.map((sport) => (
                    <FilterChip
                      key={sport.id}
                      active={sportId === sport.id}
                      onClick={() => {
                        setSportId(sport.id);
                        setIndex(0);
                      }}
                    >
                      <span className="mr-1">{sport.icon}</span>
                      {sport.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Trình độ
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SKILL_FILTERS.map((option) => (
                    <FilterChip
                      key={option}
                      active={skill === option}
                      onClick={() => {
                        setSkill(option);
                        setIndex(0);
                      }}
                    >
                      {option}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Giới tính
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {GENDER_FILTERS.map((option) => (
                    <FilterChip
                      key={option.value}
                      active={gender === option.value}
                      onClick={() => {
                        setGender(option.value);
                        setIndex(0);
                      }}
                    >
                      {option.icon ? (
                        <span className="mr-1">{option.icon}</span>
                      ) : null}
                      {option.value}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Độ tuổi
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    value={ageFrom}
                    onChange={(event) => setAgeFrom(event.target.value)}
                    inputMode="numeric"
                    placeholder="Từ"
                    aria-label="Độ tuổi từ"
                    className="h-11 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    value={ageTo}
                    onChange={(event) => setAgeTo(event.target.value)}
                    inputMode="numeric"
                    placeholder="Đến"
                    aria-label="Độ tuổi đến"
                    className="h-11 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Khoảng cách
                  </p>
                  <span className="text-brand text-sm font-bold">
                    {distance} km
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={distance}
                  aria-label="Khoảng cách tối đa"
                  onChange={(event) => {
                    setDistance(Number(event.target.value));
                    setIndex(0);
                  }}
                  className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full"
                  style={{
                    background: `linear-gradient(to right, var(--brand) ${
                      ((distance - 1) / 49) * 100
                    }%, var(--secondary) ${((distance - 1) / 49) * 100}%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(() => {});
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold transition-colors hover:border-brand"
                >
                  <Crosshair className="size-4" />
                  Lấy vị trí của tôi
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Dùng vị trí đã lưu trong hồ sơ
                </p>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className="bg-success size-2.5 rounded-full" />
                    Online ngay
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chỉ hiện người đang online
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={onlineOnly}
                  aria-label="Chỉ hiện người đang online"
                  onClick={() => {
                    setOnlineOnly((value) => !value);
                    setIndex(0);
                  }}
                  className={cn(
                    "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                    onlineOnly ? "bg-brand" : "bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full bg-white transition-transform",
                      onlineOnly && "translate-x-5",
                    )}
                  />
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Lịch rảnh
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <FilterChip
                      key={day}
                      active={days.includes(day)}
                      onClick={() => toggleDay(day)}
                    >
                      {WEEKDAY_SHORT[day]}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex h-fit items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:border-brand"
          >
            <SlidersHorizontal className="size-4" />
            Bộ lọc
          </button>
        )}

        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatPill
              icon={<Users className="size-5 text-white" />}
              value={String(matched.length)}
              label="người phù hợp"
            />
            <StatPill
              icon={<Zap className="size-5 text-white" />}
              value={`${invitesUsed}/${FREE_INVITES_PER_DAY}`}
              label="lượt mời miễn phí"
            />
            <StatPill
              icon={<Clock className="size-5 text-white" />}
              value={countdown}
              label="reset lúc 0h"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-bold">{matched.length}</span>{" "}
              <span className="text-muted-foreground">người chơi</span>
            </p>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setIndex(0);
              }}
              aria-label="Sắp xếp"
              className="h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium outline-none focus:border-brand"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {!current ? (
            <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-20 text-center">
              <p className="font-heading text-lg font-bold">
                Không còn người chơi phù hợp
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Thử nới rộng bộ lọc hoặc quay lại sau.
              </p>
            </div>
          ) : (
            <article className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
              <div className="from-brand/40 relative flex h-72 items-center justify-center bg-gradient-to-b to-card">
                <span
                  className={cn(
                    "absolute top-5 right-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                    current.isOnline
                      ? "bg-success text-success-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  <span className="size-2 rounded-full bg-current" />
                  {current.isOnline ? "Online" : "Offline"}
                </span>

                <span className="bg-brand-gradient ring-brand/40 flex size-32 items-center justify-center rounded-full text-6xl ring-8">
                  {current.avatar}
                </span>

                {current.sports[0] ? (
                  <span className="bg-background/80 absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <span>{current.sports[0].icon}</span>
                    {current.sports[0].name}
                  </span>
                ) : null}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${current.id}`}
                      className="font-heading text-2xl font-extrabold hover:underline"
                    >
                      {current.name}
                    </Link>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      {current.distanceKm}km · {current.area}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="flex items-center justify-end gap-1.5 font-bold">
                      <Star className="fill-brand text-brand size-4" />
                      {current.averageStars}
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {current.matchCount} trận
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="bg-success-muted text-success rounded-full px-3 py-1.5 text-xs font-semibold">
                    {current.sports[0]?.skillLevel ?? "Mới chơi"}
                  </span>
                  <span className="bg-success-muted text-success flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                    <Shield className="size-3.5" />
                    {current.trustScore}% uy tín
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Lịch:</span>
                  <div className="flex flex-1 justify-between gap-1">
                    {WEEKDAYS.map((day) => {
                      const active = current.availability.includes(day);
                      return (
                        <span
                          key={day}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            active
                              ? "bg-brand/15 text-brand"
                              : "text-muted-foreground/25",
                          )}
                        >
                          {WEEKDAY_SHORT[day]}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {current.bio ? (
                  <p className="mt-5 text-sm text-muted-foreground">
                    {current.bio}
                  </p>
                ) : null}

                <p className="bg-brand/10 text-brand mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold">
                  <Zap className="size-4 shrink-0" />
                  Cách bạn {current.distanceKm}km
                  {current.isOnline ? " • Đang online" : ""}
                  {sharedDays.length > 0
                    ? ` • Rảnh ${sharedDays
                        .map((day) => WEEKDAY_SHORT[day])
                        .join(", ")}`
                    : ""}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={skip}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <X className="size-4" />
                    Bỏ qua
                  </button>
                  <Link
                    href="/chat"
                    className="border-success/40 text-success hover:bg-success-muted flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="size-4" />
                    Nhắn tin
                  </Link>
                  <button
                    type="button"
                    onClick={invite}
                    disabled={invitesUsed >= FREE_INVITES_PER_DAY}
                    className="bg-brand-gradient flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Zap className="size-4" />
                    Mời chơi
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Quẹt trái để bỏ qua · Quẹt phải để mời chơi
                </p>
              </div>
            </article>
          )}
        </div>

        <aside className="hidden rounded-2xl border border-border bg-card p-5 xl:sticky xl:top-24 xl:block">
          <p className="font-heading flex items-center gap-2 font-bold">
            <span className="bg-brand-gradient flex size-8 items-center justify-center rounded-lg">
              <Users className="size-4 text-white" />
            </span>
            <span>
              Tiếp theo
              <span className="block text-xs font-normal text-muted-foreground">
                {Math.max(0, matched.length - safeIndex - 1)} người chơi
              </span>
            </span>
          </p>

          {next ? (
            <>
              <p className="mt-4 rounded-xl bg-secondary/40 px-3 py-2.5 text-xs text-muted-foreground">
                💡 Nhấn để chuyển sang người này
              </p>
              <button
                type="button"
                onClick={() => setIndex(safeIndex + 1)}
                className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-brand"
              >
                <span className="bg-brand-gradient flex size-11 shrink-0 items-center justify-center rounded-full text-xl">
                  {next.avatar}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {next.name}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{next.sports[0]?.icon}</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="fill-brand text-brand size-3" />
                      {next.averageStars}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="size-3" />
                      {next.distanceKm}km
                    </span>
                  </span>
                </span>
              </button>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Không còn ai trong hàng chờ.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
      <span className="bg-brand-gradient flex size-10 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="font-heading block text-xl font-extrabold tabular-nums">
          {value}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {label}
        </span>
      </span>
    </div>
  );
}
