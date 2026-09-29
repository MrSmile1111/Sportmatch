import { ClubDetailRoute } from "@/components/clubs/club-detail-route";

export default async function ClubPreviewDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  return <ClubDetailRoute clubId={clubId} preview />;
}
