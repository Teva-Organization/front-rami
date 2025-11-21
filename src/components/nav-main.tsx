"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useNavigate, useRouter } from "@/app/router";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/features/auth";

export interface AppNavItem {
  label: string;
  to: string;
  title: string;
  url: string;
  role?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: (pathname: string) => boolean;
  items?: {
    title: string;
    url: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }[];
}

export function NavMain({ items }: { items: AppNavItem[] }) {
  const navigate = useNavigate();
  const { pathname } = useRouter();
  const { user } = useAuth();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {

          if(item.role && !user?.roles?.includes(item.role)) {
            return null;
          }
        
          const isActive = item.isActive(pathname);

          return (
            <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive(pathname)}
            className={twMerge(
              "group/collapsible",
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "text-neutral-700",
            )}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  onClick={item.items ? undefined : () => navigate(item.url)}
                  tooltip={item.title}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title} className="flex items-center">
                       {subItem.icon && <subItem.icon className="w-3 h-3" />}
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
