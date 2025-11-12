import type { AppRoute } from '@/app/routes';
import CropListPage from './pages/CropListPage';
import CropFormPage from './pages/CropFormPage';

export const cropRoutes: AppRoute[] = [
  {
    path: '/configuracoes/culturas',
    component: CropListPage,
    access: 'private',
    fallbackPath: '/signin',
    label: 'Culturas',
    children: [
      {
        path: '/configuracoes/culturas/novo',
        component: CropFormPage,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Nova cultura',
      },
      {
        path: '/configuracoes/culturas/:cropId/editar',
        component: CropFormPage,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Editar cultura',
      },
    ],
  },
];
