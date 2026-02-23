import { notFound } from "next/navigation";
import Link from "next/link";
import { getVenueById } from "@/lib/venues";
import { Logo } from "@/components/Logo";
import { VenueForm } from "@/components/VenueForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "공연장 정보 수정 | Bandinity",
};

export default async function EditVenuePage({ params }: PageProps) {
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href={`/venues/${id}`}
            className="flex shrink-0 items-center justify-center rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="뒤로가기"
          >
            ←
          </Link>
          <Logo />
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <h1 className="min-w-0 truncate text-sm font-medium text-zinc-600 dark:text-zinc-400">
            정보 수정
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-12">
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
          <span className="font-semibold">{venue.name}</span>의 정보를 수정합니다.
          잘못된 내용을 바로잡아 주세요.
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <VenueForm initialData={venue} />
        </div>
      </main>
    </div>
  );
}
