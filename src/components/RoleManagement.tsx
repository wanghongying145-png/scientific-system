import { useState } from "react";
import { 
  Plus, 
  Search, 
  Shield, 
  MoreHorizontal, 
  Check,
  ChevronRight,
  ChevronDown,
  Lock,
  Database,
  Users,
  Settings
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Role, PermissionNode } from "@/src/types";
import { cn } from "@/lib/utils";

const initialRoles: Role[] = [
  {
    id: "role-1",
    name: "管理员",
    code: "ADMIN",
    description: "系统超级管理员，拥有所有模块的最高权限。",
    permissionIds: ["all"],
    status: "active",
    createdAt: "2024-01-01"
  },
  {
    id: "role-2",
    name: "研究员",
    code: "RESEARCHER",
    description: "主要负责科研数据分析、项目管理和结果查看。",
    permissionIds: ["workbench", "project-mgmt", "sample-mgmt", "pathogen", "immuno", "special-db", "ai-drug"],
    status: "active",
    createdAt: "2024-01-05"
  },
  {
    id: "role-3",
    name: "普通成员",
    code: "MEMBER",
    description: "基础权限，可进行样本登记和基础数据查询。",
    permissionIds: ["sample-mgmt", "results-mgmt"],
    status: "active",
    createdAt: "2024-02-10"
  }
];

