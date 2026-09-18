import { useState } from "react";
import { 
  ChevronLeft, 
  Download, 
  Search, 
  Filter, 
  DownloadCloud,
  FileBox,
  FileCheck,
  Activity,
  Database,
  ArrowUpDown,
  ExternalLink,
  Table as TableIcon,
  Layers,
  CheckCircle2,
  XCircle,
  FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DockingResult {
  id: string;
  name: string;
  score: number;
  rank: number;
  poses: number;
  passedFilter: boolean;
}

const MOCK_RESULTS: DockingResult[] = [
  { id: "MOL-001", name: "Quercetin_Derivative_A", score: -10.2, rank: 1, poses: 9, passedFilter: true },
  { id: "MOL-012", name: "Luteolin_Complex_7", score: -9.8, rank: 2, poses: 9, passedFilter: true },
  { id: "MOL-045", name: "Synthetic_Indole_3", score: -9.5, rank: 3, poses: 8, passedFilter: true },
  { id: "MOL-102", name: "Natural_Flavonoid_X1", score: -9.2, rank: 4, poses: 9, passedFilter: true },
  { id: "MOL-088", name: "Pyridine_Based_Block", score: -8.9, rank: 5, poses: 6, passedFilter: false },
  { id: "MOL-201", name: "Coumarin_Scaffold_C", score: -8.7, rank: 6, poses: 9, passedFilter: true },
  { id: "MOL-156", name: "Benzimidazole_Deriv", score: -8.5, rank: 7, poses: 7, passedFilter: true },
  { id: "MOL-033", name: "Thiazole_Intermediate", score: -8.4, rank: 8, poses: 9, passedFilter: false },
  { id: "MOL-290", name: "Piperazine_Linked_A1", score: -8.2, rank: 9, poses: 5, passedFilter: true },
  { id: "MOL-111", name: "Naphthyridine_Comp", score: -8.1, rank: 10, poses: 9, passedFilter: true },
];

export function VirtualScreeningResult({ onBack, taskId = "VS-001" }: { onBack: () => void; taskId?: string }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = MOCK_RESULTS.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      {/* Top Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F172A]">筛选结果详情: {taskId}</h1>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold">对接完成</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" />
              基于 AutoDock Vina 的受体-配体对接分析
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 tech-mono text-xs font-bold border-slate-200">
             <FileDown className="w-4 h-4 mr-2" />
             下载结构预览表
          </Button>
          <Button className="h-9 tech-mono text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white">
             <DownloadCloud className="w-4 h-4 mr-2" />
             导出全量结果 (ZIP)
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[1200px] mx-auto space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "对接分子总数", value: "24,501", icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "平均对接得分", value: "-7.45", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "通过性质过滤", value: "18,202", icon: FileCheck, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "最优对接能 (kcal/mol)", value: "-10.2", icon: ZapIcon, color: "text-rose-600", bg: "bg-rose-50" },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm ring-1 ring-black/[0.03]">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-lg font-black text-[#0F172A] tech-mono">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Result Table Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#0F172A] rounded-full" />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">对接结果排名表</h2>
               </div>
               <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      placeholder="搜索分子 ID 或名称..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-9 w-64 pl-9 text-xs tech-mono bg-white border-slate-200" 
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 border-slate-200 tech-mono text-[10px] font-bold">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    筛选
                  </Button>
               </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-black/[0.03] overflow-hidden">
               <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                    <TableRow className="tech-mono text-[10px] uppercase font-bold text-slate-500">
                      <TableHead className="w-[80px] pl-6 py-4">排名</TableHead>
                      <TableHead>分子 ID</TableHead>
                      <TableHead>分子名称</TableHead>
                      <TableHead className="cursor-pointer hover:bg-slate-100/50 transition-colors">
                        Docking Score (kcal/mol) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                      </TableHead>
                      <TableHead>Pose 数量</TableHead>
                      <TableHead>过滤状态</TableHead>
                      <TableHead className="text-right pr-6">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {filteredResults.map((result) => (
                      <TableRow key={result.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                        <TableCell className="pl-6 py-4">
                           <div className={cn(
                             "w-7 h-7 rounded-lg flex items-center justify-center font-black italic tech-mono text-xs",
                             result.rank === 1 ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200" : 
                             result.rank === 2 ? "bg-slate-100 text-slate-600 ring-1 ring-slate-200" :
                             result.rank === 3 ? "bg-orange-100 text-orange-700 ring-1 ring-orange-200" : "text-slate-400"
                           )}>
                             #{result.rank}
                           </div>
                        </TableCell>
                        <TableCell className="font-bold tech-mono text-[11px] text-[#0F172A]">{result.id}</TableCell>
                        <TableCell className="text-[11px] font-medium text-slate-600">{result.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 tech-mono font-black italic rounded px-2">
                             {result.score}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                             <Layers className="w-3 h-3" />
                             {result.poses}
                          </div>
                        </TableCell>
                        <TableCell>
                           {result.passedFilter ? (
                             <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                               <CheckCircle2 className="w-3.5 h-3.5" />
                               通过
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold">
                               <XCircle className="w-3.5 h-3.5" />
                               未通过
                             </div>
                           )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all rounded-lg" title="下载构象文件">
                                 <Download className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all rounded-lg" title="查看 3D 预览">
                                 <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
               </Table>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Summary Bar */}
      <div className="bg-white border-t px-8 py-4 flex items-center justify-between sticky bottom-0 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] backdrop-blur-md bg-white/90">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 tech-gradient-blue rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <FileBox className="w-5 h-5 text-white" />
            </div>
            <div>
               <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">筛选数据集成</p>
               <p className="text-[9px] text-slate-400 font-medium tracking-tight">包含全量 PDBQT 文件与对接打分 log，已完成 {MOCK_RESULTS.length} / 100 多维度评估</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <Button variant="outline" className="h-10 px-6 rounded-xl text-xs font-bold tech-mono border-slate-200">
               筛选重置
            </Button>
            <Button className="h-10 px-10 rounded-xl text-xs font-black tech-mono bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-xl shadow-slate-900/10 transition-all">
               <DownloadCloud className="w-4 h-4 mr-2" />
               并发导出构象 (ZIP)
            </Button>
         </div>
      </div>
    </div>
  );
}

function ZapIcon(props: any) {
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
      <path d="M4 14.71 11.29 4H12v8.59L17.29 8h.71l-7.29 12h-.71V11.41L4 16.71z" />
    </svg>
  )
}
