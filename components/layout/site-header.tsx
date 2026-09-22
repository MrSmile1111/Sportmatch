import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <SiteLogo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="bg-brand-gradient inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-opacity hover:opacity-90"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </header>
  );
}
