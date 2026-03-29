import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never',
});

// Extract subdomain from hostname
function getSubdomain(hostname: string): string | null {
  // Handle localhost for development
  if (hostname === 'localhost' || hostname.startsWith('localhost:')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }

  // Handle production domains
  // e.g., kfm-delice.restaurant-os.app -> kfm-delice
  // e.g., www.kfm-delice.restaurant-os.app -> kfm-delice
  const parts = hostname.split('.');

  // Remove 'www' if present
  const filteredParts = parts.filter(p => p !== 'www');

  // Check if it's a subdomain (more than 2 parts for domain like restaurant-os.app)
  if (filteredParts.length > 2) {
    return filteredParts[0];
  }

  return null;
}

// Check if request is for custom domain
function isCustomDomain(hostname: string): boolean {
  // Known platform domains
  const platformDomains = [
    'restaurant-os.app',
    'restaurant-os.com',
    'localhost',
    'vercel.app',
    'onrender.com',
  ];

  return !platformDomains.some(domain =>
    hostname === domain || hostname.endsWith('.' + domain)
  );
}

export default function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow root landing page without i18n redirect
  if (pathname === '/') {
    // Check for subdomain or custom domain
    const subdomain = getSubdomain(hostname);
    const isCustom = isCustomDomain(hostname);

    if (subdomain || isCustom) {
      // Redirect to restaurant menu
      const url = request.nextUrl.clone();
      url.pathname = '/menu/redirect';
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // App routes that need authentication
  const appRoutes = ['/login', '/dashboard', '/pos', '/orders', '/menu', '/reservations',
                     '/customers', '/deliveries', '/drivers', '/analytics', '/settings',
                     '/kitchen', '/driver', '/staff', '/admin', '/profile', '/api',
                     '/customer', '/restaurants'];

  // Check if accessing via subdomain/custom domain
  const subdomain = getSubdomain(hostname);
  const isCustom = isCustomDomain(hostname);

  if (subdomain || isCustom) {
    // Restaurant-specific domain - serve public menu
    // Rewrite /menu/[slug] paths
    if (pathname === '/menu/redirect') {
      // This will be handled by a special page that looks up the restaurant
      return NextResponse.next();
    }

    // For restaurant-specific domains, rewrite to the menu
    if (!pathname.startsWith('/admin') &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/dashboard')) {
      // Rewrite to menu with the slug from subdomain/domain
      const url = request.nextUrl.clone();

      // Store the subdomain/domain in a header for the page to use
      const response = NextResponse.rewrite(url);
      response.headers.set('x-restaurant-subdomain', subdomain || '');
      response.headers.set('x-restaurant-domain', isCustom ? hostname : '');
      return response;
    }
  }

  // Allow app routes without i18n
  if (appRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Apply i18n middleware for other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
