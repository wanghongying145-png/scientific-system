import { useState } from "react";
import { 
  ChevronLeft, 
  Download, 
  RotateCcw, 
  Plus, 
  Info, 
  Search, 
  Filter, 
  ExternalLink, 
  Sidebar as SidebarIcon,
  X,
  Activity,
  Beaker,
  Database,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface TargetResult {
  rank: number;
  name: string;
  symbol: string;
  family: string;
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string[];
  uniprot: string;
  description: string;
}

const MOCK_RESULTS: TargetResult[] = [
  { rank: 1, name: "Epidermal growth factor receptor", symbol: "EGFR", family: "Kinase", score: 0.942, confidence: 'High', evidence: ["Structure", "Binding"], uniprot: "P00533", description: "The protein encoded by this gene is a transmembrane glycoprotein that is a member of the protein kinase superfamily. This protein is a receptor for members of the epidermal growth factor family." },
  { rank: 2, name: "Cyclin-dependent kinase 2", symbol: "CDK2", family: "Kinase", score: 0.885, confidence: 'High', evidence: ["Docking"], uniprot: "P24941", description: "Involved in the control of the cell cycle; specifically transcription and DNA replication. Essential for meiosis." },
  { rank: 3, name: "Vascular endothelial growth factor receptor 2", symbol: "VEGFR2", family: "Kinase", score: 0.756, confidence: 'Medium', evidence: ["NLP", "Omics"], uniprot: "P35968", description: "Tyrosine-protein kinase that acts as a cell-surface receptor for VEGFA, VEGFC and VEGFD." },
  { rank: 4, name: "B-Raf proto-oncogene", symbol: "BRAF", family: "Kinase", score: 0.621, confidence: 'Medium', evidence: ["Literature"], uniprot: "P15056", description: "Involved in the transduction of mitogenic signals from the cell membrane to the nucleus." },
  { rank: 5, name: "Mitogen-activated protein kinase 1", symbol: "MAPK1", family: "Kinase", score: 0.442, confidence: 'Low', evidence: ["Prediction"], uniprot: "P28482", description: "Acts as a target for several anticancer drugs." },
];

export function PotentialTargetPredictionResult({ onBack, taskId }: { onBack: () => void; taskId: string }) {
  const [selectedTarget, setSelectedTarget] = useState<TargetResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = MOCK_RESULTS.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      {/* Top Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F172A]">任务详情: {taskId}</h1>
              <Badge variant="outline" className="bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] text-[10px] py-0 px-2 font-bold">已完成</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">靶点发现模型推理分析报告</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-9 px-4 text-xs font-bold tech-mono border-slate-200 hover:bg-slate-50">
            <Download className="w-3.5 h-3.5 mr-2" />
            导出结果
          </Button>
          <Button className="h-9 px-4 text-xs font-bold tech-mono bg-[#0F172A] hover:bg-[#0F172A]/90">
             <RotateCcw className="w-3.5 h-3.5 mr-2" />
             重新发起
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
          
          {/* Module 1: Top Overview Section - Refactored to text-list style */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/[0.03] p-10 space-y-10">
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-3">
                一、基础信息
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 px-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">推理任务名称:</span>
                    <span className="text-[#0F172A] font-medium font-sans">针对阿司匹林衍生物的靶点预测</span>
                  </div>
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">上传时间:</span>
                    <span className="text-[#0F172A] font-medium tech-mono uppercase">2026年04月12日 14:20:10</span>
                  </div>
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">上传类型:</span>
                    <span className="text-[#0F172A] font-medium">SMILES 输入</span>
                  </div>
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">模型名称:</span>
                    <span className="text-[#0F172A] font-medium">靶点发现模型 (GraphDTA)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">靶标库名称:</span>
                    <span className="text-[#0F172A] font-medium">标准靶标库 (全库)</span>
                  </div>
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">预测任务状态:</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      COMPLETED SUCCESS
                    </span>
                  </div>
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">预测消耗时长:</span>
                    <span className="text-[#0F172A] font-medium tech-mono">2m 14s</span>
                  </div>
                  <div className="flex items-start gap-4 text-sm">
                    <span className="text-slate-500 w-32 shrink-0">输入分子 SMILES:</span>
                    <span className="text-[#0F172A] font-medium tech-mono truncate max-w-[300px]" title="CC1=C(C(=O)N(C1=O)C)C2=CC=C(C=C2)C(=O)NC3=CC=C(C=C3)S(=O)(=O)N">
                      CC1=C(C(=O)N(C1=O)C)C2=CC=C(C=C2)...
                    </span>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="space-y-6 pt-4 border-t border-slate-50">
               <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-3">
                二、分子结构预览
              </h2>
              <div className="flex items-center gap-10 px-2">
                <div className="w-48 h-48 bg-[#F8FAFB] rounded-2xl border border-slate-100 flex items-center justify-center p-6 relative group overflow-hidden shadow-inner">
                  <img 
                    src="https://picsum.photos/seed/chemistry-mol-result/300/300" 
                    alt="Molecule structure" 
                    className="w-full h-full object-contain opacity-60 group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold text-center translate-y-full group-hover:translate-y-0 transition-transform">
                    2D CONFORMATION
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 flex-1">
                   <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">分子量 (MW)</span>
                      <p className="text-sm font-bold tech-mono">450.45 g/mol</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">LogP</span>
                      <p className="text-sm font-bold tech-mono">3.24</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">原子数</span>
                      <p className="text-sm font-bold tech-mono">34</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">可旋转键数</span>
                      <p className="text-sm font-bold tech-mono">6</p>
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* Module 2: Middle Result Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white border rounded shadow-sm">
                    <Database className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#0F172A]">靶标预测结果列表</h2>
               </div>
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="搜索蛋白名称或 Symbol..." 
                      className="w-64 h-9 pl-8 text-xs bg-white" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-slate-200">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    筛选
                  </Button>
               </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white ring-1 ring-black/[0.03]">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-[#F8FAFB] border-b">
                     <tr className="tech-mono text-[10px] uppercase text-slate-500 font-bold">
                       <th className="px-6 py-4">Rank</th>
                       <th className="px-6 py-4">Target Name</th>
                       <th className="px-6 py-4">Gene Symbol</th>
                       <th className="px-6 py-4">Family</th>
                       <th className="px-6 py-4 w-64">Score (Predicted Affinity)</th>
                       <th className="px-6 py-4">Confidence</th>
                       <th className="px-6 py-4">Evidence</th>
                       <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {filteredResults.map((item) => (
                       <tr 
                          key={item.rank} 
                          className="text-[11px] group hover:bg-slate-50/50 transition-all cursor-pointer"
                          onClick={() => setSelectedTarget(item)}
                       >
                         <td className="px-6 py-4 font-bold text-slate-400 tech-mono">#{item.rank}</td>
                         <td className="px-6 py-4">
                            <span className="font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors uppercase pr-2 tracking-tight line-clamp-1">{item.name}</span>
                         </td>
                         <td className="px-6 py-4 font-bold text-[#0F172A] tech-mono">{item.symbol}</td>
                         <td className="px-6 py-4 text-slate-500 uppercase">{item.family}</td>
                         <td className="px-6 py-4">
                            <div className="space-y-1.5 min-w-[140px]">
                               <div className="flex items-center justify-between text-[10px] tech-mono font-bold">
                                  <span>Affinity:</span>
                                  <span className="text-indigo-600 font-black">{item.score.toFixed(3)}</span>
                               </div>
                               <Progress value={item.score * 100} className="h-1 bg-slate-100 border-none" />
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <Badge className={cn(
                              "text-[9px] font-bold py-0.5 px-2 rounded-md uppercase border-none ring-1",
                              item.confidence === 'High' ? "bg-emerald-50 text-emerald-600 ring-emerald-100" :
                              item.confidence === 'Medium' ? "bg-amber-50 text-amber-600 ring-amber-100" :
                              "bg-slate-50 text-slate-500 ring-slate-100"
                            )}>
                              {item.confidence}
                            </Badge>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-wrap gap-1">
                             {item.evidence.map(ev => (
                               <span key={ev} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">{ev}</span>
                             ))}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            >
                              详情 <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               {filteredResults.length === 0 && (
                 <div className="p-20 text-center space-y-3">
                    <Search className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">未找到匹配的靶标结果</p>
                 </div>
               )}
            </Card>
          </div>

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between pt-6 border-t pb-10">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold text-muted-foreground hover:bg-slate-100 tech-mono">
                <Download className="w-3.5 h-3.5 mr-2" />
                下载分析报告 (PDF)
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 px-6 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-600">
                <Plus className="w-3.5 h-3.5 mr-2" />
                加入候选清单
              </Button>
              <Button 
                onClick={onBack}
                className="h-10 px-8 rounded-xl text-xs font-bold tech-mono transition-all hover:scale-105 active:scale-95 shadow-lg bg-[#0F172A] hover:bg-[#0F172A]/90 text-white"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-2" />
                返回记录
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Detail Drawer (Module 3) */}
      <Sheet open={!!selectedTarget} onOpenChange={() => setSelectedTarget(null)}>
        <SheetContent className="sm:max-w-xl p-0 border-l shadow-2xl overflow-hidden flex flex-col">
          {selectedTarget && (
            <>
              <div className="bg-[#0F172A] p-6 text-white relative">
                 <div className="absolute top-0 right-0 p-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTarget(null)} className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                       <X className="w-5 h-5" />
                    </Button>
                 </div>
                 <div className="space-y-1">
                    <Badge className="bg-white/10 text-white/80 border-none text-[9px] mb-2 font-bold uppercase tracking-widest">{selectedTarget.family}</Badge>
                    <SheetTitle className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
                      {selectedTarget.name}
                    </SheetTitle>
                    <div className="flex items-center gap-3 mt-4">
                       <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold tech-mono">Symbol: {selectedTarget.symbol}</div>
                       <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold tech-mono">UniProt: {selectedTarget.uniprot}</div>
                    </div>
                 </div>
              </div>
              
              <ScrollArea className="flex-1">
                 <div className="p-8 space-y-10">
                    <section className="space-y-4">
                       <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-widest border-l-4 border-indigo-500 pl-3">蛋白功能简介</h3>
                       <p className="text-xs text-slate-600 leading-relaxed font-medium">
                         {selectedTarget.description}
                       </p>
                    </section>

                    <section className="space-y-6">
                       <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-widest border-l-4 border-indigo-500 pl-3">预测评分详情</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <Card className="border-none shadow-sm ring-1 ring-black/[0.03] bg-slate-50/50 p-4">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Affinity Score</span>
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                             </div>
                             <p className="text-2xl font-black tech-mono text-indigo-600">{selectedTarget.score.toFixed(4)}</p>
                             <div className="mt-2 text-[9px] text-slate-400 font-medium">结合亲和力预测值，范围 0-1</div>
                          </Card>
                          <Card className="border-none shadow-sm ring-1 ring-black/[0.03] bg-slate-50/50 p-4">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Confidence</span>
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                             </div>
                             <p className={cn(
                               "text-xl font-black tech-mono uppercase",
                               selectedTarget.confidence === 'High' ? "text-emerald-600" : "text-amber-600"
                             )}>{selectedTarget.confidence}</p>
                             <div className="mt-2 text-[9px] text-slate-400 font-medium">基于模型分布与特征覆盖度计算</div>
                          </Card>
                       </div>
                    </section>

                    <section className="space-y-4">
                       <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-widest border-l-4 border-indigo-500 pl-3">模型分析说明</h3>
                       <Card className="border-none shadow-sm ring-1 ring-black/[0.01] bg-[#F8FAFB] p-5 space-y-4">
                          <div className="flex items-start gap-4">
                             <div className="p-2 bg-white rounded-lg shadow-sm">
                               <Beaker className="w-4 h-4 text-slate-600" />
                             </div>
                             <div className="flex-1 space-y-1">
                                <span className="text-[10px] font-bold text-slate-900 uppercase">Input Matching</span>
                                <p className="text-[10px] text-slate-500 leading-normal">输入分子结构与该靶标的已知配体在药效团构象上具有高度相似性 (Sim = 0.82)。</p>
                             </div>
                          </div>
                          <div className="flex items-start gap-4">
                             <div className="p-2 bg-white rounded-lg shadow-sm">
                               <AlertTriangle className="w-4 h-4 text-amber-500" />
                             </div>
                             <div className="flex-1 space-y-1">
                                <span className="text-[10px] font-bold text-slate-900 uppercase">Risk Assessment</span>
                                <p className="text-[10px] text-slate-500 leading-normal">该靶标为广泛表达的激酶，需关注脱靶可能带来的细胞毒性风险。建议进行 Kinase Panel 验证。</p>
                             </div>
                          </div>
                       </Card>
                    </section>
                    
                    <div className="pt-6">
                      <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 group">
                        <span>查看 UniProt 外部链接</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
                 </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
