import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'


async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/create-tshirt', '/cart', '/checkout', '/orders']
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/confirm', '/auth/check-email']
  const publicRoutes = ['/'] // Routes that don't require auth but don't redirect
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/signup', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth routes (except confirm/check-email)
  if (user && (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/signup')) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect root to appropriate page
  if (request.nextUrl.pathname === '/') {
    const redirectUrl = new URL(user ? '/dashboard' : '/auth/signup', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export default middleware

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
