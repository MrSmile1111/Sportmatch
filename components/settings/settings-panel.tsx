"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  Crosshair,
  Save,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { saveProfileAction } from "@/app/(app)/settings/actions";
import {
  SKILL_LEVELS,
  WEEKDAYS,
  type Gender,
  type SkillLevel,
  type UserSport,
  type Weekday,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type SettingsUser = {
  name: string;
  avatar: string;
  area: string;
  gender: Gender | "";
  birthday: string;
  bio: string;
  sports: UserSport[];
  availability: Weekday[];
};

const TABS = [
  { id: "profile", label: "Hồ sơ", icon: UserIcon },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Shield },
] as const;

const AVATARS = [
  "🧑‍🦱",
  "👩",
  "👱‍♀️",
  "🧒",
  "🧑🏾",
  "🧑‍🦲",
  "👵",
  "👩‍🦰",
  "🧑‍🦰",
  "👧",
  "😉",
  "👩🏽",
  "🧑‍🎤",
  "👶",
  "🧔",
  "👨",
];

const GENDERS: Gender[] = ["Nam", "Nữ", "Khác"];

const NOTIFICATION_SETTINGS = [
  { id: "invites", label: "Lời mời trận đấu", detail: "Khi có người mời bạn vào trận" },
  { id: "joins", label: "Yêu cầu tham gia", detail: "Khi có người xin vào trận của bạn" },
  { id: "messages", label: "Tin nhắn mới", detail: "Tin nhắn từ chủ trận hoặc team" },
  { id: "ratings", label: "Đánh giá mới", detail: "Khi đồng đội đánh giá bạn sau trận" },
];

