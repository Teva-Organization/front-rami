import type { AppRoute } from '../../app/routes';
import Areas from '../../app/pages/Areas';
import AreaDetails from '../../app/pages/AreaDetails';
import CadastrarArea from '@/app/pages/CadastrarArea';

export const areaRoutes: AppRoute[] = [
  {
    path: '/areas',
    component: Areas,
    access: 'private',
    fallbackPath: '/signin',
    label: 'Minhas áreas',
    children: [
      {
        path: '/areas/cadastrar',
        component: CadastrarArea,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Cadastrar área',
      },
      {
        path: '/areas/:id',
        component: AreaDetails,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Detalhes da área',
      },
    ],
  },
];
