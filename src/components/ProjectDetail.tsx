import React, { useState } from "react";
import { 
  ArrowLeft, 
  Layers, 
  Sparkles, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Plus, 
  Check, 
  TrendingUp, 
  FileText, 
  FileSpreadsheet, 
  Database, 
  ShieldCheck, 
  MessageSquare, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Calendar, 
  Download, 
  Send, 
  FolderKanban,
  Target,
  FlaskConical,
  Award,
  Users,
  Activity,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Project } from "@/src/types";
import { ProjectNodeDetailDrawer, DetailNodeType } from "./ProjectNodeDetailDrawer";

export type { WorkflowStep } from '../types';
import type { WorkflowStep } from '../types';
import { makeStep, researchTypeName, stepHasRecords } from '../lib/projectDomain';
import { ProjectRecordPanels } from './ProjectRecordPanels';

import { ProjectSamples } from './ProjectSamples';
import { useSamples, samplesAtNode } from '../lib/sampleStore';

import { useDatasets, datasetsAtNode } from '../lib/datasetStore';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateProject?: (updated: Project) => void;
}

export function ProjectDetail({ project, onBack, onUpdateProject }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<"flow" | "info" | "team" | "samples">("flow");
  const samples = useSamples();
  const datasets = useDatasets();
  const [sampleNodeId, setSampleNodeId] = useState('');
  const [mutationError, setMutationError] = useState('');
  const steps = project.steps || [];
  const setSteps = (next: WorkflowStep[]) => { try { onUpdateProject?.({ ...project, steps: next.map((s, i) => ({ ...s, order: i + 1 })) }); setMutationError(''); } catch(e) { setMutationError((e as Error).message); } };
  const [selectedStepId, setSelectedStepId] = useState<string>(steps[0]?.id || "");

  // Right-side Drawer for Step 01 (and other steps) 6 sub-nodes
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveNode, setDrawerActiveNode] = useState<DetailNodeType>("progress");

  const openNodeDrawer = (nodeType: DetailNodeType) => {
    setDrawerActiveNode(nodeType);
    setIsDrawerOpen(true);
  };

  // Dialogs
  const [isAiDiagOpen, setIsAiDiagOpen] = useState(false);
  const [activeCardDialog, setActiveCardDialog] = useState<string | null>(null);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isEditStepOpen, setIsEditStepOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepCategory, setNewStepCategory] = useState("湿实验 · 验证");
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);

  // PI Review interactive state
  const [piFeedbackText, setPiFeedbackText] = useState(
    "65℃ 比活力已达成阶段指标（18,500 U/mg），但常温 37℃ 下 kcat 降低 14.5% 需重点关注。请务必补充 55℃~75℃ 的热失活动力学半衰期（T50）测试，并在本周五前复核原始吸收峰数据。"
  );
  const [newChatQuestion, setNewChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: "1", sender: "王雪 (实验负责人)", time: "2026-08-22 14:20", content: "张老师，突变体 Mut-T04 在 65℃ 热稳定性表现突出，但底物亲和力 Km 略有升高，是否需要马上开展补料连续发酵？" },
    { id: "2", sender: "张立华 (PI)", time: "2026-08-22 15:05", content: "先不要盲目放大。先把 Tm 和 T50 的热变性曲线测准，同时让赵博士用 MD 模拟看看活性口袋入口是否有残基位阻。" }
  ]);

  const selectedStep = steps.find(s => s.id === selectedStepId) || steps[0];
  const nodeDatasets = selectedStep ? datasetsAtNode(datasets, project.id, selectedStep.id) : [];

  // Move step up/down
  const handleMoveStep = (stepId: string, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const index = steps.findIndex(s => s.id === stepId);
    if (index === -1) return;
    if (direction === "up" && index > 0) {
      const nextSteps = steps.map(s => ({ ...s }));
      const temp = nextSteps[index];
      nextSteps[index] = nextSteps[index - 1];
      nextSteps[index - 1] = temp;
      nextSteps.forEach((s, idx) => s.order = idx + 1);
      setSteps(nextSteps);
    } else if (direction === "down" && index < steps.length - 1) {
      const nextSteps = steps.map(s => ({ ...s }));
      const temp = nextSteps[index];
      nextSteps[index] = nextSteps[index + 1];
      nextSteps[index + 1] = temp;
      nextSteps.forEach((s, idx) => s.order = idx + 1);
      setSteps(nextSteps);
    }
  };

  // Delete step
  const handleDeleteStep = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (steps.length <= 1) return;
    if (steps.some(s => s.id === stepId && stepHasRecords(s))) return;
    const nextSteps = steps.filter(s => s.id !== stepId).map(s => ({ ...s }));
    nextSteps.forEach((s, idx) => s.order = idx + 1);
    setSteps(nextSteps);
    if (selectedStepId === stepId) {
      setSelectedStepId(nextSteps[0].id);
    }
  };

  // Open edit step
  const handleOpenEditStep = (step: WorkflowStep, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStep({ ...step });
    setIsEditStepOpen(true);
  };

  // Save edit step
  const handleSaveEditStep = () => {
    if (!editingStep || !editingStep.title.trim() || steps.some(s => s.id !== editingStep.id && s.title.trim() === editingStep.title.trim())) return;
    setSteps(steps.map(s => s.id === editingStep.id ? editingStep : s));
    setIsEditStepOpen(false);
  };

  // Add new step
  const handleAddStep = () => {
    if (!newStepTitle.trim() || steps.some(s => s.title.trim() === newStepTitle.trim())) return;
    const newStep = makeStep(newStepTitle.trim(), steps.length + 1, project.piName, newStepCategory);
    setSteps([...steps, newStep]);
    setSelectedStepId(newStep.id);
    setNewStepTitle("");
    setIsAddStepOpen(false);
  };

  const handleSendChat = () => {
    if (!newChatQuestion.trim()) return;
    const msg = {
      id: Date.now().toString(),
      sender: "当前研究员 (我)",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: newChatQuestion.trim()
    };
    setChatMessages([...chatMessages, msg]);
    setNewChatQuestion("");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto bg-slate-50/50 min-h-screen">
      {/* 顶部主卡片 / 导航条 */}
      <div className="p-6 pb-4">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 左侧：返回按钮 + 项目标识 + 标题 + 风险标签 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-9 px-3.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50 gap-1.5 shrink-0 rounded-lg cursor-pointer font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回项目列表
            </Button>

            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tech-mono text-xs font-bold text-[#02A1C8] bg-[#02A1C8]/10 border border-[#02A1C8]/20 px-2.5 py-0.5 rounded">
                  {project.number}
                </span>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
                  {project.name}
                </h1>
                <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70 text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-none">
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                  {steps.some(s => s.riskLevel === "high") ? "高风险预警" : "项目计划"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-normal">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">研究类型:</span>
                  <span className="text-slate-700 font-medium">{researchTypeName(project.researchType)}</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">负责人:</span>
                  <span className="text-slate-700 font-medium">{project.piName || "待确定"}</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">承担单位:</span>
                  <span className="text-slate-700 font-medium">{project.institution || "待补充"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：Tab切换 + AI项目全局诊断 */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {/* Tab 选项组 */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setActiveTab("flow")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "flow" 
                    ? "bg-[#02A1C8] text-white shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                项目流程
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "info" 
                    ? "bg-[#02A1C8] text-white shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                项目信息
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "team" 
                    ? "bg-[#02A1C8] text-white shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                项目团队
              </button>
              <button aria-pressed={activeTab === 'samples'} onClick={() => { setSampleNodeId(''); setActiveTab('samples'); }} className={cn('px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer', activeTab === 'samples' ? 'bg-[#02A1C8] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900')}>项目样本</button>
            </div>

            {/* AI 项目全局诊断按钮 */}
            <Button
              disabled={project.id !== "enz-01"}
              onClick={() => setIsAiDiagOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-[#02A1C8]/40 shadow-2xs text-xs font-semibold h-9 px-3.5 gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#02A1C8]" />
              AI 项目全局诊断
            </Button>
          </div>
        </div>
      </div>

      {/* 主体内容根据 Tab 渲染 */}
      <div className="px-6 pb-8 flex-1 flex flex-col">
        {activeTab === "flow" && (
          <div className="space-y-4 flex-1 flex flex-col">
            {/* 流程模板标题 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <div className="w-6 h-6 rounded-md bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>{researchTypeName(project.researchType)} · 实验流程</span>
                <Badge variant="outline" className="text-[10px] text-slate-500 font-normal border-slate-200 bg-white ml-1">
                  {steps.length} 个节点 · 已完成 {steps.filter(s => s.status === "completed").length} 个
                </Badge>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { setSampleNodeId(selectedStep?.id || ''); setActiveTab('samples'); }}>管理当前节点样本</Button>
                <span>流程节点支持排序与编辑</span>
              </div>
            </div>

            {/* 左右分栏：左侧流程列表，右侧阶段详情看板 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* 左侧流程列表 (占据 4 列) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌱</span>
                    <span className="text-xs font-bold text-slate-800">研究流程</span>
                    <span className="text-[11px] text-slate-400 font-mono">({steps.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">点击切换环节</span>
                </div>

                <div className="space-y-1.5 py-1">
                  {steps.map((step, index) => {
                    const isSelected = step.id === selectedStepId;
                    const isCompleted = step.status === "completed";
                    const isInProgress = step.status === "in_progress";

                    return (
                      <div
                        key={step.id}
                        onClick={() => setSelectedStepId(step.id)}
                        className={cn(
                          "group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-[#02A1C8] text-white shadow-sm font-medium"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent"
                        )}
                      >
                        {/* 左侧状态点与标题 */}
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="shrink-0 flex items-center justify-center">
                            {isCompleted ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                            ) : isInProgress ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                            )}
                          </div>

                          <span className={cn(
                            "truncate",
                            isSelected ? "text-white font-bold" : "text-slate-700"
                          )}>
                            {step.title}
                          </span>
                        </div>

                        {/* 右侧微操作按钮组 */}
                        <div className={cn(
                          "flex items-center gap-1 shrink-0",
                          isSelected ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-80 text-slate-400 hover:text-slate-600 transition-opacity"
                        )}>
                          <button
                            title="编辑环节"
                            onClick={(e) => handleOpenEditStep(step, e)}
                            className={cn(
                              "p-1 rounded hover:bg-black/10 transition-colors",
                              isSelected ? "hover:bg-white/20" : ""
                            )}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            title="上移"
                            disabled={index === 0}
                            onClick={(e) => handleMoveStep(step.id, "up", e)}
                            className={cn(
                              "p-1 rounded hover:bg-black/10 disabled:opacity-20 transition-colors",
                              isSelected ? "hover:bg-white/20" : ""
                            )}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            title="下移"
                            disabled={index === steps.length - 1}
                            onClick={(e) => handleMoveStep(step.id, "down", e)}
                            className={cn(
                              "p-1 rounded hover:bg-black/10 disabled:opacity-20 transition-colors",
                              isSelected ? "hover:bg-white/20" : ""
                            )}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            title={stepHasRecords(step) ? "已有记录的节点不可删除" : "删除"}
                            disabled={steps.length <= 1 || stepHasRecords(step)}
                            onClick={(e) => handleDeleteStep(step.id, e)}
                            className={cn(
                              "p-1 rounded hover:bg-black/10 transition-colors",
                              isSelected ? "hover:bg-white/20" : ""
                            )}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 添加环节按钮 */}
                <button
                  onClick={() => setIsAddStepOpen(true)}
                  className="mt-3 w-full border border-dashed border-sky-300 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50 text-[#02A1C8] rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加环节
                </button>
              </div>

              {/* 右侧阶段详情看板 (占据 8 列) */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-sky-200/90 shadow-sm p-5 space-y-5">
                {/* 阶段概要头部 */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-1">
                    阶段概要
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    R1 · 阶段 {selectedStep.order < 10 ? `0${selectedStep.order}` : selectedStep.order} · {selectedStep.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    【{selectedStep.category}】{selectedStep.description}
                  </p>
                </div>

                {/* 6 块功能看板卡片 (2 列 × 3 行) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs text-sky-900">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#02A1C8] shrink-0" />
                      <span>
                        当前展示阶段的 <strong>6 个核心子节点</strong>。点击任一子节点卡片，将在<strong>右侧通过抽屉</strong>查看详细设计与数据。
                      </span>
                    </div>
                    <Badge className="bg-[#02A1C8]/15 text-[#02A1C8] border-[#02A1C8]/30 text-[10px] font-mono shrink-0">
                      支持右侧抽屉查看
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 卡片 1: 实验进展与状态 */}
                    <div 
                      onClick={() => openNodeDrawer("progress")}
                      className="p-4 rounded-xl border border-slate-200/90 hover:border-[#02A1C8] bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[155px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-sky-100 text-[#02A1C8] text-[11px] font-mono font-bold flex items-center justify-center">
                              1
                            </span>
                            <TrendingUp className="w-4 h-4 text-[#02A1C8]" />
                            <span className="text-xs font-bold text-slate-800">实验进展与状态</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-normal text-slate-400 group-hover:text-[#02A1C8] group-hover:border-[#02A1C8]/40 transition-colors">
                            右侧抽屉
                          </Badge>
                        </div>

                        <div className="text-sm font-bold text-slate-900 mb-2">
                          {selectedStep.progressText}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-2 py-0 border-none",
                              selectedStep.riskLevel === "high" 
                                ? "bg-rose-50 text-rose-600 font-bold" 
                                : "bg-slate-100 text-slate-600"
                            )}
                          >
                            风险: {selectedStep.riskLevel === "high" ? "高" : selectedStep.riskLevel === "medium" ? "中" : "低"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-2 py-0 text-slate-400 border-slate-200 font-mono">
                            更新: {selectedStep.updatedAt}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          节点负责人：{selectedStep.leadPerson || "待分配"}；计划周期：{selectedStep.startDate || "待安排"} 至 {selectedStep.endDate || "待安排"}。
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-[#02A1C8] transition-colors">
                          <span className="font-medium">点击展开右侧抽屉详情</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* 卡片 2: 实验方案设计 */}
                    <div 
                      onClick={() => openNodeDrawer("scheme")}
                      className="p-4 rounded-xl border border-slate-200/90 hover:border-[#02A1C8] bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[155px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-sky-100 text-[#02A1C8] text-[11px] font-mono font-bold flex items-center justify-center">
                              2
                            </span>
                            <FileText className="w-4 h-4 text-[#02A1C8]" />
                            <span className="text-xs font-bold text-slate-800">实验方案设计</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-normal text-slate-400 group-hover:text-[#02A1C8] group-hover:border-[#02A1C8]/40 transition-colors">
                            右侧抽屉
                          </Badge>
                        </div>

                        <div className="text-xs font-bold text-slate-900 mb-2 truncate">
                          {selectedStep.schemeTitle}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            方案: {selectedStep.schemeCount} 份
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            参考资料: {selectedStep.refCount} 份
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {selectedStep.schemeNote}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-[#02A1C8] transition-colors">
                          <span className="font-medium">点击展开右侧抽屉详情</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* 卡片 3: 实验报告 */}
                    <div 
                      onClick={() => openNodeDrawer("report")}
                      className="p-4 rounded-xl border border-slate-200/90 hover:border-[#02A1C8] bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[155px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-sky-100 text-[#02A1C8] text-[11px] font-mono font-bold flex items-center justify-center">
                              3
                            </span>
                            <FileSpreadsheet className="w-4 h-4 text-[#02A1C8]" />
                            <span className="text-xs font-bold text-slate-800">实验报告</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-normal text-slate-400 group-hover:text-[#02A1C8] group-hover:border-[#02A1C8]/40 transition-colors">
                            右侧抽屉
                          </Badge>
                        </div>

                        <p className="text-[11px] font-medium text-slate-800 mb-2 line-clamp-2 leading-snug">
                          {selectedStep.reportSummary}
                        </p>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            交付报告: {selectedStep.reportCount} 份
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0 border-none font-mono">
                            {selectedStep.piStatus}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] text-[#02A1C8] font-mono truncate flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {selectedStep.attachmentName}
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-[#02A1C8] transition-colors">
                          <span className="font-medium">点击展开右侧抽屉详情</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* 卡片 4: 原始实验数据 */}
                    <div 
                      onClick={() => openNodeDrawer("dataset")}
                      className="p-4 rounded-xl border border-slate-200/90 hover:border-[#02A1C8] bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[155px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-sky-100 text-[#02A1C8] text-[11px] font-mono font-bold flex items-center justify-center">
                              4
                            </span>
                            <Database className="w-4 h-4 text-[#02A1C8]" />
                            <span className="text-xs font-bold text-slate-800">原始实验数据</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-normal text-slate-400 group-hover:text-[#02A1C8] group-hover:border-[#02A1C8]/40 transition-colors">
                            右侧抽屉
                          </Badge>
                        </div>

                        <div className="text-xs font-bold text-slate-900 mb-2">
                          {nodeDatasets.length} 个数据集
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            样本: {samples.filter(s => s.links.some(l => l.projectId === project.id && l.nodeId === selectedStep.id) || nodeDatasets.some(d => d.sampleIds.includes(s.id))).length}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            文件: {nodeDatasets.reduce((sum, d) => sum + d.files.length, 0)} 个
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-mono">
                          {nodeDatasets.length ? nodeDatasets.map(d => d.name).join('、') : '暂无关联数据集'}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-[#02A1C8] transition-colors">
                          <span className="font-medium">点击展开右侧抽屉详情</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* 卡片 5: PI审核与批复 */}
                    <div 
                      onClick={() => openNodeDrawer("pi")}
                      className="p-4 rounded-xl border border-slate-200/90 hover:border-[#02A1C8] bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[155px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-sky-100 text-[#02A1C8] text-[11px] font-mono font-bold flex items-center justify-center">
                              5
                            </span>
                            <ShieldCheck className="w-4 h-4 text-[#02A1C8]" />
                            <span className="text-xs font-bold text-slate-800">PI审核与批复</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-normal text-slate-400 group-hover:text-[#02A1C8] group-hover:border-[#02A1C8]/40 transition-colors">
                            右侧抽屉
                          </Badge>
                        </div>

                        <div className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{selectedStep.piStatus}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            审批人: {selectedStep.piReviewer}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            审签记录: {selectedStep.piRecordsCount} 条
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {selectedStep.piNote}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-[#02A1C8] transition-colors">
                          <span className="font-medium">点击展开右侧抽屉详情</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* 卡片 6: 交流入口 (协作交流) */}
                    <div 
                      onClick={() => openNodeDrawer("chat")}
                      className="p-4 rounded-xl border border-slate-200/90 hover:border-[#02A1C8] bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[155px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-sky-100 text-[#02A1C8] text-[11px] font-mono font-bold flex items-center justify-center">
                              6
                            </span>
                            <MessageSquare className="w-4 h-4 text-[#02A1C8]" />
                            <span className="text-xs font-bold text-slate-800">协作交流</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-normal text-slate-400 group-hover:text-[#02A1C8] group-hover:border-[#02A1C8]/40 transition-colors">
                            右侧抽屉
                          </Badge>
                        </div>

                        <div className="text-xs font-bold text-slate-900 mb-2">
                          {selectedStep.issueTotalCount} 条课题协作学术研讨
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 border-none">
                            本阶段: {selectedStep.issueTotalCount} 条
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0 border-none">
                            待回复: 0 条 (已闭环)
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {selectedStep.chatNote}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-[#02A1C8] transition-colors">
                          <span className="font-medium">点击展开右侧抽屉详情</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mutationError && <p role="alert" className="p-3 text-rose-700 bg-rose-50 rounded-lg">{mutationError}</p>}
        {activeTab === 'samples' && <div key={sampleNodeId} className="bg-white border rounded-xl p-5"><ProjectSamples project={project} initialNodeId={sampleNodeId} /></div>}
        {/* Project information */}
        {(activeTab === 'info' || activeTab === 'team') && <ProjectRecordPanels project={project} view={activeTab} />}

      </div>

      {/* AI 项目全局诊断 对话框 */}
      <Dialog open={isAiDiagOpen} onOpenChange={setIsAiDiagOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <div className="w-6 h-6 rounded-md bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              AI 项目全局诊断报告
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              基于科研中台全流程数据，利用生信 AI 大模型对当前研发里程碑、瓶颈风险及实验动力学开展智能诊断。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            {/* 总体健康度评分 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-800">总体健康评分</div>
                <div className="text-2xl font-black text-amber-600 mt-0.5">78 / 100</div>
                <div className="text-[11px] text-amber-700 mt-1">
                  阶段 09（酶学性质与稳定性表征）处于高风险延期状态，常温催化动力学存在异常折损
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/80 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-600 text-sm shadow-2xs">
                高风险
              </div>
            </div>

            {/* 关键瓶颈分析 */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                关键瓶颈识别与异常归因
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800">1. 进度延期：阶段 09 较原计划滞后 14 个自然日</div>
                  <p className="text-slate-600 leading-relaxed">
                    原因：65℃ 与 37℃ 动力学 Michaelis-Menten 曲线重现性验证耗时过长，且常温 kcat 下降达 14.5%，触发质控告警。
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800">2. 结构柔性与热稳定性的权衡（Trade-off）效应</div>
                  <p className="text-slate-600 leading-relaxed">
                    Mut-T04 引入的工程二硫键虽然将热变性温度提升，但限制了催化活性口袋在常温下的构象呼吸振动，导致催化转换数受阻。
                  </p>
                </div>
              </div>
            </div>

            {/* 智能优化策略建议 */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                AI 优化建议与挽救方案
              </h4>
              <div className="p-3.5 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-2 text-emerald-900">
                <div className="font-semibold">建议协同推进下列措施：</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800">
                  <li><strong>Loop 3 柔性补偿突变：</strong>建议在 S128 或 G154 位点引入柔性甘氨酸/丙氨酸，释放催化中心局部位阻。</li>
                  <li><strong>前置启动 R2 文库：</strong>不必等待单一突变株完美达标，可并行开展包含 Mut-T09 与 Mut-T04 的复合双位点筛选。</li>
                  <li><strong>补充 T50 实验：</strong>立即开展 55~75℃ 梯度失活实验，向 PI 张立华提交完整的半衰期报告以通过阶段验收。</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAiDiagOpen(false)}>
              关闭
            </Button>
            <Button size="sm" className="bg-[#02A1C8] hover:bg-[#0281a0] text-white" onClick={() => setIsAiDiagOpen(false)}>
              采纳建议并导出诊断报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6 个子节点的右侧抽屉式详情展示 */}
      {isDrawerOpen && selectedStep && (
      <div key={`${project.id}:${selectedStep.id}`}><ProjectNodeDetailDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        project={project}
        step={selectedStep}
        activeNode={drawerActiveNode}
        onChangeActiveNode={setDrawerActiveNode}
      /></div>
      )}


      {/* 添加新环节对话框 */}
      <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">添加新的研究环节</DialogTitle>
            <DialogDescription className="text-xs">
              在研发流程链条中插入新的实验或计算阶段
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">环节名称</Label>
              <Input 
                placeholder="例如：冷冻电镜三维构象解析"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">所属分类 / 范式</Label>
              <select 
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={newStepCategory}
                onChange={(e) => setNewStepCategory(e.target.value)}
              >
                <option value="湿实验 · 验证">湿实验 · 验证</option>
                <option value="干实验 · 计算模拟">干实验 · 计算模拟</option>
                <option value="中试 · 发酵放大">中试 · 发酵放大</option>
                <option value="质控 · 性能表征">质控 · 性能表征</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAddStepOpen(false)}>取消</Button>
            <Button size="sm" className="bg-[#02A1C8] hover:bg-[#0281a0] text-white" onClick={handleAddStep}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑环节对话框 */}
      <Dialog open={isEditStepOpen} onOpenChange={setIsEditStepOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">编辑环节信息</DialogTitle>
          </DialogHeader>
          {editingStep && (
            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">环节名称</Label>
                <Input 
                  value={editingStep.title}
                  onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">阶段分类</Label>
                <Input 
                  value={editingStep.category}
                  onChange={(e) => setEditingStep({ ...editingStep, category: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">阶段描述</Label>
                <Textarea 
                  value={editingStep.description}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsEditStepOpen(false)}>取消</Button>
            <Button size="sm" className="bg-[#02A1C8] hover:bg-[#0281a0] text-white" onClick={handleSaveEditStep}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
