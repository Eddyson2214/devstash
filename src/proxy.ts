import { auth } from "@/auth";

const PROTECTED_PATH_PREFIXES = ["/dashboard", "/profile"];

export const proxy = auth((req) => {
  const isProtectedRoute = PROTECTED_PATH_PREFIXES.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
