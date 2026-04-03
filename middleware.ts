import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/perfil", "/configuracion", "/mis-combinaciones"];
const authPages = ["/ingresar", "/registrarse"];

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (sessionCookie && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!sessionCookie && protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL("/ingresar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/perfil/:path*", "/configuracion/:path*", "/mis-combinaciones/:path*", "/ingresar", "/registrarse"],
};
