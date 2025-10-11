import { AUTH_CONFIG } from './config';
import { AuthUser } from './types';

export function getPostLoginRedirect(user: AuthUser): string {
  if (user.role === 'super_admin' || user.role === 'admin') {
    return AUTH_CONFIG.redirects.adminAfterLogin;
  }
  return AUTH_CONFIG.redirects.afterLogin;
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];
  
  return publicRoutes.includes(pathname) || 
         pathname.startsWith('/api/') ||
         pathname.startsWith('/_next/') ||
         pathname.startsWith('/favicon');
}

export function shouldRedirectToLogin(pathname: string, user: AuthUser | null): boolean {
  return !isPublicRoute(pathname) && !user;
}

export function shouldRedirectToAdmin(pathname: string, user: AuthUser | null): boolean {
  return pathname === AUTH_CONFIG.redirects.login && 
         user && 
         (user.role === 'super_admin' || user.role === 'admin');
}
