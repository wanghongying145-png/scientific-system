import React, { useState, useEffect } from "react";
import { 
  SlidersHorizontal,
  RotateCcw, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2,
  Undo2,
  LayoutDashboard,
  ShieldCheck,
  FolderTree,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  MenuGroupConfig, 
  MenuItemConfig, 
  getStoredMenuConfig, 
  saveStoredMenuConfig, 
  resetStoredMenuConfig,
  ICON_MAP 
} from "@/src/lib/menuConfig";
import { cn } from "@/lib/utils";

export function MenuManagement({
  onMenuConfigChange
}: {
  onMenuConfigChange?: (configs: MenuGroupConfig[]) => void;
}) {
  const [menuGroups, setMenuGroups] = useState<MenuGroupConfig[]>(() => getStoredMenuConfig());
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([
    "research-middle-platform",
    "bio-analysis", 
    "specialized-db", 
    "ai-drug-discovery", 
    "system-mgmt"
  ]);
  const [expandedSubMenuIds, setExpandedSubMenuIds] = useState<string[]>([]);

  // Editing state for rename dialog or inline edit
  const [editingItem, setEditingItem] = useState<{
    groupId: string;
    itemId?: string;
    parentItemId?: string;
    currentTitle: string;
    defaultTitle: string;
    isGroup?: boolean;
  } | null>(null);
  const [renameInput, setRenameInput] = useState("");

  // Confirmation dialog for Reset
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>("所有修改自动实时同步");

  // Show auto-save notification
  const triggerSaveNotification = (msg = "菜单配置已更新并实时应用") => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 2800);
  };

  // Sync state & save
  const updateAndSave = (newGroups: MenuGroupConfig[], message?: string) => {
    setMenuGroups(newGroups);
    saveStoredMenuConfig(newGroups);
    if (onMenuConfigChange) {
      onMenuConfigChange(newGroups);
    }
    triggerSaveNotification(message);
  };

  // Toggle group expansion
  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroupIds(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  // Toggle submenu expansion
  const toggleSubMenuExpand = (itemId: string) => {
    setExpandedSubMenuIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Expand / collapse all
  const handleExpandAll = () => {
    setExpandedGroupIds(menuGroups.map(g => g.id));
    const allParentIds: string[] = [];
    menuGroups.forEach(g => {
      g.items.forEach(i => {
        if (i.children && i.children.length > 0) {
          allParentIds.push(i.id);
        }
      });
    });
    setExpandedSubMenuIds(allParentIds);
  };

  const handleCollapseAll = () => {
    setExpandedGroupIds([]);
    setExpandedSubMenuIds([]);
  };

  // Toggle Visibility for a top-level menu item
  const handleToggleItemVisibility = (groupId: string, itemId: string) => {
    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.map(item => {
          if (item.id === itemId) {
            return { ...item, visible: !item.visible };
          }
          return item;
        })
      };
    });
    updateAndSave(updated, "菜单显示状态已更新");
  };

  // Toggle Visibility for a child menu item
  const handleToggleChildVisibility = (groupId: string, parentItemId: string, childId: string) => {
    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.map(item => {
          if (item.id !== parentItemId || !item.children) return item;
          return {
            ...item,
            children: item.children.map(child => {
              if (child.id === childId) {
                return { ...child, visible: !child.visible };
              }
              return child;
            })
          };
        })
      };
    });
    updateAndSave(updated, "子菜单显示状态已更新");
  };

  // Toggle Visibility for an entire Group
  const handleToggleGroupVisibility = (groupId: string) => {
    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, visible: !group.visible };
    });
    updateAndSave(updated, "模块分组显隐已切换");
  };

  // Move Group Up or Down
  const handleMoveGroup = (groupId: string, direction: "up" | "down") => {
    const sorted = [...menuGroups].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sorted.findIndex(g => g.id === groupId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const temp = sorted[index];
      sorted[index] = sorted[index - 1];
      sorted[index - 1] = temp;
    } else if (direction === "down" && index < sorted.length - 1) {
      const temp = sorted[index];
      sorted[index] = sorted[index + 1];
      sorted[index + 1] = temp;
    }

    const reorderedGroups = sorted.map((g, idx) => ({
      ...g,
      order: idx + 1
    }));

    updateAndSave(reorderedGroups, "模块分组排序已调整");
  };

  // Move Menu Item Up or Down
  const handleMoveItem = (groupId: string, itemId: string, direction: "up" | "down") => {
    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;
      const items = [...group.items];
      const index = items.findIndex(i => i.id === itemId);
      if (index === -1) return group;

      if (direction === "up" && index > 0) {
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;
      } else if (direction === "down" && index < items.length - 1) {
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;
      }

      // Re-assign order numbers consecutively
      const reorderedItems = items.map((item, idx) => ({
        ...item,
        order: idx + 1
      }));

      return {
        ...group,
        items: reorderedItems
      };
    });

    updateAndSave(updated, "菜单排序已调整");
  };

  // Move Child Item Up or Down
  const handleMoveChildItem = (groupId: string, parentItemId: string, childId: string, direction: "up" | "down") => {
    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.map(item => {
          if (item.id !== parentItemId || !item.children) return item;
          const children = [...item.children];
          const index = children.findIndex(c => c.id === childId);
          if (index === -1) return item;

          if (direction === "up" && index > 0) {
            const temp = children[index];
            children[index] = children[index - 1];
            children[index - 1] = temp;
          } else if (direction === "down" && index < children.length - 1) {
            const temp = children[index];
            children[index] = children[index + 1];
            children[index + 1] = temp;
          }

          const reorderedChildren = children.map((c, idx) => ({
            ...c,
            order: idx + 1
          }));

          return {
            ...item,
            children: reorderedChildren
          };
        })
      };
    });

    updateAndSave(updated, "子菜单排序已调整");
  };

  // Direct Order Change by number input
  const handleOrderChange = (groupId: string, itemId: string, newOrderVal: number) => {
    if (isNaN(newOrderVal) || newOrderVal < 1) return;
    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;
      const items = group.items.map(i => {
        if (i.id === itemId) {
          return { ...i, order: newOrderVal };
        }
        return i;
      });
      // Sort items by new order
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return { ...group, items };
    });
    updateAndSave(updated, "排序编号已更新");
  };

  // Open Rename Dialog
  const openRenameDialog = (
    groupId: string, 
    itemId?: string, 
    parentItemId?: string, 
    currentTitle = "", 
    defaultTitle = "",
    isGroup = false
  ) => {
    setEditingItem({
      groupId,
      itemId,
      parentItemId,
      currentTitle,
      defaultTitle,
      isGroup
    });
    setRenameInput(currentTitle);
  };

  // Confirm Rename
  const handleConfirmRename = () => {
    if (!editingItem) return;
    const trimmed = renameInput.trim();
    if (!trimmed) return;

    const { groupId, itemId, parentItemId, isGroup } = editingItem;

    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;

      if (isGroup) {
        return { ...group, title: trimmed };
      }

      return {
        ...group,
        items: group.items.map(item => {
          // If editing a top-level menu item
          if (!parentItemId && item.id === itemId) {
            return { ...item, title: trimmed };
          }
          // If editing a child menu item
          if (parentItemId && item.id === parentItemId && item.children) {
            return {
              ...item,
              children: item.children.map(child => {
                if (child.id === itemId) {
                  return { ...child, title: trimmed };
                }
                return child;
              })
            };
          }
          return item;
        })
      };
    });

    updateAndSave(updated, `名称已修改为 “${trimmed}”`);
    setEditingItem(null);
  };

  // Reset to default title for an item
  const handleResetItemTitle = (groupId: string, itemId: string, parentItemId?: string) => {
    const updated = menuGroups.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.map(item => {
          if (!parentItemId && item.id === itemId) {
            return { ...item, title: item.defaultTitle };
          }
          if (parentItemId && item.id === parentItemId && item.children) {
            return {
              ...item,
              children: item.children.map(child => {
                if (child.id === itemId) {
                  return { ...child, title: child.defaultTitle };
                }
                return child;
              })
            };
          }
          return item;
        })
      };
    });
    updateAndSave(updated, "已恢复默认菜单名称");
  };

  // Reset All to Default
  const handleResetAll = () => {
    const reset = resetStoredMenuConfig();
    setMenuGroups(reset);
    if (onMenuConfigChange) {
      onMenuConfigChange(reset);
    }
    setIsResetDialogOpen(false);
    triggerSaveNotification("已恢复系统默认菜单配置");
  };

  return (
    <div className="flex-1 space-y-5 p-6 md:p-8 bg-slate-50/60 min-h-[calc(100vh-4rem)]">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
            <span>系统管理</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">菜单管理</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-sky-600" />
            菜单管理与显隐控制
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            配置系统各功能菜单的显隐状态、显示名称和排序次序，设置将即时生效并同步应用至全局侧边导航栏。
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveToast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium shadow-2xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveToast}</span>
            </div>
          )}

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandAll}
              className="h-7 px-2.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
            >
              展开全部
            </Button>
            <span className="text-slate-200">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseAll}
              className="h-7 px-2.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
            >
              折叠全部
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="h-8 px-3 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 rounded-lg shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复默认设置</span>
          </Button>
        </div>
      </div>

      {/* Main Menu List Accordion/Tree View */}
      <div className="space-y-4">
        {menuGroups
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((group, groupIndex, sortedGroups) => {
            const isGroupExpanded = expandedGroupIds.includes(group.id);
            const visibleItemCount = group.items.filter(i => i.visible).length;

            return (
              <Card key={group.id} className="border border-slate-200/90 shadow-2xs bg-white rounded-xl overflow-hidden transition-all">
                {/* Group Header */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleGroupExpand(group.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                    >
                      {isGroupExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {group.order}
                      </span>
                      <span className="text-sm font-bold text-slate-800">{group.title}</span>
                      {group.title !== group.defaultTitle && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-indigo-200">
                          原名: {group.defaultTitle}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400 font-normal">
                        ({visibleItemCount} / {group.items.length} 显式项)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Move Group Up/Down */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={groupIndex === 0}
                        onClick={() => handleMoveGroup(group.id, "up")}
                        className="h-6 w-6 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        title="上移模块分组"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={groupIndex === sortedGroups.length - 1}
                        onClick={() => handleMoveGroup(group.id, "down")}
                        className="h-6 w-6 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        title="下移模块分组"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Rename Group Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRenameDialog(group.id, undefined, undefined, group.title, group.defaultTitle, true)}
                      className="h-7 px-2 text-xs text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-md"
                      title="修改模块分组名称"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      <span>重命名模块</span>
                    </Button>

                    {/* Group Visibility Toggle */}
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                      <span className="text-xs text-slate-500 hidden sm:inline">模块显隐:</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={group.visible}
                        onClick={() => handleToggleGroupVisibility(group.id)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
                          group.visible ? "bg-sky-600" : "bg-slate-300"
                        )}
                        title={group.visible ? "隐藏该整个模块分组" : "显示该整个模块分组"}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            group.visible ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group Content (Menu Items Table) */}
                {isGroupExpanded && (
                  <div className="divide-y divide-slate-100">
                    {group.items.map((item, itemIndex) => {
                      const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
                      const hasChildren = item.children && item.children.length > 0;
                      const isSubExpanded = expandedSubMenuIds.includes(item.id);
                      const isFirst = itemIndex === 0;
                      const isLast = itemIndex === group.items.length - 1;

                      return (
                        <React.Fragment key={item.id}>
                          {/* Menu Item Row */}
                          <div className={cn(
                            "px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors",
                            !item.visible && "bg-slate-50/60 opacity-75"
                          )}>
                            {/* Left: Icon & Title & Meta */}
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Order Badge */}
                              <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0">
                                {item.order}
                              </div>

                              {/* Icon */}
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                item.visible 
                                  ? "bg-sky-50 text-sky-600 border border-sky-100" 
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              )}>
                                <IconComponent className="w-4 h-4" />
                              </div>

                              {/* Titles */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={cn(
                                    "text-xs font-bold truncate",
                                    item.visible ? "text-slate-900" : "text-slate-500 line-through decoration-slate-400"
                                  )}>
                                    {item.title}
                                  </span>

                                  {item.title !== item.defaultTitle && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-indigo-200 font-normal">
                                      原名: {item.defaultTitle}
                                    </Badge>
                                  )}

                                  {item.isCore && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200 font-medium flex items-center gap-0.5">
                                      <ShieldCheck className="w-3 h-3 text-sky-600" />
                                      核心菜单
                                    </Badge>
                                  )}

                                  {item.adminOnly && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200 font-normal">
                                      管理员专属
                                    </Badge>
                                  )}

                                  {hasChildren && (
                                    <button
                                      onClick={() => toggleSubMenuExpand(item.id)}
                                      className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 bg-sky-50/60 hover:bg-sky-100/60 px-1.5 py-0.5 rounded border border-sky-200/70"
                                    >
                                      <span>{item.children?.length}个子菜单</span>
                                      {isSubExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span className="font-mono">ID: {item.id}</span>
                                  <span>·</span>
                                  <span>所属: {group.title}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Controls (Sorting, Renaming, Visibility Switch) */}
                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                              {/* Quick Order Input & Up/Down Arrows */}
                              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200/80">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isFirst}
                                  onClick={() => handleMoveItem(group.id, item.id, "up")}
                                  className="w-6 h-6 p-0 text-slate-600 hover:text-sky-700 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                                  title="在同级中上移"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </Button>

                                <span className="text-xs font-bold text-slate-700 w-5 text-center">
                                  {item.order}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isLast}
                                  onClick={() => handleMoveItem(group.id, item.id, "down")}
                                  className="w-6 h-6 p-0 text-slate-600 hover:text-sky-700 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                                  title="在同级中下移"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                              </div>

                              {/* Rename Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRenameDialog(group.id, item.id, undefined, item.title, item.defaultTitle)}
                                className="h-7 px-2.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg flex items-center gap-1 shadow-2xs"
                                title="修改菜单名称"
                              >
                                <Edit3 className="w-3 h-3 text-slate-500" />
                                <span>重命名</span>
                              </Button>

                              {/* Reset name button if changed */}
                              {item.title !== item.defaultTitle && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResetItemTitle(group.id, item.id)}
                                  className="h-7 px-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                  title="恢复此菜单的默认名称"
                                >
                                  <Undo2 className="w-3.5 h-3.5" />
                                </Button>
                              )}

                              {/* Visibility Toggle Switch */}
                              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                <span className={cn(
                                  "text-xs font-medium w-12 text-right",
                                  item.visible ? "text-emerald-600" : "text-slate-400"
                                )}>
                                  {item.visible ? "显示中" : "已隐藏"}
                                </span>

                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={item.visible}
                                  onClick={() => handleToggleItemVisibility(group.id, item.id)}
                                  className={cn(
                                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
                                    item.visible ? "bg-emerald-500" : "bg-slate-300"
                                  )}
                                  title={item.visible ? "点击隐藏该菜单" : "点击在侧边栏显示该菜单"}
                                >
                                  <span
                                    className={cn(
                                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                      item.visible ? "translate-x-4" : "translate-x-0"
                                    )}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Child Submenu Rows (if expanded) */}
                          {hasChildren && isSubExpanded && (
                            <div className="bg-slate-50/80 pl-10 pr-5 py-2 space-y-1.5 border-l-4 border-sky-400 border-t border-b border-slate-100">
                              <div className="text-[11px] font-semibold text-slate-500 py-0.5 flex items-center gap-1.5">
                                <FolderTree className="w-3.5 h-3.5 text-sky-600" />
                                <span>{item.title} - 二级子菜单列表</span>
                              </div>

                              {item.children?.map((child, childIdx) => {
                                const isChildFirst = childIdx === 0;
                                const isChildLast = childIdx === item.children!.length - 1;

                                return (
                                  <div 
                                    key={child.id}
                                    className={cn(
                                      "p-2.5 rounded-lg bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs",
                                      !child.visible && "opacity-60 bg-slate-100"
                                    )}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-5 h-5 rounded bg-sky-50 text-sky-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                                        {child.order || childIdx + 1}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className={cn(
                                            "text-xs font-semibold",
                                            child.visible ? "text-slate-800" : "text-slate-500 line-through"
                                          )}>
                                            {child.title}
                                          </span>
                                          {child.title !== child.defaultTitle && (
                                            <span className="text-[10px] text-indigo-600 font-normal">
                                              (原: {child.defaultTitle})
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">
                                          ID: {child.id}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      {/* Move child up / down */}
                                      <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                                        <button
                                          disabled={isChildFirst}
                                          onClick={() => handleMoveChildItem(group.id, item.id, child.id, "up")}
                                          className="p-1 text-slate-600 hover:text-sky-700 rounded disabled:opacity-30"
                                          title="子菜单同级上移"
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button
                                          disabled={isChildLast}
                                          onClick={() => handleMoveChildItem(group.id, item.id, child.id, "down")}
                                          className="p-1 text-slate-600 hover:text-sky-700 rounded disabled:opacity-30"
                                          title="子菜单同级下移"
                                        >
                                          <ArrowDown className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Child rename */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openRenameDialog(group.id, child.id, item.id, child.title, child.defaultTitle)}
                                        className="h-6 px-2 text-[11px] text-slate-600 hover:text-slate-900 rounded"
                                      >
                                        <Edit3 className="w-3 h-3 mr-1" />
                                        重命名
                                      </Button>

                                      {/* Child reset title */}
                                      {child.title !== child.defaultTitle && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleResetItemTitle(group.id, child.id, item.id)}
                                          className="h-6 px-1.5 text-[11px] text-slate-500 hover:text-indigo-600"
                                          title="恢复默认名"
                                        >
                                          <Undo2 className="w-3 h-3" />
                                        </Button>
                                      )}

                                      {/* Child Visibility Toggle */}
                                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                                        <span className="text-[11px] text-slate-500">
                                          {child.visible ? "显示" : "隐藏"}
                                        </span>
                                        <button
                                          type="button"
                                          role="switch"
                                          aria-checked={child.visible}
                                          onClick={() => handleToggleChildVisibility(group.id, item.id, child.id)}
                                          className={cn(
                                            "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                            child.visible ? "bg-emerald-500" : "bg-slate-300"
                                          )}
                                        >
                                          <span
                                            className={cn(
                                              "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                              child.visible ? "translate-x-3" : "translate-x-0"
                                            )}
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-sky-600" />
              <span>修改{editingItem?.isGroup ? "模块分组" : "菜单"}显示名称</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              设置在系统侧边导航栏及页面标题中展示的自定义名称。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">系统默认名称</Label>
              <div className="text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-medium">
                {editingItem?.defaultTitle}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rename-input" className="text-xs font-semibold text-slate-700">
                新显示名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rename-input"
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmRename();
                  }
                }}
                placeholder="请输入新名称"
                className="h-9 text-xs"
                autoFocus
              />
              <p className="text-[11px] text-slate-400">
                支持 1~20 个字符，修改后侧边栏将立即更新。
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingItem(null)}
              className="text-xs h-8 px-4 rounded-lg"
            >
              取消
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmRename}
              disabled={!renameInput.trim()}
              className="text-xs h-8 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
            >
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>确认恢复默认菜单配置？</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              该操作将清除所有自定义菜单名称、重置菜单顺序，并将所有菜单恢复为默认的显示状态。此操作无法撤销。
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
            <p className="font-semibold">重置内容包括：</p>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              <li>所有模块与功能菜单的显隐状态恢复为默认开启</li>
              <li>所有菜单名称恢复为出厂标准命名</li>
              <li>恢复默认标准菜单排序序号</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(false)}
              className="text-xs h-8 px-4 rounded-lg"
            >
              取消
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleResetAll}
              className="text-xs h-8 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
