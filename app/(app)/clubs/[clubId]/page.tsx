import { ClubDetailRoute } from "@/components/clubs/club-detail-route";

export default async function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  return <ClubDetailRoute clubId={clubId} />;
}
