import React, { useMemo, useEffect, useRef } from 'react';
import { RouterProvider, useNavigate, useRouter } from './router';
import { appRoutes, type AppRoute } from './routes';
import { runAuthGuard } from './middlewares/auth-guard';
import type { GuardResult } from './middlewares/auth-guard';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useToast } from '../shared/ui/ToastProvider';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, APP_NAV_ITEMS } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function RouteRenderer() {
  const { route, pathname } = useRouter();
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const { showToast } = useToast();
  const lastGuardReasonRef = useRef<GuardResult['reason'] | null>(null);

  const guardResult = useMemo(
    () => runAuthGuard(route, isAuthenticated),
    [route, isAuthenticated],
  );

  useEffect(() => {
    if (isInitializing) return;
    if (guardResult.redirectTo && guardResult.redirectTo !== pathname) {
      navigate(guardResult.redirectTo, { replace: true });
    }
  }, [guardResult.redirectTo, navigate, pathname, isInitializing]);

  useEffect(() => {
    if (isInitializing) return;
    if (
      guardResult.reason === 'unauthenticated' &&
      lastGuardReasonRef.current !== 'unauthenticated'
    ) {
      showToast({
        title: 'Faça login para continuar',
        description: 'Sua sessão expirou ou você não está autenticado.',
        variant: 'destructive',
      });
    }
    lastGuardReasonRef.current = guardResult.reason ?? null;
  }, [guardResult.reason, isInitializing, showToast]);

  if (!route || isInitializing) {
    return null;
  }

  if (!guardResult.allowed) {
    return null;
  }

  const Component = route.component;
  const rendered = <Component />;

  if (route.access === 'private') {
    return <PrivateLayout>{rendered}</PrivateLayout>;
  }

  return rendered;
}

export default function App() {
  return (
    <RouterProvider routes={appRoutes}>
      <RouteRenderer />
    </RouterProvider>
  );
}

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-neutral-50">
        <PrivateHeader />
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function PrivateHeader() {
  const navigate = useNavigate();
  const { pathname, route, parentRoute } = useRouter();
  const breadcrumbs = React.useMemo(() => buildBreadcrumbs(pathname, route, parentRoute), [pathname, route, parentRoute]);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <SidebarTrigger className="h-9 w-9 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-800" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : crumb.href ? (
                      <BreadcrumbLink asChild>
                        <button
                          type="button"
                          onClick={() => navigate(crumb.href!)}
                          className="text-sm text-neutral-500 transition hover:text-neutral-800"
                        >
                          {crumb.label}
                        </button>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {isLast ? null : <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}

type BreadcrumbDescriptor = {
  label: string;
  href?: string;
};

function buildBreadcrumbs(pathname: string, currentRoute: AppRoute | null, parentRoute: AppRoute | null): BreadcrumbDescriptor[] {
  const normalizedPath = normalizePath(pathname);
  const trail: BreadcrumbDescriptor[] = [];
  const stack: AppRoute[] = [];

  if (parentRoute) stack.push(parentRoute);
  if (currentRoute) stack.push(currentRoute);

  stack.forEach((route, index) => {
    if (!route.path.startsWith('/')) return;
    const label = route.label ?? formatSegment(route.path.split('/').filter(Boolean).pop() ?? 'home');
    const isLast = index === stack.length - 1;
    trail.push({ label, href: isLast ? undefined : route.path });
  });

  if (!trail.length) {
    const baseNav = resolveBaseNavItem(normalizedPath);
    if (baseNav) {
      trail.push({ label: baseNav.label, href: normalizedPath === baseNav.to ? undefined : baseNav.to });
    } else {
      trail.push({ label: 'Dashboard', href: '/dashboard' });
    }
  }

  return trail;
}

function normalizePath(pathname: string) {
  if (pathname === '/' || pathname === '') return '/dashboard';
  return pathname.replace(/\/+$/, '') || '/dashboard';
}

function resolveBaseNavItem(pathname: string) {
  const sorted = [...APP_NAV_ITEMS].sort((a, b) => b.to.length - a.to.length);
  return sorted.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
}

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
