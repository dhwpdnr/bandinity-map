import { PlaceExplorer } from "@/components/PlaceExplorer";
import { CARD_PADDING, CARD_RADIUS, HEADER_PADDING, PAGE_BG_GRADIENT, PAGE_MAX_WIDTH } from "@/lib/layout";
import { getMissingPublicEnvKeys, hasPublicFirestoreConfig } from "@/lib/public-env";
import { getPlaces } from "@/lib/places";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!hasPublicFirestoreConfig()) {
    return (
      <main className={`flex ${PAGE_BG_GRADIENT} items-center justify-center py-12`}>
        <div className={`mx-auto w-full ${PAGE_MAX_WIDTH} ${HEADER_PADDING}`}>
          <div className={`${CARD_RADIUS} border border-zinc-200 bg-white text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${CARD_PADDING}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Configuration
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Firebase 설정이 비어 있습니다
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            아래 환경 변수를 채우면 장소 데이터를 불러올 수 있습니다.
          </p>
          <pre className="mt-5 rounded-2xl bg-zinc-50 p-4 text-left text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
            {getMissingPublicEnvKeys().join("\n")}
          </pre>
          </div>
        </div>
      </main>
    );
  }

  const places = await getPlaces();
  return <PlaceExplorer places={places} />;
}
