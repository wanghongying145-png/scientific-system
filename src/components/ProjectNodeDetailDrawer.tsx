import { NodeReviewPanel } from './NodeReviewPanel';
import { getProjects, updateProjects } from '../lib/projectStore';
import { assertProjectAccess, useIdentity } from '../lib/session';
import React, { useEffect, useRef, useState } from "react";
import { 
  X, 
  Check, 
  TrendingUp, 
  FileText, 
  FileSpreadsheet, 
  Database, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  ExternalLink, 
  Download, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Calendar, 
  Send, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  FileCode, 
  Layers, 
  Info,
  CheckCircle,
  FileCheck2,
  Lock,
  ArrowUpRight,
  HelpCircle,
  Share2,
  SlidersHorizontal,
  Save,
  BookOpen,
  Bookmark,
  Activity,
  Sliders,
  Pencil,
  Trash2,
  Upload,
  Plus,
  File,
  Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Project } from "@/src/types";
import { WorkflowStep } from "./ProjectDetail";

import { ProjectSamples } from './ProjectSamples';
import { NodeDatasets } from './DatasetViews';
import { useDatasets, datasetsAtNode } from '../lib/datasetStore';

export type DetailNodeType = "progress" | "scheme" | "report" | "dataset" | "pi" | "chat";

interface ProjectNodeDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  step: WorkflowStep;
  activeNode: DetailNodeType;
  onChangeActiveNode: (node: DetailNodeType) => void;
}

