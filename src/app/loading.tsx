import { Logo } from "@/components/Logo";

export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(100,197,218,0.12),_transparent_28%),linear-gradient(180deg,var(--surface-app-alt)_0%,var(--surface-app)_100%)] px-6 py-12 text-white">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,15,22,0.96),rgba(7,9,14,0.98))] px-8 py-10 shadow-[0_30px_90px_-52px_rgba(0,0,0,0.92)]">
        <Logo />
        <div className="mt-8 w-full max-w-[220px] overflow-hidden rounded-full bg-white/8">
          <div className="h-1.5 w-2/3 animate-pulse rounded-full bg-primary-400" />
        </div>
      </div>
    </main>
  );
}
