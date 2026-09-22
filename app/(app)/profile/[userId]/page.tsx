import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Crown,
  MapPin,
  Shield,
  SquarePen,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { calculateScore, getRankTier } from "@/lib/ranking";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser, getUserById, getUsers } from "@/lib/data/users";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/profile/[userId]">): Promise<Metadata> {
  const { userId } = await params;
  const user = await getUserById(userId);
  return {
    title: user ? `${user.name} · SportMatch` : "Hồ sơ · SportMatch",
  };
}

export default async function ProfilePage({
  params,
}: PageProps<"/profile/[userId]">) {
  const { userId } = await params;
  const [user, users, sports, currentUser] = await Promise.all([
    getUserById(userId),
    getUsers(),
    getSports(),
    getCurrentUser(),
  ]);

  if (!user) notFound();

  const sportMap = new Map(sports.map((sport) => [sport.id, sport]));
  const score = calculateScore({
    averageStars: user.averageStars,
    matchCount: user.matchCount,
    trustScore: user.trustScore,
    communityVotes: user.communityVotes,
  });
  const tier = getRankTier(score.total);

  const leaderboard = users
    .map((candidate) => ({
      id: candidate.id,
      total: calculateScore({
        averageStars: candidate.averageStars,
        matchCount: candidate.matchCount,
        trustScore: candidate.trustScore,
        communityVotes: candidate.communityVotes,
      }).total,
    }))
    .sort((a, b) => b.total - a.total);
  const rank = leaderboard.findIndex((entry) => entry.id === user.id) + 1;

  const breakdown = [
    {
      icon: Star,
      label: "Điểm đánh giá",
      value: score.rating,
      detail: "Sao TB × 30",
      bar: "bg-brand",
    },
    {
      icon: Trophy,
      label: "Điểm trận đấu",
      value: score.matches,
      detail: "Số trận × 1.5",
      bar: "bg-brand",
    },
    {
      icon: Shield,
      label: "Điểm uy tín",
      value: score.trust,
      detail: "Uy tín × 0.4",
      bar: "bg-teal-400",
    },
    {
      icon: Users,
      label: "Điểm cộng đồng",
      value: score.community,
      detail: "Votes × 2",
      bar: "bg-purple-400",
    },
  ];

  const trustDetails = [
    { label: "Độ tin cậy", value: user.trustScore },
    { label: "Hoàn thành trận", value: 100 },
    { label: "Đánh giá cộng đồng", value: Math.min(100, user.communityVotes * 2) },
  ];

  const isMe = user.id === currentUser.id;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <section className="from-brand/25 relative overflow-hidden rounded-3xl bg-gradient-to-br via-card to-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="relative">
            <span className="bg-brand-gradient flex size-24 items-center justify-center rounded-full text-5xl ring-4 ring-background">
              {user.avatar}
            </span>
            {user.isOnline ? (
              <span className="bg-success absolute right-1 bottom-1 size-4 rounded-full ring-2 ring-background" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {user.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {user.area}
            </p>
            <p className="mt-4 text-sm">
              {user.bio || "Người chơi chưa cập nhật giới thiệu cá nhân."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {user.sports.map((entry) => (
                <span
                  key={entry.sportId}
                  className="bg-brand/15 text-brand flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold"
                >
                  <span>{sportMap.get(entry.sportId)?.icon ?? "🏅"}</span>
                  {sportMap.get(entry.sportId)?.name ?? entry.sportId}
                </span>
              ))}
              {user.sports[0] ? (
                <span className="rounded-full bg-teal-400/15 px-3.5 py-1.5 text-sm font-semibold text-teal-400">
                  {user.sports[0].skillLevel}
                </span>
              ) : null}
            </div>
          </div>

          {isMe ? (
            <Link
              href="/settings"
              className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <SquarePen className="size-4" />
              Sửa hồ sơ
            </Link>
          ) : null}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Thống kê</h2>
            <dl className="mt-4">
              <StatRow
                icon={<Crown className="text-brand size-4" />}
                label="Điểm xếp hạng"
                value={String(Math.round(score.total))}
              />
              <StatRow
                icon={<Trophy className="text-brand size-4" />}
                label="Tổng trận"
                value={String(user.matchCount)}
              />
              <StatRow
                icon={<Shield className="text-brand size-4" />}
                label="Điểm uy tín"
                value={`${user.trustScore}%`}
              />
              <StatRow
                icon={<Users className="text-brand size-4" />}
                label="Số đánh giá"
                value={String(user.ratingCount)}
              />
            </dl>

            <div className="mt-6 border-t border-border pt-6 text-center">
              <p className="font-heading text-4xl font-extrabold">
                {user.averageStars.toFixed(1)}
              </p>
              <div className="mt-2 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "size-4",
                      star <= Math.round(user.averageStars)
                        ? "fill-brand text-brand"
                        : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                điểm đánh giá trung bình
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
              <CalendarDays className="text-brand size-5" />
              Lịch rảnh
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.availability.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa chọn lịch rảnh.
                </p>
              ) : (
                user.availability.map((day) => (
                  <span
                    key={day}
                    className="bg-brand/10 text-brand rounded-full px-3 py-1.5 text-sm font-medium"
                  >
                    {day}
                  </span>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Môn thể thao</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {user.sports.map((entry) => (
                <div
                  key={entry.sportId}
                  className="rounded-2xl border border-border bg-secondary/30 p-5"
                >
                  <span className="text-3xl">
                    {sportMap.get(entry.sportId)?.icon ?? "🏅"}
                  </span>
                  <p className="font-heading mt-3 font-bold">
                    {sportMap.get(entry.sportId)?.name ?? entry.sportId}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.skillLevel}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                  <Crown className="text-brand size-5" />
                  Xếp hạng
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hạng tổng thể:{" "}
                  <span className="font-semibold text-foreground">#{rank}</span>
                </p>
              </div>
              <span className="bg-secondary flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <Crown className="size-3" />
                {tier.name}
              </span>
            </div>

            <div className="mt-6 text-center">
              <p className="font-heading text-brand text-5xl font-extrabold">
                {Math.round(score.total)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                điểm xếp hạng tổng
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-secondary/40 p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Cách tính điểm xếp hạng
              </p>
              <ul className="mt-4 space-y-4">
                {breakdown.map((item) => (
                  <li key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <item.icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </span>
                      <span className="text-brand font-bold">
                        +{Math.round(item.value)}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                      <div
                        className={cn("h-full rounded-full", item.bar)}
                        style={{
                          width: `${
                            score.total > 0
                              ? Math.round((item.value / score.total) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-bold">Tổng điểm</span>
                <span className="text-brand font-bold">
                  {Math.round(score.total)}
                </span>
              </div>
            </div>

            <Link
              href="/ranking"
              className="border-brand text-brand hover:bg-brand/10 mt-5 flex items-center justify-center rounded-full border py-3 text-sm font-semibold transition-colors"
            >
              Xem bảng xếp hạng
            </Link>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Chi tiết uy tín</h2>
            <ul className="mt-5 space-y-5">
              {trustDetails.map((item) => (
                <li key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="bg-brand-gradient h-full rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5 last:border-0">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
