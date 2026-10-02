"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { LoaderCircle, LockKeyhole, MessageCircle, Send, Wifi, WifiOff } from "lucide-react";
import type { ClubViewerAccess } from "@/lib/clubs/viewer-access";

type RoomType = "admin_1on1" | "club_group";

type ChatMessage = {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  sender_name: string;
  content: string;
  room_type: RoomType;
  club_id: string;
  created_at: string;
};

type Props = {
  clubId: string;
  viewerAccess?: ClubViewerAccess;
};

export function ClubChat({ clubId, viewerAccess }: Props) {
  const senderName = viewerAccess?.displayName ?? "Khách chơi";
  const [ownerRoom, setOwnerRoom] = useState<RoomType>("club_group");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("Chủ CLB");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesScope, setMessagesScope] = useState("");
  const [draft, setDraft] = useState("");
  const [errorState, setErrorState] = useState<{ scope: string; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [connectedScope, setConnectedScope] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const isOwner = viewerAccess?.isOwner ?? false;
  const isApproved = isOwner || viewerAccess?.membershipStatus === "APPROVED";
  const roomType: RoomType = isOwner
    ? ownerRoom
    : isApproved ? "club_group" : "admin_1on1";
  const title = roomType === "admin_1on1"
    ? "Hỏi đáp trước khi gia nhập CLB"
    : "Kênh chat nội bộ thành viên";
  const canUseChat = Boolean(viewerAccess?.isPersisted && viewerAccess.isAuthenticated && viewerAccess.userId);
  const roomScope = `${clubId}:${roomType}`;
  const isLoading = canUseChat && messagesScope !== roomScope;
  const visibleMessages = messagesScope === roomScope ? messages : [];
  const error = errorState?.scope === roomScope
    ? errorState.message
    : !canUseChat
      ? viewerAccess?.isAuthenticated
        ? "Chat realtime chỉ khả dụng với CLB đã được lưu trong database."
        : "Đăng nhập để tham gia cuộc trò chuyện."
      : "";
  const isConnected = connectedScope === roomScope;

  useEffect(() => {
    let isActive = true;
    let client: SupabaseClient | null = null;
    let channel: ReturnType<NonNullable<SupabaseClient>["channel"]> | null = null;

    if (!canUseChat) {
      return () => { isActive = false; };
    }

    async function connect() {
      const tokenResponse = await fetch(`/api/clubs/${clubId}/chat-token?roomType=${roomType}`, { cache: "no-store" });
      const tokenResult = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(tokenResult.error ?? "Không được phép vào phòng chat này.");
      setOwnerId(typeof tokenResult.ownerId === "string" ? tokenResult.ownerId : null);
      setOwnerName(typeof tokenResult.ownerName === "string" ? tokenResult.ownerName : "Chủ CLB");

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anonKey) throw new Error("Thiếu cấu hình URL hoặc publishable key của Supabase.");

      const accessToken = tokenResult.accessToken as string;
      client = createClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });
      await client.realtime.setAuth(accessToken);

      const activeClient = client;
      channel = activeClient
        .channel(`club-${clubId}-${roomType}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `club_id=eq.${clubId}` },
          (payload) => {
            const message = payload.new as ChatMessage;
            if (!isActive || message.club_id !== clubId || message.room_type !== roomType) return;
            setMessages((current) => {
              const scoped = current.filter((item) => item.club_id === clubId && item.room_type === roomType);
              return scoped.some((item) => item.id === message.id) ? scoped : [...scoped, message];
            });
            if (isOwner && message.sender_id !== viewerAccess?.userId) {
              setSelectedContactId((current) => current || message.sender_id);
            }
          },
        )
        .subscribe((status) => {
          if (!isActive) return;
          setConnectedScope(status === "SUBSCRIBED" ? roomScope : "");
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setErrorState({ scope: roomScope, message: "Không thể kết nối Realtime. Kiểm tra RLS và Realtime publication của bảng messages." });
          }
        });

      const { data, error: queryError } = await activeClient
        .from("messages")
        .select("id, sender_id, recipient_id, sender_name, content, room_type, club_id, created_at")
        .eq("club_id", clubId)
        .eq("room_type", roomType)
        .order("created_at", { ascending: true });

      if (!isActive) return;
      if (queryError) throw new Error(`Không tải được tin nhắn: ${queryError.message}`);
      setMessages((current) => {
        const scoped = current.filter((message) => message.club_id === clubId && message.room_type === roomType);
        const byId = new Map(scoped.map((message) => [message.id, message]));
        for (const message of (data ?? []) as ChatMessage[]) byId.set(message.id, message);
        return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
      setMessagesScope(roomScope);
    }

    void connect().catch((cause: unknown) => {
      if (!isActive) return;
      setErrorState({ scope: roomScope, message: cause instanceof Error ? cause.message : "Không thể kết nối phòng chat." });
    });

    return () => {
      isActive = false;
      if (client && channel) void client.removeChannel(channel);
    };
  }, [canUseChat, clubId, isOwner, roomScope, roomType, viewerAccess?.isAuthenticated, viewerAccess?.userId]);

  const contacts = [...new Map(visibleMessages
    .filter((message) => message.sender_id !== viewerAccess?.userId)
    .map((message) => [message.sender_id, { id: message.sender_id, name: message.sender_name }])).values()];
  const activeContactId = isOwner
    ? contacts.some((contact) => contact.id === selectedContactId) ? selectedContactId : contacts[0]?.id || ""
    : ownerId ?? "";
  const displayedMessages = isOwner && roomType === "admin_1on1" && activeContactId
    ? visibleMessages.filter((message) => message.sender_id === activeContactId || message.recipient_id === activeContactId)
    : visibleMessages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!content || !senderName.trim() || !supabaseUrl || !anonKey || !viewerAccess?.userId || isSending) return;

    setIsSending(true);
    setErrorState(null);
    try {
      const tokenResponse = await fetch(`/api/clubs/${clubId}/chat-token?roomType=${roomType}`, { cache: "no-store" });
      const tokenResult = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(tokenResult.error ?? "Bạn không có quyền gửi tin trong phòng này.");

      const supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${tokenResult.accessToken as string}` } },
      });
      const { error: insertError } = await supabase.from("messages").insert({
        club_id: clubId,
        sender_id: viewerAccess.userId,
        sender_name: senderName.trim(),
        content,
        room_type: roomType,
        recipient_id: roomType === "admin_1on1" ? activeContactId : null,
      });
      if (insertError) throw new Error(insertError.message);
      setDraft("");
    } catch (cause) {
      setErrorState({ scope: roomScope, message: cause instanceof Error ? cause.message : "Không gửi được tin nhắn." });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white" aria-label={title}>
      <div className="border-b border-slate-200 p-4 md:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="block text-sm font-semibold text-slate-700">
            Tên người dùng
            <input value={senderName} readOnly
              className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-normal text-slate-600 sm:max-w-sm"
              placeholder="Khách chơi" />
          </label>
          {isOwner && <div className="flex rounded-lg border border-slate-200 p-1" role="group" aria-label="Chọn phòng chat">
            <button type="button" onClick={() => setOwnerRoom("admin_1on1")} aria-pressed={ownerRoom === "admin_1on1"}
              className={`min-h-9 rounded-md px-3 text-xs font-semibold ${ownerRoom === "admin_1on1" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Hỏi đáp</button>
            <button type="button" onClick={() => setOwnerRoom("club_group")} aria-pressed={ownerRoom === "club_group"}
              className={`min-h-9 rounded-md px-3 text-xs font-semibold ${ownerRoom === "club_group" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Nội bộ</button>
          </div>}
          {!isOwner && <p className="flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600">
            {isApproved ? <LockKeyhole className="size-4 text-emerald-600" /> : <MessageCircle className="size-4 text-orange-500" />}
            {isApproved ? "Thành viên đã được chủ CLB duyệt" : viewerAccess?.membershipStatus === "PENDING" ? "Yêu cầu đang chờ chủ CLB duyệt" : "Bạn đang ở phòng hỏi đáp"}
          </p>}
          {isOwner && ownerRoom === "admin_1on1" && <label className="block text-sm font-semibold text-slate-700">
            Hội thoại
            <select value={activeContactId} onChange={(event) => setSelectedContactId(event.target.value)} disabled={!contacts.length}
              className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal sm:max-w-sm">
              {contacts.length ? contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>) : <option value="">Chưa có người hỏi đáp</option>}
            </select>
          </label>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><MessageCircle className="size-4" /></span>
          <div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{title}</h2><p className="text-xs text-slate-500">{roomType === "club_group" ? "Chỉ dành cho chủ CLB và thành viên đã được duyệt" : isOwner ? `Đang trao đổi với ${contacts.find((contact) => contact.id === activeContactId)?.name ?? ownerName}` : `Trao đổi riêng với ${ownerName}`}</p></div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${isConnected ? "text-emerald-700" : "text-slate-500"}`}>
          {isConnected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {isConnected ? "Đang kết nối" : "Đang kết nối..."}
        </span>
      </div>

      <div className="flex h-[min(60vh,520px)] min-h-72 flex-col bg-slate-50">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5" aria-live="polite" aria-relevant="additions">
          {isLoading && <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" /> Đang tải tin nhắn...</div>}
          {!isLoading && displayedMessages.length === 0 && !error && <div className="flex h-full flex-col items-center justify-center text-center text-slate-500"><MessageCircle className="size-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">Chưa có tin nhắn</p><p className="mt-1 text-xs">Gửi lời chào để bắt đầu cuộc trò chuyện.</p></div>}
          {displayedMessages.map((message) => {
            const isOwnMessage = message.sender_id === viewerAccess?.userId;
            return <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[72%] ${isOwnMessage ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
                <p className={`mb-1 text-xs font-semibold ${isOwnMessage ? "text-blue-100" : "text-slate-500"}`}>{message.sender_name}</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.content}</p>
              </div>
            </div>;
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 md:p-4">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} aria-label="Tin nhắn" placeholder="Nhập tin nhắn..."
            disabled={!canUseChat || Boolean(error && !isConnected)}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50" />
          <button type="submit" disabled={!canUseChat || !draft.trim() || !senderName.trim() || isSending || Boolean(error && !isConnected)} aria-label="Gửi tin nhắn"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
            {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>
    </section>
  );
}
