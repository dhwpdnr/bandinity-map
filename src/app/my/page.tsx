import Link from "next/link";
import { BUTTON_SECONDARY, RADIUS_PANEL } from "@/lib/ui";
import { requireUserSession } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await requireUserSession();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--surface-app)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <section
        className={`w-full max-w-lg border border-white/10 bg-[rgba(11,14,20,0.92)] p-6 shadow-[0_14px_36px_-28px_rgba(0,0,0,0.74)] ${RADIUS_PANEL}`}
      >
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-300">
            My Page
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">마이페이지</h1>
          <p className="mt-2 text-sm text-zinc-400">
            카카오 로그인 세션이 유지되고 있습니다.
          </p>
        </header>

        <div className="space-y-3 rounded-[14px] border border-white/10 bg-[rgba(10,14,20,0.94)] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Kakao ID</p>
            <p className="mt-1 break-all text-sm text-zinc-100">{session.kakaoId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Nickname</p>
            <p className="mt-1 text-sm text-zinc-100">{session.nickname}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Profile Image</p>
            <p className="mt-1 break-all text-sm text-zinc-100">
              {session.profileImage || "없음"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className={BUTTON_SECONDARY}>
            홈으로 이동
          </Link>
          <Link href="/api/auth/logout" className={BUTTON_SECONDARY}>
            로그아웃
          </Link>
        </div>
      </section>
    </main>
  );
}
