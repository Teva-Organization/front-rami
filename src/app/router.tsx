import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AppRoute, RouteMatch } from './routes';

type NavigateOptions = {
  replace?: boolean;
};

type RouterContextValue = {
  pathname: string;
  params: Record<string, string>;
  route: AppRoute | null;
  parentRoute: AppRoute | null;
  navigate: (to: string, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function matchPath(pattern: string, pathname: string): RouteMatch | null {
  if (pattern === '*') {
    return { params: {} };
  }

  const trim = (value: string) => value.replace(/(^\/+|\/+$)/g, '');
  const patternSegments = trim(pattern).split('/').filter(Boolean);
  const pathSegments = trim(pathname).split('/').filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i += 1) {
    const currentPattern = patternSegments[i];
    const currentPath = pathSegments[i];
    if (currentPattern.startsWith(':')) {
      const key = currentPattern.slice(1);
      params[key] = decodeURIComponent(currentPath);
      continue;
    }
    if (currentPattern !== currentPath) {
      return null;
    }
  }

  return { params };
}

function findRoute(routes: AppRoute[], pathname: string, parent: AppRoute | null = null): { route: AppRoute; match: RouteMatch; parent: AppRoute | null } | null {
  for (const route of routes) {
    if (route.children) {
      const childMatch = findRoute(route.children, pathname, route);
      if (childMatch) {
        return childMatch;
      }
    }
    const match = matchPath(route.path, pathname);
    if (match) {
      return { route, match, parent };
    }
  }
  return null;
}

export function RouterProvider({
  routes,
  children,
}: {
  routes: AppRoute[];
  children: ReactNode;
}) {
  const initialPath =
    typeof window !== 'undefined' ? window.location.pathname : '/';

  const [pathname, setPathname] = useState(initialPath);

  const navigate = useCallback((to: string, options?: NavigateOptions) => {
    if (typeof window === 'undefined') return;
    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const matched = useMemo(() => findRoute(routes, pathname), [routes, pathname]);

  const value = useMemo<RouterContextValue>(() => {
    const route = matched?.route ?? null;
    const parentRoute = matched?.parent ?? null;
    const params = matched?.match.params ?? {};
    return {
      pathname,
      params,
       route,
      parentRoute,
      navigate,
    };
  }, [pathname, matched, navigate]);

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter deve ser usado dentro de <RouterProvider>');
  }
  return ctx;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function useRouteParams<Params extends Record<string, string>>() {
  return useRouter().params as Params;
}
