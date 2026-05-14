import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin"];

export function proxy(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  const hasSession = request.cookies.has("accessToken") || request.cookies.has("refreshToken");

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
};
