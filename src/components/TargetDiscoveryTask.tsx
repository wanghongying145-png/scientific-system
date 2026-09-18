import { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronDown,
  ChevronsUpDown,
  RotateCcw, 
  Send, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  History,
  XCircle,
  Lock,
  Info,
  Search,
  Sliders,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const DISEASE_OPTIONS = [
  "()-2-methylthiazolidine measurement",
  "(14 or 15)-methylpalmitate (a17:0 or i17:0) measurement",
  "(16 or 17)-methylstearate (a19:0 or i19:0) measurement",
  "(1R2R)-3-(12-dihydro-2-hydroxy-1-naphthalenyl)thio-2-oxopropanoic acid measurement",
  "(2 or 3)-decenoate (10:1n7 or n8) measurement",
  "(2,4 or 2,5)-dimethylphenol sulfate measurement",
  "childhood asthma (MONDO_0004979)",
  "disabling pansclerotic morphea of childhood (MONDO_0957497)",
  "non-small cell lung cancer (NSCLC)",
];

export function TargetDiscoveryTask({ 
  onBack, 
  onViewResult 
}: { 
  onBack: () => void; 
  onViewResult: (task: any) => void 
}) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference');

  // Task Settings State
  const [taskName, setTaskName] = useState("TD-2026-08-31-1024");
  const [taskDesc, setTaskDesc] = useState(
    "基于多组学和文献证据，发现儿童哮喘相关候选靶标，并增加小鼠动物模型验证证据。"
  );

  // Parameter Settings State
  const [diseaseName, setDiseaseName] = useState("");
  const [isDiseaseDropdownOpen, setIsDiseaseDropdownOpen] = useState(false);
  const [candidateCount, setCandidateCount] = useState<number | string>(9);
  const [enableMouseEvidence, setEnableMouseEvidence] = useState(true);

  // Error validation
  const [descError, setDescError] = useState(false);
  const [diseaseError, setDiseaseError] = useState(false);

  // Search in History
  const [historySearchTerm, setHistorySearchTerm] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDiseaseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered disease list
  const filteredDiseases = DISEASE_OPTIONS.filter((d) =>
    d.toLowerCase().includes(diseaseName.toLowerCase().trim())
  );

  // History Tasks State
  const [historyTasks, setHistoryTasks] = useState([
    { 
      id: 'TD-2026-08-31-1024', 
      name: '儿童哮喘相关人类候选靶标发现与小鼠动物模型证据查询', 
      model: 'Open Targets 靶标发现与验证模型', 
      start: '2026-08-31 10:24:00', 
      end: '2026-08-31 10:24:18', 
      status: 'success', 
      params: { 
        model: 'Open Targets 靶标发现与验证模型',
        disease: '儿童哮喘 · MONDO_0004979',
        species: '人类 · Homo sapiens · 9606',
        topN: '9',
        enableMouse: true,
        mouseSpecies: '小鼠 · Mus musculus · 10090',
        dataVersion: 'Open Targets Platform 26.06',
        dataSource: 'Open Targets / Ensembl / MGI / IMPC',
        execTime: '2026-08-31 10:24',
        desc: '基于多组学和文献证据，发现儿童哮喘相关候选靶标，并增加小鼠动物模型验证证据。' 
      } 
    },
    { 
      id: 'TD-2026-08-18-1420', 
      name: '儿童禁用性全硬化性斑块状硬皮病靶标发现', 
      model: 'Open Targets 靶标发现与验证模型', 
      start: '2026-08-18 14:20:10', 
      end: '2026-08-18 14:20:15', 
      status: 'success', 
      params: { 
        model: 'Open Targets 靶标发现与验证模型',
        species: '人类 Homo sapiens · Taxon 9606',
        topN: '20',
        enableMouse: true,
        mouseSpecies: '小鼠 Mus musculus · Taxon 10090',
        desc: '针对儿童禁用性全硬化性斑块状硬皮病的候选靶标筛选与多维证据关联验证。' 
      } 
    },
    { 
      id: 'TD-2026-08-15-0915', 
      name: '针对NSCLC候选靶标发现与验证', 
      model: 'Open Targets 靶标发现与验证模型', 
      start: '2026-08-15 09:15:22', 
      end: '2026-08-15 09:15:27', 
      status: 'success', 
      params: { 
        model: 'Open Targets 靶标发现与验证模型',
        species: '人类 Homo sapiens · Taxon 9606',
        topN: '10',
        enableMouse: false,
        desc: '非小细胞肺癌相关关键候选靶点识别及多组学文献证据整合。' 
      } 
    },
  ]);

  // Handle Reset according to screenshot default
  const handleReset = () => {
    setTaskName("TD-2026-08-31-1024");
    setTaskDesc("基于多组学和文献证据，发现儿童哮喘相关候选靶标，并增加小鼠动物模型验证证据。");
    setDiseaseName("");
    setIsDiseaseDropdownOpen(false);
    setCandidateCount(9);
    setEnableMouseEvidence(true);
    setDescError(false);
    setDiseaseError(false);
  };

  // Handle Submit
  const handleSubmit = () => {
    let hasError = false;
    if (!taskDesc.trim()) {
      setDescError(true);
      hasError = true;
    }
    if (!diseaseName.trim()) {
      setDiseaseError(true);
      hasError = true;
    }

    if (hasError) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const autoId = `TD-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

    const newTask = {
      id: taskName.trim() || autoId,
      name: taskName.trim() || "未命名靶标发现任务",
      model: "Open Targets 靶标发现与验证模型",
      start: timeStr,
      end: timeStr,
      status: 'success' as const,
      params: {
        model: "Open Targets 靶标发现与验证模型",
        disease: diseaseName.trim() || "儿童哮喘 · MONDO_0004979",
        species: '人类 · Homo sapiens · 9606',
        topN: String(candidateCount || 9),
        enableMouse: enableMouseEvidence,
        mouseSpecies: enableMouseEvidence ? '小鼠 · Mus musculus · 10090' : undefined,
        dataVersion: 'Open Targets Platform 26.06',
        dataSource: 'Open Targets / Ensembl / MGI / IMPC',
        execTime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
        desc: taskDesc
      }
    };

    setHistoryTasks([newTask, ...historyTasks]);
    onViewResult(newTask);
  };

  const filteredHistory = historyTasks.filter(item => 
    item.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    item.params.desc.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#edf2f7] min-h-screen text-slate-800">
      {/* Header Area */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="rounded-full hover:bg-slate-100 transition-colors mt-1"
            title="返回模型中心"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">靶标发现与验证模型</h1>
                <Badge variant="outline" className="text-xs">Open Targets</Badge>
              </div>
              <p className="text-xs text-muted-foreground">基于 Open Targets 平台多维证据源的系统化靶标发现与综合评分验证</p>
            </div>

            {/* Tab Selection (放在标题下方) */}
            <div className="flex items-center bg-[#F1F4F9] p-1 rounded-full w-fit">
              <button 
                onClick={() => setActiveTab('inference')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium transition-all cursor-pointer",
                  activeTab === 'inference' ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A]"
                )}
              >
                <Sliders className="w-4 h-4" />
                <span>模型推理</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium transition-all cursor-pointer",
                  activeTab === 'history' ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A]"
                )}
              >
                <History className="w-4 h-4" />
                <span>历史任务</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        <div className="py-8 px-4 max-w-4xl mx-auto space-y-6">
          
          {activeTab === 'inference' ? (
            <div className="space-y-6 pb-12 animate-in fade-in duration-200">
              
              {/* ================= CARD 1: 任务设置 ================= */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 md:p-8 space-y-6">
                
                {/* Section Header */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0284c7] font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">任务设置</h2>
                </div>

                {/* Field 1: 任务名称 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    任务名称
                  </label>
                  <Input
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="请输入任务名称"
                    className="h-10 text-xs bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 font-normal"
                  />
                </div>

                {/* Field 2: 任务描述 (必填 *) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>任务描述</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                  </div>

                  <div className="relative">
                    <textarea
                      value={taskDesc}
                      onChange={(e) => {
                        setTaskDesc(e.target.value);
                        if (descError && e.target.value.trim()) {
                          setDescError(false);
                        }
                      }}
                      rows={4}
                      placeholder="基于多组学和文献证据，发现儿童哮喘相关候选靶标，并增加小鼠动物模型验证证据。"
                      className={cn(
                        "w-full p-3 text-xs bg-white border rounded-lg text-slate-800 leading-relaxed font-normal focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-y min-h-[96px]",
                        descError 
                          ? "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/20" 
                          : "border-slate-200"
                      )}
                    />
                  </div>

                  <p className="text-[12px] text-slate-400">
                    建议描述疾病名称、研究人群、关注的组学类型或验证目标。
                  </p>

                  {descError && (
                    <p className="text-xs text-red-500 font-medium">
                      请填写任务描述以启动靶标发现分析。
                    </p>
                  )}
                </div>

              </div>

              {/* ================= CARD 2: 参数配置 ================= */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 md:p-8 space-y-6">
                
                {/* Section Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-sky-600" />
                    <h2 className="text-sm font-bold text-slate-900">参数配置</h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    输入疾病关键词与返回数量，快速生成面向该疾病的候选靶标与验证结果。
                  </p>
                </div>

                {/* Field 1: 疾病名称 (必填 *) */}
                <div className="space-y-2" ref={dropdownRef}>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>疾病名称</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>

                  <div className="relative">
                    <div 
                      className={cn(
                        "w-full h-10 px-3.5 bg-white border rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer",
                        isDiseaseDropdownOpen 
                          ? "border-[#38bdf8] ring-2 ring-sky-100" 
                          : diseaseError
                            ? "border-red-400 bg-red-50/20"
                            : "border-slate-300 hover:border-slate-400"
                      )}
                      onClick={() => setIsDiseaseDropdownOpen(!isDiseaseDropdownOpen)}
                    >
                      <input
                        type="text"
                        value={diseaseName}
                        onChange={(e) => {
                          setDiseaseName(e.target.value);
                          setIsDiseaseDropdownOpen(true);
                          if (diseaseError && e.target.value.trim()) {
                            setDiseaseError(false);
                          }
                        }}
                        onFocus={() => setIsDiseaseDropdownOpen(true)}
                        placeholder="请输入疾病名称，例如 NSCLC"
                        className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs font-normal"
                      />
                      <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </div>

                    {/* Dropdown Options List */}
                    {isDiseaseDropdownOpen && (
                      <div className="absolute z-30 w-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1 text-xs animate-in fade-in-50 zoom-in-95 duration-100">
                        {filteredDiseases.length === 0 ? (
                          <div className="px-4 py-3 text-slate-400 text-center">
                            未匹配到建议项，可直接按输入内容提交
                          </div>
                        ) : (
                          filteredDiseases.map((disease) => {
                            const isSelected = diseaseName === disease;
                            return (
                              <div
                                key={disease}
                                onClick={() => {
                                  setDiseaseName(disease);
                                  setIsDiseaseDropdownOpen(false);
                                  setDiseaseError(false);
                                }}
                                className={cn(
                                  "px-4 py-2.5 cursor-pointer text-slate-700 hover:bg-slate-100/80 transition-colors flex items-center justify-between",
                                  isSelected && "bg-slate-100 font-medium text-slate-900"
                                )}
                              >
                                <span>{disease}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 ml-2 shrink-0" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {diseaseError && (
                    <p className="text-xs text-red-500 font-medium">
                      请选择或输入疾病名称。
                    </p>
                  )}
                </div>

                {/* Field 2 & 3: 靶标物种 (左) + 候选靶标数量 (右) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 靶标物种 */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      靶标物种
                    </label>
                    <div className="h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <span className="text-xs text-slate-800 font-normal">
                        人类 Homo sapiens · Taxon 9606
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded font-normal shrink-0">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>固定条件</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-slate-400">
                      候选靶标统一输出为人类 Ensembl Gene。
                    </p>
                  </div>

                  {/* 候选靶标数量 */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      候选靶标数量
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={candidateCount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCandidateCount(val === '' ? '' : Number(val));
                      }}
                      className="h-10 text-xs bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500 font-normal"
                    />
                    <p className="text-[12px] text-slate-400">
                      允许范围：1 ~ 100。
                    </p>
                  </div>

                </div>

                {/* Nested Box: 添加小鼠动物模型验证证据 */}
                <div className="border border-sky-100 bg-[#f4f9fd]/80 rounded-xl p-5 space-y-4">
                  
                  {/* Top Switch Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">
                        添加小鼠动物模型验证证据
                      </h4>
                      <p className="text-[12px] text-slate-500">
                        匹配人鼠同源基因、MGI小鼠表型及IMPC疾病相关动物模型证据。
                      </p>
                    </div>

                    {/* Switch Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enableMouseEvidence}
                      onClick={() => setEnableMouseEvidence(!enableMouseEvidence)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5",
                        enableMouseEvidence ? "bg-[#0284c7]" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          enableMouseEvidence ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Expanded Content when Switch is ON */}
                  {enableMouseEvidence && (
                    <div className="pt-3 border-t border-sky-100/90 space-y-2 animate-in fade-in-50 duration-150">
                      <label className="block text-xs font-bold text-slate-800">
                        动物模型物种
                      </label>
                      <div className="h-10 px-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-2xs">
                        <span className="text-xs text-slate-800 font-normal">
                          小鼠 Mus musculus · Taxon 10090
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded font-normal shrink-0">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>固定条件</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Information Tip Notice Banner */}
                <div className="p-3 bg-slate-100/70 border border-slate-200/70 rounded-lg flex items-start gap-2 text-[12px] text-slate-500 leading-normal">
                  <span className="text-slate-400 font-bold shrink-0 mt-0.5">ⓘ</span>
                  <span>
                    当前模型输出人类候选靶标；小鼠数据仅作为跨物种动物模型验证证据，不改变候选靶标所属物种。
                  </span>
                </div>

              </div>

              {/* ================= BOTTOM ACTION BUTTONS ================= */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-9 px-6 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 text-xs rounded-lg font-medium shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>清空重置</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="h-9 px-7 bg-[#58C2DE] hover:bg-[#46B2CF] text-white text-xs rounded-lg font-medium shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>提交任务</span>
                </Button>
              </div>

            </div>
          ) : (
            /* ================= TAB 2: 历史任务 ================= */
            <div className="space-y-4 pb-12 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <h2 className="text-xs font-bold text-slate-800">历史推理任务记录</h2>
                  <p className="text-[11px] text-slate-500">查看已提交的靶标发现与验证任务，支持点击进入多维度报告</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="搜索任务名称或 ID..." 
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="h-8.5 pl-8 text-xs bg-slate-50 border-slate-200 rounded-lg" 
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="px-4 py-3 min-w-[140px]">任务 ID</th>
                        <th className="px-4 py-3 min-w-[180px]">任务名称</th>
                        <th className="px-4 py-3 min-w-[200px]">任务描述与模型</th>
                        <th className="px-4 py-3 min-w-[120px]">提交时间</th>
                        <th className="px-4 py-3 min-w-[90px]">状态</th>
                        <th className="px-4 py-3 text-right min-w-[90px]">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                            暂无匹配的任务记录
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3.5 font-mono font-bold text-sky-800">
                              {item.id}
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-800">
                              {item.name}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600">
                              <p className="line-clamp-1 text-slate-700" title={item.params.desc}>
                                {item.params.desc}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.model} · Top {item.params.topN} · {item.params.enableMouse ? "含小鼠证据" : "无小鼠证据"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                              {item.start}
                            </td>
                            <td className="px-4 py-3.5">
                              {item.status === 'success' ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3" />
                                  执行成功
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-medium flex items-center gap-1 w-fit">
                                  <XCircle className="w-3 h-3" />
                                  失败
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewResult(item)}
                                className="h-7 text-xs text-sky-700 hover:text-sky-800 hover:bg-sky-50 font-semibold p-0 px-2"
                              >
                                查看报告
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
