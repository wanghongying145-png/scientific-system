import { useState } from "react";
import { 
  Trash2, 
  Search, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Database,
  Scissors,
  Dna,
  Layers,
  Filter,
  LineChart,
  Settings2,
  FileCheck,
  ArrowLeft
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  name: string;
  type: string;
  model: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  startTime: string;
  duration: string;
}

const MOCK_TASKS: TaskItem[] = [
  {
    id: "TASK-005",
    name: "16S标准分析任务一",
    type: "16S标准分析流程",
    model: "QIIME2 + DADA2",
    status: "running",
    progress: 45,
    startTime: "2024-04-16 16:30",
    duration: "15m 20s"
  },
  {
    id: "TASK-001",
    name: "新冠S蛋白高精度结构预测",
    type: "蛋白质结构预测",
    model: "AlphaFold2-Turbo",
    status: "completed",
    progress: 100,
    startTime: "2024-04-16 10:00",
    duration: "45m 12s"
  },
  {
    id: "TASK-002",
    name: "ZINC库100万分子初步筛选",
    type: "虚拟筛选",
    model: "DeepDock-V2",
    status: "running",
    progress: 68,
    startTime: "2024-04-16 14:30",
    duration: "2h 15m"
  },
  {
    id: "TASK-003",
    name: "EGFR靶点抗体CDR区设计",
    type: "抗体设计",
    model: "AbGenerator-X",
    status: "failed",
    progress: 42,
    startTime: "2024-04-15 09:15",
    duration: "12m 05s"
  },
  {
    id: "TASK-004",
    name: "小分子ADMET属性评估",
    type: "分子性质预测",
    model: "PropertyPredictor",
    status: "pending",
    progress: 0,
    startTime: "2024-04-16 16:00",
    duration: "-"
  }
];

