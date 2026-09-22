"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Globe,
  Lock,
  MapPin,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { createMatchAction } from "@/app/(app)/matches/create/actions";
import { SKILL_LEVELS, type MatchVisibility } from "@/lib/types";
import { cn } from "@/lib/utils";

export type InvitableUser = {
  id: string;
  name: string;
  avatar: string;
  area: string;
  sportIds: string[];
  skillLabel: string;
};

const SKILL_OPTIONS = ["Bất kỳ", ...SKILL_LEVELS] as const;

const VISIBILITY_OPTIONS: {
  id: MatchVisibility;
  label: string;
  description: string;
  icon: typeof Globe;
}[] = [
  {
    id: "Công khai",
    label: "Công khai",
    description: "Hiển thị trên bảng trận để mọi người gửi yêu cầu tham gia.",
    icon: Globe,
  },
  {
    id: "Theo lời mời",
    label: "Theo lời mời",
    description: "Chỉ người được mời hoặc đã tham gia mới xem được trận.",
    icon: UserPlus,
  },
  {
    id: "Riêng tư",
    label: "Riêng tư",
    description: "Tạo nhóm kín, bạn có thể mời thêm người sau.",
    icon: Lock,
  },
];

export function CreateMatchForm({
  sports,
  users,
}: {
  sports: { id: string; name: string; icon: string }[];
  users: InvitableUser[];
}) {
  const [sportId, setSportId] = useState("");
  const [courtName, setCourtName] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [skill, setSkill] = useState<(typeof SKILL_OPTIONS)[number]>("Bất kỳ");
  const [visibility, setVisibility] = useState<MatchVisibility>("Công khai");
  const [inviteQuery, setInviteQuery] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  const sport = sports.find((item) => item.id === sportId);

  const suggestions = useMemo(() => {
    if (!sportId) return [];
    const query = inviteQuery.trim().toLowerCase();
    return users
      .filter((user) => user.sportIds.includes(sportId))
      .filter((user) =>
        query
          ? `${user.name} ${user.area}`.toLowerCase().includes(query)
          : true,
      )
      .slice(0, 6);
  }, [users, sportId, inviteQuery]);

  const canSubmit =
    Boolean(sportId) && courtName.trim() !== "" && date !== "" && time !== "";

  function toggleInvite(userId: string) {
    setInvited((current) =>
      current.includes(userId)
        ? current.filter((value) => value !== userId)
        : [...current, userId],
    );
  }

  function submit() {
    if (!canSubmit || pending) return;
    startTransition(() => {
      void createMatchAction({
        sportId,
        title: `${sport?.name ?? "Trận đấu"} - ${courtName.trim()}`,
        courtName: courtName.trim(),
        address: address.trim() || courtName.trim(),
        dateTime: `${date}T${time}:00`,
        maxPlayers,
        skillRequirement: skill,
        visibility,
        description: description.trim(),
        invitedUserIds: invited,
      });
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <Link
        href="/matches"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Tạo trận đấu
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tạo trận công khai để tìm người chơi hoặc tạo nhóm riêng và mời bạn
            bè cùng tham gia.
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          {invited.length} người được mời
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">1. Chọn môn</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {sports.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSportId(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-2xl border p-6 transition-colors",
                    sportId === item.id
                      ? "border-brand bg-brand/5"
                      : "border-border hover:border-brand/50",
                  )}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-semibold">{item.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">
              2. Địa điểm và thời gian
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="courtName"
                  className="text-sm font-medium text-foreground"
                >
                  Tên sân
                </label>
                <div className="relative mt-2">
                  <MapPin className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="courtName"
                    value={courtName}
                    onChange={(event) => setCourtName(event.target.value)}
                    placeholder="VD: Cầu Giấy Sports Center"
                    className="h-12 w-full rounded-xl border border-input bg-secondary/40 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-foreground"
                >
                  Địa chỉ chi tiết
                </label>
                <input
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Số nhà, phường/xã, quận/huyện..."
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="text-sm font-medium text-foreground"
                  >
                    Ngày
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="text-sm font-medium text-foreground"
                  >
                    Giờ
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">
              3. Cài đặt trận đấu
            </h2>

            <div className="mt-5">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Users className="size-4 text-muted-foreground" />
                Số người cần:{" "}
                <span className="text-brand font-bold">{maxPlayers}</span>
              </p>
              <input
                type="range"
                min={2}
                max={20}
                value={maxPlayers}
                onChange={(event) => setMaxPlayers(Number(event.target.value))}
                aria-label="Số người cần"
                className="accent-brand mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary"
                style={{
                  background: `linear-gradient(to right, var(--brand) ${
                    ((maxPlayers - 2) / 18) * 100
                  }%, var(--secondary) ${((maxPlayers - 2) / 18) * 100}%)`,
                }}
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium">Trình độ yêu cầu</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSkill(option)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      skill === option
                        ? "bg-brand/10 text-brand"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium">Quyền hiển thị</p>
              <div className="mt-2 space-y-3">
                {VISIBILITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setVisibility(option.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      visibility === option.id
                        ? "border-brand bg-brand/5"
                        : "border-border hover:border-brand/50",
                    )}
                  >
                    <option.icon
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        visibility === option.id
                          ? "text-brand"
                          : "text-muted-foreground",
                      )}
                    />
                    <span>
                      <span className="block font-semibold">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">4. Mời người chơi</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chọn người chơi phù hợp để gửi lời mời ngay sau khi tạo trận.
            </p>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={inviteQuery}
                onChange={(event) => setInviteQuery(event.target.value)}
                placeholder="Tìm theo tên hoặc khu vực..."
                className="h-12 w-full rounded-xl border border-input bg-secondary/40 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
              />
            </div>

            {!sportId ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Chọn môn thể thao trước để gợi ý người chơi phù hợp.
              </p>
            ) : suggestions.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Không tìm thấy người chơi phù hợp.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {suggestions.map((user) => {
                  const selected = invited.includes(user.id);
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => toggleInvite(user.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                          selected
                            ? "border-brand bg-brand/5"
                            : "border-border hover:border-brand/50",
                        )}
                      >
                        <span className="bg-secondary flex size-10 items-center justify-center rounded-full text-lg">
                          {user.avatar}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.area} · {user.skillLabel}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-semibold",
                            selected
                              ? "bg-brand text-white"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {selected ? "Đã mời" : "Mời"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">5. Mô tả</h2>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="VD: Đánh giao lưu, ưu tiên đúng giờ, mang vợt cá nhân..."
              className="mt-4 w-full resize-y rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
            />
          </section>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || pending}
            className="bg-brand-gradient shadow-brand/30 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-xl transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="size-5" />
            {pending ? "Đang tạo..." : "Tạo trận"}
          </button>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-bold">Tóm tắt trận</h2>

          <div className="mt-5 flex items-center gap-3">
            <span className="bg-brand-gradient flex size-12 shrink-0 items-center justify-center rounded-xl text-xl">
              {sport?.icon ?? <Users className="size-5 text-white" />}
            </span>
            <div className="min-w-0">
              <p className="font-heading truncate font-bold">
                {sport?.name ?? "Chưa chọn môn"}
              </p>
              <p className="text-xs text-muted-foreground">
                {skill === "Bất kỳ" ? "Trình độ bất kỳ" : `Trình độ ${skill}`}
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{courtName || "Chưa nhập sân"}</span>
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" />
              {date || "Chưa chọn ngày"}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              {time || "Chưa chọn giờ"}
            </li>
            <li className="flex items-center gap-2">
              <Users className="size-4 shrink-0" />
              {maxPlayers} người tối đa
            </li>
            <li className="flex items-center gap-2">
              <Globe className="size-4 shrink-0" />
              {visibility}
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
