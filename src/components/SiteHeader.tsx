import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

interface SiteHeaderProps {
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function SiteHeader({
  children,
  className = "",
  containerClassName = "",
}: SiteHeaderProps) {
  return (
    <header className={className}>
      <div
        className={`mx-auto flex min-h-[72px] items-center justify-between gap-3 px-4 md:px-6 ${containerClassName}`.trim()}
      >
        <Logo />
        {children}
      </div>
    </header>
  );
}
