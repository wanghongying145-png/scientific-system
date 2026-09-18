import { currentUsername, setSessionUser, useIdentity } from './lib/session';
import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/src/components/AppSidebar";
import { Login } from "@/src/components/Login";

import { SampleManagement } from "./components/SampleManagement";
import { CustomDatabase } from "./components/CustomDatabase";
import { ProteinPredictionTask } from "./components/ProteinPredictionTask";
import { ProteinPredictionResult } from "./components/ProteinPredictionResult";
import { ScaffoldHoppingTask } from "./components/ScaffoldHoppingTask";
import { ScaffoldHoppingResult } from "./components/ScaffoldHoppingResult";
import { RlMoleculeGenerationTask } from "./components/RlMoleculeGenerationTask";
import { RlMoleculeGenerationResult } from "./components/RlMoleculeGenerationResult";
import { RetrosynthesisTask } from "./components/RetrosynthesisTask";
import { RetrosynthesisResult } from "./components/RetrosynthesisResult";
import { ModelCenter } from "./components/ModelCenter";
import { TaskCenter } from "./components/TaskCenter";
import { VirtualScreeningTask } from "./components/VirtualScreeningTask";
import { VirtualScreeningTask2 } from "./components/VirtualScreeningTask2";
import { VirtualScreeningResult } from "./components/VirtualScreeningResult";
import { TargetDiscoveryTask } from "./components/TargetDiscoveryTask";
import { TargetDiscoveryResult } from "./components/TargetDiscoveryResult";
import { PotentialTargetPredictionTask } from "./components/PotentialTargetPredictionTask";
import { PotentialTargetPredictionResult } from "./components/PotentialTargetPredictionResult";
import { ProjectManagement } from "./components/ProjectManagement";
import { Workbench } from "./components/Workbench";
import { AnalysisWorkflow } from "./components/AnalysisWorkflow";
import { TaskMonitor } from "./components/TaskMonitor";
import { DatasetManagement } from "./components/DatasetManagement";
import { ResearchAssistant } from "./components/ResearchAssistant";
import { RawDataManagement } from "./components/RawDataManagement";
import { ResultsManagement } from "./components/ResultsManagement";
import { UserManagement } from "./components/UserManagement";
import { StorageManagement } from "./components/StorageManagement";
import { RoleManagement } from "./components/RoleManagement";
import { ProjectGroupManagement } from "./components/ProjectGroupManagement";
import { DictionaryManagement } from "./components/DictionaryManagement";
import { InstitutionManagement } from "./components/InstitutionManagement";
import { MenuManagement } from "./components/MenuManagement";
import { ToolManagement } from "./components/ToolManagement";
import { AddToolWizard } from "./components/AddToolWizard";
import { ToolDetail } from "./components/ToolDetail";
import { TaxonomyAnnotationTask } from "./components/TaxonomyAnnotationTask";
import { PublicDatabaseManagement } from "./components/public-database/PublicDatabaseManagement";
import { getStoredMenuConfig } from "@/src/lib/menuConfig";
import { 
  Bell, 
  Search, 
  User, 
  Terminal,
  ChevronRight,
  Home,
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentUsername());
  const [currentUser, setCurrentUser] = useState<string | null>(currentUsername() || null);
  const identity = useIdentity();
  const [activeId, setActiveId] = useState("workbench");
  const [selectedPtpTaskId, setSelectedPtpTaskId] = useState("");
  const [selectedVsTaskId, setSelectedVsTaskId] = useState("");
  const [selectedPpTaskId, setSelectedPpTaskId] = useState("");
  const [selectedShTaskId, setSelectedShTaskId] = useState("");
  const [selectedRlTaskId, setSelectedRlTaskId] = useState("");
  const [selectedRsTaskId, setSelectedRsTaskId] = useState("");
  const [selectedTdTask, setSelectedTdTask] = useState<any>(null);
  const [selectedToolId, setSelectedToolId] = useState("");
  const [editingTool, setEditingTool] = useState<any>(null);
  const [selectedWorkbenchProject, setSelectedWorkbenchProject] = useState<any>(null);
  const [assistantDatasetId, setAssistantDatasetId] = useState("");
  useEffect(() => {
    const openDataset = (event: Event) => { setAssistantDatasetId((event as CustomEvent<string>).detail); setActiveId("dataset-mgmt"); };
    const openProject = (event: Event) => { setSelectedWorkbenchProject((event as CustomEvent<any>).detail); setActiveId("project-mgmt"); };
    const openNode = (event: Event) => { const detail = (event as CustomEvent<any>).detail; setSelectedWorkbenchProject(detail.project); setActiveId("project-mgmt"); };
    window.addEventListener("research-assistant-open-dataset", openDataset);
    window.addEventListener("research-assistant-open-project", openProject);
    window.addEventListener("research-assistant-open-node", openNode);
    return () => { window.removeEventListener("research-assistant-open-dataset", openDataset); window.removeEventListener("research-assistant-open-project", openProject); window.removeEventListener("research-assistant-open-node", openNode); };
  }, []);

  const handleLogin = (username: string) => {
    setSessionUser(username);
    setCurrentUser(username);
    setSelectedWorkbenchProject(null);
    setActiveId("workbench");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setSessionUser(null);
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const getBreadcrumbInfo = () => {
    const groups = getStoredMenuConfig();
    for (const group of groups) {
      for (const item of group.items) {
        if (item.id === activeId) {
          return { groupTitle: group.title, itemTitle: item.title };
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.id === activeId) {
              return { groupTitle: group.title, parentTitle: item.title, itemTitle: child.title };
            }
          }
        }
      }
    }
    if (activeId === "tool-create") return { groupTitle: "生信分析系统", parentTitle: "工具管理", itemTitle: "新建/编辑工具" };
    if (activeId === "tool-detail") return { groupTitle: "生信分析系统", parentTitle: "工具管理", itemTitle: "工具详情" };
    return { groupTitle: "系统", itemTitle: activeId.replace(/-/g, " ") };
  };

  const breadcrumb = getBreadcrumbInfo();

  const renderContent = () => {
    switch (activeId) {
      case "public-db-mgmt":
        return <PublicDatabaseManagement currentUserRole={currentUser === 'admin' ? 'admin' : 'user'} />;
      case "sample-mgmt":
        return <SampleManagement />;
      case "custom-db-mgmt":
        return <CustomDatabase />;
      case "tool-mgmt":
        return <ToolManagement 
          onSelectTool={(id) => {
            setSelectedToolId(id);
            setActiveId("tool-detail");
          }} 
          onAddTool={() => {
            setEditingTool(null);
            setActiveId("tool-create");
          }}
          onEditTool={(id) => {
            const savedCustom = localStorage.getItem("custom_tools");
            const list = savedCustom ? JSON.parse(savedCustom) : [];
            const tool = list.find((t: any) => t.id === id);
            setEditingTool(tool || null);
            setActiveId("tool-create");
          }}
        />; 
      case "tool-create":
        return (
          <AddToolWizard 
            onBack={() => setActiveId("tool-mgmt")} 
            toolToEdit={editingTool}
            onSave={(toolData) => {
              const existingCustom = localStorage.getItem("custom_tools");
              const list = existingCustom ? JSON.parse(existingCustom) : [];
              if (editingTool) {
                const updatedList = list.map((t: any) => {
                  if (t.id === editingTool.id) {
                    const prevVersions = t.versions || [
                      {
                        version: t.version,
                        description: t.description,
                        imageAddress: t.imageAddress,
                        inputsCount: t.inputsCount,
                        paramsCount: t.paramsCount,
                        outputsCount: t.outputsCount,
                        toolData: t.toolData
                      }
                    ];
                    
                    const newVerStr = toolData.basic.version || "1.0.0";
                    const alreadyHasVer = prevVersions.some((v: any) => v.version === newVerStr);
                    
                    const newVerObj = {
                      version: newVerStr,
                      description: toolData.basic.description || "自定义工具描述",
                      imageAddress: toolData.env?.image || toolData.env?.imageUrl || "registry.cn-hangzhou.aliyuncs.com/bio-tools/custom:v1.0",
                      inputsCount: toolData.inputs?.length || 0,
                      paramsCount: toolData.parameters?.length || 0,
                      outputsCount: toolData.outputs?.length || 0,
                      toolData: toolData
                    };

                    let updatedVersions = [...prevVersions];
                    if (alreadyHasVer) {
                      updatedVersions = updatedVersions.map((v: any) => v.version === newVerStr ? newVerObj : v);
                    } else {
                      updatedVersions.push(newVerObj);
                    }

                    return {
                      ...t,
                      name: toolData.basic.name,
                      version: newVerStr,
                      description: toolData.basic.description || "自定义工具描述",
                      imageAddress: toolData.env?.image || toolData.env?.imageUrl || "registry.cn-hangzhou.aliyuncs.com/bio-tools/custom:v1.0",
                      category: toolData.basic.category || "自定义",
                      inputsCount: toolData.inputs?.length || 0,
                      paramsCount: toolData.parameters?.length || 0,
                      outputsCount: toolData.outputs?.length || 0,
                      toolData: toolData,
                      versions: updatedVersions
                    };
                  }
                  return t;
                });
                localStorage.setItem("custom_tools", JSON.stringify(updatedList));
              } else {
                const newTool = {
                  id: toolData.basic.identifier || `custom-${Date.now()}`,
                  name: toolData.basic.name,
                  version: toolData.basic.version,
                  description: toolData.basic.description || "自定义工具描述",
                  imageAddress: toolData.env?.image || toolData.env?.imageUrl || "registry.cn-hangzhou.aliyuncs.com/bio-tools/custom:v1.0",
                  lastUsed: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  status: "enabled",
                  isCustom: true,
                  category: toolData.basic.category || "自定义",
                  inputsCount: toolData.inputs?.length || 0,
                  paramsCount: toolData.parameters?.length || 0,
                  outputsCount: toolData.outputs?.length || 0,
                  toolData: toolData,
                  versions: [
                    {
                      version: toolData.basic.version,
                      description: toolData.basic.description || "自定义工具描述",
                      imageAddress: toolData.env?.image || toolData.env?.imageUrl || "registry.cn-hangzhou.aliyuncs.com/bio-tools/custom:v1.0",
                      inputsCount: toolData.inputs?.length || 0,
                      paramsCount: toolData.parameters?.length || 0,
                      outputsCount: toolData.outputs?.length || 0,
                      toolData: toolData
                    }
                  ]
                };
                localStorage.setItem("custom_tools", JSON.stringify([...list, newTool]));
              }
            }}
          />
        );
      case "tool-detail":
        if (selectedToolId === "taxonomy-annotation") {
          return (
            <TaxonomyAnnotationTask 
              onBack={() => setActiveId("tool-mgmt")} 
              onSubmitSuccess={() => setActiveId("task-monitor")}
            />
          );
        }
        return <ToolDetail toolId={selectedToolId} onBack={() => setActiveId("tool-mgmt")} />;
      case "workflow":
        return <AnalysisWorkflow isAdmin={currentUser === 'admin'} />;
      case "results-mgmt":
        return <ResultsManagement />;
      case "dataset-mgmt":
        return <DatasetManagement initialDetailId={assistantDatasetId} onDetailConsumed={() => setAssistantDatasetId("")} />;
      case "research-assistant":
        return <ResearchAssistant />;
      case "raw-data-mgmt":
        return <RawDataManagement />;
      case "workbench":
        return (
          <Workbench 
            onNavigateToProjects={() => {
              setSelectedWorkbenchProject(null);
              setActiveId("project-mgmt");
            }}
            onSelectProjectDetail={(project) => {
              setSelectedWorkbenchProject(project);
              setActiveId("project-mgmt");
            }}
          />
        );
      case "project-mgmt":
        return <ProjectManagement initialSelectedProject={selectedWorkbenchProject} />;
      case "task-monitor":
        return <TaskMonitor />;
      case "storage-mgmt":
        return <StorageManagement />;
      case "user-mgmt":
        return <UserManagement />;
      case "role-mgmt":
        return <RoleManagement />;
      case "group-mgmt":
        return <ProjectGroupManagement />;
      case "dict-mgmt":
        return <DictionaryManagement />;
      case "institution-mgmt":
        return <InstitutionManagement />;
      case "menu-mgmt":
        return <MenuManagement />;
      case "model-center":
        return <ModelCenter onSelectModel={(id) => {
          if (id === "m1") setActiveId("pp-task-create");
          if (id === "m2") setActiveId("vs-task-create");
          if (id === "m9") setActiveId("td-task-create");
          if (id === "m10") setActiveId("ptp-task-create");
          if (id === "m11") setActiveId("sh-task-create");
          if (id === "m12") setActiveId("rl-task-create");
          if (id === "m13") setActiveId("rs-task-create");
          if (id === "m14") setActiveId("vs2-task-create");
        }} />;
      case "vs-task-create":
        return <VirtualScreeningTask 
          onBack={() => setActiveId("model-center")} 
          onSubmit={() => setActiveId("task-center")} 
          onViewResult={(id) => {
            setSelectedVsTaskId(id);
            setActiveId("vs-task-result");
          }}
        />;
      case "vs2-task-create":
        return <VirtualScreeningTask2 
          onBack={() => setActiveId("model-center")} 
          onSubmit={() => setActiveId("task-center")} 
        />;
      case "vs-task-result":
        return <VirtualScreeningResult onBack={() => setActiveId("vs-task-create")} taskId={selectedVsTaskId} />;
      case "td-task-create":
        return <TargetDiscoveryTask 
          onBack={() => setActiveId("model-center")} 
          onViewResult={(task) => {
            setSelectedTdTask(task);
            setActiveId("td-task-result");
          }}
        />;
      case "td-task-result":
        return <TargetDiscoveryResult onBack={() => setActiveId("td-task-create")} task={selectedTdTask} />;
      case "ptp-task-create":
        return <PotentialTargetPredictionTask 
          onBack={() => setActiveId("model-center")} 
          onSubmit={() => setActiveId("task-center")} 
          onViewResult={(id) => {
            setSelectedPtpTaskId(id);
            setActiveId("ptp-task-result");
          }}
        />;
      case "ptp-task-result":
        return <PotentialTargetPredictionResult onBack={() => setActiveId("ptp-task-create")} taskId={selectedPtpTaskId} />;
      case "pp-task-create":
        return <ProteinPredictionTask 
          onBack={() => setActiveId("model-center")} 
          onSubmit={() => setActiveId("task-center")} 
          onViewResult={(id) => {
            setSelectedPpTaskId(id);
            setActiveId("pp-task-result");
          }}
        />;
      case "pp-task-result":
        return <ProteinPredictionResult onBack={() => setActiveId("pp-task-create")} taskId={selectedPpTaskId} />;
      case "sh-task-create":
        return <ScaffoldHoppingTask 
          onBack={() => setActiveId("model-center")} 
          onSubmit={() => setActiveId("task-center")} 
          onViewResult={(id) => {
            setSelectedShTaskId(id);
            setActiveId("sh-task-result");
          }}
        />;
      case "sh-task-result":
        return <ScaffoldHoppingResult onBack={() => setActiveId("sh-task-create")} taskId={selectedShTaskId} />;
      case "rl-task-create":
        return <RlMoleculeGenerationTask 
          onBack={() => setActiveId("model-center")} 
          onSubmit={() => setActiveId("task-center")} 
          onViewResult={(id) => {
            setSelectedRlTaskId(id);
            setActiveId("rl-task-result");
          }} 
        />;
      case "rl-task-result":
        return <RlMoleculeGenerationResult onBack={() => setActiveId("rl-task-create")} taskId={selectedRlTaskId} />;
      case "rs-task-create":
        return <RetrosynthesisTask 
          onBack={() => setActiveId("model-center")} 
          onSubmit={() => setActiveId("task-center")} 
          onViewResult={(id) => {
            setSelectedRsTaskId(id);
            setActiveId("rs-task-result");
          }} 
        />;
      case "rs-task-result":
        return <RetrosynthesisResult onBack={() => setActiveId("rs-task-create")} taskId={selectedRsTaskId} />;
      case "task-center":
        return <TaskCenter />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Terminal className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold">模块开发中</h3>
              <p className="text-sm text-muted-foreground tech-mono">
                模块 <span className="text-primary">[{activeId}]</span> 正在部署中。
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveId("sample-mgmt")} className="tech-mono text-[10px]">
              返回仪表板
            </Button>
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full tech-grid">
          <AppSidebar activeId={activeId} onSelect={id => { setSelectedWorkbenchProject(null); setActiveId(id); }} currentUser={currentUser} />
          <SidebarInset className="flex flex-col min-w-0">
            <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur px-6 sticky top-0 z-10">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Home className="w-3.5 h-3.5 text-muted-foreground/70" />
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-muted-foreground">{breadcrumb.groupTitle}</span>
                {breadcrumb.parentTitle && (
                  <>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-muted-foreground">{breadcrumb.parentTitle}</span>
                  </>
                )}
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-foreground font-semibold">{breadcrumb.itemTitle}</span>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="全局搜索..."
                    className="w-64 pl-8 h-8 text-xs tech-mono bg-muted/50"
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
                </Button>
                <Separator orientation="vertical" className="h-4" />
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors outline-hidden">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-[10px] font-bold leading-none uppercase">{identity.name}</p>
                      <p className="text-[9px] text-muted-foreground tech-mono">权限级别: {identity.admin ? '超级管理员' : identity.personId.startsWith('pi-') ? '项目 PI' : '项目成员'}</p>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 tech-mono">
                    <DropdownMenuLabel className="text-xs">我的账户</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      个人资料
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer"
                      onClick={() => setActiveId("menu-mgmt")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      系统设置 / 菜单管理
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex-1 overflow-auto min-w-0">
              <React.Suspense fallback={
                <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
                  <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-[#02A1C8] animate-spin" />
                  <p className="text-xs text-muted-foreground tech-mono tracking-wider">系统分析模块加载中...</p>
                </div>
              }>
                {renderContent()}
              </React.Suspense>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