export function ProjectNodeDetailDrawer({
  isOpen,
  onClose,
  project,
  step,
  activeNode,
  onChangeActiveNode
}: ProjectNodeDetailDrawerProps) {
  const isLegacy = project.id === 'enz-01' && /^step-\d+$/.test(step.id);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || document.querySelector('[role="dialog"]:not([data-node-drawer])')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [isOpen]);
  const identity = useIdentity();
  const datasets = useDatasets();
  const nodeDatasets = datasetsAtNode(datasets, project.id, step.id);
  // Local state for interactive features
  const [copiedSeq, setCopiedSeq] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isAiDiagOpen, setIsAiDiagOpen] = useState(false);
  
  // Tab 1: 实验进展与状态 Form state matching user's uploaded page
  const [formProjectNo, setFormProjectNo] = useState(project.number);
  const [formProjectLead, setFormProjectLead] = useState(project.piName || "待确定");
  const [formStageLead, setFormStageLead] = useState(step.leadPerson || "");
  const [formStartDate, setFormStartDate] = useState(step.startDate || "");
  const [formEndDate, setFormEndDate] = useState(step.endDate || "");
  const [formProgress, setFormProgress] = useState(`${step.progressPercent}%`);
  const [formStatus, setFormStatus] = useState(({ completed: "已完成", in_progress: "进行中", pending: "未开始" }[step.status]));
  const [formRiskLevel, setFormRiskLevel] = useState(({ low: "低风险", medium: "中风险", high: "高风险" }[step.riskLevel]));
  const [formNotes, setFormNotes] = useState(step.progressNotes || "");
  const [progressError,setProgressError] = useState("");
  useEffect(()=>{setFormProgress(`${step.progressPercent}%`);setFormStatus(({completed:"已完成",in_progress:"进行中",pending:"未开始"}[step.status]));},[step.progressPercent,step.status]);
  const [isProgressSavedToast, setIsProgressSavedToast] = useState(false);
  const [showKpiDetails, setShowKpiDetails] = useState(false);

  const handleSaveProgress = () => {
    try {
      const latest=getProjects().find(p=>p.id===project.id);assertProjectAccess(latest);
      const node=latest?.steps?.find(n=>n.id===step.id);if(!node||node.updatedAt!==step.updatedAt)throw new Error('节点已更新，请重新打开。');
      const percent=Number(formProgress.replace('%',''));if(!Number.isFinite(percent)||percent<0||percent>100)throw new Error('进度必须在 0 到 100 之间。');
      if((percent===100||formStatus==='已完成')&&node.review?.state!=='approved')throw new Error('请通过 PI 审签完成节点，不可手动标记完成。');
      updateProjects(all=>all.map(p=>p.id===project.id?{...p,steps:p.steps?.map(n=>n.id===step.id?{...n,leadPerson:formStageLead,startDate:formStartDate,endDate:formEndDate,progressPercent:percent,status:formStatus==='已完成'?'completed':formStatus==='未开始'?'pending':'in_progress',progressText:formStatus+' · '+percent+'%',riskLevel:formRiskLevel==='高风险'?'high':formRiskLevel==='中风险'?'medium':'low',progressNotes:formNotes,updatedAt:new Date().toISOString()}:n)}:p));
      setProgressError('');setIsProgressSavedToast(true);
    } catch(e) {setProgressError((e as Error).message);return;}
    setTimeout(() => setIsProgressSavedToast(false), 3000);
  };

  // Tab 2: 实验方案设计与相关资料 state matching uploaded design
  const [schemeFiles, setSchemeFiles] = useState(isLegacy ? [
    {
      id: "sch-1",
      name: "01_课题立项与目标定义_实验方案.docx",
      size: "1.8 MB",
      type: "PROTOCOL",
      uploader: "李默然 博士",
      date: "2026-03-01",
      summary: "包含课题立项技术任务书、技术指标分解、研究边界定义与实施技术路线总图。"
    },
    {
      id: "sch-2",
      name: "《目标酶应用场景与改造指标定义报告.pdf》",
      size: "1.2 MB",
      type: "PROTOCOL",
      uploader: "李默然 博士",
      date: "2026-03-05",
      summary: "梳理高温饲料制粒工业场景要求，对标国内外同类商业化植酸酶理化指标及性能天花板。"
    },
    {
      id: "sch-3",
      name: "《酶工程改造实验设计方案(DOE)与技术路线图_v2.1.pdf》",
      size: "2.8 MB",
      type: "RAW_DATA",
      uploader: "李默然 博士",
      date: "2026-03-08",
      summary: "正交实验设计(DOE)参数、表达菌株毕赤酵母转化通量规划及 96 孔板高通量筛选工艺路线。"
    }
  ] : []);

  const [referenceFiles, setReferenceFiles] = useState(isLegacy ? [
    {
      id: "ref-1",
      title: "01_课题立项与目标定义_实验报告.pdf",
      badge: "REPORT",
      meta: "2.4 MB · 上传人: 李默然 博士 · 2026-03-10",
      description: "实验报告示例文件",
      isPaper: false
    },
    {
      id: "ref-2",
      title: "《国家重点研发计划合成生物学专项_项目立项申报书(签字审批版).pdf》",
      badge: "REPORT",
      meta: "2.0 MB · 上传人: 李默然 博士 · 2026-03-10",
      description: "阶段交付物示例文件",
      isPaper: false
    },
    {
      id: "ref-3",
      title: "Rational design of ultra-thermostable phytases via engineered disulfide bonds and surface charge...",
      meta: "Zhang, L., Li, M., Wang, X. et al. · Nature Catalysis · 2025",
      description: "Here we report a systematic rational framework combining B-factor ranking and disulfide crosslinking to engineer fungal...",
      isPaper: true
    },
    {
      id: "ref-4",
      title: "Machine-learning-guided directed evolution of Ideonella sakaiensis PETase for complete enzymatic...",
      meta: "Chen, H., Arnold, F. H. et al. · Science · 2024",
      description: "By training deep neural networks on mutational fitness landscapes, we engineered FAST-PETase variants that operate...",
      isPaper: true
    },
    {
      id: "ref-5",
      title: "Unlocking the catalytic trade-off in engineered industrial biocatalysts: Lessons from 100 industrial...",
      meta: "Bornscheuer, U. T. et al. · ACS Catalysis · 2024",
      description: "A comprehensive review dissecting why rigidity-driven thermostabilization frequently compromises turnover numbers...",
      isPaper: true
    },
    {
      id: "ref-6",
      title: "Thermal unfolding pathways of fungal phytases: Crystal structure analysis and identification of...",
      meta: "Zhang, L., Mueller, R., et al. · Applied and Environmental Microbiology · 2024",
      description: "Crystal structure determination and molecular dynamics reveal key unfolding initiation sites...",
      isPaper: true
    }
  ] : []);

  const [schemeActionToast, setSchemeActionToast] = useState<string | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<{ title: string; type: string; desc?: string } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);
  const [sopQcText, setSopQcText] = useState(
    `操作前置门槛: 前序节点产物、图谱或计算结果已完成质检。\n平行对照设置: 建议设置3组技术平行，并保留野生型WT或空载体对照。\n质控门槛: 原始数据完整、样本编号一致、异常结果需标记复测策略。\n交付要求: 形成可追溯的实验记录、原始数据附件和阶段报告。`
  );

  const triggerSchemeToast = (msg: string) => {
    setSchemeActionToast(msg);
    setTimeout(() => setSchemeActionToast(null), 3000);
  };

  const handleDeleteScheme = (id: string, name: string) => {
    setSchemeFiles(prev => prev.filter(f => f.id !== id));
    triggerSchemeToast(`方案文件「${name}」已成功移除。`);
  };

  const handleDeleteReference = (id: string, name: string) => {
    setReferenceFiles(prev => prev.filter(f => f.id !== id));
    triggerSchemeToast(`参考资料「${name}」已成功移除。`);
  };

  const handleUploadSchemeMock = () => {
    const newDoc = {
      id: `sch-${Date.now()}`,
      name: `新建实验设计方案_${new Date().toISOString().slice(0, 10)}.docx`,
      size: "1.5 MB",
      type: "PROTOCOL",
      uploader: "当前研究员",
      date: new Date().toISOString().slice(0, 10),
      summary: "新上传的课题实验设计方案文档，已进入项目方案版本库管理。"
    };
    setSchemeFiles(prev => [newDoc, ...prev]);
    triggerSchemeToast("新实验方案已成功上传并归档！");
  };

  const handleUploadRefMock = () => {
    const newRef = {
      id: `ref-${Date.now()}`,
      title: `新上传参考资料与文献_${new Date().toISOString().slice(0, 10)}.pdf`,
      badge: "REPORT",
      meta: `1.8 MB · 上传人: 当前研究员 · ${new Date().toISOString().slice(0, 10)}`,
      description: "新补充归档的科研参考资料与历史对比数据文件",
      isPaper: false
    };
    setReferenceFiles(prev => [newRef, ...prev]);
    triggerSchemeToast("新参考资料已成功上传！");
  };

  // Tab 3: 实验报告 state matching user's uploaded page
  const [conclusionText, setConclusionText] = useState(step.reportSummary || "暂无实验结论");
  const [isEditingConclusion, setIsEditingConclusion] = useState(false);
  const [reportFiles, setReportFiles] = useState(isLegacy ? [
    {
      id: "rf-1",
      name: "01_课题立项与目标定义_实验方案.docx",
      badge: "正式报告",
      size: "1.8 MB",
      format: "DOCX",
      uploader: "李默然 博士",
      checksum: "SHA-256通过",
      summary: "包含课题立项技术任务书、技术指标分解、研究边界定义与实施技术路线总图。"
    },
    {
      id: "rf-2",
      name: "01_课题立项与目标定义_实验报告.pdf",
      badge: "正式报告",
      size: "2.4 MB",
      format: "PDF",
      uploader: "李默然 博士",
      checksum: "SHA-256通过",
      summary: "阶段结题论证报告：完成了工业耐高温植酸酶立项论证、全球专利检索与自由实施度 (FTO) 评定。"
    },
    {
      id: "rf-3",
      name: "《国家重点研发计划合成生物学专项_项目立项申报书(签字审批版).pdf》",
      badge: "正式报告",
      size: "2.0 MB",
      format: "DATA",
      uploader: "李默然 博士",
      checksum: "SHA-256通过",
      summary: "国家重点研发计划合成生物学专项申报书签字盖章及学术委员会立项批复原件。"
    }
  ] : []);
  const [reportActionToast, setReportActionToast] = useState<string | null>(null);

  const triggerReportToast = (msg: string) => {
    setReportActionToast(msg);
    setTimeout(() => setReportActionToast(null), 3000);
  };

  const handleDeleteReport = (id: string, name: string) => {
    setReportFiles(prev => prev.filter(f => f.id !== id));
    triggerReportToast(`报告「${name}」已成功移除。`);
  };

  const handleEditReport = (id: string, currentName: string) => {
    const newName = window.prompt("修改报告文件名称:", currentName);
    if (newName && newName !== currentName) {
      setReportFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      triggerReportToast(`报告已重命名为「${newName}」`);
    }
  };

  const handleUploadReport = () => {
    const newRep = {
      id: `rf-${Date.now()}`,
      name: `新增阶段总结报告_${new Date().toISOString().slice(0, 10)}.pdf`,
      badge: "正式报告",
      size: "2.1 MB",
      format: "PDF",
      uploader: "当前研究员",
      checksum: "SHA-256通过",
      summary: "新归档的实验阶段性成果总结及专家综合审定意见。"
    };
    setReportFiles(prev => [newRep, ...prev]);
    triggerReportToast("新报告已成功上传并归档！");
  };

  const handleNewReport = () => {
    const title = window.prompt("请输入新建实验报告名称:", "02_实验立项论证及专利查新报告_v2.0.docx");
    if (title) {
      const newRep = {
        id: `rf-${Date.now()}`,
        name: title,
        badge: "正式报告",
        size: "1.5 MB",
        format: title.endsWith(".pdf") ? "PDF" : "DOCX",
        uploader: "张立华 教授 (PI)",
        checksum: "SHA-256通过",
        summary: "新建在线实验立项总结报告与交付物归档文件。"
      };
      setReportFiles(prev => [newRep, ...prev]);
      triggerReportToast(`报告「${title}」已成功新建创建！`);
    }
  };

  const handleBatchDownloadReports = () => {
    triggerReportToast(`已打包全部 ${reportFiles.length} 份正式报告文件，正在启动批量下载...`);
  };

  // Tab 4: 实验数据管理 (8) state matching user's uploaded page

  const [datasetToast, setDatasetToast] = useState<string | null>(null);

  const triggerDatasetToast = (msg: string) => {
    setDatasetToast(msg);
    setTimeout(() => setDatasetToast(null), 3000);
  };

  // Chat message state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(isLegacy ? [
    {
      id: "1",
      sender: "赵一凡",
      role: "计算生物学副研究员",
      avatarBg: "bg-blue-100 text-[#02A1C8]",
      time: "2026-02-18 10:20",
      content: "张老师，我们在对比 16 株真菌植酸酶多序列时，发现嗜热真菌 Thermomyces lanuginosus 的表面有额外盐桥加固。在立项指标中，除了要求 Tm ≥ 85℃ 外，是否需要增加'发酵上清蛋白表达量 ≥ 2.0 g/L'作为次级约束，防止突变体分泌障碍？"
    },
    {
      id: "2",
      sender: "张立华",
      role: "项目负责人 (PI)",
      avatarBg: "bg-amber-100 text-amber-700",
      time: "2026-02-18 11:05",
      content: "一凡的提醒非常关键！工业生产必须兼顾热稳定性与分泌表达得率。已在任务书第 4.2 节中增加了'高密度发酵上清蛋白表达量 ≥ 2.0 g/L'作为约束性指标。如果计算预测的突变体自由能极好但破坏了分泌信号肽折叠，不可作为主推突变体。"
    },
    {
      id: "3",
      sender: "王雪",
      role: "湿实验负责人",
      avatarBg: "bg-emerald-100 text-emerald-700",
      time: "2026-03-01 15:40",
      content: "报告张老师，野生型 Aspergillus niger AppA 表达菌株已从 CGMCC 调拨入库，并完成 pPIC9K 毕赤酵母转化复核。野生型 37℃ 基准比活力测定为 16,200 ± 350 U/mg，85℃ 10min 热处理残余酶活仅剩 4.2%，对照基线已稳固建立，随时可启动后续突变体盲测！"
    }
  ] : []);

  if (!isOpen) return null;

  const handleCopySequence = (seqText: string) => {
    navigator.clipboard?.writeText(seqText);
    setCopiedSeq(true);
    setTimeout(() => setCopiedSeq(false), 2000);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: "当前研究员 (我)",
      role: "研发团队成员",
      avatarBg: "bg-sky-100 text-[#02A1C8]",
      time: new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      content: chatInput.trim()
    };
    setChatMessages([...chatMessages, newMsg]);
    setChatInput("");
  };

  // The 6 nodes navigation definition
  const NODE_TABS: { id: DetailNodeType; name: string; icon: React.ElementType; badge?: string; dot?: boolean }[] = [
    { id: "progress", name: "1. 实验进展与状态", icon: TrendingUp },
    { id: "scheme", name: "2. 实验方案设计", icon: BookOpen },
    { id: "report", name: "3. 实验报告", icon: Bookmark, badge: String(reportFiles.length) },
    { id: "dataset", name: "4. 原始实验数据", icon: Database, badge: String(nodeDatasets.length) },
    { id: "pi", name: "5. PI 审核与批复", icon: ShieldCheck, dot: step.piStatus !== "未提交" },
    { id: "chat", name: "6. 协作交流", icon: MessageSquare }
  ];

  // Tab 4: 实验数据管理 · 文件类型标签样式
  const DATA_TAG_STYLES: Record<string, string> = {
    PROTOCOL: "bg-slate-50 text-slate-600 border-slate-200",
    REPORT: "bg-sky-50 text-sky-700 border-sky-200",
    RAW_DATA: "bg-amber-50 text-amber-700 border-amber-200",
    DATA: "bg-violet-50 text-violet-700 border-violet-200"
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 半透明遮罩层 */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* 右侧滑出抽屉容器 */}
      <div ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="node-drawer-title" data-node-drawer className="outline-none relative z-10 w-full max-w-4xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        
        {/* 1. 抽屉顶部头部 Header (按照上传页面设计) */}
        <div className="p-5 pb-0 border-b border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              {/* 大标题与图标 */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#02A1C8] flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 id="node-drawer-title" className="text-base md:text-lg font-bold text-slate-900">
                  {step.order}. {step.title}
                </h2>
              </div>

              {/* 阶段描述 */}
              <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                {project.name} · {step.description || step.category}
              </p>
            </div>

            {/* 右侧动作按钮 */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={!isLegacy}
                onClick={() => setIsAiDiagOpen(!isAiDiagOpen)}
                className={cn(
                  "h-8 px-3 text-xs gap-1.5 cursor-pointer font-medium rounded-lg transition-all",
                  isAiDiagOpen 
                    ? "bg-[#02A1C8] text-white border-[#02A1C8]" 
                    : "bg-sky-50 text-[#02A1C8] border-sky-200 hover:bg-sky-100"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 节点诊断</span>
              </Button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="关闭抽屉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI 节点诊断展开条 */}
          {isLegacy && isAiDiagOpen && (
            <div className="mt-3 p-3.5 bg-gradient-to-r from-sky-50 to-blue-50/60 border border-sky-200 rounded-xl text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sky-900">
                  <Sparkles className="w-3.5 h-3.5 text-[#02A1C8]" />
                  <span>AI 智能节点质控诊断评估 (阶段 01)</span>
                </div>
                <Badge className="bg-white text-emerald-700 border-emerald-200 text-[10px] font-mono">
                  合规度: 98.5% · 准予放行
                </Badge>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                <strong>诊断结论：</strong>本节点立项考核指标（Tm、残余酶活、表达量约束、专利FTO空间）定义清晰完整。已核验 Aspergillus niger AppA（UniProt: P34752）全长野生型基准数据。<strong>下一阶段建议：</strong>进入阶段 02 后，重点抓取 16 种嗜热真菌中晶体分辨率优于 2.0 Å 的拓扑骨架，重点标记 Loop2 与 Loop8 柔性区域。
              </p>
            </div>
          )}

          {/* 2. 6个子节点横向导航选项卡 (Segmented Tab Bar 按照上传页面展示) */}
          <div className="flex items-center gap-2 mt-4 pb-2.5 overflow-x-auto no-scrollbar border-b border-slate-200/90">
            {NODE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeNode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeActiveNode(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer rounded-lg",
                    isActive 
                      ? "border-2 border-slate-800 text-[#02A1C8] bg-white shadow-2xs font-bold" 
                      : "border border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#02A1C8]" : "text-slate-400")} />
                  <span>{tab.name}</span>
                  {tab.dot && (
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-rose-500" : "bg-rose-400")} />
                  )}
                  {tab.badge && (
                    <span className={cn(
                      "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono",
                      isActive ? "bg-sky-100 text-[#02A1C8] font-bold" : "bg-slate-100 text-slate-500"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 抽屉滚动主体内容区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ======================================================== */}
          {/* TAB 1: 实验进展与状态 (1:1 复刻用户上传页面及样式规范) */}
          {/* ======================================================== */}
          {activeNode === "progress" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {progressError&&<p role="alert" className="text-sm text-rose-700">{progressError}</p>}
              {/* 保存成功提示 Banner */}
              {isProgressSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">实验进展与状态已保存！已同步至研发流程看板及操作流水。</span>
                  </div>
                  <Badge className="bg-white text-emerald-700 border-emerald-200 text-[10px]">已更新</Badge>
                </div>
              )}

              {/* 核心卡片容器 */}
              <div className="rounded-2xl border border-sky-200/80 bg-white p-6 md:p-8 shadow-2xs space-y-6">
                
                {/* 卡片头部: 实验进展与状态 */}
                <div>
                  <div className="flex items-center gap-2 pb-3">
                    <SlidersHorizontal className="w-4 h-4 text-[#02A1C8]" />
                    <span className="text-xs font-bold text-slate-800">实验进展与状态</span>
                  </div>
                  <div className="border-b border-slate-100 -mx-6 md:-mx-8" />
                </div>

                {/* 第一行: 3 列 (项目编号, 项目负责人, 阶段负责人) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#02A1C8]" />
                      <span>项目编号</span>
                    </label>
                    <Input
                      aria-label="项目编号" value={formProjectNo}
                      onChange={(e) => setFormProjectNo(e.target.value)}
                      className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-[#02A1C8] text-slate-800 font-mono rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                      <User className="w-3.5 h-3.5 text-[#02A1C8]" />
                      <span>项目负责人</span>
                    </label>
                    <Input
                      aria-label="项目负责人" value={formProjectLead}
                      onChange={(e) => setFormProjectLead(e.target.value)}
                      className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-[#02A1C8] text-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                      <User className="w-3.5 h-3.5 text-[#02A1C8]" />
                      <span>阶段负责人</span>
                    </label>
                    <Input
                      aria-label="阶段负责人" value={formStageLead}
                      onChange={(e) => setFormStageLead(e.target.value)}
                      className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-[#02A1C8] text-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* 第二行: 3 列 (计划开始, 计划结束, 当前进度) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      计划开始
                    </label>
                    <div className="relative">
                      <Input
                        aria-label="计划开始" value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-[#02A1C8] text-slate-800 font-mono pr-9 rounded-lg"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      计划结束
                    </label>
                    <div className="relative">
                      <Input
                        aria-label="计划结束" value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-[#02A1C8] text-slate-800 font-mono pr-9 rounded-lg"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#02A1C8]" />
                      <span>当前进度</span>
                    </label>
                    <select
                      aria-label="当前进度" value={formProgress}
                      onChange={(e) => setFormProgress(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02A1C8] text-slate-800 font-mono cursor-pointer"
                    >
                      <option value="100%">100%</option>
                      <option value="90%">90%</option>
                      <option value="75%">75%</option>
                      <option value="50%">50%</option>
                      <option value="25%">25%</option>
                      <option value="0%">0%</option>
                    </select>
                  </div>
                </div>

                {/* 第三行: 2 列 (状态, 风险等级) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#02A1C8]" />
                      <span>状态</span>
                    </label>
                    <select
                      aria-label="状态" value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02A1C8] text-slate-800 cursor-pointer"
                    >
                      <option value="已完成">已完成</option>
                      <option value="进行中">进行中</option>
                      <option value="未开始">未开始</option>
                      <option value="阻塞中">阻塞中</option>
                      <option value="延期调整">延期调整</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      风险等级
                    </label>
                    <select
                      aria-label="风险等级" value={formRiskLevel}
                      onChange={(e) => setFormRiskLevel(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02A1C8] text-slate-800 cursor-pointer"
                    >
                      <option value="正常受控">正常受控</option>
                      <option value="低风险">低风险</option>
                      <option value="中风险">中风险</option>
                      <option value="高风险">高风险</option>
                    </select>
                  </div>
                </div>

                {/* 第四行: 进展说明 */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    进展说明
                  </label>
                  <Textarea
                    aria-label="进展说明" value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="简要填写当前已完成内容、待处理问题或下一步动作..."
                    rows={3}
                    className="text-xs bg-white border-slate-200 focus-visible:ring-[#02A1C8] text-slate-800 rounded-lg resize-none leading-relaxed placeholder:text-slate-400"
                  />
                </div>

                {/* 底部操作行: 操作人与保存按钮 */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <span>操作人:</span>
                    <span className="font-semibold text-slate-900">{identity.name}</span>
                  </div>

                  <Button
                    onClick={handleSaveProgress}
                    className="h-10 px-5 text-xs font-bold gap-2 bg-[#02A1C8] hover:bg-[#0281a0] text-white shadow-xs transition-colors rounded-lg cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存实验进展与状态</span>
                  </Button>
                </div>
              </div>

              {isLegacy ? <>
              {/* 辅助折叠面板: 查看考核技术指标基准 (KPIs) 与执行里程碑流水 */}
              <div className="pt-1">
                <button
                  onClick={() => setShowKpiDetails(!showKpiDetails)}
                  className="text-xs text-slate-500 hover:text-[#02A1C8] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#02A1C8]" />
                  <span>{showKpiDetails ? "收起立项考核基准与执行流水" : "展开查看立项考核指标基准 (KPIs) 与执行里程碑流水"}</span>
                  <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showKpiDetails && "rotate-90")} />
                </button>

                {showKpiDetails && (
                  <div className="mt-4 space-y-6 pt-4 border-t border-slate-200 animate-in fade-in duration-200">
                    {/* 核心考核指标定义表 */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                          <TrendingUp className="w-4 h-4 text-[#02A1C8]" />
                          <span>立项技术指标基准与总体考核目标 (KPIs)</span>
                        </h3>
                        <span className="text-[11px] text-slate-400">已固化为验收标准</span>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                              <th className="py-2.5 px-3">指标维度</th>
                              <th className="py-2.5 px-3">野生型基准 (WT Baseline)</th>
                              <th className="py-2.5 px-3">改造目标值 (Target)</th>
                              <th className="py-2.5 px-3">评价验证规范与方法</th>
                              <th className="py-2.5 px-3 text-right">状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">耐受变性温度 (Tm)</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">62.4℃</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-[#02A1C8]">≥ 85.0℃ (+22.6℃)</td>
                              <td className="py-2.5 px-3 text-slate-600">差示扫描量热法 (DSC) / CD 光谱测定</td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">指标已确立</Badge>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">高温残余酶活力</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">85℃ 10min &lt; 5%</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-[#02A1C8]">≥ 80.0% 保持率</td>
                              <td className="py-2.5 px-3 text-slate-600">85℃ 热处理 10min 钼蓝定磷法测定残余活性</td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">指标已确立</Badge>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">常温催化比活力</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">16,200 U/mg</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-[#02A1C8]">≥ WT 的 80% (≥ 12,960 U/mg)</td>
                              <td className="py-2.5 px-3 text-slate-600">37℃ pH 5.5 植酸钠底物酶促动力学 Km/kcat 测定</td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">约束已固化</Badge>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">发酵表达得率下限</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">0.8 g/L (摇瓶)</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-[#02A1C8]">≥ 2.0 g/L (50L中试罐)</td>
                              <td className="py-2.5 px-3 text-slate-600">毕赤酵母甲醇流加诱导发酵上清总蛋白测定</td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">约束已固化</Badge>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">专利 FTO 空间</td>
                              <td className="py-2.5 px-3 text-slate-500">无在先自主专利</td>
                              <td className="py-2.5 px-3 font-bold text-slate-800">申请核心发明专利 2~3 项</td>
                              <td className="py-2.5 px-3 text-slate-600">覆盖特定二硫键与刚性化突变序列权利要求</td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">检索无冲突</Badge>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 里程碑节点流水 Timeline */}
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Clock className="w-4 h-4 text-[#02A1C8]" />
                        <span>节点里程碑执行事件流水 (Timeline)</span>
                      </h3>

                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                        {[
                          { date: "2026-01-10", title: "课题申报立项与学术委员会答辩", desc: "完成立项答辩，确立工业耐高温植酸酶重塑总体任务，分配统一流水号 BIO-2026-ENZ-01。" },
                          { date: "2026-01-25", title: "全球专利壁垒检索与自由实施度 (FTO) 分析", desc: "完成 1,280 件全球植酸酶专利排查，确认计划改造的 3 处二硫键位点处于自主知识产权空白区。" },
                          { date: "2026-02-15", title: "理性重塑技术指标细化与盲测质控标准编制", desc: "明确 Tm ≥ 85℃、高温残余酶活 ≥ 80% 核心考核门槛，编制标准操作规程 (SOP)。" },
                          { date: "2026-03-02", title: "专家咨询委员会线上评审与预算审定", desc: "邀请中国生物工程学会专家开展线上论证，全票通过实施细则，核准第一期专项预算 ¥1,500,000。" },
                          { date: "2026-03-10", title: "PI 张立华审签任务书，节点结项归档", desc: "签署立项任务书与阶段成果交付单，系统自动解锁阶段 02（基础数据与知识库整理）。" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 relative">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                              {idx + 1}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#02A1C8]">{item.date}</span>
                                <span className="text-xs font-bold text-slate-800">{item.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </> : <div className="rounded-xl border bg-slate-50 p-4 text-xs space-y-2"><h3 className="font-semibold">研究目标与节点计划</h3><p>{project.objective || "待补充研究目标"}</p><p>{step.description || "待补充节点任务说明"}</p></div>}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: 实验方案设计 (按照上传页面 1:1 精确排布) */}
          {/* ======================================================== */}
          {activeNode === "scheme" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* 操作提示 Toast Banner */}
              {schemeActionToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{schemeActionToast}</span>
                  </div>
                  <Badge className="bg-white text-emerald-700 border-emerald-200 text-[10px]">已更新</Badge>
                </div>
              )}

              {/* 卡片 1: 实验方案管理 */}
              <div className="rounded-2xl border border-sky-200/80 bg-white p-5 md:p-6 shadow-2xs space-y-4">
                {/* 头部标题与操作按钮 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#02A1C8]" />
                    <h3 className="text-xs font-bold text-slate-800 tracking-wide">实验方案管理</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerSchemeToast("已下载「课题立项与目标定义_标准实验方案模板.docx」")}
                      className="h-8 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#02A1C8] cursor-pointer rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>模板下载</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleUploadSchemeMock}
                      className="h-8 px-3 text-xs gap-1.5 bg-[#02A1C8] hover:bg-[#0281a0] text-white cursor-pointer rounded-lg shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传方案</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const name = window.prompt("请输入新建实验方案名称:", `${step.title}_实验方案.docx`);
                        if (name) {
                          setSchemeFiles(prev => [
                            {
                              id: `sch-${Date.now()}`,
                              name,
                              size: "1.6 MB",
                              type: "PROTOCOL",
                              uploader: "张立华 教授 (PI)",
                              date: new Date().toISOString().slice(0, 10),
                              summary: "新建在线实验方案设计任务书与测试矩阵。"
                            },
                            ...prev
                          ]);
                          triggerSchemeToast(`方案「${name}」已成功新建创建！`);
                        }
                      }}
                      className="h-8 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#02A1C8] cursor-pointer rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>新建方案</span>
                    </Button>
                  </div>
                </div>

                {/* 方案文件列表 */}
                <div className="divide-y divide-slate-100">
                  {!schemeFiles.length && <p className="p-6 text-center text-xs text-slate-400">本节点暂无实验方案。</p>}
                  {schemeFiles.map((file) => (
                    <div
                      key={file.id}
                      className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      {/* 左侧文件名与元信息 */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {file.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{file.size}</span>
                          <span>·</span>
                          <span className="text-[#02A1C8] font-bold">{file.type}</span>
                          <span>·</span>
                          <span className="text-slate-500 font-sans">上传人: {file.uploader}</span>
                        </div>
                      </div>

                      {/* 右侧 4 个动作操作图标 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewDocModal({ title: file.name, type: file.type, desc: file.summary })}
                          className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-[#02A1C8] hover:text-[#02A1C8] hover:bg-sky-50/50 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="预览方案"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => triggerSchemeToast(`正在下载文件: ${file.name}`)}
                          className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-[#02A1C8] hover:text-[#02A1C8] hover:bg-sky-50/50 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="下载文件"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            const newName = window.prompt("重命名方案文件:", file.name);
                            if (newName && newName !== file.name) {
                              setSchemeFiles(prev => prev.map(f => f.id === file.id ? { ...f, name: newName } : f));
                              triggerSchemeToast(`方案已重命名为「${newName}」`);
                            }
                          }}
                          className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-[#02A1C8] hover:text-[#02A1C8] hover:bg-sky-50/50 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="编辑方案名称与信息"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteScheme(file.id, file.name)}
                          className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-red-200 hover:text-red-600 hover:bg-red-50/60 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="删除方案"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 卡片 2: 相关文献、历史参考资料管理 */}
              <div className="rounded-2xl border border-sky-200/80 bg-white p-5 md:p-6 shadow-2xs space-y-4">
                {/* 头部标题与操作按钮 */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-slate-800 tracking-wide">相关文献、历史参考资料管理</h3>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadRefMock}
                    className="h-8 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#02A1C8] cursor-pointer rounded-lg"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>上传资料</span>
                  </Button>
                </div>

                {/* 资料与文献列表 */}
                <div className="divide-y divide-slate-100">
                  {referenceFiles.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      {/* 左侧详情 */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                          {item.badge && (
                            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-mono text-[10px] px-1.5 py-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>

                        {/* 元信息行 */}
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.meta}
                        </div>

                        {/* 摘要/描述 */}
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* 右侧动作操作图标 */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {item.isPaper && (
                          <button
                            onClick={() => setPreviewDocModal({ title: item.title, type: "ACADEMIC_PAPER", desc: item.description })}
                            className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                            title="阅读文献全文"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setPreviewDocModal({ title: item.title, type: item.badge || "DOCUMENT", desc: item.description })}
                          className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-[#02A1C8] hover:text-[#02A1C8] hover:bg-sky-50/50 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="查看详情与预览"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => triggerSchemeToast(`正在下载: ${item.title}`)}
                          className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-[#02A1C8] hover:text-[#02A1C8] hover:bg-sky-50/50 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="下载参考资料"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => triggerSchemeToast(`已复制文献引用信息 / 归档标识: ${item.title.slice(0, 30)}...`)}
                          className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="复制资料引用/标识"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {item.isPaper && (
                          <button
                            onClick={() => handleDeleteReference(item.id, item.title)}
                            className="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:border-red-200 hover:text-red-600 hover:bg-red-50/60 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                            title="移出参考列表"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 卡片 3: 本阶段标准操作规程 (SOP) 与质控门槛 (按照上传页面 1:1 精确排布) */}
              <div className="rounded-2xl border border-sky-200/80 bg-white p-5 md:p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#02A1C8]" />
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                    本阶段标准操作规程 (SOP) 与质控门槛
                  </h3>
                </div>

                <textarea
                  value={sopQcText}
                  onChange={(e) => setSopQcText(e.target.value)}
                  rows={5}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 leading-relaxed font-normal focus:outline-none focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8] transition-all resize-y shadow-2xs"
                  placeholder="请输入本阶段标准操作规程与质控门槛要求..."
                />
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: 实验报告 (1:1 精确复刻用户上传页面及系统风格) */}
          {/* ======================================================== */}
          {activeNode === "report" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* 操作提示 Toast Banner */}
              {reportActionToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{reportActionToast}</span>
                  </div>
                  <Badge className="bg-white text-emerald-700 border-emerald-200 text-[10px]">已更新</Badge>
                </div>
              )}

              {/* 卡片 1: 实验结论与科学产出 (Experimental Conclusions) */}
              <div className="rounded-2xl border border-sky-200/80 bg-white p-5 md:p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#02A1C8]" />
                    <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                      实验结论与科学产出 (Experimental Conclusions)
                    </h3>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isEditingConclusion) {
                        triggerReportToast("实验结论与科学产出已成功保存！");
                      }
                      setIsEditingConclusion(!isEditingConclusion);
                    }}
                    className="h-8 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#02A1C8] cursor-pointer rounded-lg font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{isEditingConclusion ? "保存结论" : "编辑结论"}</span>
                  </Button>
                </div>

                {isEditingConclusion ? (
                  <Textarea
                    value={conclusionText}
                    onChange={(e) => setConclusionText(e.target.value)}
                    rows={3}
                    className="text-xs text-slate-700 leading-relaxed border-slate-200 focus-visible:ring-[#02A1C8] rounded-xl"
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-700 leading-relaxed font-normal shadow-2xs">
                    {conclusionText}
                  </div>
                )}
              </div>

              {/* 卡片 2: 报告文件列表 (3) */}
              <div className="rounded-2xl border border-sky-200/80 bg-white p-5 md:p-6 shadow-2xs space-y-4">
                {/* 头部标题与 4 个功能操作按钮 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                      报告文件列表 ({reportFiles.length})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerReportToast("已下载「阶段实验报告与科学产出标准模板.docx」")}
                      className="h-8 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#02A1C8] cursor-pointer rounded-lg font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>模板下载</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadReport}
                      className="h-8 px-3 text-xs gap-1.5 border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100/70 cursor-pointer rounded-lg font-medium"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传报告</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleNewReport}
                      className="h-8 px-3 text-xs gap-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer rounded-lg font-medium shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新建报告</span>
                    </Button>

                    <button
                      onClick={handleBatchDownloadReports}
                      className="text-xs text-[#02A1C8] hover:text-[#0281a0] flex items-center gap-1 font-medium transition-colors cursor-pointer ml-1 py-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>一键批量下载报告</span>
                    </button>
                  </div>
                </div>

                {/* 报告文件列表卡片 */}
                <div className="space-y-3">
                  {!reportFiles.length && <p className="p-6 text-center text-xs text-slate-400">本节点暂无实验报告记录。</p>}
                  {reportFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 md:p-4 rounded-xl border border-slate-200/90 bg-white hover:border-[#02A1C8]/40 hover:bg-slate-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      {/* 左侧文档紫色方标与信息 */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">
                              {file.name}
                            </h4>
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-200/70 text-[10px] px-1.5 py-0 font-medium">
                              {file.badge}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                            <span>{file.size}</span>
                            <span>·</span>
                            <span>格式: {file.format}</span>
                            <span>·</span>
                            <span className="font-sans">上传人: {file.uploader}</span>
                            <span>·</span>
                            <span>校验码: {file.checksum}</span>
                          </div>
                        </div>
                      </div>

                      {/* 右侧动作按钮 (预览, 下载, 编辑, 删除) */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewDocModal({ title: file.name, type: file.badge, desc: file.summary })}
                          className="h-8 px-3 text-xs gap-1 border-slate-200 text-slate-700 hover:text-[#02A1C8] hover:border-[#02A1C8] rounded-lg cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>预览</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerReportToast(`正在下载文件: ${file.name}`)}
                          className="h-8 px-3 text-xs gap-1 border-slate-200 text-slate-700 hover:text-[#02A1C8] hover:border-[#02A1C8] rounded-lg cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>下载</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(file.id, file.name)}
                          className="h-8 px-3 text-xs gap-1 border-slate-200 text-slate-700 hover:text-[#02A1C8] hover:border-[#02A1C8] rounded-lg cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>编辑</span>
                        </Button>

                        <button
                          onClick={() => handleDeleteReport(file.id, file.name)}
                          className="w-8 h-8 rounded-lg border border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                          title="删除报告"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: 原始实验数据 */}
          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* TAB 4: 原始实验数据 (实验数据管理 · 按上传页面 1:1 实现) */}
          {/* ======================================================== */}
          {activeNode === "dataset" && <div className="space-y-5"><NodeDatasets project={project} step={step} /><div className="rounded-xl border bg-white p-4"><ProjectSamples project={project} initialNodeId={step.id} /></div></div>}

          {activeNode === "pi" && <div key={step.id}><NodeReviewPanel project={project} step={step} /></div>}

          {activeNode === "chat" && (
            <div className="space-y-4 animate-in fade-in duration-200 flex flex-col h-full min-h-[500px]">
              {/* 交流概况条 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#02A1C8]" />
                  <span className="font-bold text-slate-800">阶段学术交流研讨与答疑</span>
                  <Badge variant="outline" className="bg-white text-slate-600 text-[10px] font-mono">
                    共 {chatMessages.length} 条研讨
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400">全部核心技术疑问已闭环答复</span>
              </div>

              {/* 消息流水列表 */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] p-1 pr-2">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs", msg.avatarBg)}>
                          {msg.sender.substring(0, 1)}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{msg.sender}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-sans">
                          {msg.role}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{msg.time}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-8">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* 底部输入框 */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="输入学术问题、方案建议或阶段答复内容..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    className="text-xs h-9 border-slate-200 focus-visible:ring-[#02A1C8]"
                  />
                  <Button 
                    size="sm"
                    onClick={handleSendChatMessage}
                    className="h-9 px-4 bg-[#02A1C8] hover:bg-[#0281a0] text-white shrink-0 gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>发送</span>
                  </Button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">按 Enter 发送，实时同步至科研中台课题协作日志</span>
              </div>
            </div>
          )}

        </div>

        {/* 文档与文献预览弹窗 Preview Modal */}
        {previewDocModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-sky-100 text-[#02A1C8] border-none font-mono text-[10px]">
                      {previewDocModal.type}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">在线受控受阅副本</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {previewDocModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewDocModal(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600 leading-relaxed">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#02A1C8]" />
                  <span>核心摘要与内容概要</span>
                </div>
                <p>{previewDocModal.desc || "本文件为课题立项与目标定义阶段的关键归档材料，经学术委员会与项目负责人审核批准，已受控固化。"}</p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-200/60">
                  <span>安全密级: 内部受控 (Level 2)</span>
                  <span>版本状态: 已验真通过</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewDocModal(null)}
                  className="h-8 text-xs border-slate-200"
                >
                  关闭
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    triggerSchemeToast(`已发起下载「${previewDocModal.title}」`);
                    triggerDatasetToast(`已发起下载「${previewDocModal.title}」`);
                    setPreviewDocModal(null);
                  }}
                  className="h-8 text-xs bg-[#02A1C8] hover:bg-[#0281a0] text-white gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载此文件</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 4. 抽屉底部工具栏 Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>支持使用键盘 <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">ESC</kbd> 快捷关闭</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs border-slate-200 cursor-pointer">
              关闭抽屉
            </Button>
            {activeNode !== "chat" && (
              <Button 
                size="sm" 
                onClick={() => {
                  const nodeIds: DetailNodeType[] = ["progress", "scheme", "report", "dataset", "pi", "chat"];
                  const currentIndex = nodeIds.indexOf(activeNode);
                  if (currentIndex < nodeIds.length - 1) {
                    onChangeActiveNode(nodeIds[currentIndex + 1]);
                  }
                }}
                className="h-8 text-xs bg-[#02A1C8] hover:bg-[#0281a0] text-white gap-1 cursor-pointer"
              >
                <span>下一节点详情</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
