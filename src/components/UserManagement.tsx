import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  User, 
  Shield, 
  Calendar,
  Edit2,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  KeyRound,
  Send,
  CheckCircle2
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
import { cn } from "@/lib/utils";
import { UserAccount } from "@/src/types";

const MOCK_USERS: UserAccount[] = [
  { 
    id: "1", 
    username: "admin", 
    realName: "系统管理员", 
    phone: "13800138000",
    email: "admin@lab.com", 
    roleId: "role-1",
    roleName: "管理员",
    status: "active", 
    createdAt: "2024-01-01" 
  },
  { 
    id: "2", 
    username: "operator_zhang", 
    realName: "张工", 
    phone: "13912345678",
    email: "zhang@lab.com", 
    roleId: "role-2",
    roleName: "研究员",
    status: "active", 
    createdAt: "2024-02-15" 
  },
  { 
    id: "3", 
    username: "viewer_li", 
    realName: "李博士", 
    phone: "13588889999",
    email: "li@lab.com", 
    roleId: "role-3",
    roleName: "普通成员",
    status: "disabled", 
    createdAt: "2024-03-10" 
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [resetFormData, setResetFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [formData, setFormData] = useState({
    username: "",
    realName: "",
    phone: "",
    email: "",
    roleId: "role-3",
    status: "active" as UserAccount['status']
  });

  const handleOpenDialog = (user?: UserAccount) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        roleId: user.roleId,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        realName: "",
        phone: "",
        email: "",
        roleId: "role-3",
        status: "active"
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenResetDialog = (user: UserAccount) => {
    setEditingUser(user);
    setResetFormData({
      newPassword: "",
      confirmPassword: ""
    });
    setIsResetDialogOpen(true);
  };

  const handleResetPassword = () => {
    if (resetFormData.newPassword.trim() === "") {
      alert("请输入新密码");
      return;
    }
    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }
    
    // Simulate reset
    alert(`用户 ${editingUser?.username} 的密码已成功重置`);
    setIsResetDialogOpen(false);
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: UserAccount = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([newUser, ...users]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-6 min-w-0 w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">用户管理</h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1">
            管理系统访问权限、用户信息及账号状态。
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger 
            className={cn(buttonVariants({ size: "sm" }), "tech-mono text-[10px] bg-[#02A1C8] hover:bg-[#02A1C8]/90")}
            onClick={() => handleOpenDialog()}
          >
            <UserPlus className="w-3 h-3 mr-2" />
            创建用户
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="tech-header text-sm">{editingUser ? "编辑用户" : "创建新用户"}</DialogTitle>
              <DialogDescription className="text-xs tech-mono">
                请填写用户的基本信息及系统角色。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">用户名</Label>
                  <Input 
                    className="h-8 text-xs tech-mono" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="请输入登录账号"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">真实姓名</Label>
                  <Input 
                    className="h-8 text-xs tech-mono" 
                    value={formData.realName}
                    onChange={(e) => setFormData({...formData, realName: e.target.value})}
                    placeholder="请输入用户姓名"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">手机号码</Label>
                  <Input 
                    className="h-8 text-xs tech-mono" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="请输入手机号"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">电子邮箱</Label>
                  <Input 
                    className="h-8 text-xs tech-mono" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="请输入邮箱地址"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">角色</Label>
                  <select 
                    className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs tech-mono"
                    value={formData.roleId}
                    onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                  >
                    <option value="role-1">管理员</option>
                    <option value="role-2">研究员</option>
                    <option value="role-3">普通成员</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">状态</Label>
                  <select 
                    className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs tech-mono"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as UserAccount['status']})}
                  >
                    <option value="active">启用</option>
                    <option value="disabled">禁用</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>取消</Button>
              <Button size="sm" className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={handleSave}>
                {editingUser ? "保存修改" : "确认创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="tech-header text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#02A1C8]" />
                重置用户密码
              </DialogTitle>
              <DialogDescription className="text-xs tech-mono">
                请输入新密码并确认以完成重置。
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">新密码</Label>
                  <Input 
                    type="password"
                    className="h-9 text-xs tech-mono" 
                    placeholder="请输入新密码"
                    value={resetFormData.newPassword}
                    onChange={(e) => setResetFormData({...resetFormData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">确认新密码</Label>
                  <Input 
                    type="password"
                    className="h-9 text-xs tech-mono" 
                    placeholder="请再次输入新密码"
                    value={resetFormData.confirmPassword}
                    onChange={(e) => setResetFormData({...resetFormData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsResetDialogOpen(false)}>取消</Button>
              <Button 
                size="sm" 
                className="bg-[#02A1C8] hover:bg-[#02A1C8]/90"
                onClick={handleResetPassword}
              >
                确认重置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户名、姓名、邮箱..."
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
              <TableHead className="tech-header">用户名</TableHead>
              <TableHead className="tech-header">用户姓名</TableHead>
              <TableHead className="tech-header">手机号</TableHead>
              <TableHead className="tech-header">邮箱</TableHead>
              <TableHead className="tech-header">所属角色</TableHead>
              <TableHead className="tech-header">是否启用</TableHead>
              <TableHead className="tech-header text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell className="text-xs tech-mono font-bold">{user.username}</TableCell>
                    <TableCell className="text-xs tech-mono">{user.realName}</TableCell>
                    <TableCell className="text-xs tech-mono">{user.phone}</TableCell>
                    <TableCell className="text-xs tech-mono">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] tech-mono uppercase border-none bg-muted">
                        {user.roleId === 'role-1' ? '管理员' : user.roleId === 'role-2' ? '研究员' : '普通成员'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] tech-mono px-1.5 py-0 border-none ${
                          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status === 'active' ? '是' : '否'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="tech-mono text-xs">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>账号操作</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                              <Edit2 className="mr-2 h-3 w-3" /> 编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenResetDialog(user)}>
                              <Shield className="mr-2 h-3 w-3" /> 重置密码
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u))}>
                              {user.status === 'active' ? <UserX className="mr-2 h-3 w-3" /> : <UserCheck className="mr-2 h-3 w-3" />}
                              {user.status === 'active' ? '禁用' : '启用'}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="mr-2 h-3 w-3" /> 删除
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
    </div>
  );
}
