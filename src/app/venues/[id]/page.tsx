import { redirect } from "next/navigation";

interface LegacyVenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyVenueDetailPage({
  params,
}: LegacyVenueDetailPageProps) {
  const { id } = await params;
  redirect(`/places/${id}`);
}
