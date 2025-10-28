import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'


const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/landing(.*)','/sign-up(.*)', '/p/(.*)','/api/(.*)','/' ])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const origin = req.nextUrl.origin;
    const pathname = req.nextUrl.pathname;
    await auth.protect({
      unauthenticatedUrl: `${origin}/sign-in?redirect_url=${encodeURIComponent(pathname)}`
    })
  }
})



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}