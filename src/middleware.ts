import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/platform', '/services', '/framework'];
  const isPublicRoute = publicRoutes.includes(url.pathname);

  // Redirect old dashboard routes to new structure
  const redirectMap: Record<string, string> = {
    '/dashboard/agents': '/agents',
    '/dashboard/knowledge': '/knowledge',
    '/dashboard/workflows': '/workflows',
    '/dashboard/ma01': '/medical-intelligence',
    '/dashboard/settings': '/settings',
  };

  // Check if the current path matches any redirect rules
  for (const [oldPath, newPath] of Object.entries(redirectMap)) {
    if (url.pathname === oldPath || url.pathname.startsWith(oldPath + '/')) {
      // Replace the old path prefix with the new one
      url.pathname = url.pathname.replace(oldPath, newPath);
      return NextResponse.redirect(url);
    }
  }

  // Redirect old API routes
  if (url.pathname.startsWith('/api/jobs')) {
    url.pathname = url.pathname.replace('/api/jobs', '/api/medical-intelligence/jobs');
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip auth check for public routes
  if (isPublicRoute) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: unknown) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: unknown) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

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
};
