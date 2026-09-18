import { useState } from "react";
import { 
  Upload, 
  Trash2, 
  ChevronLeft, 
  Search, 
  RotateCcw, 
  Activity, 
  History,
  Beaker,
  SlidersHorizontal,
  Target,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Filter,
  FileText,
  Plus,
  Info,
  HelpCircle,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function RetrosynthesisTask({ onBack, onSubmit, onViewResult }: { onBack: () => void; onSubmit: () => void; onViewResult: (taskId: string) => void }) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference'); 
  
  // Basic Info State
  const [taskName, setTaskName] = useState("合成路线规划任务一");
  
  // Input State
  const [smiles, setSmiles] = useState("CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F");
  const [showEditorAlert, setShowEditorAlert] = useState(false);

  // Parameters Configuration States matching required outline
  const [maxSearchSteps, setMaxSearchSteps] = useState<"100" | "200" | "500">("200");
  const [maxReactionSteps, setMaxReactionSteps] = useState<number>(6); // range 3 - 10
  const [returnedCount, setReturnedCount] = useState<"3" | "5" | "10">("5");
  const [searchTimeLimit, setSearchTimeLimit] = useState<number>(180); // seconds

  const historyData = [
    { id: "RS-20260420-001", name: "EGFR_Inhibitor_Plan", model: "合成路线规划", startTime: "2026-04-20 10:30:00", endTime: "2026-04-20 11:15:00", status: "success" },
    { id: "RS-20260421-002", name: "ALDH2_Synthetic_Route", model: "合成路线规划", startTime: "2026-04-21 09:00:00", endTime: "2026-04-21 09:45:00", status: "success" },
    { id: "RS-20260421-003", name: "PDL1_Synthesis_Analysis", model: "合成路线规划", startTime: "2026-04-21 13:20:00", endTime: "-", status: "executing" },
  ];

  const handleReset = () => {
    setTaskName("合成路线规划任务一");
    setSmiles("CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F");
    setMaxSearchSteps("200");
    setMaxReactionSteps(6);
    setReturnedCount("5");
    setSearchTimeLimit(180);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] text-slate-800 font-sans">
      {/* Header Area in design style matching Scaffold Hopping */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
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
          <span className="text-slate-400 text-xs font-mono">模型计算中心 / 合成路线规划 (Retrosynthesis)</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[950px] mx-auto pb-40 space-y-8">
          
          {/* 1. Model Description Header Banner */}
          <div className="space-y-3 text-left bg-gradient-to-r from-white to-slate-50/40 p-6 rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">合成路线规划</h1>
              <Badge className="bg-indigo-50 text-indigo-600 border-none text-[10px] font-extrabold px-2 h-4.5 uppercase tracking-wide">
                Retrosynthesis AI
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
              针对特定靶点或高活性自设计分子，使用蒙特卡洛树搜索（MCTS）匹配深度神经网络及经典规则反应库，一键进行可拆解、逆向合成路线图解规划。辅助化学家对合成难度、原料价格、步骤产率进行多维度预测评分。
            </p>
          </div>

          {/* 2. Top-level Tabs (推理 / 历史任务) */}
          <div className="flex items-center border-b border-slate-200/80">
            <button
              onClick={() => setActiveTab('inference')}
              className={cn(
                "px-5 py-3 text-xs font-bold transition-all relative flex items-center gap-2",
                activeTab === 'inference' 
                  ? "text-indigo-600" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Activity className="w-4 h-4" />
              推理预测
              {activeTab === 'inference' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-in fade-in duration-200" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-5 py-3 text-xs font-bold transition-all relative flex items-center gap-2",
                activeTab === 'history' 
                  ? "text-indigo-600" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <History className="w-4 h-4" />
              历史任务
              <Badge variant="secondary" className="text-[10px] px-1.5 h-4 bg-slate-100 text-slate-500 border-none font-bold">
                {historyData.length}
              </Badge>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-in fade-in duration-200" />
              )}
            </button>
          </div>

          {activeTab === 'inference' ? (
            <div className="space-y-8 text-left animate-in fade-in slide-in-from-top-1 duration-300">
              
              {/* Job Global Options Card Info */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-3">
                <Label className="text-xs font-bold text-slate-700 block">常规配置 (Global Info)</Label>
                <div className="max-w-md space-y-1.5 text-left">
                  <span className="text-[11px] text-slate-400 font-medium">任务作业名称</span>
                  <Input 
                    value={taskName} 
                    onChange={(e) => setTaskName(e.target.value)}
                    className="h-9.5 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/40"
                    placeholder="请输入任务名称"
                  />
                </div>
              </div>

              {/* —— 第一部分：输入 (Outline: 输入 -> 目标分子 -> 文本输入(SMILES) / 分子编辑器编辑) —— */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">输入 (Input)</h3>
                  <div className="h-[1px] bg-slate-100 flex-1" />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700">目标分子 SMILES 序列 (Target Molecule)</Label>
                      <Badge variant="outline" className="text-[9px] text-indigo-500 border-indigo-200 bg-indigo-50/50">
                        文本输入 / SMILES 序列
                      </Badge>
                    </div>

                    <Textarea 
                      value={smiles}
                      onChange={(e) => setSmiles(e.target.value)}
                      placeholder="例如: CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F"
                      className="min-h-[90px] font-mono text-xs text-slate-700 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-600/40 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Molecular Editor Action */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-50 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowEditorAlert(true);
                          setTimeout(() => setShowEditorAlert(false), 3000);
                        }}
                        className="text-[11px] font-bold text-indigo-600 bg-indigo-50/40 border-indigo-200/50 hover:bg-indigo-50 hover:border-indigo-300 h-8 transition-colors rounded-lg flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        分子编辑器进行编辑
                      </Button>
                      
                      {showEditorAlert && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded animate-in fade-in duration-200">
                          ✓ 已成功初始化2D画布，支持结构实时提取写入
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto">
                      <span className="text-slate-400 whitespace-nowrap">推荐示例：</span>
                      {[
                        { name: "阿司匹林", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
                        { name: "莫西沙星", smiles: "COC1=C(C2=C(C(=O)C(=CN2C3CC3)C(=O)O)C=C1)N4CC5CC5C4" },
                        { name: "拉米夫定", smiles: "CC(=O)OCC1COCC(O1)N2C=CC(=O)NC2=O" }
                      ].map(ex => (
                        <button 
                          type="button"
                          key={ex.name}
                          onClick={() => setSmiles(ex.smiles)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] border transition-all whitespace-nowrap",
                            smiles === ex.smiles 
                              ? "bg-slate-900 border-slate-900 text-white font-bold" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-105"
                          )}
                        >
                          {ex.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* —— 第二部分：参数配置 —— */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">参数配置 (Parameters Configuration)</h3>
                  <div className="h-[1px] bg-slate-100 flex-1" />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
                  
                  {/* 最大搜索步数（迭代步数）- Fast / Standard / Deep Cards selection */}
                  <div className="space-y-2.5 text-left">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs font-bold text-slate-900">
                        最大搜索步数 (迭代步数)
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: "100", label: "快速 (Fast)", steps: "100步", duration: "约 10 秒", desc: "适合结构简单、易解析的小分子", color: "border-teal-200 hover:border-teal-400 bg-teal-50/10" },
                        { key: "200", label: "标准 (Standard)", steps: "200步", duration: "约 30 秒", desc: "推荐策略，覆盖及满足大多数常规场景", color: "border-indigo-200 hover:border-indigo-400 bg-indigo-50/10" },
                        { key: "500", label: "深度 (Deep Search)", steps: "500步", duration: "约 2 分钟", desc: "极高覆盖，适合结构高度复杂的天然药物分子", color: "border-amber-200 hover:border-amber-400 bg-amber-50/10" }
                      ].map(opt => (
                        <div 
                          key={opt.key}
                          onClick={() => setMaxSearchSteps(opt.key as any)}
                          className={cn(
                            "p-3.5 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between text-left",
                            maxSearchSteps === opt.key 
                              ? "border-indigo-600 ring-2 ring-indigo-50 bg-[#F5F3FF]" 
                              : "border-slate-200 bg-white hover:bg-slate-50/60"
                          )}
                        >
                          <div className="space-y-1">
                            <span className={cn(
                              "text-[11px] font-bold block",
                              maxSearchSteps === opt.key ? "text-indigo-600" : "text-slate-700"
                            )}>
                              {opt.label}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 font-mono text-[9.5px]">
                            <span className="text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                              {opt.steps}
                            </span>
                            <span className="text-indigo-600 font-semibold">
                              {opt.duration}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100" />

                  {/* 最大反应步骤数 (3-10 range) with inline descriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 text-left">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-800 block">最大反应步骤数</Label>
                        <div className="flex items-center gap-3">
                          <Select 
                            value={maxReactionSteps.toString()} 
                            onValueChange={(val) => setMaxReactionSteps(parseInt(val))}
                          >
                            <SelectTrigger className="h-10 text-xs bg-slate-50/50 border-slate-200">
                              <SelectValue placeholder="选择反应步数" />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                              {[3, 4, 5, 6, 7, 8, 9, 10].map(step => (
                                <SelectItem key={step} value={step.toString()}>
                                  最多允许 {step} 步反应 (范围为 3——10 之类)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-slate-400 bg-slate-50 px-2 py-2 rounded border border-slate-100 whitespace-nowrap font-mono">
                            允许范围: 3 - 10
                          </span>
                        </div>
                      </div>

                      {/* Explicit interactive guide description about reaction steps mapping image exactly */}
                      <div className="bg-slate-50/85 p-3.5 rounded-xl border border-slate-150 text-[11px] text-slate-550 leading-relaxed space-y-1.5">
                        <div className="font-bold text-slate-700 flex items-center gap-1 text-[11.5px]">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          参数说明：
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-500">
                          <li><span className="font-bold text-slate-700">步骤越少：</span>合成路线越短越简洁，但对于高复杂度药物可能无法拆出合理可行路线。</li>
                          <li><span className="font-bold text-slate-700">步骤越多：</span>允许拆解更复杂的分子结构，匹配远端大分子，但生成路线可能较为冗长。</li>
                        </ul>
                      </div>
                    </div>

                    {/* Returning Route Path count & Search Time limit */}
                    <div className="space-y-4 text-left">
                      
                      {/* 返回路线数量 (Options: 3条 / 5条 / 10条) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-800 block">返回合成路线数量</Label>
                        <Select value={returnedCount} onValueChange={(val: any) => setReturnedCount(val)}>
                          <SelectTrigger className="h-10 text-xs bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="返回数量" />
                          </SelectTrigger>
                          <SelectContent className="text-xs">
                            <SelectItem value="3">3 条 (快速对比)</SelectItem>
                            <SelectItem value="5">5 条 (默认推荐 - 广度均衡)</SelectItem>
                            <SelectItem value="10">10 条 (详细研究 - 深度搜集)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 搜索时间限制 */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-800 block">搜索时间限制 (秒)</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="number"
                            value={searchTimeLimit}
                            onChange={(e) => setSearchTimeLimit(parseInt(e.target.value) || 180)}
                            className="h-10 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-650"
                            placeholder="默认180"
                          />
                          <span className="h-10 px-3 bg-slate-50 text-[11px] text-slate-400 border border-slate-200 rounded-md flex items-center justify-center font-bold whitespace-nowrap">
                            secs
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">控制算法在蒙特卡洛树检索时的最大超时等待时间 (推荐100-300秒)</p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            /* 3. 历史任务 (History tab content styled matching Scaffold Hopping) */
            <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">历史合成路线规划列表</h2>
                  <p className="text-xs text-slate-400 mt-0.5">记录您账户下生成的的所有逆向合成模型预测路线与解离路径</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input placeholder="检索历史规划任务..." className="w-48 sm:w-56 h-9 pl-9 text-[11px] tech-mono bg-white border-slate-200" />
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden bg-white rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400">
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">规划任务名称</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">算法引擎</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">系统任务 ID</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">时间</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">状态</th>
                        <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-650">
                      {historyData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 max-w-[185px] truncate">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 font-mono text-[11.5px] text-slate-550">{item.model}</td>
                          <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">{item.id}</td>
                          <td className="px-6 py-4 text-[11px] text-slate-500">
                            <div>{item.startTime}</div>
                          </td>
                          <td className="px-6 py-4">
                            {item.status === 'success' && (
                              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-150 hover:bg-emerald-50 text-[10px] font-bold rounded-lg px-2 py-0.5">
                                计算完成
                              </Badge>
                            )}
                            {item.status === 'executing' && (
                              <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-150 hover:bg-indigo-50 text-[10px] font-bold rounded-lg animate-pulse px-2 py-0.5">
                                拆解中...
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              className={cn(
                                "text-[11px] font-bold hover:underline",
                                item.status === 'success' ? "text-indigo-600" : "text-slate-350 cursor-not-allowed"
                              )}
                              disabled={item.status !== 'success'}
                              onClick={() => {
                                if (item.status === 'success') onViewResult(item.id);
                              }}
                            >
                              查看规划路线树
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

      {/* Footer Submission Bar - Inference only */}
      {activeTab === 'inference' && (
        <div className="bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-between sticky bottom-0 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-sans bg-slate-50 py-1.5 px-3.5 rounded-lg border border-slate-100">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>算法预计运行耗时：单分子约 30 秒</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="h-10 px-5 rounded-xl text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              清空重置
            </Button>
            <Button 
              onClick={onSubmit}
              className={cn(
                "h-10 px-10 rounded-xl text-xs font-bold text-white transition-all transform hover:scale-[1.01] active:scale-95 shadow-md",
                smiles ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
              disabled={!smiles}
            >
              开始合成逆向路线分析
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
