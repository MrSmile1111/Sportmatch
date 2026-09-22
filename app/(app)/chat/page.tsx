import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getConversations } from "@/lib/data/chat";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Tin nhắn · SportMatch",
};

export default async function ChatPage() {
  const currentUser = await getCurrentUser();
  const conversations = await getConversations(currentUser.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Tin nhắn</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Realtime · cập nhật tự động
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center">
        {conversations.length === 0 ? (
          <>
            <MessageCircle className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-6 text-sm text-muted-foreground">
              Chưa có hội thoại. Vào trận đấu để chat với chủ trận hoặc team!
            </p>
            <Link
              href="/matches"
              className="bg-brand-gradient shadow-brand/30 mt-6 inline-flex rounded-full px-7 py-3 text-sm font-semibold text-white shadow-xl transition-opacity hover:opacity-90"
            >
              Xem trận đấu
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {conversations.length} hội thoại
          </p>
        )}
      </div>
    </div>
  );
}
