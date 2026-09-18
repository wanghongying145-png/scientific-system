import React, { useState } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  Trash2, 
  Plus, 
  Box, 
  PlayCircle, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2,
  Filter,
  Check,
  ExternalLink,
  Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ToolItem {
  id: string;
  name: string;
  version: string;
  description: string;
  imageAddress: string;
  lastUsed: string;
  status: "enabled" | "disabled";
  tags?: string[];
  iconType?: "gear" | "box";
}

const TOOLS: ToolItem[] = [
  {
    id: "taxonomy-annotation",
    name: "TAXONOMY_ANNOTATION",
    version: "0.1.0",
    description: "该工具基于 SINTAX 数据库对代表序列进行物种注释，并输出注释结果与数据库信息。",
    imageAddress: "builtin",
    lastUsed: "2026/8/17",
    status: "enabled",
    tags: ["16S", "taxonomy", "sintax", "vsearch"],
    iconType: "gear",
  },
  {
    id: "qc-preprocess",
    name: "QC_PREPROCESS",
    version: "v1.0",
    description: "该工具对测序数据进行质控分析，接头/引物去除，生成clean_reads和基础的质控报告",
    imageAddress: "registry.cn-hangzhou.aliyuncs.com/bio-tools/qc_preprocess:v1.0",
    lastUsed: "2024-05-06 10:00",
    status: "enabled",
  },
  {
    id: "1",
    name: "QIIME2",
    version: "v2023.9",
    description: "当前主流16S分析框架，插件化设计",
    imageAddress: "quay.io/qiime2/core:2023.9",
    lastUsed: "2024-03-18 10:20",
    status: "enabled",
  },
  {
    id: "2",
    name: "DADA2",
    version: "v1.26",
    description: "基于错误模型去噪，替代OTU",
    imageAddress: "bioconductor/dada2:1.26.0",
    lastUsed: "2024-03-19 16:45",
    status: "enabled",
  },
  {
    id: "3",
    name: "Cutadapt",
    version: "v4.4",
    description: "高精度 adapter 去除",
    imageAddress: "k8s.gcr.io/cutadapt:4.4",
    lastUsed: "2024-03-20 09:00",
    status: "enabled",
  },
  {
    id: "4",
    name: "Trimmomatic",
    version: "v0.39",
    description: "常用 reads 质控工具",
    imageAddress: "quay.io/biocontainers/trimmomatic:0.39--hdfd78af_2",
    lastUsed: "2024-03-21 11:30",
    status: "enabled",
  },
  {
    id: "5",
    name: "FastQC",
    version: "v0.12",
    description: "生成 QC 报告",
    imageAddress: "quay.io/biocontainers/fastqc:0.12.1--hdfd78af_0",
    lastUsed: "2024-03-21 14:10",
    status: "enabled",
  },
  {
    id: "6",
    name: "MultiQC",
    version: "v1.14",
    description: "汇总 FastQC 结果",
    imageAddress: "ewels/multiqc:v1.14",
    lastUsed: "2024-03-17 08:55",
    status: "enabled",
  },
  {
    id: "7",
    name: "RDP Classifier",
    version: "v2.13",
    description: "朴素贝叶斯分类",
    imageAddress: "biocontainers/rdp-classifier:v2.13_cv1",
    lastUsed: "2024-03-15 13:40",
    status: "enabled",
  },
  {
    id: "8",
    name: "Kraken2",
    version: "v2.1",
    description: "k-mer 快速比对",
    imageAddress: "staphb/kraken2:2.1.2",
    lastUsed: "2024-03-22 09:25",
    status: "enabled",
  },
  {
    id: "9",
    name: "Bracken",
    version: "v2.7",
    description: "基于 Kraken 结果优化",
    imageAddress: "staphb/bracken:2.7",
    lastUsed: "2024-03-14 17:00",
    status: "enabled",
  },
  {
    id: "10",
    name: "PICRUSt2",
    version: "v2.5",
    description: "从 16S 推测功能",
    imageAddress: "vsergeyev/picrust2:2.5.2",
    lastUsed: "2024-03-16 11:50",
    status: "enabled",
  },
  {
    id: "11",
    name: "LEfSe",
    version: "v1.1",
    description: "LDA 分析差异菌",
    imageAddress: "biobakery/lefse:1.1.2",
    lastUsed: "2024-03-18 15:30",
    status: "enabled",
  },
];

