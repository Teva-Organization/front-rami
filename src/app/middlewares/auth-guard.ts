import type { AppRoute } from '../routes';

export type GuardResult = {
  allowed: boolean;
  redirectTo?: string;
  reason?: 'unauthenticated' | 'restricted';
};

export function runAuthGuard(route: AppRoute | null, isAuthenticated: boolean): GuardResult {
  if (!route) {
    return { allowed: true };
  }

  const isAuthEntryRoute = route.path === '/signin' || route.path === '/signup';
  if (isAuthEntryRoute && isAuthenticated) {
    return {
      allowed: false,
      redirectTo: route.authenticatedFallback ?? '/dashboard',
      reason: 'restricted',
    };
  }

  if (route.access === 'private' && !isAuthenticated) {
    return {
      allowed: false,
      redirectTo: route.fallbackPath ?? '/signin',
      reason: 'unauthenticated',
    };
  }

  if (route.access === 'public' && route.publicOnly && isAuthenticated) {
    return {
      allowed: false,
      redirectTo: route.authenticatedFallback ?? '/',
      reason: 'restricted',
    };
  }

  return { allowed: true };
}
