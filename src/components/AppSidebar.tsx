import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Database, 
  Dna, 
  FlaskConical, 
  LayoutDashboard, 
  Microscope, 
  Settings, 
  Activity,
  FileText,
  Search,
  Workflow,
  BarChart3,
  Box,
  Boxes,
  Users,
  ShieldAlert,
  ClipboardList,
  HardDriveDownload,
  BookOpen,
  ChevronDown,
  Building2,
  Folder,
  HardDrive,
  ListTree
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  getStoredMenuConfig, 
  ICON_MAP, 
  MenuGroupConfig, 
  MenuItemConfig 
} from "@/src/lib/menuConfig";

export function AppSidebar({ 
  activeId, 
  onSelect,
  currentUser = "admin"
}: { 
  activeId: string; 
  onSelect: (id: string) => void;
  currentUser?: string | null;
}) {
  const isAdmin = currentUser === "admin";
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [menuGroups, setMenuGroups] = useState<MenuGroupConfig[]>(() => getStoredMenuConfig());

  // Listen for real-time menu configuration changes
  useEffect(() => {
    const handleConfigChange = (e: any) => {
      if (e.detail) {
        setMenuGroups(e.detail);
      } else {
        setMenuGroups(getStoredMenuConfig());
      }
    };

    window.addEventListener("system_menu_config_changed", handleConfigChange);
    return () => {
      window.removeEventListener("system_menu_config_changed", handleConfigChange);
    };
  }, []);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  return (
    <Sidebar className="tech-border">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 tech-gradient-blue rounded flex items-center justify-center shadow-sm">
            <FlaskConical className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-foreground">通用型基础科研系统</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups
          .filter(group => group.visible)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((group) => {
            const visibleItems = group.items
              .filter(item => item.visible && (!item.adminOnly || isAdmin))
              .sort((a, b) => (a.order || 0) - (b.order || 0));

            if (visibleItems.length === 0) return null;

            return (
              <SidebarGroup key={group.id}>
                <SidebarGroupLabel className="tech-header">{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const IconComponent = ICON_MAP[item.iconName] || Database;
                      const hasChildren = item.children && item.children.length > 0;

                      if (hasChildren) {
                        const visibleChildren = (item.children || [])
                          .filter(child => child.visible && (!child.adminOnly || isAdmin))
                          .sort((a, b) => (a.order || 0) - (b.order || 0));

                        if (visibleChildren.length === 0) return null;

                        return (
                          <SidebarMenuItem key={item.id}>
                            <Collapsible
                              open={openGroups.includes(item.id)}
                              onOpenChange={() => toggleGroup(item.id)}
                              className="w-full"
                            >
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.title} className="w-full">
                                  <IconComponent className="w-4 h-4" />
                                  <span>{item.title}</span>
                                  <ChevronDown className={cn(
                                    "ml-auto w-4 h-4 transition-transform",
                                    openGroups.includes(item.id) ? "rotate-0" : "-rotate-90"
                                  )} />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {visibleChildren.map((child) => (
                                    <SidebarMenuSubItem key={child.id}>
                                      <SidebarMenuSubButton
                                        isActive={activeId === child.id}
                                        onClick={() => onSelect(child.id)}
                                      >
                                        <span>{child.title}</span>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </Collapsible>
                          </SidebarMenuItem>
                        );
                      }

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton 
                            isActive={activeId === item.id}
                            onClick={() => onSelect(item.id)}
                            tooltip={item.title}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground tech-mono">
          <span>用户: {currentUser || "zsz"}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            系统在线
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
