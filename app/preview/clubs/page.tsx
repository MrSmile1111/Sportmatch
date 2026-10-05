"use client";

import { useMemo, useState } from "react";

type Club = {
  id: string;
  name: string;
  description: string;
  rules: string;
  homeCourt: string;
  members: number;
  status?: "idle" | "pending" | "accepted";
};

type RequestItem = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

const initialClubs: Club[] = [
  {
    id: "club-1",
    name: "CLB Cầu Lông Sunrise",
    description:
      "CLB năng động, tập luyện mỗi tối và tổ chức các trận giao hữu cuối tuần cho mọi trình độ.",
    rules: "- Đúng giờ cho mọi buổi tập\n- Mang giày thể thao riêng\n- Giữ vệ sinh và đặt lịch trước khi tham gia",
    homeCourt: "Sân cầu lông Tây Hồ",
    members: 24,
    status: "accepted",
  },
  {
    id: "club-2",
    name: "CLB Pickleball CityCore",
    description:
      "CLB tập trung vào các hoạt động team building và giải giao lưu pickleball cho thành viên mới.",
    rules: "- Không đá quá tay\n- Có thể ghép đôi theo trình độ\n- Hỗ trợ người mới học tập",
    homeCourt: "Sân pickleball Quận 7",
    members: 18,
    status: "idle",
  },
  {
    id: "club-3",
    name: "CLB Bóng Rổ Hoàng Gia",
    description:
      "CLB không quá nghiêm ngặt, ưu tiên sự vui vẻ, tập luyện đều đặn và kết nối cộng đồng yêu thể thao.",
    rules: "- Tham gia 2 buổi/tuần\n- Mặc đồ thể thao phù hợp\n- Có ý thức bảo vệ sân",
    homeCourt: "Sân bóng rổ Thủ Đức",
    members: 31,
    status: "pending",
  },
];

const initialRequests: RequestItem[] = [
  {
    id: "req-1",
    user: {
      id: "u-1",
      name: "Lan Anh",
      email: "lananh@gmail.com",
    },
  },
  {
    id: "req-2",
    user: {
      id: "u-2",
      name: "Minh Hoàng",
      email: "minhhoang@gmail.com",
    },
  },
  {
    id: "req-3",
    user: {
      id: "u-3",
      name: "Ngọc Trâm",
      email: "ngoctram@gmail.com",
    },
  },
];

function formatTabLabel(tab: "info" | "rules") {
  return tab === "info" ? "Thông tin" : "Nội quy";
}

export default function PreviewClubsPage() {
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [selectedClubId, setSelectedClubId] = useState<string>(initialClubs[0].id);
  const [tab, setTab] = useState<"info" | "rules">("info");
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>(initialRequests);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    rules: "",
  });

  const selectedClub = useMemo(
    () => clubs.find((club) => club.id === selectedClubId) ?? clubs[0],
    [clubs, selectedClubId],
  );

  const handleCreateClub = () => {
    const name = createForm.name.trim();
    if (!name) return;

    const newClub: Club = {
      id: `club-${Date.now()}`,
      name,
      description:
        createForm.description.trim() || "CLB mới được thành lập, đang chào đón thành viên đầu tiên.",
      rules:
        createForm.rules.trim() || "- Đúng giờ\n- Mỗi thành viên giữ vệ sinh\n- Tôn trọng người chơi khác",
      homeCourt: "Sân nhà chưa cập nhật",
      members: 1,
      status: "accepted",
    };

    setClubs((prev) => [newClub, ...prev]);
    setSelectedClubId(newClub.id);
    setCreateForm({ name: "", description: "", rules: "" });
  };

  const handleRequestJoin = () => {
    setClubs((prev) =>
      prev.map((club) =>
        club.id === selectedClubId ? { ...club, status: "pending" } : club,
      ),
    );
  };

  const handleApproveRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-[0_18px_60px_rgba(249,115,22,0.08)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                Câu lạc bộ
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Kết nối người chơi, tạo CLB và tìm sân cùng nhau
              </h1>
            </div>

            <button className="rounded-2xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
              Tạo CLB mới
            </button>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm shadow-orange-100">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                Người tạo CLB
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Tạo câu lạc bộ mới</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tên CLB</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: CLB Cầu Lông Sài Gòn"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Mô tả ngắn về CLB của bạn..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nội quy</label>
                <textarea
                  rows={4}
                  value={createForm.rules}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, rules: e.target.value }))
                  }
                  placeholder="Ví dụ: đúng giờ, giữ vệ sinh, tôn trọng người chơi..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateClub}
                className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Tạo Câu Lạc Bộ
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm shadow-orange-100">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Danh sách CLB
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Khám phá</h2>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                {clubs.length} CLB
              </span>
            </div>

            <div className="space-y-4">
              {clubs.map((club) => {
                const isSelected = selectedClub.id === club.id;

                return (
                  <button
                    key={club.id}
                    type="button"
                    onClick={() => setSelectedClubId(club.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      isSelected
                        ? "border-orange-300 bg-orange-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
                          CLB
                        </p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{club.name}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{club.description}</p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {club.members} thành viên
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm shadow-orange-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Thông tin CLB
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{selectedClub.name}</h2>
              </div>

              <button
                type="button"
                onClick={handleRequestJoin}
                disabled={selectedClub.status === "pending" || selectedClub.status === "accepted"}
                className={`rounded-2xl px-6 py-3 text-base font-semibold shadow-md transition ${
                  selectedClub.status === "accepted"
                    ? "cursor-default bg-emerald-500 text-white shadow-emerald-200"
                    : selectedClub.status === "pending"
                      ? "cursor-not-allowed bg-orange-100 text-orange-600"
                      : "bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600"
                }`}
              >
                {selectedClub.status === "accepted"
                  ? "Đã tham gia"
                  : selectedClub.status === "pending"
                    ? "Đang chờ duyệt"
                    : "Xin gia nhập CLB"}
              </button>
            </div>

            <div className="mt-6 flex gap-3 border-b border-slate-200 pb-4">
              {(["info", "rules"] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setTab(tabKey)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tab === tabKey
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {formatTabLabel(tabKey)}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === "info" ? (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-orange-50 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                      Mô tả
                    </p>
                    <p className="mt-3 text-slate-700">{selectedClub.description}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-medium text-slate-500">Sân nhà</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{selectedClub.homeCourt}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-medium text-slate-500">Thành viên</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{selectedClub.members} người</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Nội quy
                  </p>
                  <div className="mt-4 space-y-2 text-slate-700">
                    {selectedClub.rules.split("\n").map((line, index) => (
                      <p key={`${selectedClub.id}-${index}`}>• {line.replace(/^[-•\s]+/, "")}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm shadow-orange-100">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                Quản lý
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Yêu cầu duyệt</h2>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                Chưa có yêu cầu nào đang chờ duyệt.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{request.user.name}</p>
                        <p className="text-sm text-slate-500">{request.user.email}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(request.id)}
                          className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                        >
                          Chấp nhận
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectRequest(request.id)}
                          className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
