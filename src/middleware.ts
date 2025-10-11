import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login', 
    '/register', 
    '/forgot-password', 
    '/platform', 
    '/services', 
    '/framework',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];

  // Public API routes that don't require authentication
  const publicApiRoutes = [
    '/api/auth/',
    '/api/health',
    '/api/public/'
  ];

  const isPublicRoute = publicRoutes.includes(url.pathname) || 
                       publicApiRoutes.some(route => url.pathname.startsWith(route)) ||
                       url.pathname.startsWith('/_next/') ||
                       url.pathname.startsWith('/favicon');

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

  // Skip auth check for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {
            // Not implemented for middleware
          },
          remove() {
            // Not implemented for middleware
          }
        }
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Redirect to login for protected routes
      if (url.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', url.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check user role for admin routes
    if (url.pathname.startsWith('/admin/')) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // User is authenticated, continue
    return NextResponse.next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', url.pathname);
    return NextResponse.redirect(loginUrl);
  }
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
