import Link from "next/link";
import { BUTTON_KAKAO } from "@/lib/ui";

interface KakaoLoginButtonProps {
  href: string;
  className?: string;
}

function KakaoSymbol() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 fill-black"
    >
      <path d="M12 4.5c-4.97 0-9 3.06-9 6.84 0 2.43 1.66 4.57 4.17 5.79L6.2 20.5a.7.7 0 0 0 1.02.76l4.27-2.75c.17.01.34.01.51.01 4.97 0 9-3.06 9-6.84s-4.03-6.84-9-6.84Z" />
    </svg>
  );
}

export default function KakaoLoginButton({ href, className }: KakaoLoginButtonProps) {
  return (
    <Link href={href} className={`${BUTTON_KAKAO} ${className ?? ""}`.trim()} aria-label="카카오 로그인">
      <KakaoSymbol />
      <span className="text-black" style={{ color: "#000" }}>카카오 로그인</span>
    </Link>
  );
}
