import { notFound } from "next/navigation";
import Link from "next/link";
import { getVenueById } from "@/lib/venues";
import { VenueMap } from "@/components/VenueMap";
import { Logo } from "@/components/Logo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex shrink-0 items-center justify-center rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="목록으로"
          >
            ←
          </Link>
          <Logo />
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {venue.name}
          </h1>
          <Link
            href={`/venues/${venue.id}/edit`}
            className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            정보 수정
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 p-4 pb-8">
        <div className="mb-4 h-[220px] w-full overflow-hidden rounded-xl sm:h-[280px]">
          <VenueMap venues={[venue]} selectedId={venue.id} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <dl className="space-y-3">
            {venue.region && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">지역</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{venue.region}</dd>
              </div>
            )}
            {venue.address && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">주소</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{venue.address}</dd>
              </div>
            )}
            {venue.phone && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">연락처</dt>
                <dd>
                  <a
                    href={`tel:${venue.phone}`}
                    className="text-amber-600 hover:underline dark:text-amber-400"
                  >
                    {venue.phone}
                  </a>
                </dd>
              </div>
            )}
            {venue.description && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">소개</dt>
                <dd className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {venue.description}
                </dd>
              </div>
            )}
            {venue.tags && venue.tags.length > 0 && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">태그</dt>
                <dd className="flex flex-wrap gap-2">
                  {venue.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {venue.link && (
              <div className="pt-2">
                <a
                  href={venue.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
                >
                  예약/홈페이지 →
                </a>
              </div>
            )}
          </dl>
        </div>
      </main>
    </div>
  );
}
