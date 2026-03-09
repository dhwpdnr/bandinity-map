export type PlaceType = "venue" | "studio";

export type AvailabilityStatus = "open" | "booked" | "inquiry" | "unknown";

export type AvailabilityMode = "manual" | "hybrid" | "external";

export type AvailabilitySourceType = "manual" | "calendar" | "booking";

export type VerificationStatus = "unverified" | "community" | "verified";

export interface ExternalLink {
  label: string;
  url: string;
}

export interface Place {
  id: string;
  name: string;
  placeType: PlaceType;
  region: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  phone?: string;
  priceInfo?: string;
  equipment?: string;
  imageUrl?: string;
  photos?: string[];
  bookingLink?: string;
  tags: string[];
  openDates: string[];
  bookedDates: string[];
  inquiryDates: string[];
  availabilityMode: AvailabilityMode;
  availabilitySourceType: AvailabilitySourceType;
  availabilitySourceUrl?: string;
  availabilityLastSyncedAt?: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  lastUpdatedAt?: string;
  createdAt?: string;
  sourceLinks: ExternalLink[];
  isLegacy?: boolean;
}

export type PlaceInput = Omit<Place, "id" | "isLegacy">;