const permissionTree: PermissionNode[] = [
  {
    id: "research-middle-platform",
    label: "科研中台",
    type: "module",
    children: [
      { id: "workbench", label: "工作台", type: "menu" },
      { id: "project-mgmt", label: "项目管理", type: "menu" },
      { id: "sample-mgmt", label: "样本管理", type: "menu" },
      { id: "raw-data-mgmt", label: "原始数据管理", type: "menu" },
    ]
  },
  {
    id: "bio-analysis",
    label: "生信分析系统",
    type: "module",
    children: [
      { id: "tool-mgmt", label: "工具管理", type: "menu", children: [
        { id: "tool-create", label: "新建工具", type: "function" }
      ]},
      { id: "analysis-workflow", label: "分析工作流", type: "menu", children: [
        { id: "workflow-create", label: "创建工作流", type: "function" },
        { id: "workflow-edit", label: "编辑工作流", type: "function" }
      ]},
      { id: "task-monitor", label: "任务监控", type: "menu" },
      { id: "results-mgmt", label: "结果管理", type: "menu" },
    ]
  },
  {
    id: "disease-db",
    label: "专病数据库",
    type: "module",
    children: [
      { id: "public-db-mgmt", label: "公共数据库管理", type: "menu", children: [
        { id: "public-db-view", label: "查看详情", type: "function" },
        { id: "public-db-update", label: "手动更新", type: "function" },
        { id: "public-db-edit", label: "编辑", type: "function" },
        { id: "public-db-access", label: "课题组查看权限", type: "function" },
      ]},
      { id: "custom-db-mgmt", label: "自建数据库", type: "menu" },
    ]
  },
  {
    id: "ai-drug",
    label: "AI药物发现平台",
    type: "module",
    children: [
      { id: "model-center", label: "模型中心", type: "menu" },
      { id: "task-center", label: "任务中心", type: "menu" },
    ]
  },
  {
    id: "system-mgmt",
    label: "系统管理",
    type: "module",
    children: [
      { id: "user-mgmt", label: "用户管理", type: "menu" },
      { id: "role-mgmt", label: "角色管理", type: "menu" },
      { id: "group-mgmt", label: "课题组管理", type: "menu" },
      { id: "dict-mgmt", label: "字典管理", type: "menu" },
    ]
  }
];

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [activeRoleId, setActiveRoleId] = useState<string>(initialRoles[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["research-middle-platform", "bio-analysis", "system-mgmt"]));
  
  // Dialog State
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    code: "",
    description: ""
  });

  const activeRole = roles.find(r => r.id === activeRoleId) || roles[0] || { name: "", code: "", description: "", permissionIds: [] };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleFormData({
      name: "",
      code: "",
      description: ""
    });
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      code: role.code,
      description: role.description
    });
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      // Update
      setRoles(roles.map(r => r.id === editingRole.id ? { 
        ...r, 
        name: roleFormData.name, 
        description: roleFormData.description 
      } : r));
    } else {
      // Create
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleFormData.name,
        code: roleFormData.code,
        description: roleFormData.description,
        permissionIds: [],
        status: "active",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoles([...roles, newRole]);
      setActiveRoleId(newRole.id);
    }
    setIsRoleDialogOpen(false);
  };

  const handleDeleteRole = (id: string) => {
    const newRoles = roles.filter(r => r.id !== id);
    setRoles(newRoles);
    if (activeRoleId === id && newRoles.length > 0) {
      setActiveRoleId(newRoles[0].id);
    }
  };

  const getAllNodeIds = (nodes: PermissionNode[]): string[] => {
    let ids: string[] = [];
    nodes.forEach(node => {
      ids.push(node.id);
      if (node.children) {
        ids = [...ids, ...getAllNodeIds(node.children)];
      }
    });
    return ids;
  };

  const getAllParentIds = (nodes: PermissionNode[]): string[] => {
    let ids: string[] = [];
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        ids = [...ids, ...getAllParentIds(node.children)];
      }
    });
    return ids;
  };

  const handleSelectAll = () => {
    const allIds = getAllNodeIds(permissionTree);
    setRoles(roles.map(r => r.id === activeRoleId ? { ...r, permissionIds: allIds } : r));
  };

  const handleDeselectAll = () => {
    setRoles(roles.map(r => r.id === activeRoleId ? { ...r, permissionIds: [] } : r));
  };

  const handleExpandAll = () => {
    const allParentIds = getAllParentIds(permissionTree);
    setExpandedNodes(new Set(allParentIds));
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  const togglePermission = (id: string) => {
    setRoles(roles.map(r => {
      if (r.id === activeRoleId) {
        const pIds = r.permissionIds || [];
        return {
          ...r,
          permissionIds: pIds.includes(id)
            ? pIds.filter(pid => pid !== id)
            : [...pIds, id]
        };
      }
      return r;
    }));
  };

  const renderPermissionNode = (node: PermissionNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const pIds = (activeRole && activeRole.permissionIds) || [];
    const isSelected = pIds.includes(node.id) || pIds.includes("all");

    return (
      <div key={node.id} className="select-none">
        <div 
          className={cn(
            "flex items-center py-2.5 px-3 hover:bg-muted/50 cursor-pointer transition-colors rounded-sm group",
            level === 0 && "font-bold text-[13px] border-b border-transparent",
            level > 0 && "text-xs"
          )}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={(e) => {
            if (hasChildren && (e.target as HTMLElement).closest('.collapse-trigger')) {
              toggleNode(node.id);
            } else {
              togglePermission(node.id);
            }
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="collapse-trigger p-0.5 hover:bg-muted rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleNode(node.id);
              }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <div className="w-3.5 h-3.5" />
              )}
            </div>
            
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              isSelected ? "bg-[#02A1C8] border-[#02A1C8] text-white" : "border-slate-300 bg-background"
            )}>
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>

            <span className={cn(
              isSelected ? "text-slate-900 font-medium" : "text-slate-500",
              level === 0 && "uppercase tracking-tight"
            )}>
              {node.label}
            </span>
            
            {node.type === 'function' && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border-slate-200">FN</Badge>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            {node.children!.map(child => renderPermissionNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">角色管理</h2>
          <p className="text-muted-foreground text-sm tech-mono">
            配置系统访问角色及其对应的功能权限矩阵。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Role List */}
        <Card className="col-span-4 flex flex-col tech-border bg-background/50">
          <CardHeader className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                角色列表
              </CardTitle>
              <Button 
                size="sm" 
                variant="destructive" 
                className="h-7 px-2 text-[10px] tech-mono"
                onClick={handleAddRole}
              >
                添加
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="搜索角色名称/编码..."
                className="pl-8 h-9 text-xs tech-mono bg-muted/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all border border-transparent",
                      activeRoleId === role.id 
                        ? "bg-primary/5 border-primary/20 shadow-sm" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setActiveRoleId(role.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-bold",
                          activeRoleId === role.id ? "text-primary" : "text-foreground"
                        )}>
                          {role.name}
                        </span>
                        {role.code === 'ADMIN' && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-[10px] tech-mono text-muted-foreground uppercase">
                        {role.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeRoleId === role.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity")}>
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="tech-mono text-xs">
                          <DropdownMenuItem onClick={() => handleEditRole(role)}>编辑角色</DropdownMenuItem>
                          <DropdownMenuItem>复制角色</DropdownMenuItem>
                          <Separator className="my-1" />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRole(role.id)}>删除角色</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Permission Config */}
        <Card className="col-span-8 flex flex-col tech-border bg-background/50 overflow-hidden">
          <Tabs defaultValue="permissions" className="flex flex-col h-full">
            <CardHeader className="p-0 border-b">
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {activeRole.name}
                      <Badge variant="outline" className="tech-mono text-[9px] font-normal uppercase">
                        {activeRole.code}
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeRole.description}
                    </p>
                  </div>
                  <Button size="sm" className="tech-mono text-[10px] h-8">
                    保存配置
                  </Button>
                </div>
                <TabsList className="bg-muted/50 p-1 h-9">
                  <TabsTrigger value="permissions" className="text-xs tech-mono px-4 h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    功能权限分配
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <TabsContent value="permissions" className="flex-1 m-0 p-0 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="bg-[#f8fafc] px-6 py-3 flex items-center justify-between border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#02A1C8] rounded-full" />
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider tech-mono">权限矩阵配置矩阵 / PERMISSION_MATRIX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-7 px-3 tech-mono text-[#02A1C8] hover:text-[#02A1C8] hover:bg-[#02A1C8]/5 font-bold"
                      onClick={handleSelectAll}
                    >
                      全选
                    </Button>
                    <Separator orientation="vertical" className="h-3 bg-slate-200" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-7 px-3 tech-mono text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold"
                      onClick={handleDeselectAll}
                    >
                      取消全选
                    </Button>
                    <Separator orientation="vertical" className="h-3 bg-slate-200" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-7 px-3 tech-mono text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold"
                      onClick={expandedNodes.size === getAllParentIds(permissionTree).length ? handleCollapseAll : handleExpandAll}
                    >
                      {expandedNodes.size === getAllParentIds(permissionTree).length ? "收起全部" : "展开全部"}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-4">
                    <div className="tech-border rounded-lg overflow-hidden bg-background">
                      {permissionTree.map(node => renderPermissionNode(node))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="tech-header text-sm">
              {editingRole ? "编辑角色" : "新增角色"}
            </DialogTitle>
            <DialogDescription className="text-xs tech-mono">
              {editingRole ? "修改角色的基本信息。" : "创建一个新的系统访问角色。"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">角色名称</Label>
              <Input 
                className="h-8 text-xs tech-mono" 
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                placeholder="请输入角色名称"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">角色编码</Label>
              <Input 
                className="h-8 text-xs tech-mono" 
                value={roleFormData.code}
                onChange={(e) => setRoleFormData({...roleFormData, code: e.target.value})}
                placeholder="请输入角色编码"
                disabled={!!editingRole}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">角色备注</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs tech-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                placeholder="请输入角色备注信息..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsRoleDialogOpen(false)}>取消</Button>
            <Button size="sm" className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={handleSaveRole}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
