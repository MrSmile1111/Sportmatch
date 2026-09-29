"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, Share2, ShieldCheck, Star, Users } from "lucide-react";
import type { Club } from "@/lib/clubs/mock-data";
import { getPendingClubRequests, getServerPendingClubRequests, saveClubRequest, subscribeClubRequests } from "@/lib/clubs/demo-storage";

const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const tabs = ["Tổng quan", "Thành viên", "Hoạt động", "Thành tích"] as const;
type ProfileTab = (typeof tabs)[number];

export function ClubProfilePage({ club, preview = false }: { club: Club; preview?: boolean }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("Tổng quan");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [activityJoined, setActivityJoined] = useState(false);

  const pendingRequests = useSyncExternalStore(subscribeClubRequests, getPendingClubRequests, getServerPendingClubRequests);
  const isPending = pendingRequests.includes(club.id);

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      saveClubRequest(club.id);
      setShowRequestForm(false);
      setIsSubmitting(false);
      setSuccess("Đã gửi yêu cầu tham gia. Bạn có thể theo dõi trạng thái tại đây.");
    }, 350);
  }

  const joinLabel = isPending ? "Đang chờ duyệt" : "Tham gia CLB";
  const backHref = preview ? "/preview/explore-clubs" : "/clubs";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600"><ArrowLeft className="size-4" /> Câu lạc bộ</Link>
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="h-32 bg-[linear-gradient(115deg,#fff1ea_0%,#fff_48%,#f3f4f6_100%)] md:h-44" />
          <div className="px-5 pb-5 md:px-7">
            <div className="-mt-8 flex flex-wrap items-end justify-between gap-4 md:-mt-10">
              <div className="flex items-end gap-4">
                <div className="flex size-16 items-center justify-center rounded-xl border-4 border-white bg-orange-50 text-3xl md:size-20">{club.logo}</div>
                <div className="pb-1">
                  <p className="text-xs font-semibold text-orange-600">{club.sportType}</p>
                  <h1 className="mt-1 text-2xl font-bold md:text-3xl">{club.name}</h1>
                </div>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <button type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.href); setSuccess("Đã sao chép liên kết CLB."); }} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-none"><Share2 className="size-4" /> Chia sẻ</button>
                <button type="button" onClick={() => !isPending && setShowRequestForm(true)} disabled={isPending} className="min-h-10 flex-1 rounded-lg bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-emerald-600 sm:flex-none">{isPending && <Check className="mr-1 inline size-4" />}{joinLabel}</button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-orange-500" />{club.area}</span>
              <span className="inline-flex items-center gap-1.5"><Star className="size-4 fill-amber-400 text-amber-400" />{club.rating.toFixed(1)}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="size-4 text-slate-400" />{club.memberCount}/{club.capacity} thành viên</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${club.status === "Đang hoạt động" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{club.status}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${club.recruitmentCount ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{club.recruitmentCount ? `Đang tuyển ${club.recruitmentCount} người` : "Đã đủ thành viên"}</span>
            </div>
          </div>
        </section>

        {success && <div role="status" className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}<button type="button" onClick={() => setSuccess("")} className="ml-3 font-semibold">Đóng</button></div>}

        {isPending && <section className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="font-semibold text-slate-900">Yêu cầu tham gia đang được xem xét</p>
          <ol className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-3"><li className="flex items-center gap-2 text-emerald-700"><Check className="size-4" /> Đã gửi yêu cầu</li><li className="flex items-center gap-2 font-semibold text-orange-700"><Clock3 className="size-4" /> CLB đang xem xét</li><li>○ Được chấp nhận</li></ol>
        </section>}

        <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Thông tin câu lạc bộ">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? "page" : undefined} className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold ${activeTab === tab ? "border-orange-500 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab}</button>)}</nav>

        <div className="mt-5">
          {activeTab === "Tổng quan" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
            <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Giới thiệu</h2><p className="mt-3 text-sm leading-6 text-slate-600">{club.description}</p><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{[["Thành viên", `${club.memberCount}/${club.capacity}`], ["Hoạt động", `${club.activityCount}`], ["Tham gia", `${club.activityRate}%`], ["Phản hồi", `${club.responseRate}%`]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>)}</div>
              <div className="mt-5 rounded-lg border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">Hoạt động sắp tới</p><p className="mt-1 text-xs text-slate-500">{club.nextActivity.title}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Sắp diễn ra</span></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600"><span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{club.nextActivity.date}</span><span>{club.nextActivity.time}</span><span><MapPin className="mr-1 inline size-3.5" />{club.nextActivity.venue}</span></div><button type="button" disabled={activityJoined} onClick={() => { setActivityJoined(true); setSuccess("Bạn đã đăng ký tham gia hoạt động."); }} className="mt-3 min-h-9 rounded-lg border border-orange-200 px-3 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:border-emerald-200 disabled:text-emerald-700">{activityJoined ? "Đã đăng ký" : "Tham gia hoạt động"}</button></div>
            </section>
            <aside className="space-y-5"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">CLB đang tuyển thành viên</h2>{club.recruitmentCount > 0 ? <><p className="mt-2 text-sm text-slate-600">Còn {club.recruitmentCount} vị trí · Trình độ {club.level.toLocaleLowerCase("vi")}</p><div className="mt-3 flex flex-wrap gap-2">{club.positions.map((position) => <span key={position} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">{position}</span>)}</div><p className="mt-3 text-xs text-slate-500">Lịch: {club.schedule.join(" · ")} · {club.time}</p><button type="button" onClick={() => !isPending && setShowRequestForm(true)} disabled={isPending} className="mt-4 min-h-10 w-full rounded-lg bg-orange-500 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-emerald-600">{joinLabel}</button></> : <p className="mt-2 text-sm text-slate-600">CLB đã đủ thành viên và chưa nhận yêu cầu mới.</p>}</section><section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /><h2 className="font-bold">Hoạt động tích cực</h2></div><p className="mt-3 text-2xl font-bold">{club.activityRate}%</p><p className="text-xs text-slate-500">{club.activityCount} hoạt động đã tổ chức</p></section></aside>
          </div>}
          {activeTab === "Thành viên" && <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Thành viên</h2><span className="text-sm text-slate-500">{club.memberCount} thành viên</span></div><div className="mt-4 divide-y divide-slate-100">{club.members.map((member, index) => <div key={member} className="flex items-center gap-3 py-3"><div className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-700">{member.slice(0, 1)}</div><div><p className="text-sm font-semibold">{member}</p><p className="text-xs text-slate-500">{index === 0 ? "Quản trị viên" : "Thành viên"} · {club.level}</p></div></div>)}</div><button type="button" className="mt-2 text-sm font-semibold text-orange-600">Xem tất cả {club.memberCount} thành viên</button></section>}
          {activeTab === "Hoạt động" && <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Hoạt động của CLB</h2><span className="text-sm text-slate-500">{club.activityCount} hoạt động</span></div><article className="mt-4 rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{club.nextActivity.kind}</span><h3 className="mt-2 font-bold">{club.nextActivity.title}</h3></div><span className="text-xs text-slate-500">Sắp diễn ra</span></div><div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"><span>{club.nextActivity.date}</span><span>{club.nextActivity.time}</span><span>{club.nextActivity.venue}</span></div><div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-500">{club.nextActivity.joined}/{club.nextActivity.capacity} người</span><button type="button" disabled={activityJoined} onClick={() => { setActivityJoined(true); setSuccess("Bạn đã đăng ký tham gia hoạt động."); }} className="min-h-9 rounded-lg bg-orange-500 px-3 text-xs font-bold text-white hover:bg-orange-600 disabled:bg-emerald-600">{activityJoined ? "Đã đăng ký" : "Tham gia"}</button></div></article><p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">CLB đã tổ chức {club.activityCount} hoạt động, hoạt động gần nhất diễn ra trong tháng này.</p></section>}
          {activeTab === "Thành tích" && <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Thành tích CLB</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Hoạt động", club.achievements.events], ["Thắng", club.achievements.wins], ["Hòa", club.achievements.draws], ["Thua", club.achievements.losses]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div><div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><Star className="size-4 fill-amber-400 text-amber-400" />Đánh giá trung bình {club.rating.toFixed(1)} / 5 · Hoạt động {club.foundedMonths} tháng</div></section>}
        </div>
      </div>

      {showRequestForm && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowRequestForm(false); }}><section role="dialog" aria-modal="true" aria-labelledby="club-request-title" className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-orange-600">Yêu cầu tham gia · {club.name}</p><h2 id="club-request-title" className="mt-1 text-xl font-bold">Giới thiệu về bạn</h2></div><button type="button" onClick={() => setShowRequestForm(false)} aria-label="Đóng" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button></div><form onSubmit={submitRequest} className="mt-5 space-y-4"><label className="block text-sm font-semibold">Trình độ<select className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>Người mới</option><option>Cơ bản</option><option>Trung bình</option><option>Nâng cao</option></select></label><label className="block text-sm font-semibold">Vị trí<input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" placeholder={club.positions[0] ?? "Không áp dụng"} /></label><fieldset><legend className="text-sm font-semibold">Lịch có thể tham gia</legend><div className="mt-2 flex flex-wrap gap-2">{daysOfWeek.map((day) => <label key={day} className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold ${selectedDays.includes(day) ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600"}`}><input type="checkbox" checked={selectedDays.includes(day)} onChange={() => setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])} className="sr-only" />{day}</label>)}</div></fieldset><label className="block text-sm font-semibold">Giới thiệu<textarea rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" placeholder="Chia sẻ ngắn về kinh nghiệm và mong muốn của bạn" /></label><button type="submit" disabled={isSubmitting} className="min-h-11 w-full rounded-lg bg-orange-500 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">{isSubmitting ? "Đang gửi..." : "Gửi yêu cầu tham gia"}</button></form></section></div>}
    </main>
  );
}
