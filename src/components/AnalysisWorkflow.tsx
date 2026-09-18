import React, { useState, useCallback, useMemo } from "react";
import { 
  Play, 
  Settings2, 
  LayoutGrid, 
  GitBranch, 
  Search, 
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Cpu,
  Database,
  FileCode,
  Plus,
  Save,
  Code,
  ShieldCheck,
  Copy,
  Trash2,
  Maximize2,
  Minimize2,
  Zap,
  Upload,
  MoreHorizontal,
  Edit,
  PlayCircle,
  Share2,
  X,
  Check,
  Mail,
  BellRing,
  Globe,
  History,
  FileUp,
  CloudUpload,
  FolderOpen,
  Dna,
  Layers,
  LineChart,
  Filter,
  Scissors,
  FileText,
  Download
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel,
  Handle,
  Position,
  NodeProps,
  Edge,
  Connection,
  ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { WorkflowTemplate } from "@/src/types";

// --- Types & Constants ---

const BUILTIN_TEMPLATES = [
  {
    id: "16s-rrna",
    name: "16S标准分析流程",
    usageCount: 156,
    duration: "约35分钟",
    scenario: "16S rRNA分析",
    version: "v2.1",
    status: "已发布",
    toolCount: 8,
    updateTime: "2024-03-20",
    steps: [
      { id: "s1", name: "Fastp", pos: { x: 100, y: 150 } },
      { id: "s2", name: "Cutadapt", pos: { x: 300, y: 150 } },
      { id: "s3", name: "DADA2", pos: { x: 500, y: 150 } },
      { id: "s4", name: "QIIME2", pos: { x: 700, y: 150 } }
    ]
  },
  {
    id: "mngs",
    name: "mNGS快速鉴定流程",
    usageCount: 89,
    duration: "约45分钟",
    scenario: "mNGS宏基因组",
    version: "v1.3",
    status: "已发布",
    toolCount: 6,
    updateTime: "2024-03-18",
    steps: [
      { id: "s1", name: "Fastp", pos: { x: 100, y: 150 } },
      { id: "s2", name: "Kraken2", pos: { x: 350, y: 150 } },
      { id: "s3", name: "Bracken", pos: { x: 600, y: 150 } }
    ]
  },
  {
    id: "scrna-seq",
    name: "单细胞标准分析流程 (Seurat)",
    usageCount: 203,
    duration: "约2小时",
    scenario: "scRNA-seq分析",
    version: "v3.0",
    status: "已发布",
    toolCount: 12,
    updateTime: "2024-03-15",
    steps: [
      { id: "s1", name: "Fastp", pos: { x: 100, y: 150 } },
      { id: "s2", name: "Seurat", pos: { x: 350, y: 150 } }
    ]
  },
  {
    id: "tcr",
    name: "TCR克隆分析流程",
    usageCount: 45,
    duration: "约20分钟",
    scenario: "TCR分析",
    version: "v1.1",
    status: "已发布",
    toolCount: 5,
    updateTime: "2024-03-10",
    steps: [
      { id: "s1", name: "Fastp", pos: { x: 100, y: 150 } },
      { id: "s2", name: "MixCr", pos: { x: 350, y: 150 } }
    ]
  },
  {
    id: "atac-seq",
    name: "ATAC-seq分析流程",
    usageCount: 12,
    duration: "约1.5小时",
    scenario: "ATAC-seq分析",
    version: "v0.9",
    status: "草稿",
    toolCount: 7,
    updateTime: "2024-03-22",
    steps: [
      { id: "s1", name: "Fastp", pos: { x: 100, y: 150 } },
      { id: "s2", name: "BWA-MEM", pos: { x: 350, y: 150 } },
      { id: "s3", name: "MACS2", pos: { x: 600, y: 150 } }
    ]
  }
];

const TOOLS = [
  { id: "qiime2", name: "QIIME2", version: "v2023.9", category: "内置工具", description: "当前主流16S分析框架，插件化设计。", tags: ["综合分析平台", "conda"] },
  { id: "dada2", name: "DADA2", version: "v1.26", category: "内置工具", description: "基于错误模型去噪，替代OTU。", tags: ["去噪 (ASV)", "package"] },
  { id: "cutadapt", name: "Cutadapt", version: "v4.4", category: "内置工具", description: "高精度 adapter 去除。", tags: ["质控", "package"] },
  { id: "trimmomatic", name: "Trimmomatic", version: "v0.39", category: "内置工具", description: "常用 reads 质控工具。", tags: ["质控", "package"] },
  { id: "fastqc", name: "FastQC", version: "v0.12", category: "内置工具", description: "生成 QC 报告。", tags: ["质控", "package"] },
  { id: "multiqc", name: "MultiQC", version: "v1.14", category: "内置工具", description: "汇总 FastQC 结果。", tags: ["质控", "package"] },
  { id: "rdp", name: "RDP Classifier", version: "v2.13", category: "内置工具", description: "朴素贝叶斯分类。", tags: ["分类工具", "package"] },
  { id: "kraken2", name: "Kraken2", version: "v2.1", category: "内置工具", description: "k-mer 快速比对。", tags: ["分类工具", "package"] },
  { id: "bracken", name: "Bracken", version: "v2.7", category: "内置工具", description: "基于 Kraken 结果优化。", tags: ["丰度估计", "package"] },
  { id: "fastp", name: "Fastp", version: "v0.23.4", category: "内置工具", description: "超快速全功能 FASTQ 预处理工具。", tags: ["质控", "package"] },
  { id: "bwa", name: "BWA-MEM", version: "v0.7.17", category: "内置工具", description: "将测序读段比对到参考基因组。", tags: ["比对", "package"] },
  { id: "bowtie2", name: "Bowtie2", version: "v2.5.1", category: "内置工具", description: "超快速、内存高效的短序列比对工具。", tags: ["比对", "package"] },
  { id: "star", name: "STAR", version: "v2.7.10", category: "内置工具", description: "通用的 RNA-seq 比对工具。", tags: ["比对", "RNA-seq"] },
  { id: "samtools", name: "Samtools", version: "v1.17", category: "内置工具", description: "处理高通量测序数据的各种实用程序。", tags: ["工具集", "package"] },
  { id: "gatk", name: "GATK4", version: "v4.4", category: "内置工具", description: "变异检测标准流程工具集。", tags: ["变异检测", "package"] },
  { id: "freebayes", name: "FreeBayes", version: "v1.3.6", category: "内置工具", description: "基于单倍型的变异检测工具。", tags: ["变异检测", "package"] },
  { id: "macs2", name: "MACS2", version: "v2.2.7", category: "内置工具", description: "ChIP-seq/ATAC-seq Peak Calling 工具。", tags: ["Peak Calling", "package"] },
  { id: "seurat", name: "Seurat", version: "v5.0", category: "内置工具", description: "单细胞转录组数据分析 R 包。", tags: ["单细胞", "R"] },
  { id: "scanpy", name: "Scanpy", version: "v1.9", category: "内置工具", description: "单细胞转录组数据分析 Python 包。", tags: ["单细胞", "Python"] },
  { id: "custom-qc", name: "自定义QC脚本", version: "v1.0", category: "我的工具", description: "实验室内部使用的质控脚本。", tags: ["自定义"] },
];

// --- Custom Node Components ---

const BioNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 transition-all ${selected ? 'border-[#02A1C8] ring-2 ring-[#02A1C8]/20' : 'border-gray-200'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-[#02A1C8]" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#02A1C8]/10 flex items-center justify-center">
          <Zap className="w-3 h-3 text-[#02A1C8]" />
        </div>
        <div>
          <div className="text-[10px] font-bold tech-mono">{data.label as string}</div>
          <div className="text-[8px] text-muted-foreground tech-mono">v1.2.0</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-[#02A1C8]" />
    </div>
  );
};

const nodeTypes = {
  bioNode: BioNode,
};

// --- Main Component ---

export function AnalysisWorkflow({ isAdmin = false }: { isAdmin?: boolean }) {
  const [mode, setMode] = useState<"builtin" | "custom" | "editor">("builtin");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showRunConfig, setShowRunConfig] = useState(false);
  const [runningWorkflow, setRunningWorkflow] = useState<any>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [customWorkflows, setCustomWorkflows] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_workflows");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      {
        id: "custom-1",
        name: "科室专项：结核分枝杆菌耐药分析",
        usageCount: 12,
        duration: "约15分钟",
        scenario: "耐药基因分析",
        version: "v1.0",
        status: "已发布",
        toolCount: 4,
        updateTime: "2024-04-01",
        steps: [
          { id: "s1", name: "Fastp", pos: { x: 100, y: 150 } },
          { id: "s2", name: "BWA-MEM", pos: { x: 350, y: 150 } },
          { id: "s3", name: "GATK4", pos: { x: 600, y: 150 } }
        ]
      },
      {
        id: "custom-2",
        name: "外部合作：肠道菌群多样性深度流程",
        usageCount: 8,
        duration: "约50分钟",
        scenario: "16S深度分析",
        version: "v2.0",
        status: "已发布",
        toolCount: 10,
        updateTime: "2024-04-10",
        steps: [
          { id: "s1", name: "Fastp", pos: { x: 100, y: 150 } },
          { id: "s2", name: "VSEARCH", pos: { x: 350, y: 150 } },
          { id: "s3", name: "QIIME2", pos: { x: 600, y: 150 } }
        ]
      }
    ];
  });

  const handleDeleteWorkflow = (id: string) => {
    const updated = customWorkflows.filter(wf => wf.id !== id);
    setCustomWorkflows(updated);
    localStorage.setItem("custom_workflows", JSON.stringify(updated));
  };
  
  // Run Config Form State
  const [priority, setPriority] = useState("Normal");
  const [notifications, setNotifications] = useState<string[]>(["Email"]);
  const [dataUploadTab, setDataUploadTab] = useState<"samples" | "manual">("samples");
  const [sampleRows, setSampleRows] = useState([
    { id: Date.now().toString(), sampleId: "", batch: "", fastq1: "", fastq2: "" }
  ]);

  const addSampleRow = () => {
    setSampleRows([...sampleRows, { id: Date.now().toString(), sampleId: "", batch: "", fastq1: "", fastq2: "" }]);
  };

  const removeSampleRow = (id: string) => {
    if (sampleRows.length > 1) {
      setSampleRows(sampleRows.filter(row => row.id !== id));
    }
  };

  const updateSampleRow = (id: string, field: string, value: string) => {
    setSampleRows(sampleRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const SAMPLES = [
    { id: "Sample_001", type: "粪便样本", date: "2024-03-01", library: "双端", size: "2.3GB" },
    { id: "Sample_002", type: "粪便样本", date: "2024-03-01", library: "双端", size: "2.1GB" },
    { id: "Sample_003", type: "粪便样本", date: "2024-03-02", library: "双端", size: "2.5GB" },
    { id: "Sample_004", type: "粪便样本", date: "2024-03-02", library: "双端", size: "2.0GB" },
    { id: "Sample_005", type: "粪便样本", date: "2024-03-03", library: "双端", size: "2.4GB" },
  ];

  const renderRunConfig = () => {
    if (!runningWorkflow) return null;

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <header className="h-14 border-b flex items-center px-6 shrink-0 bg-white">
          <div className="w-1 h-5 bg-[#02A1C8] rounded-full mr-3" />
          <h2 className="text-lg font-bold">运行工作流：{runningWorkflow.name}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-8 w-8 text-muted-foreground"
            onClick={() => setShowRunConfig(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8 space-y-10 pb-20">
            {/* Step 1: Data Upload */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-sm font-bold">数据上传</h3>
              </div>

              <Card className="border-none bg-[#f8fafc] shadow-none p-6 space-y-12 overflow-visible">
                {/* 1. Sample Sequence Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Database className="w-4 h-4 text-[#02A1C8]" />
                     <h3 className="text-sm font-bold text-slate-800">1. 样本序列数据 (Sample Sequence Data)</h3>
                  </div>
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f8fafc] border-b">
                        <tr className="text-[10px] text-muted-foreground uppercase tech-mono font-bold">
                          <th className="px-4 py-3 border-r">样本ID</th>
                          <th className="px-4 py-3 border-r">测序批次</th>
                          <th className="px-4 py-3 border-r">FASTQ_1</th>
                          <th className="px-4 py-3 border-r">FASTQ_2</th>
                          <th className="px-4 py-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sampleRows.map((row) => (
                          <tr key={row.id} className="text-xs hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2 border-r">
                              <select 
                                value={row.sampleId} 
                                onChange={(e) => updateSampleRow(row.id, 'sampleId', e.target.value)}
                                className="w-full h-8 bg-transparent border border-gray-200 rounded px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#02A1C8]"
                              >
                                <option value="">选择样本ID</option>
                                <option value="SAM-001">SAM-001</option>
                                <option value="SAM-002">SAM-002</option>
                                <option value="SAM-003">SAM-003</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 border-r">
                              <select 
                                value={row.batch} 
                                onChange={(e) => updateSampleRow(row.id, 'batch', e.target.value)}
                                className="w-full h-8 bg-transparent border border-gray-200 rounded px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#02A1C8]"
                              >
                                <option value="">选择批次</option>
                                <option value="BATCH-20240401">BATCH-20240401</option>
                                <option value="BATCH-20240415">BATCH-20240415</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 border-r">
                              <select 
                                value={row.fastq1} 
                                onChange={(e) => updateSampleRow(row.id, 'fastq1', e.target.value)}
                                className="w-full h-8 bg-transparent border border-gray-200 rounded px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#02A1C8]"
                              >
                                <option value="">选择 fastq_1 路径</option>
                                <option value="/data/SAM-001_R1.fq.gz">SAM-001_R1.fq.gz</option>
                                <option value="/data/SAM-002_R1.fq.gz">SAM-002_R1.fq.gz</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 border-r">
                              <select 
                                value={row.fastq2} 
                                onChange={(e) => updateSampleRow(row.id, 'fastq2', e.target.value)}
                                className="w-full h-8 bg-transparent border border-gray-200 rounded px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#02A1C8]"
                              >
                                <option value="">选择 fastq_2 路径</option>
                                <option value="/data/SAM-001_R2.fq.gz">SAM-001_R2.fq.gz</option>
                                <option value="/data/SAM-002_R2.fq.gz">SAM-002_R2.fq.gz</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-slate-400 hover:text-red-500 transition-colors"
                                onClick={() => removeSampleRow(row.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-2 tech-mono text-[10px] gap-2 border-slate-300 text-slate-500" onClick={addSampleRow}>
                      <Plus className="w-3 h-3" /> 添加样本行
                    </Button>
                  </div>
                </div>

                {/* 2. Sample Grouping Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4 text-[#02A1C8]" />
                     <h3 className="text-sm font-bold text-slate-800">2. 样本分组信息 (Metadata Upload)</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="aspect-[3/1] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-white hover:border-[#02A1C8]/50 hover:bg-[#02A1C8]/5 transition-all cursor-pointer group">
                      <CloudUpload className="w-6 h-6 text-slate-300 group-hover:text-[#02A1C8] mb-2" />
                      <p className="text-[10px] font-bold text-gray-700">拖放或点击上传分组文件 (TSV/CSV)</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-center">
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                          请上传制表符（TSV）或逗号分隔（CSV）格式的样本分组信息表。该文件用于分组展示、组间差异分析、功能预测分组统计等
                        </p>
                        <div className="space-y-1">
                          <div className="text-[9px] text-slate-400 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[#02A1C8]/40" /> 第一列为样本名称（Sample ID）</div>
                          <div className="text-[9px] text-slate-400 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[#02A1C8]/40" /> 第二列为默认的分组列，用于组间比较</div>
                          <div className="text-[9px] text-slate-400 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[#02A1C8]/40" /> 其他列为可选列，针对其他额外的分组信息</div>
                        </div>
                        <div className="flex justify-end mt-2">
                           <button className="text-[9px] font-bold text-[#02A1C8] hover:underline flex items-center gap-1">
                             <Download className="w-2.5 h-2.5" /> 下载示例文件
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Environmental Factors Table */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <GitBranch className="w-4 h-4 text-[#02A1C8]" />
                     <h3 className="text-sm font-bold text-slate-800">3. 环境因子表 (Environmental Factors Table)</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg py-12 flex flex-col items-center justify-center bg-white hover:border-[#02A1C8]/50 transition-all cursor-pointer group">
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-[#02A1C8]" />
                      <p className="text-[10px] font-bold text-gray-700 mt-2">点击上传环境因子表 (TSV/CSV)</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex flex-col justify-center">
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                          请上传制表符 (TSV) 或逗号分隔 (CSV) 格式的环境因子表。该文件主要用于物种-环境因子相关性分析。
                        </p>
                        <div className="space-y-1">
                          <div className="text-[9px] text-slate-400 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[#02A1C8]/40" /> 第一列为样本名称 (Sample ID)</div>
                          <div className="text-[9px] text-slate-400 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[#02A1C8]/40" /> 第二列及之后为环境因子列 (数值型)</div>
                        </div>
                        <div className="flex justify-end mt-2">
                           <button className="text-[9px] font-bold text-[#02A1C8] hover:underline flex items-center gap-1">
                             <Download className="w-2.5 h-2.5" /> 下载示例文件
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Step 2: Parameter Configuration */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="text-sm font-bold">参数配置</h3>
              </div>

              <Card className="border-none bg-[#f8fafc] shadow-none p-6 space-y-10">
                {/* 1. Primer Sequences */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                    <Scissors className="w-4 h-4 text-[#02A1C8]" />
                    <span className="text-xs font-bold text-gray-800">引物序列配置 (Cutadapt)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-bold">上游引物序列</Label>
                        <Badge variant="secondary" className="text-[9px] font-normal bg-gray-100 text-gray-500 border-none">默认: AACMGGATTAGATACCCKG</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-[-4px]">传递给 cutadapt 的上游引物序列。</p>
                      <Input defaultValue="AACMGGATTAGATACCCKG" className="h-9 bg-white border-gray-200 text-xs tech-mono" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-bold">下游引物序列</Label>
                        <Badge variant="secondary" className="text-[9px] font-normal bg-gray-100 text-gray-500 border-none">默认: ACGTCATCCCCACCTTCC</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-[-4px]">传递给 cutadapt 的下游引物序列。</p>
                      <Input defaultValue="ACGTCATCCCCACCTTCC" className="h-9 bg-white border-gray-200 text-xs tech-mono" />
                    </div>
                  </div>
                </div>

                {/* 2. Sequence Processing Params */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                    <Dna className="w-4 h-4 text-[#02A1C8]" />
                    <span className="text-xs font-bold text-gray-800">序列处理与聚类参数</span>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">最小重叠区域长度</Label>
                      <Input type="number" defaultValue="20" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">重叠区域最大错配数</Label>
                      <Input type="number" defaultValue="10" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">最大错误率</Label>
                      <Input type="number" step="0.1" defaultValue="1.0" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">最小序列长度</Label>
                      <Input type="number" defaultValue="200" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">最大序列长度</Label>
                      <Input type="number" defaultValue="500" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">最大模糊碱基数</Label>
                      <Input type="number" defaultValue="0" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">聚类置信度</Label>
                      <Input type="number" step="0.01" defaultValue="0.97" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                  </div>
                </div>

                {/* 3 & 4. Diversity Analysis */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                    <Layers className="w-4 h-4 text-[#02A1C8]" />
                    <span className="text-xs font-bold text-gray-800">多样性分析配置 (Alpha & Beta)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">Alpha 多样性指数</Label>
                      <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#02A1C8]">
                        <option value="shannon">shannon</option>
                        <option value="simpson">simpson</option>
                        <option value="chao1">chao1</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">计算相异矩阵</Label>
                      <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#02A1C8]">
                        <option value="braycurtis">braycurtis</option>
                        <option value="jaccard">jaccard</option>
                        <option value="euclidean">euclidean</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">NMDS 最大尝试次数</Label>
                      <Input type="number" defaultValue="50" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                  </div>
                </div>

                {/* 5. Differential Analysis */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                    <Filter className="w-4 h-4 text-[#02A1C8]" />
                    <span className="text-xs font-bold text-gray-800">差异分析参数 (LEfSe/DESeq2)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">分组列</Label>
                      <Input defaultValue="Group" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">显著性阈值 (P-value)</Label>
                      <Input type="number" step="0.01" defaultValue="0.05" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">LDA 报告阈值</Label>
                      <Input type="number" step="0.1" defaultValue="2.0" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                  </div>
                </div>

                {/* 6. Functional/Association Analysis */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                    <LineChart className="w-4 h-4 text-[#02A1C8]" />
                    <span className="text-xs font-bold text-gray-800">关联与功能预测分析</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">关联分析排序模型</Label>
                      <select className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#02A1C8]">
                        <option value="rda">rda</option>
                        <option value="cca">cca</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">最大通路数量</Label>
                      <Input type="number" defaultValue="20" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-gray-500">分组列</Label>
                      <Input defaultValue="Group" className="h-9 bg-white border-gray-200 text-xs" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] text-[#02A1C8] border-[#02A1C8]/20 bg-[#e0f2fe] hover:bg-[#bae6fd]">保存为常用配置</Button>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] text-gray-500 border-gray-200 bg-white">恢复默认</Button>
                </div>
              </Card>
            </section>

            {/* Step 3: Run Configuration */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="text-sm font-bold">运行配置</h3>
              </div>

              <Card className="border-none bg-[#f8fafc] shadow-none p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] text-gray-500">任务名称</Label>
                  <Input defaultValue={`${runningWorkflow.name}_20260416_001`} className="h-9 bg-white border-gray-200 text-xs" />
                </div>
              </Card>
            </section>

            <div className="flex items-center justify-center gap-4 pt-10">
              <Button variant="outline" className="w-32 h-10 text-sm border-gray-300" onClick={() => setShowRunConfig(false)}>取消</Button>
              <Button className="w-32 h-10 text-sm bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={() => {
                setIsRunning(true);
                setTimeout(() => {
                  setIsRunning(false);
                  setShowRunConfig(false);
                }, 2000);
              }}>
                {isRunning ? "正在启动..." : "立即运行"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ReactFlow State
  const initialNodes = [
    { id: '1', type: 'bioNode', position: { x: 50, y: 100 }, data: { label: 'Fastp QC' } },
    { id: '2', type: 'bioNode', position: { x: 250, y: 100 }, data: { label: 'BWA Alignment' } },
  ];
  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#02A1C8' } }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const toolName = event.dataTransfer.getData('application/reactflow');

      if (!toolName || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Math.random().toString(36).substr(2, 9)}`,
        type: 'bioNode',
        position,
        data: { label: toolName },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const handleEditTemplate = (tpl: any) => {
    setMode("editor");
    setEditingWorkflow(tpl);
    
    if (tpl.steps) {
      const newNodes = tpl.steps.map((s: any) => ({
        id: s.id,
        type: 'bioNode',
        position: s.pos,
        data: { label: s.name }
      }));
      setNodes(newNodes);
      
      const newEdges: Edge[] = newNodes.slice(0, -1).map((n: any, idx: number) => ({
        id: `e-${idx}`,
        source: n.id,
        target: newNodes[idx + 1].id,
        animated: true,
        style: { stroke: '#02A1C8' }
      }));
      setEdges(newEdges);
    }
  };

  const handleCreateNew = () => {
    setMode("editor");
    setEditingWorkflow(null);
    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  return (
    <div className="space-y-4 p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {mode === "editor" ? (editingWorkflow ? `编辑工作流: ${editingWorkflow.name}` : "创建工作流") : "工作流管理"}
          </h2>
        </div>
      </div>

      {showRunConfig && renderRunConfig()}

      {mode !== "editor" ? (
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="bg-[#02A1C8] hover:bg-[#02A1C8]/90 text-xs h-8"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4 mr-1" />
                创建工作流
              </Button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="搜索工作流名称" className="pl-8 h-8 text-xs" />
            </div>
          </div>

          <div className="flex bg-[#f4f4f5] p-1 rounded-lg self-start">
            <Button 
              variant={mode === "builtin" ? "secondary" : "ghost"} 
              size="sm" 
              className={`tech-mono text-[10px] h-8 ${mode === "builtin" ? "bg-white shadow-sm text-[#02A1C8]" : "text-[#595656]/60"}`}
              onClick={() => setMode("builtin")}
            >
              <LayoutGrid className="w-3 h-3 mr-2" />
              内置流程模板
            </Button>
            <Button 
              variant={mode === "custom" ? "secondary" : "ghost"} 
              size="sm" 
              className={`tech-mono text-[10px] h-8 ${mode === "custom" ? "bg-white shadow-sm text-[#02A1C8]" : "text-[#595656]/60"}`}
              onClick={() => setMode("custom")}
            >
              <GitBranch className="w-3 h-3 mr-2" />
              自定义工作流
            </Button>
          </div>

          {/* Table */}
          <Card className="flex-1 overflow-hidden flex flex-col tech-border">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b">
                  <tr className="text-[11px] text-gray-500 uppercase tech-mono">
                    <th className="px-4 py-3 font-medium">工作流名称</th>
                    <th className="px-4 py-3 font-medium">应用场景</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium">工具数</th>
                    <th className="px-4 py-3 font-medium">更新时间</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(mode === "builtin" ? BUILTIN_TEMPLATES : customWorkflows).map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#02A1C8]/10 flex items-center justify-center border border-[#02A1C8]/20">
                            <Share2 className="w-4 h-4 text-[#02A1C8]" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800">{tpl.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              使用次数: {tpl.usageCount} | 耗时: {tpl.duration}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-600">{tpl.scenario}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-normal px-2 py-0 h-5 ${
                            tpl.status === '已发布' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                          }`}
                        >
                          {tpl.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs tech-mono text-gray-600">{tpl.toolCount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs tech-mono text-gray-500">{tpl.updateTime}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 px-3 text-[10px] text-[#02A1C8] border-[#02A1C8]/20 bg-[#02A1C8]/5 hover:bg-[#02A1C8]/10"
                            onClick={() => {
                              setRunningWorkflow(tpl);
                              setShowRunConfig(true);
                            }}
                          >
                            运行
                          </Button>
                          {(mode === "custom" || (mode === "builtin" && isAdmin)) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-3 text-[10px] text-gray-600 border-gray-200 hover:bg-gray-50"
                              onClick={() => handleEditTemplate(tpl)}
                            >
                              编辑
                            </Button>
                          )}
                          {mode === "custom" && isAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-3 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => handleDeleteWorkflow(tpl.id)}
                            >
                              删除
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t bg-[#f8fafc] flex items-center justify-between">
              <span className="text-xs text-muted-foreground tech-mono">共 {(mode === "builtin" ? BUILTIN_TEMPLATES : customWorkflows).length} 条记录</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7 border-gray-200">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" className="h-7 w-7 p-0 bg-[#02A1C8] text-white text-xs">1</Button>
                <Button variant="outline" size="icon" className="h-7 w-7 border-gray-200">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left: Tool Panel */}
          <Card className="w-64 tech-border flex flex-col overflow-hidden">
            <CardHeader className="tech-bg-soft border-b py-3">
              <CardTitle className="text-xs tech-header">工具面板</CardTitle>
            </CardHeader>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="搜索算子..." className="pl-7 h-7 text-[10px] tech-mono" />
              </div>
            </div>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <Tabs defaultValue="builtin" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-8 p-0">
                  <TabsTrigger value="builtin" className="text-[9px] tech-mono px-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#02A1C8]">内置</TabsTrigger>
                  <TabsTrigger value="mine" className="text-[9px] tech-mono px-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#02A1C8]">我的</TabsTrigger>
                  <TabsTrigger value="public" className="text-[9px] tech-mono px-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#02A1C8]">公开</TabsTrigger>
                </TabsList>
                <TabsContent value="builtin" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-2">
                      {TOOLS.filter(t => t.category === "内置工具").map(tool => (
                        <div 
                          key={tool.id} 
                          className="p-3 border rounded-lg bg-white hover:border-[#02A1C8]/50 cursor-move transition-all group shadow-sm"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('application/reactflow', tool.name)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded bg-[#02A1C8]/5 flex items-center justify-center border border-[#02A1C8]/10">
                                <Database className="w-3.5 h-3.5 text-[#02A1C8]" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold tech-mono text-[#595656]">{tool.name}</div>
                                <div className="text-[8px] text-muted-foreground tech-mono">{(tool as any).version}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center">
                                <Play className="w-2.5 h-2.5 text-[#02A1C8]" />
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-[9px] text-muted-foreground tech-mono line-clamp-2 mb-3 leading-relaxed">
                            {tool.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {(tool as any).tags?.map((tag: string) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-[8px] px-1.5 py-0 h-4 tech-mono font-normal bg-[#f4f4f5] text-[#595656]"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="mine" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-2">
                      {TOOLS.filter(t => t.category === "我的工具").map(tool => (
                        <div 
                          key={tool.id} 
                          className="p-3 border rounded-lg bg-white hover:border-[#02A1C8]/50 cursor-move transition-all group shadow-sm"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('application/reactflow', tool.name)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded bg-[#02A1C8]/5 flex items-center justify-center border border-[#02A1C8]/10">
                                <Database className="w-3.5 h-3.5 text-[#02A1C8]" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold tech-mono text-[#595656]">{tool.name}</div>
                                <div className="text-[8px] text-muted-foreground tech-mono">{(tool as any).version}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center">
                                <Play className="w-2.5 h-2.5 text-[#02A1C8]" />
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-[9px] text-muted-foreground tech-mono line-clamp-2 mb-3 leading-relaxed">
                            {tool.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {(tool as any).tags?.map((tag: string) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-[8px] px-1.5 py-0 h-4 tech-mono font-normal bg-[#f4f4f5] text-[#595656]"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Center: Canvas */}
          <Card className="flex-1 tech-border relative overflow-hidden bg-slate-50">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background color="#96C2E1" gap={20} size={1} />
                <Controls />
                <MiniMap zoomable pannable />
                <Panel position="top-right" className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-[9px] tech-mono bg-white"
                    onClick={() => setMode("builtin")}
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" />
                    返回列表
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[9px] tech-mono bg-white">
                    <ShieldCheck className="w-3 h-3 mr-1 text-yellow-500" />
                    三层串联校验
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[9px] tech-mono bg-white">
                    <Code className="w-3 h-3 mr-1 text-[#02A1C8]" />
                    脚本自动生成
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-7 text-[9px] tech-mono bg-[#02A1C8] hover:bg-[#02A1C8]/90"
                    onClick={() => {
                      if (editingWorkflow) {
                        const updated = customWorkflows.map(w => w.id === editingWorkflow.id ? {
                          ...w,
                          toolCount: nodes.length,
                          updateTime: new Date().toISOString().split('T')[0],
                          steps: nodes.map(n => ({ id: n.id, name: n.data.label, pos: n.position }))
                        } : w);
                        setCustomWorkflows(updated);
                        localStorage.setItem("custom_workflows", JSON.stringify(updated));
                      } else {
                        const newWorkflowName = `自主分析设计流程_${Date.now().toString().slice(-4)}`;
                        const newWf = {
                          id: `custom-${Date.now()}`,
                          name: newWorkflowName,
                          usageCount: 0,
                          duration: "约25分钟",
                          scenario: "自定义测序项目",
                          version: "v1.0",
                          status: "暂存草稿",
                          toolCount: nodes.length,
                          updateTime: new Date().toISOString().split('T')[0],
                          steps: nodes.map(n => ({ id: n.id, name: n.data.label, pos: n.position }))
                        };
                        const updated = [newWf, ...customWorkflows];
                        setCustomWorkflows(updated);
                        localStorage.setItem("custom_workflows", JSON.stringify(updated));
                      }
                      setMode("custom");
                    }}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    保存工作流
                  </Button>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>
          </Card>

          {/* Right: Config Panel */}
          <Card className="w-72 tech-border flex flex-col overflow-hidden">
            <CardHeader className="tech-bg-soft border-b py-3">
              <CardTitle className="text-xs tech-header">节点配置面板</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-auto">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Badge variant="outline" className="text-[8px] tech-mono bg-[#02A1C8]/5 text-[#02A1C8] border-[#02A1C8]/20">算子</Badge>
                    <span className="text-xs font-bold tech-mono">{selectedNode.data.label}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] tech-mono uppercase">输入路径 (Input)</Label>
                      <Input placeholder="s3://bucket/data/" className="h-7 text-[10px] tech-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] tech-mono uppercase">输出前缀 (Prefix)</Label>
                      <Input placeholder="sample_01" className="h-7 text-[10px] tech-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] tech-mono uppercase">计算资源 (CPU/Memory)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="4 Cores" className="h-7 text-[10px] tech-mono" />
                        <Input placeholder="16 GB" className="h-7 text-[10px] tech-mono" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] tech-mono uppercase">高级参数 (JSON Schema)</Label>
                      <div className="p-2 border rounded bg-muted/20 text-[9px] tech-mono text-muted-foreground">
                        {`{ "mismatch": 2, "quality": 20 }`}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t mt-4">
                    <Button variant="destructive" size="sm" className="w-full h-7 text-[9px] tech-mono">
                      <Trash2 className="w-3 h-3 mr-2" />
                      删除节点
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Settings2 className="w-8 h-8 mb-2" />
                  <p className="text-[10px] tech-mono">点击画布节点进行配置</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batch Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] w-full p-0 overflow-hidden bg-[#f9fafb]">
          <DialogHeader className="p-6 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#02A1C8]/10 text-[#02A1C8]">
                <CloudUpload className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">批量数据上传</DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">支持测序数据、分组信息及辅助分析文件的统一上传</p>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[600px]">
            <div className="p-10 space-y-16">
              {/* Type 1 */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-[#02A1C8] text-white flex items-center justify-center text-[10px] font-bold">01</div>
                   <h4 className="text-sm font-bold text-slate-800">样本序列数据 (Sample Sequence Data)</h4>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-white hover:border-[#02A1C8]/40 hover:bg-[#02A1C8]/5 transition-all cursor-pointer group">
                  <Upload className="w-10 h-10 text-slate-300 group-hover:text-[#02A1C8] mb-4 transition-transform group-hover:-translate-y-1" />
                  <p className="text-sm font-bold text-slate-600">点击上传或拖拽测序文件到此处</p>
                  <p className="text-xs text-slate-400 mt-2">支持 .fastq, .fastq.gz, .fq.gz 格式</p>
                </div>
              </div>

              {/* Type 2 */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-[#02A1C8] text-white flex items-center justify-center text-[10px] font-bold">02</div>
                   <h4 className="text-sm font-bold text-slate-800">样本分组信息 (Sample Grouping Info)</h4>
                </div>
                <div className="grid grid-cols-2 gap-8 h-48">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-white hover:border-[#02A1C8]/40 hover:bg-[#02A1C8]/5 transition-all cursor-pointer group">
                    <Database className="w-8 h-8 text-slate-300 group-hover:text-[#02A1C8] mb-2" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">上传分组表</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col justify-center gap-3">
                    <div className="flex items-center gap-2 text-[#02A1C8] font-bold text-[11px]">
                      <Info className="w-4 h-4" />
                      格式说明 (Instruction)
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          请上传制表符（TSV）或逗号分隔（CSV）格式的样本分组信息表。该文件用于分组展示、组间差异分析、功能预测分组统计等
                        </p>
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#02A1C8] flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">1</div>
                            <p className="text-[10px] text-slate-600">第一列为样本名称（Sample ID），每一行代表一个样本</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#02A1C8] flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">2</div>
                            <p className="text-[10px] text-slate-600">第二列为默认的分组列，用于组间比较</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-[#02A1C8] flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">3</div>
                            <p className="text-[10px] text-slate-600">其他列为可选列，针对其他额外的分组信息</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-slate-200/50 mt-2">
                         <button className="text-[10px] font-bold text-[#02A1C8] hover:underline flex items-center gap-1.5">
                           <Download className="w-3 h-3" /> 下载示例模板
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type 3 */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-[#02A1C8] text-white flex items-center justify-center text-[10px] font-bold">03</div>
                   <h4 className="text-sm font-bold text-slate-800">环境因子表 (Environmental Factors Table)</h4>
                </div>
                <div className="grid grid-cols-2 gap-8 h-56 pb-6">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-white hover:border-[#02A1C8]/40 hover:bg-[#02A1C8]/5 transition-all cursor-pointer group">
                    <Plus className="w-8 h-8 text-slate-300 group-hover:text-[#02A1C8] mb-2" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">上传环境因子表</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col justify-center gap-3">
                    <div className="flex items-center gap-2 text-[#02A1C8] font-bold text-[11px]">
                      <Info className="w-4 h-4" />
                      文件格式要求 (Format Requirements)
                    </div>
                    <div className="space-y-4">
                       <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                         请上传制表符 (TSV) 或逗号分隔 (CSV) 格式的环境因子表。该文件主要用于物种-环境因子相关性分析。
                       </p>
                       <div className="space-y-1.5 pt-1">
                         <div className="flex items-start gap-2">
                           <div className="w-4 h-4 rounded-full bg-blue-100 text-[#02A1C8] flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">1</div>
                           <p className="text-[10px] text-slate-600">第一列为样本名称 (Sample ID)，每一行代表一个样本</p>
                         </div>
                         <div className="flex items-start gap-2">
                           <div className="w-4 h-4 rounded-full bg-blue-100 text-[#02A1C8] flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">2</div>
                           <p className="text-[10px] text-slate-600">第二列及以后为环境因子列，需要为数值型变量，如酸碱度，温度，湿度等</p>
                         </div>
                       </div>
                       <div className="flex justify-end pt-2 border-t border-slate-200/50 mt-2">
                          <button className="text-[10px] font-bold text-[#02A1C8] hover:underline flex items-center gap-1.5">
                            <Download className="w-3 h-3" /> 下载示例模板
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-white flex justify-end gap-3 items-center px-10">
            <Button variant="ghost" size="sm" className="h-10 px-8 font-bold text-slate-500" onClick={() => setIsUploadDialogOpen(false)}>取消</Button>
            <Button size="sm" className="h-10 px-12 font-bold bg-[#02A1C8] hover:bg-[#028baa] text-white shadow-lg shadow-[#02A1C8]/20" onClick={() => setIsUploadDialogOpen(false)}>完成并开始校验</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
