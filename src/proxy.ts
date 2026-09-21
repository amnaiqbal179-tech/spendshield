import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Manager-only routes jo sirf managers access kar sakte hain
const isManagerRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/subscriptions(.*)",
  "/renewals(.*)",
  "/savings(.*)",
  "/decisions(.*)",
  "/forecast(.*)",
]);

// Employee-only routes ya general workspace routes
const isEmployeeRoute = createRouteMatcher([
  "/requests(.*)",
  "/employee(.*)",
]);

// Sari protected routes ki list
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/subscriptions(.*)",
  "/renewals(.*)",
  "/savings(.*)",
  "/decisions(.*)",
  "/approvals(.*)",
  "/forecast(.*)",
  "/settings(.*)",
  "/requests(.*)",
  "/employee(.*)",
  "/organization(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth();

  // 1. Agar user protected route par hai aur login nahi hai -> sign-in page par redirect karein
  if (isProtectedRoute(req) && !userId) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(url);
  }

  // 2. Agar login hai lekin organization select nahi ki (aur organization page par nahi hai)
  if (userId && isProtectedRoute(req) && !orgId && !req.nextUrl.pathname.startsWith("/organization")) {
    const orgUrl = new URL("/organization", req.url);
    return NextResponse.redirect(orgUrl);
  }

  // 3. Role-based routing check (Agar organization selected hai)
  if (userId && orgId) {
    // Clerk role check: org:admin ya org:manager ko manager mana jayega
    const isManager = orgRole === "org:admin" || orgRole === "org:manager";

    const path = req.nextUrl.pathname;

    // Agar employee manager route (jaise /dashboard) access karne ki koshish kare, toh usay /requests par bhej do
    if (!isManager && isManagerRoute(req)) {
      const employeeUrl = new URL("/requests", req.url);
      return NextResponse.redirect(employeeUrl);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};