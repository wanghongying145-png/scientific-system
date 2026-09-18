import React, { useState } from "react";
import { 
  Search, 
  Download, 
  ChevronRight, 
  ChevronLeft, 
  Filter,
  ArrowRight,
  Database,
  Shield,
  User,
  Activity
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface PathogenSearchProps {
  onSelectPathogen: (p: any) => void;
}

export function PathogenSearch({ onSelectPathogen }: PathogenSearchProps) {
  const [activeType, setActiveType] = useState<string>("全部");
  
  const categories = [
    { name: "全部", count: 20847 },
    { name: "细菌", count: 10231 },
    { name: "病毒", count: 8614 },
    { name: "真菌", count: 1042 },
    { name: "寄生虫", count: 648 },
    { name: "支原体/衣原体", count: 158 },
    { name: "分枝杆菌", count: 154 },
  ];

  const sources = [
    { name: "NCBI", count: 14392 },
    { name: "FDA-ARGOS", count: 2614 },
    { name: "FungiDB", count: 3841 },
  ];

  const mockResults = [
    { name: "结核分枝杆菌", latin: "M. tuberculosis H37Rv", category: "分枝杆菌", bsl: "BSL-3", taxid: "1773", source: "NCBI · FDA-ARGOS" },
    { name: "麻风分枝杆菌", latin: "M. leprae", category: "分枝杆菌", bsl: "BSL-3", taxid: "1769", source: "NCBI" },
    { name: "牛分枝杆菌", latin: "M. bovis", category: "分枝杆菌", bsl: "BSL-3", taxid: "1765", source: "NCBI · FDA-ARGOS" },
    { name: "鸟分枝杆菌", latin: "M. avium complex", category: "分枝杆菌", bsl: "BSL-2", taxid: "1764", source: "NCBI" },
    { name: "堪萨斯分枝杆菌", latin: "M. kansasii", category: "分枝杆菌", bsl: "BSL-2", taxid: "1768", source: "NCBI" },
    { name: "脓肿分枝杆菌", latin: "M. abscessus", category: "分枝杆菌", bsl: "BSL-2", taxid: "120961", source: "NCBI · FDA-ARGOS" },
    { name: "龟分枝杆菌", latin: "M. chelonae", category: "分枝杆菌", bsl: "BSL-2", taxid: "1774", source: "NCBI" },
    { name: "耻垢分枝杆菌", latin: "M. smegmatis", category: "分枝杆菌", bsl: "BSL-1", taxid: "1772", source: "NCBI" },
    { name: "海分枝杆菌", latin: "M. marinum", category: "分枝杆菌", bsl: "BSL-2", taxid: "1770", source: "NCBI" },
    { name: "非洲分枝杆菌", latin: "M. africanum", category: "分枝杆菌", bsl: "BSL-3", taxid: "33894", source: "NCBI" },
  ];

  return (
    <div className="flex h-full bg-[#f8fafc]">
      {/* Left Filters */}
      <div className="w-64 border-r bg-white p-4 space-y-6 shrink-0 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">病原体类型</h3>
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${activeType === cat.name ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}
              onClick={() => setActiveType(cat.name)}
            >
              <div className="flex items-center gap-2">
                <Checkbox checked={activeType === cat.name} className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                <span className="text-sm">{cat.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{cat.count}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">数据来源</h3>
          {sources.map((src) => (
            <div key={src.name} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <Checkbox />
                <span className="text-sm">{src.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{src.count}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Search Bar */}
        <div className="p-6 bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="flex gap-4 max-w-5xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#00A19B]" />
              <Input 
                placeholder="Mycobacterium" 
                className="pl-10 h-10 border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#00A19B] focus:border-[#00A19B] rounded bg-white"
              />
            </div>
            <Button className="bg-[#00A19B] hover:bg-[#008c87] text-white h-10 px-8 rounded font-medium">搜索</Button>
            <Button variant="outline" className="h-10 border-[#E2E8F0] text-slate-600 hover:bg-slate-50 rounded">导出 CSV</Button>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            找到 <span className="font-bold text-slate-600">154</span> 条结果，当前显示第 1-10 条
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white border rounded-lg shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 pl-6">中文名</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">学名</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">分类</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">BSL</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TAXID</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">数据来源</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockResults.map((p, idx) => (
                  <TableRow key={idx} className="group hover:bg-slate-50 border-b last:border-0 transition-colors">
                    <TableCell className="py-4 pl-6 font-bold text-slate-700 text-sm">{p.name}</TableCell>
                    <TableCell className="italic text-slate-400 text-sm font-serif">{p.latin}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#FFF4ED] text-[#FF8540] border-[#FF8540]/20 text-[10px] font-bold rounded px-2 py-0.5">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold rounded px-2 py-0.5 border-transparent",
                        p.bsl === 'BSL-3' ? "bg-[#FFF4ED] text-[#FF8540]" :
                        p.bsl === 'BSL-2' ? "bg-[#EEF2FF] text-[#4F46E5]" :
                        "bg-[#ECFDF5] text-[#10B981]"
                      )}>
                        {p.bsl}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{p.taxid}</TableCell>
                    <TableCell className="text-xs text-slate-400 font-medium">{p.source}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] text-slate-400 hover:text-emerald-600 group-hover:bg-emerald-50 transition-all font-bold"
                        onClick={() => onSelectPathogen(p)}
                      >
                        详情 <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <Button variant="outline" size="icon" className="w-8 h-8 rounded border-slate-200">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="outline" size="sm" className="w-8 h-8 rounded border-slate-200 bg-emerald-600 text-white border-emerald-600">1</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 rounded border-slate-200 text-slate-500">2</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 rounded border-slate-200 text-slate-500">3</Button>
            <span className="px-2 self-center text-slate-400">...</span>
            <Button variant="outline" size="sm" className="w-8 h-8 rounded border-slate-200 text-slate-500">16</Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded border-slate-200">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
