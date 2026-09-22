"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Crosshair, MapPin } from "lucide-react";
import { completeOnboardingAction } from "@/app/onboarding/actions";
import { SiteLogo } from "@/components/layout/site-logo";
import { WEEKDAYS, type SkillLevel, type Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_OPTIONS: { level: SkillLevel; description: string }[] = [
  { level: "Mới chơi", description: "Mới chơi, ưu tiên vui vẻ" },
  { level: "Trung cấp", description: "Nắm luật, có thể chơi cạnh tranh" },
  { level: "Chuyên nghiệp", description: "Kinh nghiệm cao, sẵn sàng thi đấu" },
];

const AREA_SUGGESTIONS = [
  "Cầu Giấy, Hà Nội",
  "Đống Đa, Hà Nội",
  "Tây Hồ, Hà Nội",
  "Hoàn Kiếm, Hà Nội",
  "Quận 1, TP.HCM",
  "Hải Châu, Đà Nẵng",
];

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

const TOTAL_STEPS = 5;

export function OnboardingWizard({
  sportOptions,
}: {
  sportOptions: { id: string; name: string; icon: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sports, setSports] = useState<string[]>([]);
  const [level, setLevel] = useState<SkillLevel>("Mới chơi");
  const [area, setArea] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[2]);
  const [days, setDays] = useState<Weekday[]>([]);

  const percent = Math.round((step / TOTAL_STEPS) * 100);

  const canContinue =
    (step === 1 && sports.length > 0) ||
    step === 2 ||
    (step === 3 && area.trim().length > 0) ||
    step === 4 ||
    step === 5;

  function toggleSport(id: string) {
    setSports((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function toggleDay(day: Weekday) {
    setDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day],
    );
  }

  function goNext() {
    if (step === TOTAL_STEPS) {
      setSaveError(null);
      startTransition(async () => {
        const result = await completeOnboardingAction({
          sportIds: sports,
          skillLevel: level,
          area: area.trim(),
          avatar,
          availability: days,
        });
        setSaveError(result.error);
      });
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <SiteLogo />

        <div className="mt-10 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Bước {step} / {TOTAL_STEPS}
          </span>
          <span className="text-brand font-semibold">{percent}% hoàn tất</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="bg-brand-gradient h-full rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map(
            (dot) => (
              <span
                key={dot}
                className={cn(
                  "h-2 rounded-full transition-all",
                  dot === step ? "bg-brand w-7" : "w-2 bg-muted-foreground/40",
                )}
              />
            ),
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-extrabold">Chọn môn thể thao</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Chọn tất cả môn bạn thích. Bạn có thể thay đổi sau.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                {sportOptions.map((sport) => (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => toggleSport(sport.id)}
                    className={cn(
                      "flex size-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-white transition-colors",
                      sports.includes(sport.id)
                        ? "border-brand"
                        : "border-transparent",
                    )}
                  >
                    <span className="text-3xl">{sport.icon}</span>
                    <span className="text-sm font-semibold text-zinc-800">
                      {sport.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-extrabold">Trình độ của bạn</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Chọn trình độ chung cho các môn bạn đã chọn.
              </p>
              <div className="mt-6 space-y-3">
                {LEVEL_OPTIONS.map((option) => {
                  const active = level === option.level;
                  return (
                    <button
                      key={option.level}
                      type="button"
                      onClick={() => setLevel(option.level)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                        active
                          ? "border-green-500 bg-green-500/10"
                          : "border-transparent bg-white",
                      )}
                    >
                      <span>
                        <span
                          className={cn(
                            "block font-heading font-bold",
                            active ? "text-green-500" : "text-zinc-800",
                          )}
                        >
                          {option.level}
                        </span>
                        <span
                          className={cn(
                            "block text-sm",
                            active ? "text-green-500/80" : "text-zinc-500",
                          )}
                        >
                          {option.description}
                        </span>
                      </span>
                      {active && <Check className="size-5 text-green-500" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl font-extrabold">Khu vực của bạn</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Thông tin này giúp tìm người chơi gần bạn. Bạn có thể nhập càng
                cụ thể càng tốt.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <MapPin className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    placeholder="VD: Cầu Giấy, Hà Nội"
                    className="h-12 w-full rounded-xl border border-input bg-secondary/40 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setArea("Tây Hồ, Hà Nội")}
                  className="border-brand text-brand inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold"
                >
                  <Crosshair className="size-4" />
                  Lấy vị trí
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {AREA_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setArea(suggestion)}
                    className={cn(
                      "rounded-full border-2 px-4 py-2 text-sm transition-colors",
                      area === suggestion
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-transparent bg-white text-zinc-700",
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-2xl font-extrabold">Chọn ảnh hồ sơ</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ảnh hồ sơ giúp người chơi nhận diện bạn dễ hơn. Bạn có thể bỏ qua
                bước này.
              </p>
              <div className="mt-8 flex justify-center">
                <span className="bg-brand flex size-32 items-center justify-center rounded-full border-4 border-dashed border-white/60 text-6xl">
                  {avatar}
                </span>
              </div>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Chọn một avatar có sẵn trên hệ thống:
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {AVATARS.map((option, index) => (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    onClick={() => setAvatar(option)}
                    className={cn(
                      "bg-brand flex size-14 items-center justify-center rounded-full text-2xl transition-transform",
                      avatar === option
                        ? "ring-2 ring-white ring-offset-2 ring-offset-card"
                        : "hover:scale-105",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="text-2xl font-extrabold">Lịch rảnh của bạn</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Bạn thường rảnh lúc nào để chơi? Chọn tất cả ngày phù hợp.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {WEEKDAYS.map((day, index) => {
                  const active = days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "relative flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-colors",
                        active
                          ? "border-brand bg-brand/10"
                          : "border-transparent bg-white",
                      )}
                    >
                      <span className="text-xl">{index < 5 ? "💼" : "🎮"}</span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          active ? "text-brand" : "text-zinc-700",
                        )}
                      >
                        {day}
                      </span>
                      {active && (
                        <span className="bg-brand absolute top-2 right-2 flex size-5 items-center justify-center rounded-full">
                          <Check className="size-3 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className="border-brand text-brand inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full border font-semibold"
            >
              <ArrowLeft className="size-4" />
              Quay lại
            </button>
          )}
          <button
            type="button"
            disabled={!canContinue || pending}
            onClick={goNext}
            className={cn(
              "bg-brand-gradient flex h-13 flex-1 items-center justify-center gap-2 rounded-full font-semibold text-white transition-opacity",
              canContinue
                ? "shadow-brand/30 shadow-xl hover:opacity-90"
                : "opacity-40",
            )}
          >
            {step === TOTAL_STEPS
              ? pending
                ? "Đang lưu..."
                : "Bắt đầu chơi"
              : "Tiếp tục"}
            <ArrowRight className="size-4" />
          </button>
        </div>

        {saveError ? (
          <p role="alert" className="text-destructive mt-4 text-center text-sm">
            {saveError}
          </p>
        ) : null}

        {step === 1 && (
          <button
            type="button"
            onClick={() => router.push("/discover")}
            className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Bỏ qua lúc này →
          </button>
        )}
      </div>
    </main>
  );
}
