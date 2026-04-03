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
          <div className={`${CARD_RADIUS} border border-white/10 bg-[rgba(11,14,20,0.92)] text-center shadow-[0_14px_36px_-28px_rgba(0,0,0,0.74)] ${CARD_PADDING}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Configuration
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">
            Firebase 설정이 비어 있습니다
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            아래 환경 변수를 채우면 장소 데이터를 불러올 수 있습니다.
          </p>
          <pre className="mt-5 rounded-[20px] bg-[rgba(16,21,30,0.86)] p-4 text-left text-xs text-zinc-300">
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
