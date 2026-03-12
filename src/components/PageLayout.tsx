import type { ReactNode } from "react";
import {
  CARD_PADDING,
  CARD_RADIUS,
  PAGE_MAX_WIDTH,
  PAGE_PADDING,
} from "@/lib/layout";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/** 페이지 콘텐츠 래퍼: mx-auto + max-width + padding 통일 */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`mx-auto ${PAGE_MAX_WIDTH} ${PAGE_PADDING} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/** 메인 카드/섹션용 클래스 (border 등은 페이지에서 추가) */
export const mainCardClass = `${CARD_RADIUS} border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900`;
export const mainCardPaddingClass = CARD_PADDING;
