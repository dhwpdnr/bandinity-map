import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeSubmissionDraft } from "@/lib/place-utils";
import type {
  PlaceSubmission,
  PlaceSubmissionType,
  SubmissionDraft,
} from "@/types/submission";

const SUBMISSIONS_COLLECTION = "placeSubmissions";

export interface CreateSubmissionInput {
  submissionType: PlaceSubmissionType;
  targetPlaceId?: string;
  draft: SubmissionDraft;
  submitterName: string;
  submitterContact?: string;
  message?: string;
}

export async function createPlaceSubmission(
  input: CreateSubmissionInput
): Promise<string> {
  if (!db) {
    throw new Error("Firebase가 설정되지 않았습니다.");
  }

  const submitterName = input.submitterName.trim();
  if (!submitterName) {
    throw new Error("제보자 이름은 필수입니다.");
  }

  const draft = normalizeSubmissionDraft(input.draft);

  const payload: Omit<PlaceSubmission, "id"> = {
    submissionType: input.submissionType,
    status: "pending",
    targetPlaceId: input.targetPlaceId?.trim() || undefined,
    draft,
    submitterName,
    submitterContact: input.submitterContact?.trim() || undefined,
    message: input.message?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), payload);
  return docRef.id;
}
