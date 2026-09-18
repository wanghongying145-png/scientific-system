import { useState, useEffect } from "react";
import { 
  Activity, 
  Search, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  XCircle, 
  FileText, 
  Settings2,
  ChevronRight,
  Terminal,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Eye,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { TaskDetail } from "./TaskDetail";
import { RetryTaskConfig } from "./RetryTaskConfig";

interface Task {
  id: string;
  name: string;
  type: 'tool' | 'workflow';
  status: 'completed' | 'running' | 'failed';
  progress: number;
  createdAt: string;
  params: Record<string, any>;
  logs: string[];
}

const MOCK_TASKS: Task[] = [
  {
    id: "TASK-006",
    name: "16S标准分析任务二",
    type: 'workflow',
    status: 'failed',
    progress: 15,
    createdAt: "2024-04-17 09:00:00",
    params: {
      projectId: "病原微生物研究项目_2024",
      samples: [
        { id: "SAM-003", batch: "BATCH-02", f1: "SAM-003_R1.fq.gz", f2: "SAM-003_R2.fq.gz" }
      ],
      primerForward: "AACMGGATTAGATACCCKG",
      primerReverse: "ACGTCATCCCCACCTTCC"
    },
    logs: [
      "[09:00:00] 16S 标准分析任务初始化...",
      "[09:05:00] 错误: FASTQ 文件路径不存在或无法读取 (/data/SAM-003_R1.fq.gz)"
    ]
  },
  {
    id: "TASK-005",
    name: "16S标准分析任务一",
    type: 'workflow',
    status: 'running',
    progress: 45,
    createdAt: "2024-04-16 16:30:00",
    params: {
      projectId: "病原微生物研究项目_2024",
      samples: [
        { id: "SAM-001", batch: "BATCH-01", f1: "SAM-001_R1.fq.gz", f2: "SAM-001_R2.fq.gz" },
        { id: "SAM-002", batch: "BATCH-01", f1: "SAM-002_R1.fq.gz", f2: "SAM-002_R2.fq.gz" }
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
      nmdsTry: 50,
      groupCol: "Group",
      pValue: 0.05,
      ldaThreshold: 2.0,
      ordModel: "rda",
      maxPathways: 20
    },
    logs: [
      "[16:30:00] 16S 标准分析任务初始化...",
      "[16:30:05] 读取样本配置信息...",
      "[16:31:00] 开始进行 Cutadapt 引物切除...",
      "[16:40:00] 引物切除完成，进入 DADA2 降噪流程...",
      "[16:45:00] 当前进度: 45%"
    ]
  },
  {
    id: "TASK-001",
    name: "病原微生物宏基因组分析工作流",
    type: 'workflow',
    status: 'completed',
    progress: 100,
    createdAt: "2024-04-15 10:30:00",
    params: {
      sampleId: "SAMP-20240415-001",
      database: "Pathogen_DB_v2.1",
      threads: 16,
      minReadLength: 50
    },
    logs: [
      "[10:30:00] 任务启动...",
      "[10:30:05] 正在加载参考数据库...",
      "[10:31:20] 数据库加载完成。",
      "[10:31:25] 开始比对序列...",
      "[10:45:00] 比对完成，正在生成报告...",
      "[10:45:30] 任务成功结束。"
    ]
  },
  {
    id: "TASK-002",
    name: "蛋白质结构预测 - AlphaFold2",
    type: 'tool',
    status: 'running',
    progress: 65,
    createdAt: "2024-04-15 11:00:00",
    params: {
      proteinId: "PROT-789",
      model: "AlphaFold2_v2.3",
      useGpu: true,
      iterations: 5
    },
    logs: [
      "[11:00:00] 正在初始化计算节点...",
      "[11:00:15] 正在下载蛋白质序列数据...",
      "[11:01:00] 开始进行多序列比对 (MSA)...",
      "[11:20:00] MSA 完成，正在进行结构折叠预测...",
      "[11:35:00] 当前进度: 65%"
    ]
  },
  {
    id: "TASK-003",
    name: "虚拟筛选 - 分子对接",
    type: 'workflow',
    status: 'failed',
    progress: 42,
    createdAt: "2024-04-14 15:20:00",
    params: {
      ligandLibrary: "Enamine_REAL_v2024",
      targetProtein: "3CLpro_SARS-CoV-2",
      scoringFunction: "AutoDock_Vina",
      maxPoses: 10
    },
    logs: [
      "[15:20:00] 任务启动...",
      "[15:20:10] 正在准备受体文件...",
      "[15:20:45] 受体准备完成，开始对接配体库...",
      "[15:45:00] 错误: 计算节点连接超时。",
      "[15:45:05] 正在尝试重新连接...",
      "[15:45:30] 错误: 无法恢复任务。计算资源不足。",
      "[15:45:35] 任务异常终止。"
    ]
  },
  {
    id: "TASK-004",
    name: "BCR/TCR 序列注释工具",
    type: 'tool',
    status: 'completed',
    progress: 100,
    createdAt: "2024-04-14 09:15:00",
    params: {
      inputType: "FASTQ",
      species: "Human",
      loci: ["IGH", "TRB"],
      v_identity_threshold: 0.9
    },
    logs: [
      "[09:15:00] 正在读取输入文件...",
      "[09:15:30] 正在进行 V(D)J 重排识别...",
      "[09:20:00] 识别完成，正在进行 CDR3 提取...",
      "[09:22:00] 正在生成克隆型统计数据...",
      "[09:25:00] 任务完成。"
    ]
  }
];

export function TaskMonitor() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'retry_config'>('list');

  // Background progress simulator for running tasks to make retry logs and progress bar ultra-realistic!
  useEffect(() => {
    const hasRunning = tasks.some(t => t.status === 'running');
    if (!hasRunning) return;

    const timer = setInterval(() => {
      setTasks(prev => 
        prev.map(t => {
          if (t.status === 'running') {
            const nextProgress = t.progress + 10;
            if (nextProgress >= 100) {
              return {
                ...t,
                progress: 100,
                status: 'completed' as const,
                logs: [
                  ...t.logs,
                  `[${new Date().toLocaleTimeString()}] 解析作业结束。计算结果已安全存盘。`,
                  `[${new Date().toLocaleTimeString()}] 工作流全部节点执行完毕，生成物种概率丰度与层级报告。`,
                  `[${new Date().toLocaleTimeString()}] 任务圆满完成。`
                ]
              };
            }
            return {
              ...t,
              progress: nextProgress,
              logs: t.logs.length < 35 && Math.random() > 0.4
                ? [
                    ...t.logs,
                    `[${new Date().toLocaleTimeString()}] 计算模块状态正常 | 自适应线程负载调度，当前作业总进度推进至: ${nextProgress}%`
                  ]
                : t.logs
            };
          }
          return t;
        })
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [tasks]);

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 tech-mono text-[10px]">已完成</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 tech-mono text-[10px] animate-pulse">进行中</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 tech-mono text-[10px]">失败</Badge>;
    }
  };

  const handleViewDetail = (task: Task) => {
    setSelectedTask(task);
    setView('detail');
  };

  const handleTriggerRetry = (task: Task) => {
    setSelectedTask(task);
    setView('retry_config');
  };

  const handleConfirmRetrySubmit = (updatedTask: any) => {
    setTasks(prev => 
      prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask, status: 'running', progress: 5 } : t)
    );
    setSelectedTask({ ...updatedTask, status: 'running', progress: 5 });
    setView('detail');
  };

  if (view === 'detail' && selectedTask) {
    const liveSelectedTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;
    return (
      <TaskDetail 
        task={liveSelectedTask} 
        onBack={() => {
          setView('list');
          setSelectedTask(null);
        }} 
        onRetry={handleTriggerRetry}
      />
    );
  }

  if (view === 'retry_config' && selectedTask) {
    return (
      <RetryTaskConfig 
        task={selectedTask}
        onBack={() => {
          setView('list');
        }}
        onConfirmRetry={handleConfirmRetrySubmit}
      />
    );
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">任务监控</h2>
          <p className="text-muted-foreground text-sm tech-mono">
            实时监控系统内所有工具及工作流的运行状态、日志与参数。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="tech-mono text-[10px] h-8">
            <RefreshCw className="w-3 h-3 mr-2" />
            刷新列表
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索任务名称或 ID..."
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
                <TableHead className="tech-header w-[120px]">任务 ID</TableHead>
                <TableHead className="tech-header">任务名称</TableHead>
                <TableHead className="tech-header w-[100px]">类型</TableHead>
                <TableHead className="tech-header w-[120px]">进度</TableHead>
                <TableHead className="tech-header w-[100px]">状态</TableHead>
                <TableHead className="tech-header w-[180px]">创建时间</TableHead>
                <TableHead className="tech-header text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="group hover:bg-muted/30">
                  <TableCell className="tech-mono text-[11px] font-bold text-primary">{task.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {task.type === 'workflow' ? <Workflow className="w-3 h-3 text-muted-foreground" /> : <Settings2 className="w-3 h-3 text-muted-foreground" />}
                      <span className="text-xs font-medium">{task.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[9px] tech-mono uppercase px-1.5 h-4 font-normal">
                      {task.type === 'workflow' ? '工作流' : '工具'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[9px] tech-mono">
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            task.status === 'failed' ? "bg-red-500" : "bg-primary"
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="tech-mono text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {task.createdAt}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {task.status === 'failed' && (
                        <Button 
                          onClick={() => handleTriggerRetry(task)}
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 tech-mono text-[10px] text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                        >
                          <RefreshCw className="w-3 h-3 mr-1.5" />
                          重试
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 tech-mono text-[10px] text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleViewDetail(task)}
                      >
                        <Eye className="w-3 h-3 mr-1.5" />
                        详情
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
