import NotFound from './pages/NotFound';
import RootRedirect from './pages/RootRedirect';
import { authRoutes } from '../features/auth/routes';
import { dashboardRoutes } from '../features/dashboard/routes';
import { areaRoutes } from '@/features/areas';
import { configuracoesRoutes } from '@/features/configuracoes';

export type RouteAccess = 'public' | 'private';

export type RouteMatch = {
  params: Record<string, string>;
};

export type AppRoute = {
  path: string;
  component: () => JSX.Element;
  access: RouteAccess;
  label?: string;
  publicOnly?: boolean;
  fallbackPath?: string;
  authenticatedFallback?: string;
  children?: AppRoute[];
};

export const appRoutes: AppRoute[] = [
  ...authRoutes,
  {
    path: '/',
    component: RootRedirect,
    access: 'private',
    fallbackPath: '/signin',
  },
  ...dashboardRoutes,
  ...areaRoutes,
  ...configuracoesRoutes,
  {
    path: '*',
    component: NotFound,
    access: 'public',
  },
];
