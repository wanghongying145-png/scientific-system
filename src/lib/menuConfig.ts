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
  Box, 
  Boxes, 
  Users, 
  ShieldAlert, 
  HardDriveDownload, 
  BookOpen, 
  Building2, 
  Folder, 
  HardDrive, 
  ListTree,
  SlidersHorizontal,
  FolderTree,
  FolderKanban,
  Table,
  Sparkles,
  type LucideIcon
} from "lucide-react";

export interface MenuItemConfig {
  id: string;              // 路由唯一标识符
  title: string;           // 当前显示名称
  defaultTitle: string;    // 默认名称
  iconName: string;        // Lucide 图标名称
  visible: boolean;        // 是否在侧边栏显示
  order: number;           // 排序号
  adminOnly?: boolean;     // 仅管理员可见
  groupId: string;         // 所属分组 ID
  isCore?: boolean;        // 是否核心保护项
  children?: MenuItemConfig[]; // 二级子菜单
}

export interface MenuGroupConfig {
  id: string;              // 分组标识符
  title: string;           // 分组标题
  defaultTitle: string;    // 默认分组标题
  visible: boolean;        // 分组是否显示
  order: number;           // 分组排序号
  items: MenuItemConfig[]; // 菜单项列表
}

export const ICON_MAP: Record<string, LucideIcon> = {
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
  Box,
  Boxes,
  Users,
  ShieldAlert,
  HardDriveDownload,
  BookOpen,
  Building2,
  Folder,
  HardDrive,
  ListTree,
  SlidersHorizontal,
  FolderTree,
  FolderKanban,
  Table,
  Sparkles
};

export const DEFAULT_MENU_GROUPS: MenuGroupConfig[] = [
  {
    id: "research-middle-platform",
    title: "科研中台",
    defaultTitle: "科研中台",
    visible: true,
    order: 1,
    items: [
      { id: "workbench", title: "工作台", defaultTitle: "工作台", iconName: "LayoutDashboard", visible: true, order: 1, groupId: "research-middle-platform" },
      { id: "project-mgmt", title: "项目管理", defaultTitle: "项目管理", iconName: "FolderKanban", visible: true, order: 2, groupId: "research-middle-platform" },
      { id: "sample-mgmt", title: "样本管理", defaultTitle: "样本管理", iconName: "Database", visible: true, order: 3, groupId: "research-middle-platform" },
      { id: "dataset-mgmt", title: "数据集管理", defaultTitle: "数据集管理", iconName: "Table", visible: true, order: 4, groupId: "research-middle-platform" },
      { id: "research-assistant", title: "智能科研助手", defaultTitle: "智能科研助手", iconName: "Sparkles", visible: true, order: 5, groupId: "research-middle-platform" },
      { id: "raw-data-mgmt", title: "原始数据管理", defaultTitle: "原始数据管理", iconName: "HardDriveDownload", visible: true, order: 6, groupId: "research-middle-platform" },
    ]
  },
  {
    id: "bio-analysis",
    title: "生信分析系统",
    defaultTitle: "生信分析系统",
    visible: true,
    order: 2,
    items: [
      { id: "tool-mgmt", title: "工具管理", defaultTitle: "工具管理", iconName: "Settings", visible: true, order: 1, groupId: "bio-analysis" },
      { id: "workflow", title: "分析工作流", defaultTitle: "分析工作流", iconName: "Workflow", visible: true, order: 2, groupId: "bio-analysis" },
      { id: "task-monitor", title: "任务监控", defaultTitle: "任务监控", iconName: "Activity", visible: true, order: 3, groupId: "bio-analysis" },
      { id: "results-mgmt", title: "结果管理", defaultTitle: "结果管理", iconName: "FileText", visible: true, order: 4, groupId: "bio-analysis" },
    ]
  },
  {
    id: "specialized-db",
    title: "专病数据库",
    defaultTitle: "专病数据库",
    visible: true,
    order: 3,
    items: [
      { id: "public-db-mgmt", title: "公共数据库管理", defaultTitle: "公共数据库管理", iconName: "Database", visible: true, order: 1, groupId: "specialized-db" },
      { id: "custom-db-mgmt", title: "自建数据库", defaultTitle: "自建数据库", iconName: "Folder", visible: true, order: 2, groupId: "specialized-db" },
    ]
  },
  {
    id: "ai-drug-discovery",
    title: "AI药物发现平台",
    defaultTitle: "AI药物发现平台",
    visible: true,
    order: 4,
    items: [
      { id: "model-center", title: "模型中心", defaultTitle: "模型中心", iconName: "Boxes", visible: true, order: 1, groupId: "ai-drug-discovery" },
      { id: "task-center", title: "任务中心", defaultTitle: "任务中心", iconName: "Activity", visible: true, order: 2, groupId: "ai-drug-discovery" },
    ]
  },
  {
    id: "system-mgmt",
    title: "系统管理",
    defaultTitle: "系统管理",
    visible: true,
    order: 5,
    items: [
      { id: "storage-mgmt", title: "数据存储管理", defaultTitle: "数据存储管理", iconName: "HardDrive", visible: true, order: 1, groupId: "system-mgmt" },
      { id: "user-mgmt", title: "用户管理", defaultTitle: "用户管理", iconName: "Users", visible: true, order: 2, groupId: "system-mgmt" },
      { id: "role-mgmt", title: "角色管理", defaultTitle: "角色管理", iconName: "ShieldAlert", visible: true, order: 3, groupId: "system-mgmt" },
      { id: "group-mgmt", title: "课题组管理", defaultTitle: "课题组管理", iconName: "Users", visible: true, order: 4, groupId: "system-mgmt" },
      { id: "dict-mgmt", title: "字典管理", defaultTitle: "字典管理", iconName: "BookOpen", visible: true, order: 5, groupId: "system-mgmt" },
      { id: "institution-mgmt", title: "机构管理", defaultTitle: "机构管理", iconName: "Building2", visible: true, order: 6, groupId: "system-mgmt" },
      { id: "menu-mgmt", title: "菜单管理", defaultTitle: "菜单管理", iconName: "ListTree", visible: true, order: 7, groupId: "system-mgmt", isCore: true },
    ]
  }
];

