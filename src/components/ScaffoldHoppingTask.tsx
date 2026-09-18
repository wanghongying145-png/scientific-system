import { useState } from "react";
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
  Beaker,
  FileText,
  ChevronRight,
  Database,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ScaffoldHoppingTask({ onBack, onSubmit, onViewResult }: { onBack: () => void; onSubmit: () => void; onViewResult: (taskId: string) => void }) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference'); 
  
  // Inference Form State
  const [taskName, setTaskName] = useState("SH-Task-" + new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  
  // Parameter Settings State preloaded with the basis inputs requested
  const [smiles, setSmiles] = useState("CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F");
  const [fragmentSmiles, setFragmentSmiles] = useState("*c1ccccc1");
  const [numGenerations, setNumGenerations] = useState("50");
  const [iterationSteps, setIterationSteps] = useState("200");
  const [qedFilter, setQedFilter] = useState("0.5");

  const historyData = [
    { id: "SH-20260419-001", name: "EGFR_Refinement", model: "骨架跃迁分子生成模型", startTime: "2026-04-19 14:20:01", endTime: "2026-04-19 14:25:32", status: "success" },
    { id: "SH-20260419-002", name: "BRAF_Hopping", model: "骨架跃迁分子生成模型", startTime: "2026-04-19 15:10:45", endTime: "2026-04-19 15:18:20", status: "success" },
    { id: "SH-20260419-003", name: "MET_Generation", model: "骨架跃迁分子生成模型", startTime: "2026-04-19 16:45:12", endTime: "2026-04-19 16:50:00", status: "failed" },
    { id: "SH-20260420-004", name: "ALK_Inhibitor_Upgrade", model: "骨架跃迁分子生成模型", startTime: "2026-04-20 09:30:00", endTime: "-", status: "executing" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] text-slate-800 font-sans">
      {/* Sleek Navigation Bar */}
      <div className="bg-white border-b border-slate-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="flex items-center gap-1.5 text-slate-650 hover:text-slate-950 font-medium text-xs h-8 px-2.5 rounded-lg border border-slate-100 hover:border-slate-250 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
            返回
          </Button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <span className="text-slate-400 text-xs font-mono">模型计算中心 / 骨架跃迁分子生成</span>
        </div>
      </div>
 
      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[900px] mx-auto pb-40 space-y-8">
          
          {/* 1. Model Header with Title & Description */}
          <div className="space-y-3.5 text-left bg-gradient-to-r from-white to-slate-50/40 p-6 rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">骨架跃迁分子生成</h1>
              <Badge className="bg-[#02A1C8]/10 text-[#02A1C8] border-none text-[10px] font-extrabold px-2 h-4.5 uppercase tracking-wide">
                Scaffold Hopping
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
              支持输入特定候选药物分子（作为参考），通过智能图神经网络及强化学习算法，自动搜寻、替换指定的骨架片段或大分子环。在保持分子原有生物活性及关键理化特性的基础上，快速生成具备全新核心骨架、极高类药性（QED）及新颖结构的分子，有效规避专利保护。
            </p>
          </div>

          {/* 2. Top-level Tab Switcher (页签转换器) */}
          <div className="flex items-center border-b border-slate-200/80">
            <button
              onClick={() => setActiveTab('inference')}
              className={cn(
                "px-5 py-3 text-xs font-bold transition-all relative flex items-center gap-2",
                activeTab === 'inference' 
                  ? "text-[#02A1C8]" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Beaker className="w-4 h-4" />
              推理预测
              {activeTab === 'inference' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#02A1C8] rounded-full animate-in fade-in duration-200" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-5 py-3 text-xs font-bold transition-all relative flex items-center gap-2",
                activeTab === 'history' 
                  ? "text-[#02A1C8]" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <History className="w-4 h-4" />
              历史任务
              <Badge variant="secondary" className="text-[9px] px-1.5 h-4.5 bg-slate-100 text-slate-500 border-none font-bold">
                {historyData.length}
              </Badge>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#02A1C8] rounded-full animate-in fade-in duration-200" />
              )}
            </button>
          </div>

          {/* Tab Specific Content Sections */}
          {activeTab === 'inference' ? (
            <div className="space-y-8 text-left animate-in fade-in slide-in-from-top-1 duration-300">
              
              {/* —— 输入 ———————————————————————————————————— */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#02A1C8]/10 text-[#02A1C8] text-[10px] font-black">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">输入</h3>
                  <div className="h-[1px] bg-slate-100 flex-1" />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-5">
                  
                  {/* Job/Task Name Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 block">任务作业名称</Label>
                      <Input 
                        value={taskName}
                        onChange={e => setTaskName(e.target.value)}
                        className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#02A1C8]/40"
                        placeholder="请输入本次预测的任务名称"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-705 block">任务描述（选填）</Label>
                      <Input 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#02A1C8]/40"
                        placeholder="记录您的生成思路或实验批次..."
                      />
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100" />

                  {/* Reference Molecule SMILES */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-705">参考分子 SMILES 序列</Label>
                      <span className="text-[10px] text-muted-foreground tech-mono">分子结构载入</span>
                    </div>
                    <Textarea 
                      value={smiles}
                      onChange={(e) => setSmiles(e.target.value)}
                      placeholder="例如: CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F"
                      className="min-h-[90px] font-mono text-xs text-slate-700 bg-slate-50/50 border-slate-200 focus-visible:ring-[#02A1C8]/40 focus:bg-white resize-none"
                    />
                  </div>
                  
                  {/* Quick Action Imports & Reference Skeletons */}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-[11px] font-medium text-[#02A1C8] bg-[#02A1C8]/5 hover:bg-[#02A1C8]/10 border-[#02A1C8]/20 px-3.5 h-8 transition-colors rounded-lg"
                    >
                      从 2D 分子编辑器内导入
                    </Button>
                  </div>

                  <div className="h-[1px] bg-slate-150/60" />

                  {/* Fragment Target Input */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-[#0F172A] block">
                      定义替换核心骨架 (用 * 标记分子的受阻连接点)
                    </Label>
                    <Input 
                      value={fragmentSmiles}
                      onChange={(e) => setFragmentSmiles(e.target.value)}
                      placeholder="输入骨架, 例如: *c1ccccc1"
                      className="h-10 font-mono text-xs text-slate-700 bg-slate-50/50 border-slate-200 focus-visible:ring-[#02A1C8]/40 focus:bg-white"
                    />
                    <div className="flex items-center gap-2 pt-0.5">
                      <p className="text-[10px] text-slate-400">说明：用星号 (*) 标记代表原子替换连接键。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* —— 第二部分：参数配置 ———————————————————————————————————— */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#02A1C8]/10 text-[#02A1C8] text-[10px] font-black">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">第二部分：参数配置</h3>
                  <div className="h-[1px] bg-slate-100 flex-1" />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
                  
                  {/* Generation Strategy parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Generative Capacity Target count */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 block">生成分子样本数量</Label>
                      <Select value={numGenerations} onValueChange={setNumGenerations}>
                        <SelectTrigger className="h-9.5 text-xs bg-slate-50/50 border-slate-200">
                          <SelectValue placeholder="配置数量" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="20">生成 20 个分子</SelectItem>
                          <SelectItem value="50">生成 50 个分子</SelectItem>
                          <SelectItem value="100">生成 100 个分子 (推荐)</SelectItem>
                          <SelectItem value="200">生成 200 个分子</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-400">输出满足多样性指标的预测总数</p>
                    </div>

                    {/* Iterative Optimization Steps counts */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 block">强化学习迭代步数</Label>
                      <Input 
                        type="number"
                        value={iterationSteps}
                        onChange={(e) => setIterationSteps(e.target.value)}
                        className="h-9.5 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#02A1C8]/40"
                        placeholder="200"
                      />
                      <p className="text-[10px] text-slate-400">步数越高探寻网络越深，推荐 200</p>
                    </div>

                    {/* Targeted QED Threshold filter */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 block">QED 类药性过滤阈值</Label>
                      <Select value={qedFilter} onValueChange={setQedFilter}>
                        <SelectTrigger className="h-9.5 text-xs bg-slate-50/50 border-slate-200 font-medium">
                          <SelectValue placeholder="选择过滤程度" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="0">不过滤 (展示所有结构)</SelectItem>
                          <SelectItem value="0.3">≥ 0.3 (较为平缓, 广度推荐)</SelectItem>
                          <SelectItem value="0.5">≥ 0.5 (适中过滤, 均衡考虑)</SelectItem>
                          <SelectItem value="0.7">≥ 0.7 (严格控制/高药用潜力)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-400">QED代表定量估计分子类药可信度</p>
                    </div>

                  </div>
                </div>
              </div>

              {/* Interactive Submit & ETA Panel */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-50/35 p-6 rounded-xl border border-slate-100">
                <Button 
                  onClick={onSubmit}
                  className={cn(
                    "h-11 px-12 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.01] active:scale-95 shadow-md flex items-center gap-2",
                    smiles ? "bg-[#02A1C8] hover:bg-[#028FAC] text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                  disabled={!smiles}
                >
                  <Send className="w-3.5 h-3.5" />
                  开始骨架跃迁
                </Button>
              </div>

            </div>
          ) : (
            /* ------------------ 历史任务 (History Tab) ------------------ */
            <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">历史生成任务列表</h2>
                  <p className="text-xs text-slate-400 mt-0.5">记录该预测模型发起过的所有骨架重构任务（支持即时结果轮询）</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input placeholder="检索特定批次任务..." className="w-48 sm:w-56 h-9 pl-9 text-[11px] tech-mono bg-white border-slate-200" />
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden bg-white rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="px-6 py-4">任务名称 & 背景说明</th>
                        <th className="px-6 py-4">计算算法</th>
                        <th className="px-6 py-4">系统任务 ID</th>
                        <th className="px-6 py-4">发起时间</th>
                        <th className="px-6 py-4">当前状态</th>
                        <th className="px-6 py-4 text-right">结果分析</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-650">
                      {historyData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 max-w-[180px] truncate">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{item.model}</td>
                          <td className="px-6 py-4 font-mono text-slate-405 text-[11px]">{item.id}</td>
                          <td className="px-6 py-4 text-[11px] text-slate-500">
                            <div>{item.startTime}</div>
                          </td>
                          <td className="px-6 py-4">
                            {item.status === 'success' && (
                              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-150/50 hover:bg-emerald-50 text-[10px] font-bold rounded-lg px-2 py-0.5">
                                计算成功
                              </Badge>
                            )}
                            {item.status === 'failed' && (
                              <Badge className="bg-rose-50 text-rose-600 border border-rose-150/50 hover:bg-rose-50 text-[10px] font-bold rounded-lg px-2 py-0.5">
                                任务失败
                              </Badge>
                            )}
                            {item.status === 'executing' && (
                              <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-150/50 hover:bg-indigo-50 text-[10px] font-bold rounded-lg animate-pulse px-2 py-0.5">
                                进行中
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              className={cn(
                                "text-[11px] font-bold hover:underline",
                                item.status === 'success' ? "text-[#02A1C8]" : "text-slate-350 cursor-not-allowed"
                              )}
                              disabled={item.status !== 'success'}
                              onClick={() => {
                                if (item.status === 'success') onViewResult(item.id);
                              }}
                            >
                              查看分析详情
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
