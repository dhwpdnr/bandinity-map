import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="relative flex items-center gap-2 select-none">
      <img
        src="/bandinity_logo_light.png"
        alt="Bandinity"
        width={140}
        height={40}
        className="h-8 w-auto sm:h-9 dark:hidden"
        fetchPriority="high"
      />
      <img
        src="/bandinity_logo_dark.png"
        alt="Bandinity"
        width={140}
        height={40}
        className="hidden h-8 w-auto sm:h-9 dark:block"
        fetchPriority="high"
      />
    </Link>
  );
}
