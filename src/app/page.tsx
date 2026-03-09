import { PlaceExplorer } from "@/components/PlaceExplorer";
import { getMissingPublicEnvKeys, hasPublicFirestoreConfig } from "@/lib/public-env";
import { getPlaces } from "@/lib/places";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!hasPublicFirestoreConfig()) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
        <div className="max-w-xl rounded-[32px] border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
      </main>
    );
  }

  const places = await getPlaces();
  return <PlaceExplorer places={places} />;
}