const STORAGE_KEY = "system_menu_configuration_v10";

export function getStoredMenuConfig(): MenuGroupConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      try { 
        localStorage.removeItem("system_menu_configuration_v9");
        localStorage.removeItem("system_menu_configuration_v8");
        localStorage.removeItem("system_menu_configuration_v7");
        localStorage.removeItem("system_menu_configuration_v6");
        localStorage.removeItem("system_menu_configuration_v5");
        localStorage.removeItem("system_menu_configuration_v4");
        localStorage.removeItem("system_menu_configuration_v3");
        localStorage.removeItem("system_menu_configuration_v2"); 
      } catch {}
      return DEFAULT_MENU_GROUPS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_MENU_GROUPS;
    }

    // Merge with defaults to ensure any new items (like menu-mgmt or new groups) are preserved
    const merged = DEFAULT_MENU_GROUPS.map(defGroup => {
      const storedGroup = parsed.find((g: any) => g.id === defGroup.id);
      if (!storedGroup) return defGroup;

      const mergedItems = defGroup.items.map(defItem => {
        const storedItem = (storedGroup.items || []).find((i: any) => i.id === defItem.id);
        if (!storedItem) return defItem;

        // Merge children if any
        let mergedChildren = defItem.children;
        if (defItem.children && storedItem.children) {
          mergedChildren = defItem.children.map(defChild => {
            const storedChild = storedItem.children.find((c: any) => c.id === defChild.id);
            return storedChild ? { ...defChild, ...storedChild } : defChild;
          });
          // sort children by order
          mergedChildren.sort((a, b) => (a.order || 0) - (b.order || 0));
        }

        return {
          ...defItem,
          ...storedItem,
          children: mergedChildren
        };
      });

      // Sort items by order
      mergedItems.sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        ...defGroup,
        ...storedGroup,
        order: storedGroup.order ?? defGroup.order,
        items: mergedItems
      };
    });

    // Sort groups by order
    merged.sort((a, b) => (a.order || 0) - (b.order || 0));
    return merged;
  } catch (err) {
    console.error("Failed to load stored menu config:", err);
    return DEFAULT_MENU_GROUPS;
  }
}

export function saveStoredMenuConfig(configs: MenuGroupConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent("system_menu_config_changed", { detail: configs }));
  } catch (err) {
    console.error("Failed to save menu config:", err);
  }
}

export function resetStoredMenuConfig(): MenuGroupConfig[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    try { 
      localStorage.removeItem("system_menu_configuration_v9");
      localStorage.removeItem("system_menu_configuration_v8");
      localStorage.removeItem("system_menu_configuration_v7");
      localStorage.removeItem("system_menu_configuration_v6");
      localStorage.removeItem("system_menu_configuration_v5");
      localStorage.removeItem("system_menu_configuration_v4");
      localStorage.removeItem("system_menu_configuration_v3");
      localStorage.removeItem("system_menu_configuration_v2"); 
    } catch {}
    window.dispatchEvent(new CustomEvent("system_menu_config_changed", { detail: DEFAULT_MENU_GROUPS }));
    return DEFAULT_MENU_GROUPS;
  } catch (err) {
    console.error("Failed to reset menu config:", err);
    return DEFAULT_MENU_GROUPS;
  }
}
