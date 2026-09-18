import { useState } from "react";
import { 
  Plus, 
  Search, 
  Users, 
  UserPlus, 
  UserMinus, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  User,
  Info,
  ChevronRight
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ProjectGroup, UserAccount } from "@/src/types";

// Mock Users for member selection
const MOCK_USERS: UserAccount[] = [
  { id: "1", username: "admin", realName: "系统管理员", phone: "13800138000", email: "admin@lab.com", roleId: "role-1", roleName: "管理员", status: "active", createdAt: "2024-01-01" },
  { id: "2", username: "operator_zhang", realName: "张工", phone: "13912345678", email: "zhang@lab.com", roleId: "role-2", roleName: "研究员", status: "active", createdAt: "2024-02-15" },
  { id: "3", username: "viewer_li", realName: "李博士", phone: "13588889999", email: "li@lab.com", roleId: "role-3", roleName: "普通成员", status: "active", createdAt: "2024-03-10" },
  { id: "4", username: "bio_wang", realName: "王生物", phone: "13766667777", email: "wang@lab.com", roleId: "role-2", roleName: "研究员", status: "active", createdAt: "2024-03-12" },
  { id: "5", username: "tech_chen", realName: "陈技术", phone: "13611112222", email: "chen@lab.com", roleId: "role-2", roleName: "研究员", status: "active", createdAt: "2024-03-15" },
];

export const MOCK_GROUPS: ProjectGroup[] = [
  { 
    id: "PG-001", 
    name: "病原宏基因组研究组", 
    description: "专注于呼吸道病原体宏基因组测序与分析", 
    creator: "admin", 
    createdAt: "2024-01-10 10:00:00",
    memberIds: ["1", "2", "4"]
  },
  { 
    id: "PG-002", 
    name: "耐药基因监控组", 
    description: "监控临床样本中的耐药基因分布", 
    creator: "admin", 
    createdAt: "2024-02-05 14:30:00",
    memberIds: ["1", "3", "5"]
  },
  {
    id: "PG-003",
    name: "肿瘤免疫微环境研究组",
    description: "聚焦肿瘤免疫微环境单细胞与免疫组库研究",
    creator: "admin",
    createdAt: "2024-03-18 09:20:00",
    memberIds: ["1", "2", "3"]
  },
];