export function SettingsPanel({
  user,
  sports,
}: {
  user: SettingsUser;
  sports: { id: string; name: string; icon: string }[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("profile");
  const [avatar, setAvatar] = useState(user.avatar);
  const [showAvatars, setShowAvatars] = useState(false);
  const [name, setName] = useState(user.name);
  const [area, setArea] = useState(user.area);
  const [gender, setGender] = useState<Gender | "">(user.gender);
  const [birthday, setBirthday] = useState(user.birthday);
  const [bio, setBio] = useState(user.bio);
  const [userSports, setUserSports] = useState<UserSport[]>(user.sports);
  const [days, setDays] = useState<Weekday[]>(user.availability);
  const [notifications, setNotifications] = useState<string[]>(
    NOTIFICATION_SETTINGS.map((item) => item.id),
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleSport(sportId: string) {
    setUserSports((current) =>
      current.some((entry) => entry.sportId === sportId)
        ? current.filter((entry) => entry.sportId !== sportId)
        : [...current, { sportId, skillLevel: "Mới chơi" }],
    );
  }

  function setSkill(sportId: string, skillLevel: SkillLevel) {
    setUserSports((current) =>
      current.map((entry) =>
        entry.sportId === sportId ? { ...entry, skillLevel } : entry,
      ),
    );
  }

  function toggleDay(day: Weekday) {
    setDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day],
    );
  }

  function detectArea() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((result) => {
      setArea(
        `${result.coords.latitude.toFixed(3)}, ${result.coords.longitude.toFixed(3)}`,
      );
    });
  }

  function save() {
    setSaved(false);
    startTransition(() => {
      void saveProfileAction({
        name: name.trim(),
        avatar,
        area: area.trim(),
        gender: gender === "" ? "Khác" : gender,
        birthday,
        bio: bio.trim(),
        sports: userSports,
        availability: days,
      }).then(() => setSaved(true));
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Cài đặt tài khoản
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cập nhật hồ sơ, môn thể thao, lịch rảnh và bảo mật tài khoản.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <nav className="rounded-2xl border border-border bg-card p-2 lg:sticky lg:top-24">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "profile" ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold">Ảnh đại diện</h2>
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <span className="bg-brand-gradient flex size-20 items-center justify-center rounded-full text-4xl">
                  {avatar}
                </span>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAvatars((value) => !value)}
                    className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
                  >
                    <Camera className="size-4" />
                    Thay đổi ảnh đại diện
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Chọn từ avatar hệ thống hoặc upload ảnh của bạn (tối đa
                    5MB).
                  </p>
                </div>
              </div>

              {showAvatars ? (
                <div className="mt-5 grid grid-cols-8 gap-2">
                  {AVATARS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAvatar(option)}
                      aria-label={`Chọn avatar ${option}`}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-xl border text-2xl transition-colors",
                        avatar === option
                          ? "border-brand bg-brand/10"
                          : "border-border hover:border-brand/50",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold">
                Thông tin cá nhân
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-foreground"
                  >
                    Họ tên
                  </label>
                  <input
                    id="fullName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                </div>

                <div>
                  <label
                    htmlFor="area"
                    className="text-sm font-medium text-foreground"
                  >
                    Khu vực
                  </label>
                  <div className="mt-2 flex gap-3">
                    <input
                      id="area"
                      value={area}
                      onChange={(event) => setArea(event.target.value)}
                      className="h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={detectArea}
                      className="border-brand text-brand hover:bg-brand/10 inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors"
                    >
                      <Crosshair className="size-4" />
                      Vị trí
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="text-sm font-medium text-foreground"
                  >
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value as Gender | "")
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none focus:border-brand"
                  >
                    <option value="">Chưa cập nhật</option>
                    {GENDERS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="birthday"
                    className="text-sm font-medium text-foreground"
                  >
                    Ngày sinh
                  </label>
                  <input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={(event) => setBirthday(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-foreground"
                >
                  Bio ngắn
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-y rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold">
                Môn thể thao và trình độ
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {sports.map((sport) => {
                  const selected = userSports.some(
                    (entry) => entry.sportId === sport.id,
                  );
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => toggleSport(sport.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                        selected
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border hover:border-brand/50",
                      )}
                    >
                      <span>{sport.icon}</span>
                      {sport.name}
                      {selected ? <Check className="size-4" /> : null}
                    </button>
                  );
                })}
              </div>

              {userSports.length === 0 ? (
                <p className="mt-5 text-sm text-muted-foreground">
                  Chọn ít nhất một môn thể thao để đặt trình độ.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {userSports.map((entry) => (
                    <div key={entry.sportId}>
                      {userSports.length > 1 ? (
                        <p className="mb-2 text-sm text-muted-foreground">
                          {sports.find((sport) => sport.id === entry.sportId)
                            ?.name ?? entry.sportId}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-3">
                        {SKILL_LEVELS.map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSkill(entry.sportId, level)}
                            className={cn(
                              "rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors",
                              entry.skillLevel === level
                                ? "border-success/50 bg-success-muted text-success"
                                : "border-border hover:border-brand/50",
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <CalendarDays className="text-brand size-5" />
                Lịch rảnh
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors",
                      days.includes(day)
                        ? "border-success/50 bg-success-muted text-success"
                        : "border-border hover:border-brand/50",
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-end gap-4">
              {saved && !pending ? (
                <span className="text-success text-sm font-semibold">
                  Đã lưu thay đổi
                </span>
              ) : null}
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="bg-brand-gradient shadow-brand/30 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-xl transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Save className="size-4" />
                {pending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        ) : null}

        {tab === "notifications" ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Thông báo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chọn loại thông báo bạn muốn nhận.
            </p>

            <ul className="mt-6 space-y-3">
              {NOTIFICATION_SETTINGS.map((item) => {
                const enabled = notifications.includes(item.id);
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={item.label}
                      onClick={() =>
                        setNotifications((current) =>
                          enabled
                            ? current.filter((value) => value !== item.id)
                            : [...current, item.id],
                        )
                      }
                      className={cn(
                        "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                        enabled ? "bg-brand" : "bg-secondary",
                      )}
                    >
                      <span
                        className={cn(
                          "size-5 rounded-full bg-white transition-transform",
                          enabled && "translate-x-5",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {tab === "security" ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Bảo mật</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Đổi mật khẩu để giữ tài khoản an toàn.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Mật khẩu hiện tại
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Chức năng đổi mật khẩu sẽ hoạt động sau khi nối Auth.js.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
