import React from 'react'
import { LayoutDashboard, ListTodo, Map, Settings, Workflow, Sprout } from 'lucide-react'
import { useNavigate, useRouter } from '@/app/router'
import Logo from '@/shared/ui/Logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'
import { AppNavItem, NavMain } from './nav-main'

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === '/dashboard',
  },
  {
    title: 'Minhas áreas',
    url: '/areas',
    icon: Map,
    isActive: (pathname) => pathname === '/areas' || pathname.startsWith('/areas/'),
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    role: 'admin',
    icon: Settings,
    isActive: (pathname) => pathname === '/configuracoes' || pathname.startsWith('/configuracoes/'),
    items: [
      {
        title: 'Visão geral',
        url: '/configuracoes',
        icon: Settings,
      },
      {
        title: 'Atividades',
        url: '/configuracoes/atividades',
        icon: ListTodo,
      },
      {
        title: 'Fluxos',
        url: '/configuracoes/fluxos',
        icon: Workflow,
      },
      {
        title: 'Culturas',
        url: '/configuracoes/culturas',
        icon: Sprout,
      },
    ]
  },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-200 bg-white text-neutral-700" {...props}>
      <SidebarHeader>
        <Logo withText={state === 'expanded' ? true : false}  />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={APP_NAV_ITEMS} />
      </SidebarContent>
      <SidebarFooter >
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
