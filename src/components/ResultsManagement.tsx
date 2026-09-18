import { useState } from "react";
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Filter, 
  Settings2,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileBarChart,
  ExternalLink,
  MoreHorizontal,
  ArrowLeft,
  FileCode,
  FileSearch,
  Layout,
  Table as TableIcon,
  ChevronRight,
  Scissors,
  Dna,
  Layers,
  FileCheck,
  Database,
  Workflow
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AnalysisResult {
  id: string;
  taskName: string;
  sampleId: string;
  project: string;
  type: string;
  category: 'workflow' | 'tool';
  status: 'completed' | 'failed' | 'processing';
  completedAt: string;
  operator: string;
  reportPath: string;
  params?: any;
}

const MOCK_RESULTS: AnalysisResult[] = [
  {
    id: "RES-004",
    taskName: "16S标准分析任务一",
    sampleId: "SAM-2024-004",
    project: "病原微生物群落分析",
    type: "16S Seq",
    category: 'workflow',
    status: 'completed',
    completedAt: "2024-04-16 10:20",
    operator: "王工",
    reportPath: "/reports/16s_SAM-004.html",
    params: {
      projectId: "病原微生物研究项目_2024",
      samples: [
        { id: "SAM-003", batch: "BATCH-02", f1: "SAM-003_R1.fq.gz", f2: "SAM-003_R2.fq.gz" }
      ],
      primerForward: "AACMGGATTAGATACCCKG",
      primerReverse: "ACGTCATCCCCACCTTCC",
      minOverlap: 20,
      maxMismatch: 10,
      maxError: 1.0,
      minLen: 200,
      maxLen: 500,
      maxN: 0,
      confidence: 0.97,
      alphaIndex: "shannon",
      distMatrix: "braycurtis",
      groupCol: "Group",
      pValue: 0.05,
    }
  },
  {
    id: "RES-001",
    taskName: "病原微生物宏基因组分析",
    sampleId: "SAM-2024-001",
    project: "呼吸道病毒筛查",
    type: "mNGS",
    category: 'tool',
    status: 'completed',
    completedAt: "2024-04-15 14:30",
    operator: "张三",
    reportPath: "/reports/mngs_SAM-001.pdf"
  },
  {
    id: "RES-002",
    taskName: "TCR 库多样性分析",
    sampleId: "SAM-2024-002",
    project: "免疫治疗评估",
    type: "TCR-Seq",
    category: 'tool',
    status: 'completed',
    completedAt: "2024-04-15 16:45",
    operator: "李工",
    reportPath: "/reports/tcr_SAM-002.pdf"
  },
  {
    id: "RES-003",
    taskName: "耐药基因预测",
    sampleId: "SAM-2024-001",
    project: "呼吸道病毒筛查",
    type: "AMR",
    category: 'workflow',
    status: 'failed',
    completedAt: "2024-04-14 11:20",
    operator: "张三",
    reportPath: ""
  }
];

const MOCK_FILES = [
  { name: "analysis_report.html", size: "1.2 MB", type: "html", time: "2024-04-16 10:20" },
  { name: "cleaned_reads.fasta", size: "450 MB", type: "fasta", time: "2024-04-16 10:15" },
  { name: "otu_table.tsv", size: "2.4 MB", type: "tsv", time: "2024-04-16 10:18" },
  { name: "summary_statistics.txt", size: "15 KB", type: "txt", time: "2024-04-16 10:20" },
  { name: "taxonomy_assignment.csv", size: "890 KB", type: "csv", time: "2024-04-16 10:19" },
  { name: "phylogenetic_tree.nwk", size: "120 KB", type: "nwk", time: "2024-04-16 10:19" },
];

