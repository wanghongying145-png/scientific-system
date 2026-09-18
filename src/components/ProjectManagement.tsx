import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  User, 
  Building2, 
  Stethoscope, 
  Calendar,
  Edit2,
  Trash2,
  FolderKanban,
  Check,
  Info,
  Database,
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
import { Project, PI } from "@/src/types";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectEditor } from './ProjectEditor';
import { ProjectSamples } from './ProjectSamples';
import { useProjectPIs } from '../lib/projectStore';
import { useAccessibleProjects } from '../lib/researchAccess';
import { researchTypeName } from '../lib/projectDomain';

export interface ProjectManagementProps {
  initialSelectedProject?: Project | null;
}

export function ProjectManagement({ initialSelectedProject }: ProjectManagementProps = {}) {
  const [projects, setProjects] = useAccessibleProjects();
  const [pis, setPis] = useProjectPIs();
  const [viewMode, setViewMode] = useState<"list" | "detail">(initialSelectedProject ? "detail" : "list");
  const [editorProject, setEditorProject] = useState<Project | null | undefined>(undefined);
  const [isPIDialogOpen, setIsPIDialogOpen] = useState(false);
  const [isAddEditPIDialogOpen, setIsAddEditPIDialogOpen] = useState(false);
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialSelectedProject?.id || null);
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const setSelectedProject = (project: Project | null) => setSelectedProjectId(project?.id || null);
  const [projectError, setProjectError] = useState('');

  // PI Management Search States
  const [piSearchName, setPiSearchName] = useState("");
  const [piSearchInstitution, setPiSearchInstitution] = useState("");
  const [piSearchDepartment, setPiSearchDepartment] = useState("");

  // PI Form State
  const [piForm, setPiForm] = useState<Omit<PI, 'id'>>({
    name: "",
    institution: "",
    department: ""
  });
  const [editingPiId, setEditingPiId] = useState<string | null>(null);

  const filteredPis = pis.filter(pi => pi.name.includes(piSearchName) && pi.institution.includes(piSearchInstitution) && pi.department.includes(piSearchDepartment));
  const handleOpenEditProject = (project: Project) => setEditorProject(project);

  const handleSavePI = () => {
    if (!piForm.name || !piForm.institution) return;

    if (editingPiId) {
      setPis(pis.map(pi => pi.id === editingPiId ? { ...pi, ...piForm } : pi));
      setProjects(previous => previous.map(p => p.piId === editingPiId ? { ...p, piName: piForm.name,
        steps: p.steps?.map(s => ({ ...s, piReviewer: piForm.name, ...(s.leadId === editingPiId ? { leadPerson: piForm.name } : {}) })) } : p));
    } else {
      const newPi: PI = {
        id: Math.random().toString(36).substr(2, 9),
        ...piForm
      };
      setPis([...pis, newPi]);
    }
    setIsAddEditPIDialogOpen(false);
    setPiForm({ name: "", institution: "", department: "" });
    setEditingPiId(null);
  };

  const handleOpenEditPI = (pi: PI) => {
    setPiForm({
      name: pi.name,
      institution: pi.institution,
      department: pi.department
    });
    setEditingPiId(pi.id);
    setIsAddEditPIDialogOpen(true);
  };

  const getPiProjectCount = (piId: string) => {
    return projects.filter(p => p.piId === piId).length;
  };

  const handleDeleteProject = (id: string) => {
    try { setProjects(projects.filter(p => p.id !== id)); setProjectError(''); } catch(e) { setProjectError((e as Error).message); }
  };

  const handleOpenAssociate = (project: Project) => {
    setSelectedProject(project);
    setIsAssociateDialogOpen(true);
  };

  const handleOpenDetails = (project: Project) => {
    setSelectedProject(project);
    setViewMode("detail");
  };

  if (viewMode === "detail" && selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={() => setViewMode("list")}
        onUpdateProject={(updatedProject) => {
          setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
          setSelectedProject(updatedProject);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 p-6 min-w-0 w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
            <span className="text-slate-600">科研中台</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-foreground font-semibold">项目管理</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">项目管理</h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1">
            科研中台核心模块，统一管理科研项目档案、PI 负责人信息及科研样本与实验节点关联。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isPIDialogOpen} onOpenChange={setIsPIDialogOpen}>
            <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "tech-mono text-[10px]")}>
              <User className="w-3 h-3 mr-2" />
              管理 PI 信息
            </DialogTrigger>
            <DialogContent className="sm:max-w-[720px] w-full h-[600px] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-5 pb-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#02A1C8]" />
                  <DialogTitle className="tech-mono uppercase tracking-wider text-lg">PI 管理</DialogTitle>
                </div>
                <DialogDescription className="text-[10px] tech-mono mt-0.5 whitespace-nowrap">管理系统中的项目负责人信息，支持多维查询及基础档案维护。</DialogDescription>
              </DialogHeader>
              <div className="px-6 py-4 space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="flex flex-col gap-3 shrink-0">
                  <div className="flex items-center gap-2 flex-nowrap">
                    <Input 
                      placeholder="PI 姓名" 
                      className="h-8 text-[11px] tech-mono w-24 border-slate-200" 
                      value={piSearchName}
                      onChange={(e) => setPiSearchName(e.target.value)}
                    />
                    <Input 
                      placeholder="单位" 
                      className="h-8 text-[11px] tech-mono w-28 border-slate-200" 
                      value={piSearchInstitution}
                      onChange={(e) => setPiSearchInstitution(e.target.value)}
                    />
                    <Input 
                      placeholder="科室" 
                      className="h-8 text-[11px] tech-mono w-28 border-slate-200" 
                      value={piSearchDepartment}
                      onChange={(e) => setPiSearchDepartment(e.target.value)}
                    />
                    <Button variant="outline" size="sm" className="h-8 tech-mono text-[10px] px-2" onClick={() => {
                      setPiSearchName("");
                      setPiSearchInstitution("");
                      setPiSearchDepartment("");
                    }}>
                      重置
                    </Button>
                    <Button size="sm" className="h-8 tech-mono text-[10px] px-3 bg-[#02A1C8] hover:bg-[#0281a0]">
                      <Search className="w-3.5 h-3.5 mr-1" />
                      查询
                    </Button>
                    <div className="flex-1 min-w-[10px]" />
                    <Button size="sm" className="h-8 tech-mono text-[10px] px-3 bg-[#02A1C8] hover:bg-[#0281a0] whitespace-nowrap" onClick={() => {
                      setPiForm({ name: "", institution: "", department: "" });
                      setEditingPiId(null);
                      setIsAddEditPIDialogOpen(true);
                    }}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> 新增 PI
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden flex-1 flex flex-col min-h-0 bg-white">
                  <ScrollArea className="flex-1">
                    <Table>
                      <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b">
                        <TableRow className="hover:bg-transparent tracking-tighter">
                          <TableHead className="text-[10px] tech-mono uppercase font-bold h-9">PI 姓名</TableHead>
                          <TableHead className="text-[10px] tech-mono uppercase font-bold h-9">所属单位</TableHead>
                          <TableHead className="text-[10px] tech-mono uppercase font-bold h-9">科室</TableHead>
                          <TableHead className="text-[10px] tech-mono uppercase font-bold h-9 text-center">关联项目数</TableHead>
                          <TableHead className="text-[10px] tech-mono uppercase font-bold h-9 text-right pr-4">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPis.length > 0 ? (
                          filteredPis.map(pi => (
                            <TableRow key={pi.id} className="group hover:bg-slate-50/50">
                              <TableCell className="py-2.5">
                                <span className="text-[11px] font-bold text-slate-700">{pi.name}</span>
                              </TableCell>
                              <TableCell className="text-[10px] text-slate-500 py-2.5">{pi.institution}</TableCell>
                              <TableCell className="text-[10px] text-slate-500 py-2.5">{pi.department}</TableCell>
                              <TableCell className="text-[10px] text-center font-mono py-2.5">
                                <span className="text-[#02A1C8] font-bold">{getPiProjectCount(pi.id)}</span>
                              </TableCell>
                              <TableCell className="text-right pr-4 py-2.5">
                                <div className="flex items-center justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-primary hover:bg-primary/5 text-[9px] tech-mono px-2"
                                    onClick={() => handleOpenEditPI(pi)}
                                  >
                                    编辑
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-[10px] tech-mono">
                              未查询到相关 PI 信息
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
              <DialogFooter className="p-4 bg-slate-50 border-t flex items-center justify-end">
                <Button variant="outline" size="sm" className="px-6 h-8 text-[11px]" onClick={() => setIsPIDialogOpen(false)}>取消</Button>
                <Button size="sm" className="px-6 h-8 text-[11px] bg-[#02A1C8] hover:bg-[#0281a0]" onClick={() => setIsPIDialogOpen(false)}>
                  确认
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add/Edit PI Dialog */}
          <Dialog open={isAddEditPIDialogOpen} onOpenChange={setIsAddEditPIDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="tech-mono uppercase tracking-wider">{editingPiId ? "编辑 PI 信息" : "新增 PI 信息"}</DialogTitle>
                <DialogDescription className="text-xs tech-mono">填写项目负责人（PI）的详细背景资料。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <Label className="text-[10px] tech-mono uppercase font-bold">PI 姓名</Label>
                  <Input 
                    value={piForm.name} 
                    onChange={e => setPiForm({...piForm, name: e.target.value})}
                    placeholder="输入姓名" 
                    className="h-9 text-xs tech-mono border-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] tech-mono uppercase font-bold">所属单位</Label>
                  <Input 
                    value={piForm.institution} 
                    onChange={e => setPiForm({...piForm, institution: e.target.value})}
                    placeholder="输入医院或研究机构" 
                    className="h-9 text-xs tech-mono border-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] tech-mono uppercase font-bold">所属科室</Label>
                  <Input 
                    value={piForm.department} 
                    onChange={e => setPiForm({...piForm, department: e.target.value})}
                    placeholder="输入科室名称" 
                    className="h-9 text-xs tech-mono border-slate-200" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setIsAddEditPIDialogOpen(false)}>取消</Button>
                <Button size="sm" onClick={handleSavePI}>保存 PI 信息</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button size="sm" onClick={() => setEditorProject(null)}><Plus className="size-3 mr-2" />创建新项目</Button>
          {editorProject !== undefined && <ProjectEditor
            project={editorProject || undefined} projects={projects} pis={pis}
            onClose={() => setEditorProject(undefined)}
            onSave={project => setProjects(prev => prev.some(p => p.id === project.id) ? prev.map(p => p.id === project.id ? project : p) : [project, ...prev])}
          />}
        </div>
      </div>

      {projectError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{projectError}</p>}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="按项目编号、名称或 PI 搜索..."
            className="pl-8 tech-mono text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md tech-border bg-card overflow-hidden shadow-sm">
        <ScrollArea className="h-[500px] w-full">
          <div className="w-full overflow-x-auto">
            <Table>
            <TableHeader className="tech-bg-soft sticky top-0 z-10 border-b">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="tech-header w-[150px]">项目编号</TableHead>
                <TableHead className="tech-header">项目名称</TableHead>
                <TableHead className="tech-header">研究类型 / 节点</TableHead>
                <TableHead className="tech-header">项目 PI</TableHead>
                <TableHead className="tech-header">单位</TableHead>
                <TableHead className="tech-header">状态</TableHead>
                <TableHead className="tech-header">创建日期</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.filter(p => 
                p.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.piName?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((project) => (
                <TableRow key={project.id}>
                  <TableCell 
                    className="tech-mono text-xs font-medium cursor-pointer hover:text-[#02A1C8] transition-colors"
                    onClick={() => handleOpenDetails(project)}
                  >
                    {project.number}
                  </TableCell>
                  <TableCell 
                    className="text-xs cursor-pointer hover:text-[#02A1C8] transition-colors"
                    onClick={() => handleOpenDetails(project)}
                  >
                    {project.name}
                  </TableCell>
                  <TableCell className="text-xs"><div>{researchTypeName(project.researchType)}</div><div className="text-[11px] text-slate-400">{project.steps?.length || 0} 个节点</div></TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full tech-bg-soft flex items-center justify-center border border-[#96C2E1]/20">
                        <User className="w-3 h-3 text-[#02A1C8]" />
                      </div>
                      <span>{project.piName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{project.institution}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`text-[10px] tech-mono uppercase border-none ${
                        project.status === 'active' ? 'bg-blue-100 text-[#02A1C8]' : 
                        project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {project.status === 'active' ? '进行中' : 
                       project.status === 'completed' ? '已结题' : 
                       project.status === 'on-hold' ? '暂停' : '已归档'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground tech-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {project.createdAt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="tech-mono text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>项目操作</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenDetails(project)}>
                            <Info className="mr-2 h-3 w-3" /> 项目详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEditProject(project)}>
                            <Edit2 className="mr-2 h-3 w-3" /> 编辑项目
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAssociate(project)}>
                            <FolderKanban className="mr-2 h-3 w-3" /> 关联样本
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="mr-2 h-3 w-3" /> 删除项目
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
      </div>

      {/* Both project entry points use the same sample ledger. */}
      <Dialog open={isAssociateDialogOpen} onOpenChange={setIsAssociateDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>项目样本 · {selectedProject?.number}</DialogTitle><DialogDescription>{selectedProject?.name}</DialogDescription></DialogHeader>
          {selectedProject && <ProjectSamples project={selectedProject} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

