import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/landing(.*)','/sign-up(.*)', '/p/(.*)','/api/(.*)'])

export default clerkMiddleware((auth, req) => {
  // Handle root path redirect based on auth state (before page renders)
  if (req.nextUrl.pathname === '/') {
    try {
      const { userId } = auth();
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/landing', req.url));
    } catch (error) {
      console.error('Root path auth check error:', error);
      // On error, default to landing
      return NextResponse.redirect(new URL('/landing', req.url));
    }
  }
  
  if (!isPublicRoute(req)) {
    try {
      const signinUrl = new URL(`/sign-in?redirect_url=${encodeURIComponent(req.nextUrl.pathname)}`, req.url).toString();
      // Protect route - Clerk will handle redirect if not authenticated
      return auth().protect({
        unauthenticatedUrl: signinUrl,
      });
    } catch (error) {
      // Log error but don't block request
      console.error('Middleware auth error:', error);
      return NextResponse.next();
    }
  }

  // Public routes continue
  return NextResponse.next();
})



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}