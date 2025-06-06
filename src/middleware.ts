import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./actions";

export async function middleware(request: NextRequest) {
  const session = await getSession();

  if (
    !session.isLoggedIn &&
    request.nextUrl.pathname !== "/login" &&
    request.nextUrl.pathname !== "/register"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
