import Link from "next/link";
import { Logo } from "@/components/Logo";
import { VenueForm } from "@/components/VenueForm";

export const metadata = {
  title: "공연장 추가 | Bandinity",
};

export default function NewVenuePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex shrink-0 items-center justify-center rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="뒤로가기"
          >
            ←
          </Link>
          <Logo />
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <h1 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            공연장 추가
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-12">
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
          누구나 공연장 정보를 등록할 수 있습니다. 잘못된 정보는 언제든 수정할 수 있어요.
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <VenueForm />
        </div>
      </main>
    </div>
  );
}