export function ToolManagement({ 
  onSelectTool, 
  onAddTool,
  onEditTool
}: { 
  onSelectTool?: (id: string) => void;
  onAddTool?: () => void;
  onEditTool?: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [customTools, setCustomTools] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_tools");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleDeleteCustomTool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTools.filter((t: any) => t.id !== id);
    setCustomTools(updated);
    localStorage.setItem("custom_tools", JSON.stringify(updated));
  };

  const filteredPresetTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredCustomTools = customTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 space-y-5">
      {/* Tab Switcher & Header header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.01)] text-slate-800">
        <div className="text-left">
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-600 rounded-sm inline-block" />
            工具管理中心
          </h1>
          <p className="text-xs text-slate-400 mt-1">管理系统内置分析流中的静态生物信息学工具及用户自行配置运行的自定义容器算法</p>
        </div>

        {/* Dynamic Tab Selector switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/30 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveTab("preset");
              setSearchTerm("");
            }}
            className={cn(
              "relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "preset"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Box className="w-3.5 h-3.5" />
            <span>预置工具</span>
            <Badge className={cn("px-1 py-0 text-[9px] font-mono", activeTab === "preset" ? "bg-blue-100 text-blue-600" : "bg-slate-200/70 text-slate-500")}>
              {filteredPresetTools.length}
            </Badge>
          </button>
          <button
            onClick={() => {
              setActiveTab("custom");
              setSearchTerm("");
            }}
            className={cn(
              "relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "custom"
                ? "bg-white text-blue-650 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>自定义工具</span>
            <Badge className={cn("px-1 py-0 text-[9px] font-mono", activeTab === "custom" ? "bg-blue-105 text-blue-600" : "bg-slate-200/70 text-slate-500")}>
              {customTools.length}
            </Badge>
          </button>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={activeTab === "preset" ? "搜索预置分子或测序算法..." : "搜索自定义镜像工具..."} 
              className="pl-9 h-9 bg-white text-xs border border-slate-200/80 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === "preset" && (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 gap-2 text-slate-600 bg-white min-w-[100px] justify-between text-xs border border-slate-200/85 rounded-lg")}>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    <span>{activeCategory === "全部" ? "筛选" : activeCategory}</span>
                  </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 tech-mono text-xs">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] text-slate-400">工具分类筛选</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveCategory("全部")} className="text-xs flex items-center justify-between cursor-pointer">
                    全部工具
                    {activeCategory === "全部" && <Check className="w-3 h-3 text-blue-600" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveCategory("细菌（16srRNA）分析")} className="text-xs flex items-center justify-between cursor-pointer">
                    细菌（16srRNA）分析
                    {activeCategory === "细菌（16srRNA）分析" && <Check className="w-3 h-3 text-blue-600" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-xs text-slate-300">
                    宏基因mNGS分析 (开发中)
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-xs text-slate-300">
                    单细胞scRNA-seq分析 (开发中)
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-xs text-slate-300">
                    TCR分析 (开发中)
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-xs text-slate-300">
                    ATAC-seq分析 (开发中)
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={onAddTool} size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-2 cursor-pointer font-bold rounded-lg shadow-sm">
            <Plus className="h-4 w-4" />
            新增自定义工具
          </Button>
        </div>
      </div>

      {activeTab === "preset" ? (
        /* Preset Tools List Output Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 text-left">
          {filteredPresetTools.map((tool) => (
            <Card 
              key={tool.id} 
              className="border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow bg-white rounded-xl cursor-pointer flex flex-col justify-between"
              onClick={() => onSelectTool?.(tool.id)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border",
                      tool.iconType === "gear" || tool.id === "taxonomy-annotation"
                        ? "bg-teal-50 text-teal-600 border-teal-100"
                        : "bg-blue-50 text-blue-600 border-blue-100/50"
                    )}>
                      {tool.iconType === "gear" || tool.id === "taxonomy-annotation" ? (
                        <Settings className="w-5 h-5" />
                      ) : (
                        <Box className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">{tool.name}</h3>
                      <p className="text-[11px] text-slate-400 font-semibold tracking-tight font-mono">{tool.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onSelectTool?.(tool.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      title="运行工具"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-1 px-1.5 rounded-lg hover:bg-slate-50 text-slate-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3 flex-1">
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {tool.description}
                </p>

                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-1.5 p-2 bg-slate-50/80 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">镜像地址</span>
                  <code className="text-[10px] text-blue-600 tech-mono truncate font-semibold">
                    {tool.imageAddress}
                  </code>
                </div>
              </CardContent>
              <div className="px-4 pb-4 mt-2">
                <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {tool.lastUsed}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    启用
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Custom Tools List Grid or Empty State */
        <div className="pb-8 text-left">
          {filteredCustomTools.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-200/80 rounded-2xl max-w-md mx-auto mt-8 animate-fadeIn shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <SlidersHorizontal className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">暂无自定义工具</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                {searchTerm ? "未找到符合搜索条件的自定义镜像工具。" : "您还没有创建过自定义容器镜像工具。点击右上角“新增自定义工具”，发布属于您的第一个专属工具。"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={onAddTool} 
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 gap-1.5 font-bold rounded-lg shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  现在开始发布
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl cursor-pointer relative overflow-hidden group border-l-4 border-l-emerald-500 flex flex-col justify-between"
                  onClick={() => onSelectTool?.(tool.id)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/50 text-emerald-600">
                          <SlidersHorizontal className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm truncate max-w-[130px]">{tool.name}</h3>
                            <Badge className="bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-100/50 text-[9px] px-1 py-0 font-medium scale-90 origin-left">
                              自定义
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono tracking-tight font-medium mt-0.5">{tool.version || "v1.0"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => onSelectTool?.(tool.id)}
                          className="text-emerald-600 hover:text-emerald-700 transition-colors mr-1"
                          title="运行工具"
                        >
                          <PlayCircle className="w-7 h-7 text-emerald-600 hover:text-emerald-700" />
                        </button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 text-xs">
                            <DropdownMenuItem onClick={() => onSelectTool?.(tool.id)} className="text-xs cursor-pointer">
                              <PlayCircle className="w-3.5 h-3.5 mr-2 text-slate-400" />
                              运行工具
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTool?.(tool.id);
                              }} 
                              className="text-xs cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-slate-400" />
                              编辑工具
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteCustomTool(tool.id, e)} 
                              className="text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              删除工具
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3 flex-1">
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                      {tool.description}
                    </p>
                    
                    {/* docker settings metadata details */}
                    <div className="flex flex-col gap-1.5 p-2 bg-slate-50/80 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">容器镜像地址</span>
                      <code className="text-[10px] text-emerald-600 tech-mono truncate font-semibold">
                        {tool.imageAddress}
                      </code>
                    </div>

                    {/* tag counts configuration information */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[9px] text-slate-400 pt-1">
                      <span className="bg-slate-150 px-1.5 py-0.5 rounded border border-slate-200/50">{tool.inputsCount || 0} 输入项</span>
                      <span className="bg-slate-150 px-1.5 py-0.5 rounded border border-slate-200/50">{tool.paramsCount || 0} 运行参数</span>
                      <span className="bg-slate-150 px-1.5 py-0.5 rounded border border-slate-200/50">{tool.outputsCount || 0} 输出端</span>
                    </div>
                  </CardContent>
                  <div className="px-4 pb-4">
                    <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {tool.lastUsed}
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-650">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        已就绪
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
