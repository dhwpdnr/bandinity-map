import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { PANEL_SURFACE, RADIUS_CONTROL } from "@/lib/ui";
import { requireUserSession } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

type ServiceCardStatus = "active" | "coming-soon";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  href?: string;
  status: ServiceCardStatus;
  icon: ReactNode;
}

const ICON_CLASS = "h-[18px] w-[18px]";

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={ICON_CLASS}
      aria-hidden="true"
    >
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={ICON_CLASS}
      aria-hidden="true"
    >
      <path d="M4 6h10" />
      <path d="M18 6h2" />
      <path d="M4 18h6" />
      <path d="M14 18h6" />
      <path d="M4 12h2" />
      <path d="M10 12h10" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <circle cx="8" cy="12" r="2" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

const SERVICE_ITEMS: ServiceItem[] = [
  {
    id: "my-shows",
    title: "내 공연 목록",
    description: "내 제출 내역과 승인 상태를 한 곳에서 확인",
    status: "coming-soon",
    icon: <ListIcon />,
  },
  {
    id: "show-info",
    title: "공연 정보 관리",
    description: "공연 상세·일정·링크 업데이트",
    status: "coming-soon",
    icon: <SlidersIcon />,
  },
];

function getDisplayName(nickname: string): string {
  const trimmed = nickname.trim();
  return trimmed.length > 0 ? trimmed : "뮤지션";
}

export default async function MyPage() {
  const session = await requireUserSession();
  const displayName = getDisplayName(session.nickname);
  const initial = displayName.slice(0, 1);

  return (
    <main className="min-h-dvh bg-[var(--surface-app)] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-300">
            My Page
          </p>
          <h1 className="mt-1.5 text-[22px] font-semibold leading-tight text-zinc-100">
            {displayName}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">카카오로 연동됨</p>
        </header>

        <section aria-label="내 프로필" className={`${PANEL_SURFACE} px-4 py-3.5`}>
          <div className="flex items-center gap-3">
            <div
              className={`relative h-11 w-11 shrink-0 overflow-hidden ${RADIUS_CONTROL} border border-white/10 bg-[rgba(10,14,20,0.94)]`}
            >
              {session.profileImage ? (
                <Image
                  src={session.profileImage}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-300">
                  {initial}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-100">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                Kakao · {session.kakaoId}
              </p>
            </div>
          </div>
        </section>

        <section aria-label="서비스" className="space-y-2">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              서비스
            </h2>
            <span className="text-[11px] text-zinc-600">곧 더 추가돼요</span>
          </div>

          <ul className={`${PANEL_SURFACE} divide-y divide-white/6 overflow-hidden`}>
            {SERVICE_ITEMS.map((item) => (
              <li key={item.id}>
                <ServiceRow item={item} />
              </li>
            ))}
          </ul>
        </section>

        <footer className="flex items-center justify-center gap-3 pt-2 text-xs text-zinc-500">
          <Link href="/" className="transition-colors hover:text-zinc-200">
            홈으로
          </Link>
          <span className="text-zinc-700" aria-hidden="true">·</span>
          <Link
            href="/api/auth/logout"
            className="transition-colors hover:text-zinc-200"
          >
            로그아웃
          </Link>
        </footer>
      </div>
    </main>
  );
}

function ServiceRow({ item }: { item: ServiceItem }) {
  const isActive = item.status === "active" && Boolean(item.href);

  const inner = (
    <>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center ${RADIUS_CONTROL} border ${
          isActive
            ? "border-primary-400/40 bg-primary-400/12 text-primary-300"
            : "border-white/8 bg-white/4 text-zinc-500"
        }`}
        aria-hidden="true"
      >
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            isActive ? "text-zinc-100" : "text-zinc-300"
          }`}
        >
          {item.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-zinc-500">
          {item.description}
        </p>
      </div>
      {isActive ? (
        <span className="text-zinc-500 transition-colors group-hover:text-primary-300">
          <ChevronRightIcon />
        </span>
      ) : (
        <span className="shrink-0 rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          준비중
        </span>
      )}
    </>
  );

  const baseClass =
    "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150";

  if (isActive && item.href) {
    return (
      <Link
        href={item.href}
        className={`${baseClass} hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={`${baseClass} cursor-default opacity-90`} aria-disabled="true">
      {inner}
    </div>
  );
}
