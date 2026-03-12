"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, clearAdminSession, requireAdminSession } from "@/lib/admin-auth";
import {
  decideSubmission,
  deleteAdminPlace,
  deleteAdminReview,
  getAdminPlace,
  saveAdminPlace,
  syncAvailabilityForAdminPlace,
} from "@/lib/admin-place-service";
import { parseDateListInput } from "@/lib/dates";
import { computeChangedDraftFields } from "@/lib/place-utils";
import { applyDraftToPlace, findDuplicateVenue, getPlaceById } from "@/lib/places";
import { createVenueReview } from "@/lib/reviews";
import { createPlaceSubmission } from "@/lib/submissions";
import type { Place, VerificationStatus } from "@/types/place";
import type { PlaceSubmissionType, SubmissionDraft } from "@/types/submission";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** redirect URL 쿼리에 넣을 때 길이 제한·인코딩 (보안·호환성) */
function encodeErrorForUrl(message: string, maxLength = 200): string {
  return encodeURIComponent(
    message.length > maxLength ? `${message.slice(0, maxLength)}…` : message
  );
}

/** 관리자 내부 리다이렉트만 허용 (open redirect 방지) */
function isSafeAdminRedirectPath(path: string): boolean {
  if (!path || path.length > 500) return false;
  if (!path.startsWith("/admin")) return false;
  if (path.includes("//")) return false;
  return true;
}

function hasField(formData: FormData, key: string): boolean {
  return formData.has(key);
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseLinksInput(value: string) {
  return value
    .split(/\n+/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.includes("|")
        ? line.split("|", 2).map((item) => item.trim())
        : ["참고 링크", line];
      return {
        label: label || "참고 링크",
        url,
      };
    })
    .filter((item) => item.url);
}

function parseDraft(formData: FormData): SubmissionDraft {
  const tagsInput = hasField(formData, "tags") ? readString(formData, "tags") : "";
  const sourceLinksInput = hasField(formData, "sourceLinks")
    ? readString(formData, "sourceLinks")
    : "";
  const openDatesInput = hasField(formData, "openDates")
    ? readString(formData, "openDates")
    : "";
  const bookedDatesInput = hasField(formData, "bookedDates")
    ? readString(formData, "bookedDates")
    : "";
  const inquiryDatesInput = hasField(formData, "inquiryDates")
    ? readString(formData, "inquiryDates")
    : "";
  const availabilitySourceTypeInput = hasField(formData, "availabilitySourceType")
    ? readString(formData, "availabilitySourceType")
    : "";

  return {
    name: hasField(formData, "name") ? readString(formData, "name") || undefined : undefined,
    placeType: hasField(formData, "placeType")
      ? readString(formData, "placeType") === "studio"
        ? "studio"
        : "venue"
      : undefined,
    region: hasField(formData, "region")
      ? readString(formData, "region") || undefined
      : undefined,
    address: hasField(formData, "address")
      ? readString(formData, "address") || undefined
      : undefined,
    lat: hasField(formData, "lat")
      ? parseOptionalNumber(readString(formData, "lat"))
      : undefined,
    lng: hasField(formData, "lng")
      ? parseOptionalNumber(readString(formData, "lng"))
      : undefined,
    description: hasField(formData, "description")
      ? readString(formData, "description") || undefined
      : undefined,
    phone: hasField(formData, "phone")
      ? readString(formData, "phone") || undefined
      : undefined,
    priceInfo: hasField(formData, "priceInfo")
      ? readString(formData, "priceInfo") || undefined
      : undefined,
    equipment: hasField(formData, "equipment")
      ? readString(formData, "equipment") || undefined
      : undefined,
    bookingLink: hasField(formData, "bookingLink")
      ? readString(formData, "bookingLink") || undefined
      : undefined,
    imageUrl: hasField(formData, "imageUrl")
      ? readString(formData, "imageUrl") || undefined
      : undefined,
    tags: hasField(formData, "tags")
      ? tagsInput
        ? tagsInput.split(/[\n,]+/g)
        : []
      : undefined,
    sourceLinks: hasField(formData, "sourceLinks")
      ? parseLinksInput(sourceLinksInput)
      : undefined,
    openDates: hasField(formData, "openDates")
      ? parseDateListInput(openDatesInput)
      : undefined,
    bookedDates: hasField(formData, "bookedDates")
      ? parseDateListInput(bookedDatesInput)
      : undefined,
    inquiryDates: hasField(formData, "inquiryDates")
      ? parseDateListInput(inquiryDatesInput)
      : undefined,
    availabilitySourceType: hasField(formData, "availabilitySourceType")
      ? availabilitySourceTypeInput === "calendar"
        ? "calendar"
        : availabilitySourceTypeInput === "booking"
          ? "booking"
          : "manual"
      : undefined,
    availabilitySourceUrl: hasField(formData, "availabilitySourceUrl")
      ? readString(formData, "availabilitySourceUrl") || undefined
      : undefined,
  };
}