export function TaskCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("全部");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1.5 font-medium"><Loader2 className="w-3 h-3 animate-spin" /> 进行中</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200 gap-1.5 font-medium"><CheckCircle2 className="w-3 h-3" /> 已完成</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200 gap-1.5 font-medium"><AlertCircle className="w-3 h-3" /> 已失败</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground gap-1.5 font-medium"><Clock className="w-3 h-3" /> 待处理</Badge>;
    }
  };

  const renderTaskDetail = (task: TaskItem) => (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm">
      <div className="w-[800px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTask(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="text-sm font-bold">任务详情: {task.name}</h3>
              <p className="text-[10px] text-muted-foreground tech-mono">{task.id} | {task.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTask(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8 pb-20">
            {/* 1. Data Upload Info */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="text-xs font-bold">已上传数据汇总</h4>
              </div>
              <Card className="border-none bg-[#f8fafc] p-4 space-y-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">所属项目</span>
                  <span className="font-bold">病原微生物研究项目_2024</span>
                </div>
                <div className="bg-white rounded border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="h-8">
                        <TableHead className="text-[9px] h-8">样本ID</TableHead>
                        <TableHead className="text-[9px] h-8">批次</TableHead>
                        <TableHead className="text-[9px] h-8">FASTQ_1</TableHead>
                        <TableHead className="text-[9px] h-8">FASTQ_2</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: "SAM-001", b: "BATCH-01", f1: "SAM-001_R1.fq.gz", f2: "SAM-001_R2.fq.gz" },
                        { id: "SAM-002", b: "BATCH-01", f1: "SAM-002_R1.fq.gz", f2: "SAM-002_R2.fq.gz" }
                      ].map(s => (
                        <TableRow key={s.id} className="h-8">
                          <TableCell className="text-[10px] py-1">{s.id}</TableCell>
                          <TableCell className="text-[10px] py-1 tech-mono">{s.b}</TableCell>
                          <TableCell className="text-[10px] py-1 tech-mono text-[#02A1C8]">{s.f1}</TableCell>
                          <TableCell className="text-[10px] py-1 tech-mono text-[#02A1C8]">{s.f2}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </section>

            {/* 2. Parameters Configuration Info */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="text-xs font-bold">参数配置回顾</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-none bg-[#f8fafc] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Scissors className="w-3.5 h-3.5 text-[#02A1C8]" />
                    <span className="text-[10px] font-bold">引物序列</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">上游引物:</span>
                      <span className="tech-mono font-medium">AACMGGATTAGATACCCKG</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">下游引物:</span>
                      <span className="tech-mono font-medium">ACGTCATCCCCACCTTCC</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-none bg-[#f8fafc] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Dna className="w-3.5 h-3.5 text-[#02A1C8]" />
                    <span className="text-[10px] font-bold">序列处理</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground scale-90 origin-left">最小重叠:</span>
                      <span className="font-bold">20 bp</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground scale-90 origin-left">最大错配:</span>
                      <span className="font-bold">10</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground scale-90 origin-left">最大错误率:</span>
                      <span className="font-bold">1.0</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground scale-90 origin-left">聚类置信度:</span>
                      <span className="font-bold">0.97</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-none bg-[#f8fafc] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Layers className="w-3.5 h-3.5 text-[#02A1C8]" />
                    <span className="text-[10px] font-bold">多样性分析</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Alpha 多样性:</span>
                      <span className="font-bold">shannon</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">相异矩阵:</span>
                      <span className="font-bold">braycurtis</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-none bg-[#f8fafc] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Filter className="w-3.5 h-3.5 text-[#02A1C8]" />
                    <span className="text-[10px] font-bold">差异分析</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">分组列:</span>
                      <span className="font-bold">Group</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">显著阈值:</span>
                      <span className="font-bold">0.05</span>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* 3. Run Info */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02A1C8]/10 text-[#02A1C8] flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="text-xs font-bold">运行配置</h4>
              </div>
              <Card className="border-none bg-[#f8fafc] p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase">任务名称</span>
                  <p className="text-xs font-bold">{task.name}_20260416_001</p>
                </div>
              </Card>
            </section>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedTask(null)}>关闭页面</Button>
          <Button size="sm" className="text-xs bg-[#02A1C8] hover:bg-[#02A1C8]/90">
            {task.status === 'completed' ? '导出报告' : '加速任务'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">任务详情</h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1">
            查看和管理 16S 标准分析任务的运行状态与历史配置。
          </p>
        </div>
      </div>

      <Card className="tech-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {['全部', '执行中', '已成功', '处理失败'].map((f) => (
              <Button
                key={f}
                variant={activeFilter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "h-8 text-[11px] tech-mono px-3",
                  activeFilter === f && "bg-[#02A1C8] hover:bg-[#02A1C8]/90"
                )}
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="按任务 ID 或名称搜索..." 
              className="pl-8 h-9 text-xs tech-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="tech-mono text-[10px] uppercase tracking-wider">
                <TableHead className="w-[120px]">任务编号</TableHead>
                <TableHead>任务名称</TableHead>
                <TableHead>任务类型</TableHead>
                <TableHead>分析架构</TableHead>
                <TableHead>当前进度</TableHead>
                <TableHead>运行状态</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TASKS.map((task) => (
                <TableRow key={task.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="text-xs tech-mono font-medium">{task.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{task.name}</span>
                      <span className="text-[10px] text-muted-foreground tech-mono">{task.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{task.type}</TableCell>
                  <TableCell className="text-xs tech-mono font-medium text-[#02A1C8]">{task.model}</TableCell>
                  <TableCell>
                    <div className="w-32 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] tech-mono">
                        <span className="text-muted-foreground">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            task.status === 'running' ? "tech-gradient-blue animate-pulse" :
                            task.status === 'completed' ? "bg-green-500" :
                            task.status === 'failed' ? "bg-red-500" : "bg-muted-foreground/20"
                          )}
                          style={{ width: `${task.progress}%` }} 
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="text-[10px] tech-mono text-muted-foreground">{task.startTime}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setSelectedTask(task)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {selectedTask && renderTaskDetail(selectedTask)}
    </div>
  );
}
