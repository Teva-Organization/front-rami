import type { AppRoute } from '../../app/routes';
import Dashboard from '../../app/pages/Dashboard';

export const dashboardRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    component: Dashboard,
    access: 'private',
    fallbackPath: '/signin'
  },
];