export function ResultsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewedResultId, setViewedResultId] = useState<string | null>(null);

  const viewedResult = viewedResultId ? MOCK_RESULTS.find(r => r.id === viewedResultId) : null;

  const filteredResults = MOCK_RESULTS.filter(r => 
    r.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-none tech-mono text-[10px]">已完成</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-none tech-mono text-[10px] animate-pulse">处理中</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-none tech-mono text-[10px]">失败</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html': return <Layout className="w-4 h-4 text-orange-500" />;
      case 'fasta': return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'tsv': 
      case 'csv': return <TableIcon className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const render16SBaseInfo = (result: AnalysisResult) => {
    const params = result.params || {};
    return (
      <div className="space-y-10">
        {/* 1. Data Upload Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#02A1C8] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#02A1C8]/20">1</div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              数据上传详情汇总
              <Badge variant="outline" className="text-[10px] bg-slate-50 font-normal">样本数: {params.samples?.length || 0}</Badge>
            </h2>
          </div>
          <Card className="border-none bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-2 text-xs">
                <Database className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 uppercase tracking-wider tech-mono">所属项目</span>
                <span className="font-bold text-slate-700 ml-2">{params.projectId || '默认项目'}</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="h-10 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-slate-500">样本编号</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">测序批次</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">FASTQ Forward (R1)</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500">FASTQ Reverse (R2)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(params.samples || []).map((s: any) => (
                    <TableRow key={s.id} className="h-10 hover:bg-slate-50/50">
                      <TableCell className="text-xs font-medium text-slate-700">{s.id}</TableCell>
                      <TableCell className="text-[10px] tech-mono text-slate-500">{s.batch}</TableCell>
                      <TableCell className="text-[10px] tech-mono text-[#02A1C8] underline decoration-dotted">{s.f1}</TableCell>
                      <TableCell className="text-[10px] tech-mono text-[#02A1C8] underline decoration-dotted">{s.f2}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>

        {/* 2. Parameters Review */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#02A1C8] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#02A1C8]/20">2</div>
            <h2 className="text-sm font-bold text-slate-800">参数配置回顾 (Parameters Review)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primer Configuration */}
            <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <Scissors className="w-4 h-4 text-[#02A1C8]" />
                <span className="text-xs font-bold text-slate-800">引物序列配置 (Cutadapt)</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Forward Primer</span>
                  <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">{params.primerForward}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Reverse Primer</span>
                  <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">{params.primerReverse}</p>
                </div>
              </div>
            </Card>

            {/* Sequence Processing */}
            <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <Dna className="w-4 h-4 text-[#02A1C8]" />
                <span className="text-xs font-bold text-slate-800">序列处理与聚类</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: '最小重叠', val: `${params.minOverlap || 'undefined'} bp` },
                  { label: '最大错配', val: params.maxMismatch || '0' },
                  { label: '最大错误率', val: params.maxError || '0' },
                  { label: '长度范围', val: params.minLen ? `${params.minLen}-${params.maxLen}` : 'undefined-undefined' },
                  { label: '模糊碱基', val: params.maxN || '0' },
                  { label: '聚类相似度', val: params.confidence || '0.97' }
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{item.label}</span>
                    <span className="text-xs font-bold text-slate-700">{item.val}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Diversity Analysis */}
            <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <Layers className="w-4 h-4 text-[#02A1C8]" />
                <span className="text-xs font-bold text-slate-800">多样性分析配置 (Alpha & Beta)</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground tech-mono uppercase font-medium">ALPHA 指数</span>
                  <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100 h-9 flex items-center">{params.alphaIndex}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground tech-mono uppercase font-medium">相异矩阵</span>
                  <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100 h-9 flex items-center">{params.distMatrix}</p>
                </div>
              </div>
            </Card>

            {/* Differential Analysis */}
            <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <Filter className="w-4 h-4 text-[#02A1C8]" />
                <span className="text-xs font-bold text-slate-800">差异分析参数 (LEfSe)</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground tech-mono uppercase font-medium">分组列</span>
                  <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100 h-9 flex items-center">{params.groupCol}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground tech-mono uppercase font-medium">显著性阈值</span>
                  <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100 h-9 flex items-center">p &lt; {params.pValue}</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 3. Run Configuration */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#02A1C8] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#02A1C8]/20">3</div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              运行环境与元信息
              <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            </h2>
          </div>
          <Card className="border-none bg-white p-8 shadow-sm border border-slate-100 flex relative overflow-hidden h-32 items-center">
            <div className="absolute top-0 right-0 p-2 opacity-5 scale-150">
               <Settings2 className="w-24 h-24" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <FileCheck className="w-3 h-3" />
                任务名称 (Job Name)
              </div>
              <p className="text-xl font-black text-slate-800 tech-mono">{result.taskName}_20260416_001</p>
            </div>
          </Card>
        </section>
      </div>
    );
  };

  if (viewedResult) {
    return (
      <div className="flex flex-col h-full bg-[#f8fafc]">
        {/* Detail Header */}
        <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewedResultId(null)}>
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                结果详情: {viewedResult.taskName}
                <Badge variant="outline" className="text-[10px] tech-mono">{viewedResult.id}</Badge>
              </h3>
              <p className="text-[10px] text-muted-foreground tech-mono">分析完成时间: {viewedResult.completedAt} | 操作人: {viewedResult.operator}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-12 max-w-[1200px] mx-auto pb-20">
            {/* Top: Base Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <FileBarChart className="w-4 h-4 text-[#02A1C8]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">任务基础信息 (Task Base Info)</h4>
              </div>
              
              {viewedResult.taskName.includes("16S") ? (
                render16SBaseInfo(viewedResult)
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 border-none shadow-sm bg-white">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">所属项目</span>
                      <p className="text-xs font-bold mt-1 text-slate-700">{viewedResult.project}</p>
                    </Card>
                    <Card className="p-4 border-none shadow-sm bg-white">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">样本 ID</span>
                      <p className="text-xs font-bold mt-1 tech-mono text-[#02A1C8]">{viewedResult.sampleId}</p>
                    </Card>
                    <Card className="p-4 border-none shadow-sm bg-white">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">分析类型</span>
                      <p className="text-xs font-bold mt-1 uppercase tech-mono">{viewedResult.type}</p>
                    </Card>
                    <Card className="p-4 border-none shadow-sm bg-white">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">运行状态</span>
                      <div className="mt-1">{getStatusBadge(viewedResult.status)}</div>
                    </Card>
                  </div>
                  
                  <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-50">
                       <div className="p-2 bg-slate-50 rounded">
                          <Tag className="w-4 h-4 text-slate-400" />
                       </div>
                       <div>
                          <h5 className="text-xs font-bold">任务执行摘要</h5>
                          <p className="text-[10px] text-muted-foreground">该任务于 {viewedResult.completedAt} 顺利完成，所有既定分析流程执行完毕。</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">平均测序深度</span>
                        <p className="text-sm font-bold tech-mono">142.5x</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">比对成功率</span>
                        <p className="text-sm font-bold tech-mono">94.21%</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">核心克隆数量</span>
                        <p className="text-sm font-bold tech-mono">1,024</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Q30 质量分</span>
                        <p className="text-sm font-bold tech-mono">92.5%</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </section>

            {/* Bottom: Result Files */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-[#02A1C8]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">分析结果展示 (Results Files)</h4>
                </div>
                <Button size="sm" className="h-8 text-[10px] bg-[#02A1C8] hover:bg-[#02A1C8]/90">
                  <Download className="w-3 h-3 mr-2" />
                  下载全部结果
                </Button>
              </div>
              <Card className="border-none shadow-sm bg-white overflow-hidden">
                <div className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="h-10 hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold text-slate-500 w-[400px]">文件名</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-500">文件大小</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-500">文件类型</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-500">生成时间</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-500 text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_FILES.map((file, idx) => (
                        <TableRow key={idx} className="h-12 hover:bg-slate-50/50 group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-slate-50 rounded border border-slate-100 group-hover:bg-white group-hover:border-[#02A1C8]/20 transition-colors">
                                {getFileIcon(file.type)}
                              </div>
                              <span className="text-xs font-medium text-slate-700">{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] tech-mono text-slate-500">{file.size}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[9px] tech-mono uppercase px-1.5 h-4 font-normal bg-slate-100 text-slate-500 border-none">
                              {file.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] tech-mono text-slate-400">
                             {file.time}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#02A1C8]">
                                  <Eye className="w-3.5 h-3.5" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#02A1C8]">
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </section>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">结果管理</h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1">
            统一管理病原微生物分析及分子免疫分析的生成结果与报告。
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索任务名称、样本ID或项目..."
            className="pl-8 tech-mono text-xs h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 tech-mono text-[10px]">
          <Filter className="w-3 h-3 mr-2" />
          筛选
        </Button>
      </div>

      <Card className="tech-border bg-background/50 flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="tech-bg-soft sticky top-0 z-10 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="tech-header">任务ID</TableHead>
                <TableHead className="tech-header">任务名称</TableHead>
                <TableHead className="tech-header">类型</TableHead>
                <TableHead className="tech-header">状态</TableHead>
                <TableHead className="tech-header">完成时间</TableHead>
                <TableHead className="tech-header">操作人</TableHead>
                <TableHead className="tech-header text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id} className="group hover:bg-muted/30">
                  <TableCell className="tech-mono text-[11px] text-muted-foreground">{result.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{result.taskName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[9px] tech-mono uppercase px-1.5 h-4 font-normal",
                      result.category === 'workflow' ? "text-purple-600 bg-purple-50 border-purple-100" : "text-orange-600 bg-orange-50 border-orange-100"
                    )}>
                      {result.category === 'workflow' ? '工作流' : '工具'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                  <TableCell className="tech-mono text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {result.completedAt}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {result.operator}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                       <Button 
                        variant="link" 
                        size="sm" 
                        className="h-8 text-[10px] text-[#02A1C8] hover:text-[#02A1C8]/80 p-0"
                        onClick={() => setViewedResultId(result.id)}
                       >
                          查看结果
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Result Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border tech-border">
                  <FileBarChart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">
                    分析报告详情
                  </DialogTitle>
                  <DialogDescription className="tech-mono text-[10px] mt-1">
                    结果 ID: {selectedResult?.id} | 样本: {selectedResult?.sampleId}
                  </DialogDescription>
                </div>
              </div>
              <Button size="sm" className="tech-mono text-[10px] bg-[#02A1C8] hover:bg-[#02A1C8]/90" disabled={selectedResult?.status !== 'completed'}>
                <ExternalLink className="w-3 h-3 mr-2" />
                在线预览报告
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-lg border tech-border bg-muted/5">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3 h-3 text-primary" />
                  <span className="text-[10px] tech-mono uppercase text-muted-foreground">分析类型</span>
                </div>
                <p className="text-sm font-bold">{selectedResult?.type}</p>
              </div>
              <div className="p-4 rounded-lg border tech-border bg-muted/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  <span className="text-[10px] tech-mono uppercase text-muted-foreground">状态</span>
                </div>
                <p className="text-sm font-bold">{selectedResult?.status === 'completed' ? '分析完成' : '分析异常'}</p>
              </div>
              <div className="p-4 rounded-lg border tech-border bg-muted/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="text-[10px] tech-mono uppercase text-muted-foreground">完成时间</span>
                </div>
                <p className="text-sm font-bold">{selectedResult?.completedAt}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold tech-mono mb-3 flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  分析摘要
                </h4>
                <div className="p-4 rounded-lg border tech-border bg-background text-xs leading-relaxed text-muted-foreground">
                  该分析流程针对样本 {selectedResult?.sampleId} 进行了深度测序数据处理。
                  {selectedResult?.type === 'mNGS' ? (
                    "检测到 3 种高置信度病原微生物，包括流感病毒 A 型。耐药基因分析显示对奥司他韦敏感。"
                  ) : (
                    "TCR 库多样性指数 (Shannon) 为 4.2，检测到 12 个显著扩增的克隆群，提示存在特异性免疫反应。"
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold tech-mono mb-3 flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  关键指标
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border-b tech-mono text-[11px]">
                    <span className="text-muted-foreground">测序深度 (Depth)</span>
                    <span className="font-bold">120x</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border-b tech-mono text-[11px]">
                    <span className="text-muted-foreground">覆盖度 (Coverage)</span>
                    <span className="font-bold">99.4%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border-b tech-mono text-[11px]">
                    <span className="text-muted-foreground">Q30 比例</span>
                    <span className="font-bold">92.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border-b tech-mono text-[11px]">
                    <span className="text-muted-foreground">比对率 (Mapping Rate)</span>
                    <span className="font-bold">88.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
