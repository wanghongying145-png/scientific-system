import { useState, ReactNode } from "react";
import { 
  Upload, 
  Trash2, 
  FileIcon, 
  ChevronLeft, 
  Search, 
  RotateCcw, 
  Info, 
  Activity, 
  Send, 
  History,
  Dna,
  Settings2,
  ChevronRight,
  Database,
  Keyboard,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  ChevronLast,
  ChevronFirst
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

function HorizontalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-stretch border rounded h-10 overflow-hidden bg-white group focus-within:border-[#0F172A]/30 transition-colors">
      <div className="w-32 bg-[#F8FAFB] border-r flex items-center px-4 shrink-0">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex-1 flex items-center px-3 relative">
        {children}
      </div>
    </div>
  );
}

export function ProteinPredictionTask({ onBack, onSubmit, onViewResult }: { onBack: () => void; onSubmit: () => void; onViewResult: (taskId: string) => void }) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference');
  
  // Basic Info
  const [taskName, setTaskName] = useState("PP-Task-2026-04-17");
  const [taskDesc, setTaskDesc] = useState("");

  // Sequence Input
  const [sequence, setSequence] = useState("");
  const [fastaFile, setFastaFile] = useState<UploadedFile | null>(null);

  // Advanced Params
  const [modelPreset, setModelPreset] = useState("monomer");
  const [useRelax, setUseRelax] = useState(true);
  const [useTemplates, setUseTemplates] = useState(true);
  const [msaMode, setMsaMode] = useState("mmseqs2");

  const handleExampleFill = () => {
    setSequence("MAAHKGAEHHHKAAEHHEQAAKHHHAAAEHHEEAAKHHHAAAEHHEEAAKHHHAAAEHHEEAAKHHHAAAEHHEEAAKHHH");
    setTaskName("Spike_Protein_Variant_Test");
  };

  const uploadFasta = () => {
    setFastaFile({ id: "f1", name: "protein_seq.fasta", size: "12 KB", status: 'completed' });
  };

  // Sequence Validation Logic
  const getValidationStats = (seq: string) => {
    if (!seq.trim()) return null;
    
    // Parse FASTA: strip lines starting with > and join the rest
    const lines = seq.split('\n');
    const cleanSeq = lines
      .filter(line => !line.startsWith('>'))
      .join('')
      .replace(/\s/g, '')
      .toUpperCase();

    const length = cleanSeq.length;
    
    // Standard AA: A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y
    const standardAA = /^[ACDEFGHIKLMNPQRSTVWY]*$/;
    const isStandard = standardAA.test(cleanSeq);
    
    // Count X (Unknown)
    const xCount = (cleanSeq.match(/X/g) || []).length;
    
    // Check for other non-standard chars
    const invalidChars = cleanSeq.replace(/[ACDEFGHIKLMNPQRSTVWYX]/g, '');
    const hasInvalid = invalidChars.length > 0;

    return {
      length,
      isStandard: isStandard && !hasInvalid,
      type: "蛋白序列",
      xCount,
      invalidChars: [...new Set(invalidChars.split(''))].join(', ')
    };
  };

  const validation = getValidationStats(sequence);

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
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">蛋白质结构预测模型</h1>
              <p className="text-[11px] text-muted-foreground font-medium">基于改良 AlphaFold2 架构的高精度蛋白质三维结构预测</p>
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
        <div className={cn("p-8 max-w-[1200px] mx-auto space-y-8", activeTab === 'inference' ? "pb-32" : "pb-10")}>
          
          {activeTab === 'inference' ? (
            <>
              {/* Module 1: 任务基本信息 */}
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
                        placeholder="描述该预测任务的背景或目的"
                      />
                    </HorizontalField>
                  </CardContent>
                </Card>
              </div>

              {/* Module 2: 氨基酸序列录入 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white border rounded shadow-sm">
                      <Dna className="w-4 h-4 text-[#0F172A]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#0F172A]">氨基酸序列录入</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleExampleFill} 
                    className="h-7 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold"
                  >
                    示例序列
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                    <CardHeader className="pb-3 border-b bg-[#F8FAFB]/50">
                      <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-600">
                        <FileText className="w-3.5 h-3.5" />
                        文本输入 (FASTA Format)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <textarea 
                        value={sequence}
                        onChange={(e) => setSequence(e.target.value)}
                        className="w-full h-40 rounded-xl bg-[#F8FAFB] border-slate-100 p-4 text-xs tech-mono focus:ring-2 focus:ring-[#0F172A]/10 outline-none transition-all resize-none"
                        placeholder=">Sequence_Name&#10;MAAHKGAEHHHKAAEHHEQAAKHHH..."
                      />
                      
                      {validation && (
                        <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                             <span className="text-[10px] text-slate-500 font-bold">当前长度:</span>
                             <span className="text-[10px] font-black tech-mono text-[#0F172A]">{validation.length} aa</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className={cn("w-1.5 h-1.5 rounded-full", validation.isStandard ? "bg-emerald-500" : "bg-amber-500")} />
                             <span className="text-[10px] text-slate-500 font-bold">字符检查:</span>
                             <span className={cn("text-[10px] font-black", validation.isStandard ? "text-emerald-600" : "text-amber-600")}>
                               {validation.isStandard ? "通过" : "含非标氨基酸"}
                             </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                             <span className="text-[10px] text-slate-500 font-bold">序列类型:</span>
                             <span className="text-[10px] font-black text-indigo-600 tracking-tight">{validation.type}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-1">
                             <div className={cn("w-1.5 h-1.5 rounded-full", validation.xCount > 0 ? "bg-amber-500" : "bg-emerald-500")} />
                             <span className="text-[10px] text-slate-500 font-bold">风险提示:</span>
                             <span className={cn("text-[10px] font-black", validation.xCount > 0 ? "text-amber-600" : "text-emerald-600")}>
                               {validation.xCount > 0 ? `含 ${validation.xCount} 个未知氨基酸 X` : "无"}
                             </span>
                          </div>
                          {validation.invalidChars && (
                             <div className="col-span-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span className="text-[10px] text-slate-500 font-bold">非法字符:</span>
                                <span className="text-[10px] font-black text-rose-600 tech-mono">{validation.invalidChars}</span>
                             </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                    <CardHeader className="pb-3 border-b bg-[#F8FAFB]/50">
                      <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-600">
                        <Upload className="w-3.5 h-3.5" />
                        文件上传 (.fasta / .txt)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col justify-center min-h-[194px]">
                      {!fastaFile ? (
                        <div 
                          onClick={uploadFasta}
                          className="flex-1 border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                            <Upload className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-500">点击上传 FASTA 文件</p>
                        </div>
                      ) : (
                        <div className="p-5 bg-indigo-50/30 rounded-xl border border-indigo-100 flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded bg-white flex items-center justify-center shadow-sm">
                            <FileIcon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-[#0F172A] truncate">{fastaFile.name}</p>
                            <span className="text-[10px] text-muted-foreground tech-mono">{fastaFile.size}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setFastaFile(null)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Module 3: 高级配置参数 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-1.5 bg-white border rounded shadow-sm">
                    <Settings2 className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#0F172A]">高级配置参数</h2>
                </div>
                <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <Label className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">Model Preset</Label>
                          <RadioGroup value={modelPreset} onValueChange={setModelPreset} className="flex gap-6">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monomer" id="p-monomer" className="w-3.5 h-3.5" />
                                <Label htmlFor="p-monomer" className="text-xs font-medium cursor-pointer">单链 (Monomer)</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="multimer" id="p-multimer" className="w-3.5 h-3.5" />
                                <Label htmlFor="p-multimer" className="text-xs font-medium cursor-pointer">复合物 (Multimer)</Label>
                             </div>
                          </RadioGroup>
                       </div>

                       <div className="space-y-2">
                          <Label className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">MSA Mode</Label>
                          <Select value={msaMode} onValueChange={setMsaMode}>
                             <SelectTrigger className="h-9 text-xs">
                               <SelectValue placeholder="选择 MSA 模式" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="mmseqs2">MMseqs2 (速度优先)</SelectItem>
                               <SelectItem value="jackhmmer">Jackhmmer (精度优先)</SelectItem>
                               <SelectItem value="none">无 (Single Sequence)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="pt-4 border-t flex flex-wrap gap-12">
                       <div className="flex items-center space-x-3">
                          <Checkbox id="c-relax" checked={useRelax} onCheckedChange={(v) => setUseRelax(v as boolean)} className="w-4 h-4" />
                          <div className="grid gap-0.5">
                            <Label htmlFor="c-relax" className="text-xs font-bold leading-none cursor-pointer">AMBER Relaxation</Label>
                            <p className="text-[10px] text-muted-foreground">优化侧链空间构象，减少原子冲突</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-3">
                          <Checkbox id="c-templates" checked={useTemplates} onCheckedChange={(v) => setUseTemplates(v as boolean)} className="w-4 h-4" />
                          <div className="grid gap-0.5">
                            <Label htmlFor="c-templates" className="text-xs font-bold leading-none cursor-pointer">Use PDB Templates</Label>
                            <p className="text-[10px] text-muted-foreground">搜索 PDB 数据库中的同源模板</p>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">历史预测任务</h2>
                  <p className="text-xs text-muted-foreground mt-1">查看过往提交的蛋白质结构预测任务及其状态</p>
                </div>
                <div className="relative">
                   <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                   <Input placeholder="搜索任务名称或编号..." className="w-64 h-9 pl-8 text-xs bg-white" />
                </div>
              </div>

              <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8FAFB] border-b">
                      <tr className="tech-mono text-[10px] uppercase text-slate-500">
                        <th className="px-6 py-4 font-bold">任务 ID</th>
                        <th className="px-6 py-4 font-bold">任务名称</th>
                        <th className="px-6 py-4 font-bold">模型名称</th>
                        <th className="px-6 py-4 font-bold">开始时间</th>
                        <th className="px-6 py-4 font-bold">结束时间</th>
                        <th className="px-6 py-4 font-bold">状态</th>
                        <th className="px-6 py-4 font-bold text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { 
                          id: 'PP-001', 
                          model: '蛋白质结构预测模型', 
                          name: 'Spike_Protein_Variant_1', 
                          start: '2024-04-12 14:20:10', 
                          end: '2024-04-12 14:45:13', 
                          status: 'success' 
                        },
                        { 
                          id: 'PP-002', 
                          model: '蛋白质结构预测模型', 
                          name: 'Hydrolase_Mutant_Test', 
                          start: '2024-04-10 09:15:22', 
                          end: '2024-04-10 09:30:26', 
                          status: 'success' 
                        },
                        { 
                          id: 'PP-003', 
                          model: 'AlphaFold2_Base', 
                          name: 'Zinc_Finger_Domain', 
                          start: '2024-04-08 16:45:00', 
                          end: '2024-04-08 16:50:01', 
                          status: 'failed' 
                        },
                        { 
                          id: 'PP-004', 
                          model: '蛋白质结构预测模型', 
                          name: 'Unnamed_Task_20240417', 
                          start: '2024-04-17 10:00:00', 
                          end: '-', 
                          status: 'executing' 
                        }
                      ].map(item => (
                        <tr key={item.id} className="text-[11px] group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 tech-mono text-slate-500">{item.id}</td>
                          <td className="px-6 py-4 font-bold text-[#0F172A]">{item.name}</td>
                          <td className="px-6 py-4 text-slate-500">{item.model}</td>
                          <td className="px-6 py-4 text-slate-500 tech-mono">{item.start}</td>
                          <td className="px-6 py-4 text-slate-500 tech-mono">{item.end}</td>
                          <td className="px-6 py-4">
                            {item.status === 'success' ? (
                              <Badge className="bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] hover:bg-[#F0FDF4] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-[#16A34A]/10">
                                <CheckCircle2 className="w-3 h-3" />
                                执行成功
                              </Badge>
                            ) : item.status === 'failed' ? (
                              <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2] hover:bg-[#FEF2F2] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-[#DC2626]/10">
                                <XCircle className="w-3 h-3" />
                                任务失败
                              </Badge>
                            ) : (
                              <Badge className="bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE] hover:bg-[#EFF6FF] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-[#2563EB]/10">
                                <Clock className="w-3 h-3 animate-spin-slow" />
                                进行中
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              className={cn(
                                "text-[11px] font-bold flex items-center gap-1 ml-auto transition-colors",
                                item.status === 'success' ? "text-[#2563EB] hover:text-[#1D4ED8]" : "text-slate-300 cursor-not-allowed"
                              )}
                              disabled={item.status !== 'success'}
                              onClick={() => {
                                if (item.status === 'success') onViewResult(item.id);
                              }}
                            >
                              查看详情 <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pagination */}
              <div className="flex items-center justify-end gap-1 mt-6 pb-10">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <ChevronFirst className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  <button className="w-8 h-8 rounded bg-[#0F172A] text-white text-xs font-bold tech-mono">1</button>
                  <button className="w-8 h-8 rounded hover:bg-slate-200 text-xs text-slate-600 font-bold tech-mono">2</button>
                  <button className="w-8 h-8 rounded hover:bg-slate-200 text-xs text-slate-600 font-bold tech-mono">3</button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <ChevronLast className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Submission Bar */}
      {activeTab === 'inference' && (
        <div className="bottom-0 left-0 right-0 p-4 border-t bg-white flex items-center justify-between px-12 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-[9px] text-muted-foreground font-bold tech-mono uppercase">
                <Database className="w-3 h-3 text-indigo-500" />
                Linked to AlphaFold2 Database v2.3
             </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => { setSequence(""); setFastaFile(null); }}
              className="h-10 px-8 rounded-full text-xs font-bold tech-mono text-muted-foreground hover:bg-slate-50 border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              清空重置
            </Button>
            <Button 
              onClick={onSubmit}
              className={cn(
                "h-10 px-12 rounded-full text-xs font-bold tech-mono transition-all hover:scale-105 active:scale-95 shadow-lg",
                (sequence.trim() !== "" || fastaFile) 
                  ? "bg-[#0F172A] hover:bg-[#0F172A]/90 text-white" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none"
              )}
              disabled={!(sequence.trim() !== "" || fastaFile)}
            >
              <Send className="w-3.5 h-3.5 mr-2" />
              提交任务
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
