import { NextRequest, NextResponse } from "next/server";
import { USER_SESSION_COOKIE_NAME } from "@/lib/user-auth";

async function handleLogout(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(USER_SESSION_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}
