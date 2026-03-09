import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="relative h-7 w-[104px] sm:h-8 sm:w-[116px] lg:h-9 lg:w-[132px]">
        <Image
          src="/bandinity_logo_light.png"
          alt="Bandinity"
          fill
          priority
          className="object-contain dark:hidden"
          sizes="(max-width: 639px) 104px, (max-width: 1023px) 116px, 132px"
        />
        <Image
          src="/bandinity_logo_dark.png"
          alt="Bandinity"
          fill
          priority
          className="hidden object-contain dark:block"
          sizes="(max-width: 639px) 104px, (max-width: 1023px) 116px, 132px"
        />
      </span>
    </Link>
  );
}
