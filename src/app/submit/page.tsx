import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface SubmitPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const params = await searchParams;
  const submissionType = readParam(params, "submissionType");
  const targetPlaceId = readParam(params, "targetPlaceId");

  if (submissionType === "edit" && targetPlaceId) {
    redirect(`/venues/${targetPlaceId}/edit`);
  }

  redirect("/venues/new");
}
