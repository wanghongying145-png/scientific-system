import { useState, ReactNode } from "react";
import { 
  Upload, 
  Trash2, 
  FileIcon, 
  ChevronLeft, 
  Settings2,
  Database,
  Play,
  RotateCcw,
  Info,
  History,
  Activity,
  Send,
  Cpu,
  Keyboard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

function HorizontalField({ label, children, icon: Icon, rightIcon: RightIcon }: { label: string; children: ReactNode; icon?: any; rightIcon?: any }) {
  return (
    <div className="flex items-stretch border rounded h-10 overflow-hidden bg-white group focus-within:border-[#0F172A]/30 transition-colors">
      <div className="w-32 bg-[#F8FAFB] border-r flex items-center px-4 shrink-0">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex-1 flex items-center px-3 relative">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground mr-2" />}
        {children}
        {RightIcon && (
          <div className="absolute right-3 group-hover:scale-110 transition-transform cursor-pointer">
            <RightIcon className="w-4 h-4 text-[#0F172A]/40" />
          </div>
        )}
      </div>
    </div>
  );
}

export function VirtualScreeningTask({ onBack, onSubmit, onViewResult }: { onBack: () => void; onSubmit: () => void; onViewResult: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference');
  const [taskName, setTaskName] = useState("VS-Task-" + new Date().toISOString().slice(0, 10));
  const [taskDesc, setTaskDesc] = useState("");
  
  const [receptor, setReceptor] = useState<UploadedFile | null>(null);
  const [ligands, setLigands] = useState<UploadedFile[]>([]);
  
  const [params, setParams] = useState({
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    sizeX: 20,
    sizeY: 20,
    sizeZ: 20,
    energyRange: 3,
    cpu: 4,
    exhaustiveness: 8,
    mode: 'Standard'
  });

  const handleUploadReceptor = () => {
    setReceptor({ id: "r1", name: "receptor_target.pdbqt", size: "1.2 MB", status: 'completed' });
  };

  const handleUploadLigands = () => {
    const nextId = "l" + (ligands.length + 1);
    setLigands([...ligands, { id: nextId, name: `ligand_${nextId}.sdf`, size: "45 KB", status: 'completed' }]);
  };

  const handleSubmit = () => {
    if (!receptor || ligands.length === 0) return;
    onSubmit();
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      {/* Header Area */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100 transition-colors mt-1">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">基于结构的虚拟筛选</h1>
              <p className="text-[11px] text-muted-foreground font-medium">基于 AutoDock Vina 的分子对接与虚拟筛选模型</p>
            </div>

            {/* Tab Selection */}
            <div className="flex items-center bg-[#F1F4F9] p-1 rounded-full w-fit">
              <button 
                onClick={() => setActiveTab('inference')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === 'inference' ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A]"
                )}
              >
                <Activity className="w-4 h-4" />
                <span>推理</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all",
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

      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-20">
          {activeTab === 'inference' ? (
            <>
              {/* Module A: 任务基本信息 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-1.5 bg-white border rounded shadow-sm">
                    <Keyboard className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#0F172A]">任务基本信息</h2>
                </div>
                <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                  <CardContent className="p-6 space-y-4">
                    <HorizontalField label="任务名称">
                      <Input 
                        value={taskName} 
                        onChange={e => setTaskName(e.target.value)} 
                        className="border-none focus-visible:ring-0 text-xs px-0 h-full w-full"
                        placeholder="请输入任务名称"
                      />
                    </HorizontalField>

                    <HorizontalField label="任务描述 (可选)">
                      <Input 
                        value={taskDesc} 
                        onChange={e => setTaskDesc(e.target.value)} 
                        className="border-none focus-visible:ring-0 text-xs px-0 h-full w-full"
                        placeholder="请输入任务详细说明"
                      />
                    </HorizontalField>
                  </CardContent>
                </Card>
              </div>

              {/* Module B: 文件上传区 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white border rounded shadow-sm">
                      <Database className="w-4 h-4 text-[#0F172A]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#0F172A]">文件上传区</h2>
                    <Badge variant="ghost" className="text-[10px] text-muted-foreground hover:bg-transparent cursor-help">
                      <Info className="w-3 h-3 mr-1" />
                      数据格式: .pdbqt, .pdb, .ent, .xyz, .pqr, .mcif, .mmcif
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Receptor Upload */}
                  <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-[#333]">1) 受体上传 (Single File)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      {!receptor ? (
                        <div 
                          onClick={handleUploadReceptor}
                          className="min-h-[140px] border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-[#1D4ED8]/40 transition-all bg-[#F8FAFB] group"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all">
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-medium text-slate-600">点击上传受体文件</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-100 flex items-center gap-4 relative group/file">
                          <div className="w-10 h-10 rounded bg-white flex items-center justify-center shadow-sm">
                            <FileIcon className="w-5 h-5 text-[#1D4ED8]" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-[#0F172A] truncate">{receptor.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground tech-mono uppercase">{receptor.size}</span>
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-normal border-green-200 text-green-600 bg-green-50">已就绪</Badge>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive opacity-0 group-hover/file:opacity-100 transition-opacity"
                            onClick={() => setReceptor(null)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Ligand Upload */}
                  <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-[#333]">2) 配体上传 (Multi-File / Drag&Drop)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div 
                        onClick={handleUploadLigands}
                        className="min-h-[100px] border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-[#1D4ED8]/40 transition-all bg-[#F8FAFB] group mb-4"
                      >
                        <Database className="w-5 h-5 text-slate-400 group-hover:text-primary transition-all" />
                        <p className="text-[11px] font-medium text-slate-600">批量上传或拖拽配体文件</p>
                      </div>
                      
                      {ligands.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-muted-foreground tech-mono">已就绪配体: {ligands.length}</span>
                            <Button variant="ghost" className="h-6 text-[10px] text-destructive px-1 hover:bg-destructive/5" onClick={() => setLigands([])}>全部删除</Button>
                          </div>
                          <div className="max-h-[150px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                            {ligands.map(file => (
                              <div key={file.id} className="flex items-center gap-3 p-2 bg-white rounded border border-slate-100 text-[10px] group/item">
                                <FileIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 truncate font-medium">{file.name}</span>
                                <span className="text-slate-400 tech-mono">{file.size}</span>
                                <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-normal border-green-100 text-green-500 bg-green-50/50">OK</Badge>
                                <Trash2 
                                  className="w-3.5 h-3.5 text-slate-300 hover:text-destructive cursor-pointer opacity-0 group-hover/item:opacity-100 transition-opacity" 
                                  onClick={() => setLigands(ligands.filter(l => l.id !== file.id))}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Module C: 参数配置区 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-1.5 bg-white border rounded shadow-sm">
                    <Settings2 className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#0F172A]">参数配置区</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Case 1: Active Site Box */}
                  <Card className="border-none shadow-sm ring-1 ring-black/[0.03] bg-[#F8FAFB]/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                         <Badge variant="outline" className="text-[10px] font-bold border-[#0F172A]/20 text-[#0F172A] bg-white">1) 活性位点盒子 (Å)</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[11px] text-muted-foreground tech-mono uppercase font-bold tracking-tight">中心坐标 (Center)</Label>
                        <div className="grid grid-cols-3 gap-2">
                           {['centerX', 'centerY', 'centerZ'].map(axis => (
                              <div key={axis} className="space-y-1">
                                <Label className="text-[9px] uppercase text-slate-400">{axis.at(-1)}</Label>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  value={params[axis as keyof typeof params]} 
                                  onChange={e => setParams({...params, [axis]: Number(e.target.value)})}
                                  className="h-8 text-xs tech-mono bg-white"
                                />
                              </div>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] text-muted-foreground tech-mono uppercase font-bold tracking-tight">盒子大小 (Size)</Label>
                        <div className="grid grid-cols-3 gap-2">
                           {['sizeX', 'sizeY', 'sizeZ'].map(axis => (
                              <div key={axis} className="space-y-1">
                                <Label className="text-[9px] uppercase text-slate-400">{axis.at(-1)}</Label>
                                <Input 
                                  type="number" 
                                  value={params[axis as keyof typeof params]} 
                                  onChange={e => setParams({...params, [axis]: Number(e.target.value)})}
                                  className="h-8 text-xs tech-mono bg-white"
                                />
                              </div>
                           ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Case 2: Advanced Settings */}
                  <Card className="border-none shadow-sm ring-1 ring-black/[0.03] bg-[#F8FAFB]/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold">
                        <Badge variant="outline" className="text-[10px] font-bold border-[#0F172A]/20 text-[#0F172A] bg-white">2) 高级参数</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="space-y-2">
                        <Label className="text-[10px]">最大能量差</Label>
                        <Input 
                          type="number" 
                          value={params.energyRange} 
                          onChange={e => setParams({...params, energyRange: Number(e.target.value)})}
                          className="h-9 text-xs tech-mono bg-white"
                        />
                        <p className="text-[9px] text-muted-foreground italic">默认: 3</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px]">CPU 数量</Label>
                        <Input 
                          type="number" 
                          value={params.cpu} 
                          onChange={e => setParams({...params, cpu: Number(e.target.value)})}
                          className="h-9 text-xs tech-mono bg-white"
                        />
                        <p className="text-[9px] text-muted-foreground italic">默认: 4</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px]">对接细致程度</Label>
                        <Input 
                          type="number" 
                          value={params.exhaustiveness} 
                          onChange={e => setParams({...params, exhaustiveness: Number(e.target.value)})}
                          className="h-9 text-xs tech-mono bg-white"
                        />
                        <p className="text-[9px] text-muted-foreground italic">默认: 8</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Module D: 提交区 */}
              <div className="flex flex-col items-center gap-6 pt-12">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setParams({
                      centerX: 0, centerY: 0, centerZ: 0,
                      sizeX: 20, sizeY: 20, sizeZ: 20,
                      energyRange: 3, cpu: 4, exhaustiveness: 8,
                      mode: 'Standard'
                    })}
                    className="h-11 px-8 rounded-full text-xs font-bold tech-mono text-muted-foreground hover:bg-slate-50 border-slate-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    清空重置
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!receptor || ligands.length === 0}
                    className={cn(
                      "h-12 px-12 rounded-full text-sm font-bold tech-mono transition-all hover:scale-105 active:scale-95 shadow-xl",
                      receptor && ligands.length > 0 
                        ? "bg-[#0F172A] hover:bg-[#0F172A]/90 text-white shadow-blue-900/10" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed border-none"
                    )}
                  >
                    <Send className="w-4 h-4 mr-3" />
                    提交任务
                  </Button>
                </div>
                {!receptor || ligands.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 animate-pulse">
                    <Info className="w-3 h-3" />
                    请先上传受体和配体文件以激活提交按钮
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            /* History View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">历史推理任务</h2>
                  <p className="text-xs text-muted-foreground mt-1">查看过往提交的虚拟筛选任务及其状态</p>
                </div>
                <Input placeholder="搜索任务名称..." className="w-64 h-9 text-xs" />
              </div>

              <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#F8FAFB]">
                    <TableRow className="tech-mono text-[10px] uppercase">
                      <TableHead>任务 ID</TableHead>
                      <TableHead>任务名称</TableHead>
                      <TableHead>耗时</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>完成时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 'VS-001', name: '新冠靶点高通量筛选', time: '45m', status: 'completed', date: '2024-04-12 14:20' },
                      { id: 'VS-002', name: 'ZINC库子集库10k筛选', time: '12m', status: 'completed', date: '2024-04-10 09:15' },
                      { id: 'VS-003', name: '靶向分子对接优化', time: '-', status: 'failed', date: '2024-04-08 16:45' }
                    ].map(item => (
                      <TableRow key={item.id} className="text-xs group hover:bg-slate-50">
                        <TableCell className="tech-mono font-medium">{item.id}</TableCell>
                        <TableCell className="font-bold">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.time}</TableCell>
                        <TableCell>
                          {item.status === 'completed' ? (
                            <Badge className="bg-green-50 text-green-600 border-green-200 font-normal py-0">已完成</Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-600 border-red-200 font-normal py-0">失败</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground tech-mono text-[10px]">{item.date}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "h-8 text-xs flex items-center gap-1",
                              item.status === 'completed' ? "text-primary hover:text-primary/80" : "text-muted-foreground/30 cursor-not-allowed"
                            )}
                            disabled={item.status !== 'completed'}
                            onClick={() => item.status === 'completed' && onViewResult(item.id)}
                          >
                            详情 <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
