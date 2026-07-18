import { auth } from "@/auth";

const PROTECTED_PATH_PREFIX = "/dashboard";

export const proxy = auth((req) => {
  const isProtectedRoute = req.nextUrl.pathname.startsWith(PROTECTED_PATH_PREFIX);

  if (isProtectedRoute && !req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
