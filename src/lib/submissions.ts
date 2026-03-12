import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeSubmissionDraft, omitUndefinedFields } from "@/lib/place-utils";
import type {
  PlaceSubmission,
  PlaceSubmissionType,
  SubmissionDraft,
} from "@/types/submission";

const SUBMISSIONS_COLLECTION = "placeSubmissions";

const DEFAULT_SUBMITTER_NAME = "웹 등록";

export interface CreateSubmissionInput {
  submissionType: PlaceSubmissionType;
  targetPlaceId?: string;
  draft: SubmissionDraft;
  submitterName?: string;
  submitterContact?: string;
  message?: string;
}

export async function createPlaceSubmission(
  input: CreateSubmissionInput
): Promise<string> {
  if (!db) {
    throw new Error("Firebase가 설정되지 않았습니다.");
  }

  const submitterName = (input.submitterName?.trim() || DEFAULT_SUBMITTER_NAME).trim();

  const draft = normalizeSubmissionDraft(input.draft);
  const draftForFirestore = omitUndefinedFields(
    draft as Record<string, unknown>
  ) as SubmissionDraft;

  const payload = omitUndefinedFields({
    submissionType: input.submissionType,
    status: "pending",
    targetPlaceId: input.targetPlaceId?.trim() || undefined,
    draft: draftForFirestore,
    submitterName,
    submitterContact: input.submitterContact?.trim() || undefined,
    message: input.message?.trim() || undefined,
    createdAt: new Date().toISOString(),
  } as Record<string, unknown>) as Omit<PlaceSubmission, "id">;

  const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), payload);
  return docRef.id;
}
