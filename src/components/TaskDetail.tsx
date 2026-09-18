import React, { useState, useCallback, useEffect } from "react";
import { 
  ChevronLeft, 
  Settings2, 
  Terminal, 
  Database, 
  Workflow, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Copy,
  Layout,
  Play,
  FileCode,
  Zap,
  Maximize2,
  Minimize2,
  Scissors,
  Dna,
  Layers,
  Filter,
  LineChart,
  FileCheck,
  ChevronRight,
  Search,
  Download,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface TaskDetailProps {
  task: any;
  onBack: () => void;
  onRetry?: (task: any) => void;
}

// Custom Node for Workflow Visual
const BioNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-sm rounded-md bg-white border border-slate-200 min-w-[120px]">
      <Handle type="target" position={Position.Left} className="w-1.5 h-1.5 bg-primary" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
          <Zap className="w-3 h-3 text-primary" />
        </div>
        <div>
          <div className="text-[10px] font-bold tech-mono text-slate-700">{data.label as string}</div>
          <div className="text-[8px] text-muted-foreground tech-mono">v1.2.0</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-1.5 h-1.5 bg-primary" />
    </div>
  );
};

const nodeTypes = {
  bioNode: BioNode,
};

export function TaskDetail({ task, onBack, onRetry }: TaskDetailProps) {
  const isWorkflow = task.type === 'workflow';
  const is16S = task.name.includes("16S");
  
  // ReactFlow state for workflow visual
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Running logs states
  const [currentLogs, setCurrentLogs] = useState<string[]>(task.logs || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedLogs, setCopiedLogs] = useState(false);

  useEffect(() => {
    if (isWorkflow && !is16S) {
      // Mock workflow nodes based on task
      const mockNodes = [
        { id: '1', type: 'bioNode', position: { x: 50, y: 100 }, data: { label: '质控处理 (QC)' } },
        { id: '2', type: 'bioNode', position: { x: 250, y: 100 }, data: { label: '序列比对 (BWA)' } },
        { id: '3', type: 'bioNode', position: { x: 450, y: 100 }, data: { label: '变异检测 (GATK)' } },
        { id: '4', type: 'bioNode', position: { x: 650, y: 100 }, data: { label: '功能注释 (Vann)' } },
      ];
      const mockEdges: Edge[] = [
        { id: 'e1-2', source: '1', target: '2', animated: task.status === 'running', style: { stroke: '#02A1C8' } },
        { id: 'e2-3', source: '2', target: '3', animated: task.status === 'running', style: { stroke: '#02A1C8' } },
        { id: 'e3-4', source: '3', target: '4', animated: task.status === 'running', style: { stroke: '#02A1C8' } },
      ];
      setNodes(mockNodes);
      setEdges(mockEdges);
    }
  }, [isWorkflow, is16S, task.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 tech-mono text-[10px]">已完成</Badge>;
      case 'running': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 tech-mono text-[10px] animate-pulse">进行中</Badge>;
      case 'failed': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 tech-mono text-[10px]">失败</Badge>;
      default: return null;
    }
  };

  // Real-time log update & parsing simulation
  useEffect(() => {
    setCurrentLogs(task.logs || []);
    
    if (task.status === 'running') {
      const interval = setInterval(() => {
        setCurrentLogs(prev => {
          if (prev.length >= 25) return prev; // Avoid unbounded growth
          
          const timeStr = new Date().toTimeString().split(' ')[0];
          const nextLogSeed = [
            `[${timeStr}] 核心比对引擎正在处理序列块 #${prev.length + 1}...`,
            `[${timeStr}] 正在读取数据流区块，分批次写入缓存...`,
            `[${timeStr}] 处理完成区块 #${prev.length + 1} | 开启下个区块预取队列`,
            `[${timeStr}] 触发快照自动存盘: 检查点验证成功`,
            `[${timeStr}] 自适应控制: 当前进度已稳健提升至 ${Math.min(99, 45 + prev.length * 3)}%`
          ];
          const randomSeed = nextLogSeed[Math.floor(Math.random() * nextLogSeed.length)];
          return [...prev, randomSeed];
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [task.id, task.status, task.logs]);

  const generateStableHash = (index: number) => {
    const hashes = [
      'c7/ad0307', '94/ab7e4d', '1d/66065a', '27/b1425e',
      '8f/2c9c81', 'ac/7f83e0', 'd1/99a22f', '3b/1a5fe8',
      'e4/bc3d55', '50/9a8b11', '72/eef8d9', 'bc/102c9a'
    ];
    return hashes[index % hashes.length];
  };

  const getNextflowStep = (log: string, index: number) => {
    const hash = generateStableHash(index);
    const lower = log.toLowerCase();
    let stepName = "";

    if (lower.includes("dada2")) {
      stepName = "TAXONOMY_VISUALIZATION:DADA2_DENOISING (1)";
    } else if (lower.includes("cutadapt") || lower.includes("引物")) {
      stepName = "TAXONOMY_VISUALIZATION:CUTADAPT_PRIMER_STRIP (1)";
    } else if (lower.includes("比对") || lower.includes("序列")) {
      stepName = "TAXONOMY_ALIGNMENT:ALIGN_READS_TO_DB (1)";
    } else if (lower.includes("数据库")) {
      stepName = "METAGENOMICS:LOAD_REFERENCE_INDEX (1)";
    } else if (lower.includes("报告") || lower.includes("可视化")) {
      stepName = "TAXONOMY_VISUALIZATION:TAXONOMY_BARPLOT (1)";
    } else if (lower.includes("alphafold") || lower.includes("msa")) {
      stepName = "ALPHAFOLD2:GENERATE_MSA_ALIGN (1)";
    } else if (lower.includes("3d") || lower.includes("模型")) {
      stepName = "ALPHAFOLD2:STRUCTURE_PREDICTION_3D (1)";
    } else if (lower.includes("初始化") || lower.includes("启动")) {
      stepName = "PIPELINE_SCHEDULER:INITIALIZE_RESOURCES (1)";
    } else {
      const defaultSteps = [
        "TAXONOMY_VISUALIZATION:GENUS_PHYLOGENY_TREE (1)",
        "TAXONOMY_VISUALIZATION:KRONA_PLOT (1)",
        "TAXONOMY_VISUALIZATION:TAXONOMY_HEATMAP (1)",
        "TAXONOMY_VISUALIZATION:TAXONOMY_BARPLOT (1)",
        "TAXONOMY_VISUALIZATION:DATA_PREPROCESSING (1)",
        "TAXONOMY_VISUALIZATION:ASV_TABULATION (1)"
      ];
      stepName = defaultSteps[index % defaultSteps.length];
    }

    return { hash, stepName };
  };

  const parseLogLine = (log: string) => {
    const timeRegex = /^\[(\d{2}:\d{2}:\d{2})\]\s*(.*)$/;
    const match = log.match(timeRegex);
    
    let time = "";
    let message = log;
    
    if (match) {
      time = match[1];
      message = match[2];
    }
    
    let type: 'info' | 'warning' | 'error' | 'success' = 'info';
    const lowerMessage = message.toLowerCase();
    if (message.includes("错误") || lowerMessage.includes("error") || lowerMessage.includes("failed") || message.includes("失败")) {
      type = 'error';
    } else if (message.includes("警告") || lowerMessage.includes("warning") || lowerMessage.includes("warn")) {
      type = 'warning';
    } else if (message.includes("完成") || message.includes("成功") || lowerMessage.includes("success") || message.includes("结束")) {
      type = 'success';
    }
    
    return { time, message, type };
  };

  const logsEndRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentLogs, searchTerm, logLevelFilter, autoScroll]);

  const handleCopyLogs = () => {
    const textToCopy = currentLogs.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleDownloadLogs = () => {
    const textToCopy = currentLogs.join('\n');
    const blob = new Blob([textToCopy], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-${task.id}-logs.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = currentLogs.filter(log => {
    const parsed = parseLogLine(log);
    const matchesSearch = log.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevelFilter === 'all' || parsed.type === logLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const renderExecutionLogs = () => {
    return (
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">运行日志详情 (Execution Logs Detail)</h2>
            <div className="flex items-center gap-1.5 ml-2">
              {task.status === 'running' ? (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 text-[9px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  实时监听中
                </div>
              ) : task.status === 'completed' ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2 py-0.5 text-[9px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  已完成且归档
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full px-2 py-0.5 text-[9px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  核心执行中断
                </div>
              )}
              <span className="text-[10px] text-muted-foreground font-medium">共 {currentLogs.length} 条</span>
            </div>
          </div>
        </div>
        
        {/* Nextflow Console Frame */}
        <Card className="border border-[#DCDAD2] shadow-sm overflow-hidden bg-[#F5F4EF] rounded-xl">
          {/* Header Bar styled beautifully like retro window */}
          <div className="bg-[#EAE9E2] border-b border-[#DCDAD2] px-4 py-2 flex items-center justify-between text-xs text-[#5C5C54] select-none font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#5C5C54]" />
              <span className="font-mono text-[10px] tracking-tight text-[#4C4C44] font-medium">{task.id ? task.id.toLowerCase() : 'nextflow'}@cloud-host-node ~ nextflow run</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E57373]/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFB74D]/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#81C784]/80" />
            </div>
          </div>
          
          <ScrollArea className="h-[360px] w-full">
            <div className="p-5 font-mono text-[12px] leading-relaxed select-text space-y-1 bg-[#F5F4EF]">
              {/* Image Header: N E X T F L O W ~ version 25.10.4 */}
              <div className="mb-3 space-y-1 text-[#2D2D2A]">
                <div className="font-mono leading-none">
                  <span className="text-[#104EB2] font-semibold tracking-[0.22em] text-[13px]">N E X T F L O W</span>
                  <span className="text-[#6B6A64] font-normal mx-2 select-none">~</span>
                  <span className="text-[#3A3C38] font-medium">version 25.10.4</span>
                </div>
                <div className="text-[#4C4C46] text-[11px] font-mono leading-relaxed mt-1 break-all">
                  Launching <code className="bg-[#EAE8E0] text-[#1F2937] px-1 py-0.5 rounded text-[10px] font-mono">`/data-nfs/nextflow/apps/16srRNA_metaNGS/TAXONOMY_VISUALIZATION.nf`</code> <span className="text-[#7A7870]">[{task.id ? task.id.toLowerCase() : 'task-005'}_batch_223]</span> DSL2 - revision: <span className="font-semibold text-slate-800">3ee80c0408</span>
                </div>
              </div>

              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const { time, message, type } = parseLogLine(log);
                  const stepInfo = getNextflowStep(log, index);
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "py-1.5 px-3 flex flex-wrap items-center gap-x-2 rounded transition-colors text-[12px] font-mono leading-relaxed border-l-2 border-transparent",
                        type === 'error' && "bg-[#FDE8E8]/70 text-red-900 border-red-500",
                        type === 'warning' && "bg-[#FEF3C7]/70 text-amber-950 border-amber-500",
                        type === 'success' && "bg-[#DEF7EC]/70 text-emerald-950 border-emerald-500",
                        type === 'info' && "hover:bg-black/[0.015] text-[#2D2D2A]"
                      )}
                    >
                      <span className="text-[#7C7A72] select-none">[</span>
                      <span className="text-[#B45309] font-medium">{stepInfo.hash}</span>
                      <span className="text-[#7C7A72] select-none">]</span>
                      
                      <span className={cn(
                        "font-medium",
                        type === 'error' ? "text-red-700 font-bold" :
                        type === 'warning' ? "text-amber-700 font-bold" :
                        "text-[#15803D]"
                      )}>
                        {type === 'error' ? 'Error in process >' : 
                         type === 'warning' ? 'Warning in process >' : 
                         'Submitted process >'}
                      </span>
                      
                      <span className={cn(
                        "font-medium tracking-wide flex-1 break-all",
                        type === 'error' ? "text-red-800" :
                        type === 'warning' ? "text-amber-900" :
                        "text-[#1F2937]"
                      )}>
                        {stepInfo.stepName}
                      </span>
                      
                      {/* Search match highlight or extra context container */}
                      {(searchTerm || type === 'error' || type === 'warning') && (
                        <div className="w-full text-[10px] text-[#63625C] font-sans pl-6 mt-1 flex items-center gap-1 border-t border-black/[0.03] pt-1">
                          <span className="font-mono text-[9px] bg-black/[0.04] px-1 rounded select-none">RAW OUTPUT:</span>
                          <span className="font-mono">{message}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-[#6B6A64] space-y-3 select-none">
                  <Terminal className="w-8 h-8 text-[#908F87] stroke-[1.5]" />
                  <p className="text-xs font-sans">暂无匹配当前过滤条件的运行日志</p>
                </div>
              )}
              
              {task.status === 'running' && filteredLogs.length > 0 && (
                <div className="flex items-center gap-2 text-[#2563EB] mt-3 pl-3">
                  <span className="animate-pulse font-bold text-xs">⏵</span>
                  <span className="text-[10px] text-[#6B6A64] font-sans tracking-tight animate-pulse select-none">实时监听中，等待新输出产生...</span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </Card>
      </section>
    );
  };

  const commandPreview = `cutadapt ${task.params.minReadLength ? `-m ${task.params.minReadLength}` : '-m 50'} \\
  -o ${task.id}_R1.trimmed.fastq.gz \\
  -p ${task.id}_R2.trimmed.fastq.gz \\
  ${task.params.sampleId || 'raw_reads_1.fq'} ${task.params.proteinId || 'raw_reads_2.fq'}`;

  const render16SDetail = () => (
    <div className="space-y-10 max-w-[1000px] mx-auto pb-20">
      {/* 1. Data Upload Info */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#02A1C8] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#02A1C8]/20">1</div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            数据上传详情汇总
            <Badge variant="outline" className="text-[10px] bg-slate-50 font-normal">样本数: {task.params.samples?.length || 0}</Badge>
          </h2>
        </div>
        <Card className="border-none bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2 text-xs">
              <Database className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500 uppercase tracking-wider tech-mono">所属项目</span>
              <span className="font-bold text-slate-700 ml-2">{task.params.projectId || '默认项目'}</span>
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
                {(task.params.samples || []).map((s: any) => (
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
                <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">{task.params.primerForward}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Reverse Primer</span>
                <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">{task.params.primerReverse}</p>
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
                { label: '最小重叠', val: `${task.params.minOverlap} bp` },
                { label: '最大错配', val: task.params.maxMismatch },
                { label: '最大错误率', val: task.params.maxError },
                { label: '长度范围', val: `${task.params.minLen}-${task.params.maxLen}` },
                { label: '模糊碱基', val: task.params.maxN },
                { label: '聚类相似度', val: task.params.confidence }
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
                <span className="text-[10px] text-slate-400 uppercase font-medium">Alpha 指数</span>
                <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">{task.params.alphaIndex}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">相异矩阵</span>
                <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">{task.params.distMatrix}</p>
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
                <span className="text-[10px] text-slate-400 uppercase font-medium">分组列</span>
                <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">{task.params.groupCol}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">显著性阈值</span>
                <p className="text-xs font-bold tech-mono p-2 bg-slate-50 rounded border border-slate-100">p &lt; {task.params.pValue}</p>
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
        <Card className="border-none bg-white p-8 shadow-sm border border-slate-100 flex relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-150">
             <Settings2 className="w-24 h-24" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <FileCheck className="w-3 h-3" />
              任务名称 (Job Name)
            </div>
            <p className="text-lg font-black text-slate-800 tech-mono">{task.name}_20260416_001</p>
          </div>
        </Card>
      </section>

      {/* 4. Real-time Execution Logs */}
      {renderExecutionLogs()}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-primary hover:bg-primary/5 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              返回任务列表
            </Button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                {getStatusIcon(task.status)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-0.5">
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">{task.name}</h1>
                  {getStatusBadge(task.status)}
                </div>
                <div className="flex items-center gap-3 text-[10px] tech-mono text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.createdAt}</span>
                  <span>ID: {task.id}</span>
                  <span className="flex items-center gap-1 uppercase">
                    {isWorkflow ? <Workflow className="w-3 h-3" /> : <Settings2 className="w-3 h-3" />}
                    {isWorkflow ? 'Workflow' : 'Tool'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {task.status === 'failed' && (
              <Button 
                onClick={() => onRetry?.(task)}
                size="sm" 
                className="tech-mono text-[10px] h-8 font-bold bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                重试
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {is16S ? (
          <div className="p-8">
            {render16SDetail()}
          </div>
        ) : (
          <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
            {/* Section 1: Parameters */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">提交参数与配置 (Inputs & Parameters)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(task.params).map(([key, value]) => (
                  <Card key={key} className="border-slate-200 shadow-none bg-white">
                    <div className="p-4">
                      <div className="text-[10px] tech-mono text-slate-400 uppercase font-bold mb-1">{key}</div>
                      <div className="text-xs font-bold text-slate-700 tech-mono">
                        {typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : (Array.isArray(value) ? value.join(', ') : String(value))}
                      </div>
                    </div>
                  </Card>
                ))}
                <Card className="border-slate-200 shadow-none bg-white lg:col-span-1">
                  <div className="p-4">
                    <div className="text-[10px] tech-mono text-slate-400 uppercase font-bold mb-1">优先级</div>
                    <div className="text-xs font-bold text-slate-700 tech-mono">NORMAL / 普通</div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Section 2: Visual Representation */}
            {isWorkflow ? (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">工作流可视化画布 (Workflow Canvas Visual)</h2>
                </div>
                <Card className="border-slate-200 shadow-none bg-white h-[400px] overflow-hidden relative group">
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur shadow-sm">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </div>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    draggable={false}
                    nodesConnectable={false}
                    nodesDraggable={false}
                    panOnDrag={false}
                    zoomOnScroll={false}
                  >
                    <Background color="#cbd5e1" gap={16} size={1} />
                    <Controls showInteractive={false} className="bg-white border-slate-200 shadow-sm" />
                  </ReactFlow>
                  {/* Visual Status Indicator */}
                  <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/90 backdrop-blur rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-[10px] tech-mono text-slate-400 uppercase font-bold mb-2">执行状态统计</div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold">4 完成</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold">0 进行中</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            ) : (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">命令行可视化 (Command Line Visualization)</h2>
                </div>
                <Card className="border-slate-200 shadow-none bg-white overflow-hidden">
                  <div className="bg-[#1e293b] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                        </div>
                        <span className="text-[10px] tech-mono text-slate-400 font-bold uppercase tracking-tight">Bash Terminal</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-slate-300 hover:text-white hover:bg-slate-700/50 text-[10px] tech-mono">
                        <Copy className="w-3 h-3 mr-1.5" /> 复制指令
                      </Button>
                    </div>
                    <div className="space-y-4 font-mono text-xs leading-relaxed">
                      <div className="flex gap-3">
                        <span className="text-slate-500">$</span>
                        <span className="text-indigo-300"># 自动生成的任务执行指令</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-slate-500">$</span>
                        <div className="text-slate-200 break-all">
                          {commandPreview}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <span className="text-slate-500 animate-pulse">_</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <FileCode className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 mb-0.5">指令解析 (Instruction Parsing)</p>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          该指令基于您在提交表单中选择的输入路径与参数自动拼装而成。
                          系统将分配给运算集群执行，执行过程中产生的 stdout 将实时同步至运行日志中。
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Section 3: Detailed Terminal Execution Logs */}
            {renderExecutionLogs()}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