function hasRequiredVenueFields(draft: SubmissionDraft) {
  return Boolean(draft.name && draft.address && draft.region);
}

function hasResolvedAddress(formData: FormData) {
  return readString(formData, "addressResolved") === "1";
}

export async function createVenueAction(formData: FormData) {
  const draft = parseDraft(formData);

  if (!hasRequiredVenueFields(draft)) {
    redirect("/venues/new?mode=new&error=missing-required");
  }

  if (readString(formData, "address") && !hasResolvedAddress(formData)) {
    redirect("/venues/new?mode=new&error=address-search-required");
  }

  const duplicate = await findDuplicateVenue(draft);
  if (duplicate) {
    redirect("/venues/new?mode=new&error=duplicate-venue");
  }

  try {
    await createPlaceSubmission({
      submissionType: "create",
      draft,
      submitterName: "웹 등록",
    });
  } catch (error) {
    const message =
      error instanceof Error ? encodeErrorForUrl(error.message) : "unknown";
    redirect(`/venues/new?mode=new&error=${message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/submissions");
  redirect("/?success=submitted");
}

export async function updateVenueAction(formData: FormData) {
  const venueId = readString(formData, "venueId");
  if (!venueId) {
    redirect("/?error=missing-venue");
  }

  const existing = await getPlaceById(venueId);
  if (!existing) {
    redirect("/?error=missing-venue");
  }

  const draft = parseDraft(formData);

  if (!hasRequiredVenueFields(draft)) {
    redirect(`/venues/${venueId}/edit?error=missing-required`);
  }

  if (readString(formData, "address") && !hasResolvedAddress(formData)) {
    redirect(`/venues/${venueId}/edit?error=address-search-required`);
  }

  const changedOnly = computeChangedDraftFields(existing, draft);
  if (Object.keys(changedOnly).length === 0) {
    redirect(`/venues/${venueId}/edit?error=no-changes`);
  }

  try {
    await createPlaceSubmission({
      submissionType: "edit",
      targetPlaceId: venueId,
      draft: changedOnly,
      submitterName: "웹 등록",
    });
  } catch (error) {
    const message =
      error instanceof Error ? encodeErrorForUrl(error.message) : "unknown";
    redirect(`/venues/${venueId}/edit?error=${message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/submissions");
  revalidatePath(`/places/${venueId}`);
  redirect(`/places/${venueId}?success=update-requested`);
}

export async function createVenueReviewAction(formData: FormData) {
  const venueId = readString(formData, "venueId");
  const text = readString(formData, "text");

  if (!venueId) {
    redirect("/?error=missing-venue");
  }

  try {
    await createVenueReview(venueId, text);
  } catch (error) {
    const message =
      error instanceof Error ? encodeErrorForUrl(error.message) : "unknown";
    redirect(`/places/${venueId}?reviewError=${message}`);
  }

  revalidatePath(`/places/${venueId}`);
  redirect(`/places/${venueId}?review=1`);
}

export async function submitPlaceSubmissionAction(formData: FormData) {
  const submissionType = readString(formData, "submissionType") as PlaceSubmissionType;
  const targetPlaceId = readString(formData, "targetPlaceId") || undefined;
  const draft = parseDraft(formData);

  if (!["create", "edit", "availability_update"].includes(submissionType)) {
    redirect("/submit?error=invalid-type");
  }

  if (submissionType !== "create" && !targetPlaceId) {
    redirect("/submit?error=missing-target");
  }

  if (
    submissionType === "create" &&
    (!draft.name || !draft.address || !draft.region)
  ) {
    redirect("/submit?error=missing-required");
  }

  try {
    await createPlaceSubmission({
      submissionType,
      targetPlaceId,
      draft,
      submitterName: readString(formData, "submitterName"),
      submitterContact: readString(formData, "submitterContact") || undefined,
      message: readString(formData, "message") || undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? encodeErrorForUrl(error.message) : "unknown";
    redirect(`/submit?error=${message}`);
  }

  revalidatePath("/admin/submissions");
  redirect("/submit?success=1");
}

export async function loginAdminAction(formData: FormData) {
  const success = await createAdminSession(readString(formData, "password"));
  if (!success) {
    redirect("/admin/login?error=1");
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function decideSubmissionAction(formData: FormData) {
  await requireAdminSession();

  const submissionId = readString(formData, "submissionId");
  const intent = readString(formData, "intent");

  if (!submissionId || (intent !== "approve" && intent !== "reject")) {
    redirect("/admin/submissions?error=invalid-action");
  }

  await decideSubmission(
    submissionId,
    intent === "approve" ? "approved" : "rejected",
    readString(formData, "rejectionReason") || undefined
  );

  revalidatePath("/");
  revalidatePath("/admin/submissions");
  redirect("/admin/submissions?success=1");
}

function parseAdminPlace(formData: FormData, existing: Place): Place {
  const verificationStatus = readString(
    formData,
    "verificationStatus"
  ) as VerificationStatus;

  return {
    ...existing,
    name: readString(formData, "name") || existing.name,
    placeType:
      readString(formData, "placeType") === "studio" ? "studio" : "venue",
    region: readString(formData, "region") || existing.region,
    address: readString(formData, "address") || existing.address,
    lat: parseOptionalNumber(readString(formData, "lat")) ?? existing.lat,
    lng: parseOptionalNumber(readString(formData, "lng")) ?? existing.lng,
    description: readString(formData, "description") || undefined,
    phone: readString(formData, "phone") || undefined,
    priceInfo: readString(formData, "priceInfo") || undefined,
    equipment: readString(formData, "equipment") || undefined,
    bookingLink: readString(formData, "bookingLink") || undefined,
    imageUrl: readString(formData, "imageUrl") || undefined,
    tags: readString(formData, "tags")
      ? readString(formData, "tags").split(/[\n,]+/g)
      : [],
    sourceLinks: parseLinksInput(readString(formData, "sourceLinks")),
    openDates: parseDateListInput(readString(formData, "openDates")),
    bookedDates: parseDateListInput(readString(formData, "bookedDates")),
    inquiryDates: parseDateListInput(readString(formData, "inquiryDates")),
    availabilitySourceType:
      readString(formData, "availabilitySourceType") === "calendar"
        ? "calendar"
        : readString(formData, "availabilitySourceType") === "booking"
          ? "booking"
          : "manual",
    availabilitySourceUrl: readString(formData, "availabilitySourceUrl") || undefined,
    verificationStatus:
      verificationStatus === "verified" ||
      verificationStatus === "community" ||
      verificationStatus === "unverified"
        ? verificationStatus
        : existing.verificationStatus,
    lastVerifiedAt:
      verificationStatus === "verified"
        ? new Date().toISOString()
        : existing.lastVerifiedAt,
    lastUpdatedAt: new Date().toISOString(),
    isLegacy: false,
  };
}

export async function saveAdminPlaceAction(formData: FormData) {
  await requireAdminSession();

  const placeId = readString(formData, "placeId");
  const existing = await getAdminPlace(placeId);

  if (!existing) {
    redirect("/admin/submissions?error=missing-place");
  }

  const nextPlace = parseAdminPlace(formData, existing);
  await saveAdminPlace(nextPlace);

  revalidatePath("/");
  revalidatePath(`/places/${placeId}`);
  revalidatePath(`/admin/places/${placeId}`);
  redirect(`/admin/places/${placeId}?success=1`);
}

/** 관리자용: VenueForm과 동일한 폼으로 제출 시 바로 저장 (제보 대기 없음) */
export async function adminUpdateVenueAction(formData: FormData) {
  await requireAdminSession();

  const venueId = readString(formData, "venueId");
  if (!venueId) {
    redirect("/admin/places?error=missing-venue");
  }

  const existing = await getPlaceById(venueId);
  if (!existing) {
    redirect("/admin/places?error=missing-venue");
  }

  const draft = parseDraft(formData);
  if (!hasRequiredVenueFields(draft)) {
    redirect(`/admin/places/${venueId}?error=missing-required`);
  }

  if (readString(formData, "address") && !hasResolvedAddress(formData)) {
    redirect(`/admin/places/${venueId}?error=address-search-required`);
  }

  const nextPlaceInput = applyDraftToPlace(existing, draft);
  const placeToSave: Place = {
    ...nextPlaceInput,
    id: existing.id,
    lastUpdatedAt: new Date().toISOString(),
    isLegacy: false,
  };

  await saveAdminPlace(placeToSave);

  revalidatePath("/");
  revalidatePath(`/places/${venueId}`);
  revalidatePath(`/admin/places/${venueId}`);
  redirect(`/admin/places/${venueId}?success=1`);
}

export async function syncAdminPlaceAction(formData: FormData) {
  await requireAdminSession();

  const placeId = readString(formData, "placeId");
  if (!placeId) {
    redirect("/admin/submissions?error=missing-place");
  }

  try {
    await syncAvailabilityForAdminPlace(placeId);
  } catch (error) {
    const message =
      error instanceof Error ? encodeErrorForUrl(error.message) : "sync-failed";
    redirect(`/admin/places/${placeId}?error=${message}`);
  }

  revalidatePath("/");
  revalidatePath(`/places/${placeId}`);
  revalidatePath(`/admin/places/${placeId}`);
  redirect(`/admin/places/${placeId}?success=sync`);
}

export async function deleteAdminPlaceAction(formData: FormData) {
  await requireAdminSession();

  const placeId = readString(formData, "placeId");
  if (!placeId) {
    redirect("/admin/places?error=missing-place");
  }

  try {
    await deleteAdminPlace(placeId);
  } catch (error) {
    const message =
      error instanceof Error ? encodeErrorForUrl(error.message) : "delete-failed";
    redirect(`/admin/places?error=${message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/places");
  redirect("/admin/places?success=deleted");
}

export async function deleteAdminReviewAction(formData: FormData) {
  await requireAdminSession();

  const venueId = readString(formData, "venueId");
  const reviewId = readString(formData, "reviewId");
  const rawReturnTo = readString(formData, "returnTo");
  const returnTo = isSafeAdminRedirectPath(rawReturnTo) ? rawReturnTo : null;
  if (!venueId || !reviewId) {
    redirect("/admin/reviews?error=missing-params");
  }

  try {
    await deleteAdminReview(venueId, reviewId);
  } catch (error) {
    const message =
      error instanceof Error ? encodeErrorForUrl(error.message) : "delete-failed";
    const base = returnTo ?? "/admin/reviews";
    redirect(`${base}?error=${message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  revalidatePath(`/admin/places/${venueId}`);
  revalidatePath(`/places/${venueId}`);
  redirect(returnTo ? `${returnTo}?success=review-deleted` : "/admin/reviews?success=deleted");
}
