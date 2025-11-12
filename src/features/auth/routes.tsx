import type { AppRoute } from '../../app/routes';
import SignIn from '../../app/pages/SignIn';

export const authRoutes: AppRoute[] = [
  {
    path: '/signin',
    component: SignIn,
    access: 'public',
    publicOnly: true,
    authenticatedFallback: '/dashboard',
  },
];
