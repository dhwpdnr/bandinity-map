/** 공연장 리뷰 (텍스트) */
export interface VenueReview {
  id: string;
  /** 공연장 ID */
  venueId: string;
  /** 리뷰 내용 */
  text: string;
  createdAt?: { seconds: number };
}
