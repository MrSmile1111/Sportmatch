import Link from "next/link";
import { MessageSquareQuote, Star } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { UserReview } from "@/lib/data/ratings";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserReviewsCard({ reviews }: { reviews: UserReview[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
        <MessageSquareQuote className="text-brand size-5" />
        Đánh giá từ đồng đội
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Chưa có nhận xét nào từ đồng đội.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    emoji={review.reviewerAvatar}
                    src={review.reviewerAvatarUrl}
                    name={review.reviewerName}
                    className="bg-brand size-8 text-xs"
                  />
                  <div>
                    <Link
                      href={`/profile/${review.reviewerId}`}
                      className="text-xs font-semibold hover:underline"
                    >
                      {review.reviewerName}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      Trận &ldquo;{review.matchTitle}&rdquo;
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5" aria-label={`${review.stars} sao`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "size-3",
                          star <= review.stars
                            ? "fill-brand text-brand"
                            : "text-muted-foreground/40",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(review.createdAt)}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm italic text-foreground/90">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
