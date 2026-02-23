import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 select-none">
      <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
        Band<span className="text-amber-500">inity</span>
      </span>
    </Link>
  );
}
