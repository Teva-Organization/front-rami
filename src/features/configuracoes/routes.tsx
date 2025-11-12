import type { AppRoute } from '@/app/routes';
import ConfiguracoesLanding from './pages/ConfiguracoesLanding';
import AtividadesPage from './pages/AtividadesPage';
import FluxosPage from './pages/FluxosPage';
import FluxoCadastroPage from './pages/FluxoCadastroPage';
import { cropRoutes } from '@/features/crops/routes';

export const configuracoesRoutes: AppRoute[] = [
  {
    path: '/configuracoes',
    component: ConfiguracoesLanding,
    access: 'private',
    fallbackPath: '/signin',
    label: 'Configurações',
    children: [
      {
        path: '/configuracoes/atividades',
        component: AtividadesPage,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Atividades',
      },
      {
        path: '/configuracoes/fluxos',
        component: FluxosPage,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Fluxos',
      },
      {
        path: '/configuracoes/fluxos/novo',
        component: FluxoCadastroPage,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Novo fluxo',
      },
      {
        path: '/configuracoes/fluxos/:flowId/editar',
        component: FluxoCadastroPage,
        access: 'private',
        fallbackPath: '/signin',
        label: 'Editar fluxo',
      },
      ...cropRoutes,
    ],
  },
];
