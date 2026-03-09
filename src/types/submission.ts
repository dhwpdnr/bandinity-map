import type { Place, PlaceType } from "@/types/place";

export type PlaceSubmissionType = "create" | "edit" | "availability_update";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface SubmissionDraft {
  name?: string;
  placeType?: PlaceType;
  region?: string;
  address?: string;
  lat?: number;
  lng?: number;
  description?: string;
  phone?: string;
  priceInfo?: string;
  equipment?: string;
  imageUrl?: string;
  bookingLink?: string;
  tags?: string[];
  openDates?: string[];
  bookedDates?: string[];
  inquiryDates?: string[];
  availabilitySourceType?: Place["availabilitySourceType"];
  availabilitySourceUrl?: string;
  sourceLinks?: Place["sourceLinks"];
  verificationStatus?: Place["verificationStatus"];
}

export interface PlaceSubmission {
  id: string;
  submissionType: PlaceSubmissionType;
  status: SubmissionStatus;
  targetPlaceId?: string;
  draft: SubmissionDraft;
  submitterName: string;
  submitterContact?: string;
  message?: string;
  rejectionReason?: string;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}