export function ProjectGroupManagement() {
  const [groups, setGroups] = useState<ProjectGroup[]>(MOCK_GROUPS);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Group Dialog State
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProjectGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: ""
  });

  // Member Sheet State
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<ProjectGroup | null>(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");

  const handleOpenGroupDialog = (group?: ProjectGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData({
        name: group.name,
        description: group.description
      });
    } else {
      setEditingGroup(null);
      setGroupFormData({
        name: "",
        description: ""
      });
    }
    setIsGroupDialogOpen(true);
  };

  const handleSaveGroup = () => {
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    if (editingGroup) {
      setGroups(groups.map(g => g.id === editingGroup.id ? { ...g, ...groupFormData } : g));
    } else {
      const newGroup: ProjectGroup = {
        id: `PG-${Math.floor(100 + Math.random() * 900)}`,
        ...groupFormData,
        creator: "admin", // Current user
        createdAt: now,
        memberIds: []
      };
      setGroups([newGroup, ...groups]);
    }
    setIsGroupDialogOpen(false);
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const toggleMember = (groupId: string, userId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const isMember = g.memberIds.includes(userId);
        const newMemberIds = isMember 
          ? g.memberIds.filter(id => id !== userId)
          : [...g.memberIds, userId];
        
        const updatedGroup = { ...g, memberIds: newMemberIds };
        if (selectedGroupForMembers?.id === groupId) {
          setSelectedGroupForMembers(updatedGroup);
        }
        return updatedGroup;
      }
      return g;
    }));
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-6 min-w-0 w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">课题组管理</h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1">
            定义科研课题团队，管理成员权限与协作范围。
          </p>
        </div>
        <Button size="sm" className="tech-mono text-[10px] bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={() => handleOpenGroupDialog()}>
          <Plus className="w-3 h-3 mr-2" />
          创建课题组
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索课题组名称或 ID..."
            className="pl-8 tech-mono text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="tech-border bg-card shadow-sm w-full min-w-0 overflow-hidden">
        <ScrollArea className="h-[500px] w-full">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="tech-bg-soft sticky top-0 z-10 border-b">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="tech-header">课题组信息</TableHead>
                  <TableHead className="tech-header">成员数量</TableHead>
                  <TableHead className="tech-header">创建人</TableHead>
                  <TableHead className="tech-header">创建时间</TableHead>
                  <TableHead className="tech-header text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold tech-mono text-[#02A1C8]">{group.name}</span>
                        <span className="text-[10px] text-muted-foreground tech-mono">ID: {group.id}</span>
                        <span className="text-[10px] text-muted-foreground tech-mono mt-1 line-clamp-1">{group.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] tech-mono gap-1 cursor-pointer hover:bg-muted" onClick={() => setSelectedGroupForMembers(group)}>
                        <Users className="w-3 h-3" />
                        {group.memberIds.length} 人
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] tech-mono">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {group.creator}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground tech-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {group.createdAt}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="tech-mono text-xs">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>课题组操作</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenGroupDialog(group)}>
                              <Edit2 className="mr-2 h-3 w-3" /> 编辑信息
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedGroupForMembers(group)}>
                              <UserPlus className="mr-2 h-3 w-3" /> 成员管理
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteGroup(group.id)}>
                            <Trash2 className="mr-2 h-3 w-3" /> 删除课题组
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>

      {/* Group Info Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="tech-header text-sm">{editingGroup ? "编辑课题组" : "创建课题组"}</DialogTitle>
            <DialogDescription className="text-xs tech-mono">
              填写课题组的基本信息。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">课题组名称</Label>
              <Input 
                className="h-8 text-xs tech-mono" 
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                placeholder="例如：病原宏基因组研究组"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">描述</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs tech-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={groupFormData.description}
                onChange={(e) => setGroupFormData({...groupFormData, description: e.target.value})}
                placeholder="简述课题组的研究方向或职责..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsGroupDialogOpen(false)}>取消</Button>
            <Button size="sm" className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={handleSaveGroup}>
              {editingGroup ? "保存修改" : "确认创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Management Sheet */}
      <Sheet open={!!selectedGroupForMembers} onOpenChange={(open) => !open && setSelectedGroupForMembers(null)}>
        <SheetContent side="right" className="w-[50%] sm:max-w-[50%] p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b bg-muted/30">
              <div className="flex items-center gap-2 text-[#02A1C8] mb-1">
                <Users className="w-5 h-5" />
                <SheetTitle className="text-lg font-bold">成员管理</SheetTitle>
              </div>
              <SheetDescription className="text-xs tech-mono">
                正在管理课题组: <span className="text-foreground font-bold">{selectedGroupForMembers?.name}</span>
              </SheetDescription>
            </SheetHeader>
            
            <div className="p-6 space-y-6 flex-1 overflow-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索系统用户..."
                  className="pl-8 tech-mono text-xs"
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold tech-mono flex items-center gap-2">
                  <Info className="w-3 h-3 text-[#02A1C8]" />
                  系统用户列表
                </h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-[10px] tech-header">用户</TableHead>
                        <TableHead className="text-[10px] tech-header">角色</TableHead>
                        <TableHead className="text-[10px] tech-header text-right">状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_USERS.filter(u => 
                        u.username.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                        u.realName.toLowerCase().includes(memberSearchTerm.toLowerCase())
                      ).map((user) => {
                        const isMember = selectedGroupForMembers?.memberIds.includes(user.id);
                        return (
                          <TableRow key={user.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border text-[10px]">
                                  {user.realName.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold tech-mono">{user.realName}</span>
                                  <span className="text-[9px] text-muted-foreground tech-mono">{user.username}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[9px] tech-mono uppercase py-0">
                                {user.roleName || user.roleId}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant={isMember ? "destructive" : "outline"} 
                                size="sm" 
                                className="h-7 text-[9px] tech-mono"
                                onClick={() => selectedGroupForMembers && toggleMember(selectedGroupForMembers.id, user.id)}
                              >
                                {isMember ? (
                                  <>
                                    <UserMinus className="w-3 h-3 mr-1" /> 移除
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-3 h-3 mr-1" /> 添加
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-muted/10 text-right">
              <Button size="sm" className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={() => setSelectedGroupForMembers(null)}>
                完成
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
