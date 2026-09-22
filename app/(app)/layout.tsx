import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { countUnreadMessages } from "@/lib/data/chat";
import { countUnreadNotifications } from "@/lib/data/notifications";
import { getCurrentUser } from "@/lib/data/users";

// Mọi trang trong nhóm này đều phụ thuộc phiên đăng nhập và dữ liệu người dùng,
// nên không prerender — tránh cả việc build phải kết nối database.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const [unreadNotifications, unreadMessages] = await Promise.all([
    countUnreadNotifications(user.id),
    countUnreadMessages(user.id),
  ]);
  const displayName = user.name.split(" ").at(-1) ?? user.name;

  return (
    <>
      <AppHeader
        userId={user.id}
        displayName={displayName}
        avatar={user.avatar}
        isPro={user.isPro}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
      />
      <div className="flex-1">{children}</div>
    </>
  );
}
