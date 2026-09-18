import { useState, useEffect } from "react";
import { 
  ChevronLeft, Terminal, Settings, Database, ArrowRight, 
  PlayCircle, Copy, Info, Check, Search, FileCode, FolderOpen,
  ChevronRight, Plus, Trash2, CloudUpload, Upload, FileText,
  Workflow, Scissors, Download
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaxonomyAnnotationTask } from "./TaxonomyAnnotationTask";

// --- Mock Data ---
const SAMPLES = [
  { id: "S001", name: "Sample_SH_01", type: "mNGS" },
  { id: "S002", name: "Sample_SH_02", type: "mNGS" },
  { id: "S003", name: "Control_Neg_01", type: "mNGS" },
  { id: "S004", name: "Patient_Lung_04", type: "16S" },
  { id: "S005", name: "Patient_Lung_05", type: "16S" },
];

const SAMPLE_BATCHES: Record<string, string[]> = {
  "S001": ["BATCH_20240401", "BATCH_20240415"],
  "S002": ["BATCH_20240401"],
  "S003": ["BATCH_20240402"],
  "S004": ["BATCH_20240410"],
  "S005": ["BATCH_20240410"],
};

const BATCH_FILES: Record<string, string[]> = {
  "BATCH_20240401": ["/data/raw/B01_R1.fastq.gz", "/data/raw/B01_R2.fastq.gz", "/data/raw/B02_R1.fastq.gz", "/data/raw/B02_R2.fastq.gz"],
  "BATCH_20240415": ["/data/raw/B15_R1.fastq.gz", "/data/raw/B15_R2.fastq.gz"],
  "BATCH_20240402": ["/data/raw/C02_R1.fastq.gz", "/data/raw/C02_R2.fastq.gz"],
  "BATCH_20240410": ["/data/raw/D10_R1.fastq.gz", "/data/raw/D10_R2.fastq.gz"],
};

const RAW_DATA_FILES: Record<string, { id: string; name: string; path: string }[]> = {
  "S001": [
    { id: "f1", name: "S001_L01_R1.fastq.gz", path: "/oss/raw/project_abc/S001/" },
    { id: "f2", name: "S001_L01_R2.fastq.gz", path: "/oss/raw/project_abc/S001/" },
  ],
  "S002": [
    { id: "f3", name: "S002_L01_R1.fastq.gz", path: "/oss/raw/project_abc/S002/" },
    { id: "f4", name: "S002_L01_R2.fastq.gz", path: "/oss/raw/project_abc/S002/" },
  ],
  "S003": [
    { id: "f5", name: "CN_01_R1.fastq.gz", path: "/oss/raw/project_abc/S003/" },
    { id: "f6", name: "CN_01_R2.fastq.gz", path: "/oss/raw/project_abc/S003/" },
  ],
  "S004": [
    { id: "f7", name: "P04_16S_R1.fastq.gz", path: "/oss/raw/16s_lung/S004/" },
    { id: "f8", name: "P04_16S_R2.fastq.gz", path: "/oss/raw/16s_lung/S004/" },
  ],
  "S005": [
    { id: "f9", name: "P05_16S_R1.fastq.gz", path: "/oss/raw/16s_lung/S005/" },
    { id: "f10", name: "P05_16S_R2.fastq.gz", path: "/oss/raw/16s_lung/S005/" },
  ],
};

interface ToolDetailProps {
  toolId: string;
  onBack: () => void;
}

export function ToolDetail({ toolId, onBack }: ToolDetailProps) {
  if (toolId === "taxonomy-annotation") {
    return <TaxonomyAnnotationTask onBack={onBack} />;
  }

  const [taskName, setTaskName] = useState("");
  const [inputPath, setInputPath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // QC_PREPROCESS specifics
  const [qcRows, setQcRows] = useState<Array<{
    sampleId: string;
    batch: string;
    fastq1: string;
    fastq2: string;
  }>>([{ sampleId: "", batch: "", fastq1: "", fastq2: "" }]);
  
  const [upstreamPrimer, setUpstreamPrimer] = useState("");
  const [downstreamPrimer, setDownstreamPrimer] = useState("");

  const isQC = toolId === "qc-preprocess";
  let toolName = isQC ? "QC_PREPROCESS" : "QIIME2";

  // Dynamic custom tool lookup
  let matchedTool: any = null;
  const customToolsData = typeof window !== 'undefined' ? localStorage.getItem("custom_tools") : null;
  if (customToolsData) {
    try {
      const parsed = JSON.parse(customToolsData);
      matchedTool = parsed.find((t: any) => t.id === toolId);
      if (matchedTool) {
        toolName = matchedTool.name;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Multi-version support
  const versions = matchedTool?.versions || (matchedTool ? [
    {
      version: matchedTool.version,
      description: matchedTool.description,
      imageAddress: matchedTool.imageAddress,
      inputsCount: matchedTool.inputsCount,
      paramsCount: matchedTool.paramsCount,
      outputsCount: matchedTool.outputsCount,
      toolData: matchedTool.toolData
    }
  ] : []);

  const [selectedVersionStr, setSelectedVersionStr] = useState("");

  useEffect(() => {
    if (versions && versions.length > 0) {
      setSelectedVersionStr(versions[versions.length - 1].version);
    } else {
      setSelectedVersionStr("");
    }
  }, [toolId, customToolsData]);

  const currentVersionObj = versions.find((v: any) => v.version === selectedVersionStr) || versions[versions.length - 1];

  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [customParams, setCustomParams] = useState<Record<string, string>>({});
  const [customOutputs, setCustomOutputs] = useState<Record<string, string>>({});

  const currentVersionStr = currentVersionObj?.version || "";

  useEffect(() => {
    if (currentVersionObj?.toolData) {
      const data = currentVersionObj.toolData;
      
      const initInputs: Record<string, string> = {};
      data.inputs?.forEach((input: any) => {
        initInputs[input.name] = "";
      });
      setCustomInputs(initInputs);

      const initParams: Record<string, string> = {};
      data.parameters?.forEach((param: any) => {
        initParams[param.name] = param.defaultValue || "";
      });
      setCustomParams(initParams);

      const initOutputs: Record<string, string> = {};
      data.outputs?.forEach((output: any) => {
        initOutputs[output.name] = output.matchRule || "";
      });
      setCustomOutputs(initOutputs);
    }
  }, [currentVersionStr, toolId, customToolsData]);

  // Cascader State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const commandPreview = isQC 
    ? `cutadapt ${upstreamPrimer ? `-g ${upstreamPrimer}` : '${primer_f}'} ${downstreamPrimer ? `-a ${downstreamPrimer}` : '${primer_r}'} \\
              -o ${qcRows[0]?.sampleId || '${sample.id}'}_R1.trimmed.fastq.gz \\
              -p ${qcRows[0]?.sampleId || '${sample.id}'}_R2.trimmed.fastq.gz \\
              ${qcRows[0]?.fastq1 || '${reads[0]}'} ${qcRows[0]?.fastq2 || '${reads[1]}'}`
    : `qiime tools import --type 'SampleData[PairedEndSequencesWithQuality]' --input-path ${inputPath || 'manifest.csv'} --output-path ${outputPath || 'demux.qza'}`;

  let customCommandPreview = "";
  if (matchedTool && currentVersionObj?.toolData) {
    const template = currentVersionObj.toolData.command || "";
    let rendered = template;
    
    // Replace inputs
    Object.entries(customInputs).forEach(([name, value]) => {
      rendered = rendered.replace(new RegExp(`\\\${${name}}`, 'g'), value || `\${${name}}`);
    });
    
    // Replace parameters
    Object.entries(customParams).forEach(([name, value]) => {
      rendered = rendered.replace(new RegExp(`\\\${${name}}`, 'g'), value !== undefined ? String(value) : `\${${name}}`);
    });
    
    // Replace outputs
    Object.entries(customOutputs).forEach(([name, value]) => {
      rendered = rendered.replace(new RegExp(`\\\${${name}}`, 'g'), value || `\${${name}}`);
    });

    customCommandPreview = rendered;
  }

  const finalCommandPreview = matchedTool ? customCommandPreview : commandPreview;

  const addQcRow = () => {
    setQcRows([...qcRows, { sampleId: "", batch: "", fastq1: "", fastq2: "" }]);
  };

  const removeQcRow = (index: number) => {
    if (qcRows.length > 1) {
      setQcRows(qcRows.filter((_, i) => i !== index));
    }
  };

  const updateQcRow = (index: number, field: string, value: string) => {
    const newRows = [...qcRows];
    newRows[index] = { ...newRows[index], [field]: value };
    
    // Cascading resets
    if (field === "sampleId") {
      newRows[index].batch = "";
      newRows[index].fastq1 = "";
      newRows[index].fastq2 = "";
    } else if (field === "batch") {
      newRows[index].fastq1 = "";
      newRows[index].fastq2 = "";
    }
    
    setQcRows(newRows);
  };

  const handleSelectFile = (file: { name: string; path: string }) => {
    setInputPath(`${file.path}${file.name}`);
    setIsOpen(false);
    setSelectedSample(null); // Reset for next time
  };

  return (
    <div className="flex flex-col h-full bg-[#f9fafb]">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-[#4096ff] hover:text-[#0958d9] text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              返回
            </button>
            <h1 className="text-xl font-bold text-slate-800">运行工具：{toolName}</h1>
          </div>
          <Button className="bg-[#4096ff] hover:bg-[#0958d9] text-white h-9 px-6 gap-2 rounded-md shadow-sm transition-all">
            <PlayCircle className="w-4 h-4" />
            提交任务
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2">配置运行参数并提交任务</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
          {/* Section: Running Parameter Configuration */}
          <Card className="border-slate-200 shadow-none rounded-md bg-white overflow-visible">
            <CardHeader className="p-6 pb-0">
              <h2 className="text-sm font-bold text-slate-900 tech-mono uppercase tracking-tight">
                {isQC ? "输入" : "运行参数配置"}
              </h2>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {isQC ? (
                <div className="space-y-12">
                  {/* 1. Sample Sequence Data (Image 1 Style) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Database className="w-4 h-4 text-[#4096ff]" />
                       <h3 className="text-sm font-bold text-slate-800">1. 样本序列数据 (Sample Sequence Data)</h3>
                    </div>
                    <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                          <tr className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                            <th className="px-4 py-3 text-left w-[240px] border-r border-slate-200/50">样本 ID</th>
                            <th className="px-4 py-3 text-left w-[200px] border-r border-slate-200/50">测序批次</th>
                            <th className="px-4 py-3 text-left min-w-[240px] border-r border-slate-200/50">FASTQ_1</th>
                            <th className="px-4 py-3 text-left min-w-[240px] border-r border-slate-200/50">FASTQ_2</th>
                            <th className="px-4 py-3 text-center w-[80px]">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {qcRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-3 py-3 border-r border-slate-100/50">
                                <select 
                                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-blue-400 bg-white outline-none appearance-none transition-all"
                                  value={row.sampleId}
                                  onChange={(e) => updateQcRow(idx, "sampleId", e.target.value)}
                                >
                                  <option value="">选择样本ID</option>
                                  {SAMPLES.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-3 border-r border-slate-100/50">
                                <select 
                                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-blue-400 bg-white disabled:bg-slate-50 outline-none appearance-none transition-all"
                                  value={row.batch}
                                  onChange={(e) => updateQcRow(idx, "batch", e.target.value)}
                                  disabled={!row.sampleId}
                                >
                                  <option value="">选择批次</option>
                                  {row.sampleId && SAMPLE_BATCHES[row.sampleId]?.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3 border-r border-slate-100/50">
                                <select 
                                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-blue-400 bg-white disabled:bg-slate-50 outline-none appearance-none transition-all"
                                  value={row.fastq1}
                                  onChange={(e) => updateQcRow(idx, "fastq1", e.target.value)}
                                  disabled={!row.batch}
                                >
                                  <option value="">选择 fastq_1 路径</option>
                                  {row.batch && BATCH_FILES[row.batch]?.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3 border-r border-slate-100/50">
                                <select 
                                  className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-blue-400 bg-white disabled:bg-slate-50 outline-none appearance-none transition-all"
                                  value={row.fastq2}
                                  onChange={(e) => updateQcRow(idx, "fastq2", e.target.value)}
                                  disabled={!row.batch}
                                >
                                  <option value="">选择 fastq_2 路径</option>
                                  {row.batch && BATCH_FILES[row.batch]?.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  onClick={() => removeQcRow(idx)}
                                  disabled={qcRows.length === 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-4 text-xs font-bold border-dashed border-slate-300 text-slate-500 hover:text-blue-500 hover:border-blue-400 transition-all flex items-center gap-2"
                      onClick={addQcRow}
                    >
                      <Plus className="w-4 h-4" />
                      添加样本行
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-4 text-xs font-bold border-[#4096ff] text-[#4096ff] hover:bg-blue-50 transition-all flex items-center gap-2"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      <CloudUpload className="w-4 h-4" />
                      批量上传窗口
                    </Button>
                  </div>

                  {/* Primers Configuration (Remain but styled) */}
                  <div className="pt-8 border-t border-slate-100 mt-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Scissors className="w-4 h-4 text-slate-400" />
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">引物参数配置 (Optional)</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">上游引物序列 (Forward Primer)</Label>
                        <Input 
                          placeholder="请输入上游引物序列"
                          className="h-10 border-slate-200 rounded-md text-sm focus:ring-[#4096ff]/20"
                          value={upstreamPrimer}
                          onChange={(e) => setUpstreamPrimer(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 italic">传递给 cutadapt，用于引物序列的自动匹配与去除</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">下游引物序列 (Reverse Primer)</Label>
                        <Input 
                          placeholder="请输入下游引物序列"
                          className="h-10 border-slate-200 rounded-md text-sm focus:ring-[#4096ff]/20"
                          value={downstreamPrimer}
                          onChange={(e) => setDownstreamPrimer(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 italic">传递给 cutadapt，用于引物序列的自动匹配与去除</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : matchedTool && currentVersionObj?.toolData ? (
                <div className="space-y-8 text-left">
                  {/* Version selector banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/30 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#4096ff]/10 text-[#4096ff] rounded-md">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800">选择工具运行版本</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">多版本支持：您可以选择已发布的历史验证版本，默认使用最新版本</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs text-slate-500 font-semibold">选择版本:</span>
                      <select
                        value={selectedVersionStr}
                        onChange={(e) => setSelectedVersionStr(e.target.value)}
                        className="h-8 px-2.5 pr-8 border border-slate-200 rounded-md text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {versions.map((v: any, index: number) => {
                          const isLatest = index === versions.length - 1;
                          return (
                            <option key={v.version} value={v.version}>
                              {v.version} {isLatest ? " (最新默认)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Basic description for this version */}
                  {currentVersionObj.description && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100 text-left">
                      <span className="font-bold text-slate-700">当前版本描述：</span>
                      {currentVersionObj.description}
                    </div>
                  )}

                  {/* Inputs Section */}
                  {currentVersionObj.toolData.inputs && currentVersionObj.toolData.inputs.length > 0 && (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                        <Database className="w-4 h-4 text-[#4096ff]" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">输入数据端口配置</h3>
                      </div>
                      <div className="space-y-4">
                        {currentVersionObj.toolData.inputs.map((input: any) => (
                          <div key={input.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {input.required && <span className="text-red-500 text-sm font-bold leading-none">*</span>}
                                <Label className="text-xs font-bold text-slate-700 tech-mono">{input.displayName} ({input.name})</Label>
                                <Badge variant="outline" className="text-[10px] scale-90 border-slate-200 text-slate-500 font-mono">
                                  {input.type}
                                </Badge>
                              </div>
                              {input.format && (
                                <span className="text-[10px] text-slate-400 font-mono">格式: {input.format}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <div className="relative flex-1 group">
                                <Input
                                  placeholder={input.placeholder || `请输入或选择 ${input.displayName} 路径`}
                                  className="h-10 bg-white border-slate-300 text-xs flex-1 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-400 pl-9"
                                  value={customInputs[input.name] || ""}
                                  onChange={(e) => setCustomInputs({ ...customInputs, [input.name]: e.target.value })}
                                />
                                <Database className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                              </div>
                              {/* Browse Popover */}
                              <Popover>
                                <PopoverTrigger
                                  className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    "h-10 px-4 text-xs rounded-sm border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors gap-1.5"
                                  )}
                                >
                                  <FolderOpen className="w-3.5 h-3.5" />
                                  浏览
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[500px]" align="end">
                                  <div className="flex h-[350px] divide-x">
                                    <div className="w-1/2 flex flex-col overflow-hidden">
                                      <Command className="rounded-none border-none">
                                        <div className="p-2 border-b bg-muted/30">
                                          <CommandInput placeholder="搜索样本..." className="h-8 tech-mono text-xs" />
                                        </div>
                                        <CommandList className="flex-1">
                                          <CommandEmpty className="py-6 text-center text-[10px] text-slate-400 tech-mono uppercase">无匹配样本</CommandEmpty>
                                          <CommandGroup heading="可用样本列表" className="px-2">
                                            {SAMPLES.map(sample => (
                                              <CommandItem
                                                key={sample.id}
                                                onSelect={() => setSelectedSample(sample.id)}
                                                className={cn(
                                                  "flex items-center justify-between px-3 py-2 text-xs rounded-sm cursor-pointer group mb-0.5",
                                                  selectedSample === sample.id ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-600"
                                                )}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <Database className={cn("w-3.5 h-3.5", selectedSample === sample.id ? "text-blue-500" : "text-slate-400")} />
                                                  <span className="truncate tech-mono">{sample.name}</span>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </div>
                                    <div className="w-1/2 flex flex-col bg-slate-50/50 overflow-hidden">
                                      <div className="p-3 border-b h-[53px] flex items-center bg-white/50">
                                        <span className="text-[10px] text-slate-500 tech-mono font-bold uppercase tracking-widest flex items-center gap-2">
                                          {selectedSample ? "选择原始文件" : "请先选择样本"}
                                        </span>
                                      </div>
                                      <ScrollArea className="flex-1">
                                        {selectedSample ? (
                                          <div className="p-2 space-y-1 text-left">
                                            {RAW_DATA_FILES[selectedSample]?.map(file => (
                                              <button
                                                key={file.id}
                                                onClick={() => {
                                                  setCustomInputs({
                                                    ...customInputs,
                                                    [input.name]: `${file.path}${file.name}`
                                                  });
                                                }}
                                                className="w-full flex flex-col text-left px-3 py-2 text-xs rounded-sm hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
                                              >
                                                <div className="flex items-center gap-1.5 mb-1">
                                                  <FileCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                                                  <span className="truncate font-semibold tech-mono text-slate-700">{file.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 pl-5 opacity-60">
                                                  <FolderOpen className="w-2.5 h-2.5" />
                                                  <span className="text-[9px] truncate tech-mono text-slate-500">{file.path}</span>
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-white/30">
                                            <p className="text-[10px] text-slate-400 font-medium">⬅️ 请在左侧选择样本</p>
                                          </div>
                                        )}
                                      </ScrollArea>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parameters Section */}
                  {currentVersionObj.toolData.parameters && currentVersionObj.toolData.parameters.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                        <Settings className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">运行参数设置</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {currentVersionObj.toolData.parameters.map((param: any) => (
                          <div key={param.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {param.required && <span className="text-red-500 text-sm font-bold leading-none">*</span>}
                                <Label className="text-xs font-bold text-slate-700 tech-mono">{param.displayName} ({param.name})</Label>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{param.type}</span>
                            </div>
                            
                            {param.type === "boolean" ? (
                              <select
                                className="w-full h-10 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-blue-400 bg-white outline-none"
                                value={String(customParams[param.name] ?? "false")}
                                onChange={(e) => setCustomParams({ ...customParams, [param.name]: e.target.value })}
                              >
                                <option value="true">True (启用)</option>
                                <option value="false">False (关闭)</option>
                              </select>
                            ) : (
                              <Input
                                type={param.type === "integer" || param.type === "number" ? "number" : "text"}
                                min={param.min}
                                max={param.max}
                                placeholder={param.helpText || `输入 ${param.displayName}`}
                                className="h-10 bg-white border-slate-300 text-xs rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-400"
                                value={customParams[param.name] ?? ""}
                                onChange={(e) => setCustomParams({ ...customParams, [param.name]: e.target.value })}
                              />
                            )}
                            {param.helpText && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5">{param.helpText}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outputs Section */}
                  {currentVersionObj.toolData.outputs && currentVersionObj.toolData.outputs.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                        <FolderOpen className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">输出配置</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {currentVersionObj.toolData.outputs.map((output: any) => (
                          <div key={output.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-bold text-slate-700 tech-mono">{output.displayName} ({output.name})</Label>
                              <span className="text-[10px] text-slate-400 font-mono">格式: {output.format || "any"}</span>
                            </div>
                            <Input
                              placeholder="请输入匹配路径或默认输出路径"
                              className="h-10 bg-white border-slate-300 text-xs rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-400"
                              value={customOutputs[output.name] || ""}
                              onChange={(e) => setCustomOutputs({ ...customOutputs, [output.name]: e.target.value })}
                            />
                            {output.matchRule && (
                              <p className="text-[10px] text-slate-400 mt-0.5">默认路径: <span className="font-mono text-slate-500">{output.matchRule}</span></p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Default QIIME2 UI */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 min-w-[84px] justify-end">
                        <span className="text-red-500 font-bold text-lg leading-none mt-1">*</span>
                        <Label className="text-sm font-bold text-slate-700 tech-mono">input</Label>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <div className="relative flex-1 group">
                          <Input 
                            placeholder="请选择或输入 fastq 路径"
                            className="h-10 bg-white border-slate-300 text-sm flex-1 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-400 pl-9"
                            value={inputPath}
                            onChange={(e) => setInputPath(e.target.value)}
                          />
                          <Database className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>

                        <Popover open={isOpen} onOpenChange={setIsOpen}>
                          <PopoverTrigger 
                            className={cn(
                              buttonVariants({ variant: "outline" }), 
                              "h-10 px-4 text-sm rounded-sm border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors gap-2"
                            )}
                          >
                            <FolderOpen className="w-4 h-4" />
                            浏览
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[500px]" align="end">
                            <div className="flex h-[400px] divide-x">
                              {/* First Column: Samples using Command */}
                              <div className="w-1/2 flex flex-col overflow-hidden">
                                <Command className="rounded-none border-none">
                                  <div className="p-2 border-b bg-muted/30">
                                    <CommandInput 
                                      placeholder="搜索样本..." 
                                      className="h-8 tech-mono text-xs"
                                    />
                                  </div>
                                  <CommandList className="flex-1">
                                    <CommandEmpty className="py-6 text-center text-[10px] text-slate-400 tech-mono uppercase">无匹配样本</CommandEmpty>
                                    <CommandGroup heading="可用样本列表" className="px-2">
                                      {SAMPLES.map(sample => (
                                        <CommandItem
                                          key={sample.id}
                                          onSelect={() => setSelectedSample(sample.id)}
                                          className={cn(
                                            "flex items-center justify-between px-3 py-2 text-xs rounded-sm cursor-pointer group mb-0.5",
                                            selectedSample === sample.id ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-600"
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Database className={cn("w-3.5 h-3.5", selectedSample === sample.id ? "text-blue-500" : "text-slate-400")} />
                                            <span className="truncate tech-mono">{sample.name}</span>
                                          </div>
                                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </div>

                              {/* Second Column: Files */}
                              <div className="w-1/2 flex flex-col bg-slate-50/50 overflow-hidden">
                                <div className="p-3 border-b h-[53px] flex items-center bg-white/50">
                                  <span className="text-[10px] text-slate-500 tech-mono font-bold uppercase tracking-widest flex items-center gap-2">
                                    {selectedSample ? (
                                      <>
                                        <FileCode className="w-3 h-3 text-blue-500" />
                                        选择原始文件
                                      </>
                                    ) : "请先选择样本"}
                                  </span>
                                </div>
                                <ScrollArea className="flex-1">
                                  {selectedSample ? (
                                    <div className="p-2 space-y-1 text-left">
                                      {RAW_DATA_FILES[selectedSample]?.map(file => (
                                        <button
                                          key={file.id}
                                          onClick={() => handleSelectFile(file)}
                                          className="w-full flex flex-col text-left px-3 py-2.5 text-xs rounded-sm hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
                                        >
                                          <div className="flex items-center gap-2 mb-1.5">
                                            <div className="p-1 rounded bg-slate-100 group-hover:bg-blue-100 transition-colors">
                                              <FileCode className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                                            </div>
                                            <span className="truncate font-semibold tech-mono text-slate-700">{file.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 pl-7 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <FolderOpen className="w-2.5 h-2.5" />
                                            <span className="text-[9px] truncate tech-mono text-slate-500">{file.path}</span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-white/30">
                                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 animate-pulse">
                                        <Search className="w-5 h-5 text-slate-300" />
                                      </div>
                                      <p className="text-[11px] text-slate-400 tech-mono font-medium leading-relaxed">
                                        ⬅️ 待选择样本<br/>
                                        <span className="text-[9px] opacity-60">请在左侧列表点击目标样本</span>
                                      </p>
                                    </div>
                                  )}
                                </ScrollArea>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="pl-[92px]">
                      <p className="text-[10px] text-slate-400 font-bold tech-mono tracking-tight uppercase">FASTQ Raw Sequencing Data</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tech-mono tracking-widest">通用基础配置</h3>
                <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                  <div className={cn("flex items-center gap-4", isQC && "col-span-2")}>
                    <Label className="text-xs font-bold text-slate-600 min-w-[72px] text-right tech-mono">任务名称</Label>
                    <Input 
                      placeholder="例如 PCR_Preprocessing_Task"
                      className="h-10 bg-white border-slate-300 text-sm rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-400 tech-mono"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                    />
                  </div>
                  {!isQC && (
                    <div className="flex items-center gap-4">
                      <Label className="text-xs font-bold text-slate-600 min-w-[72px] text-right tech-mono">输出目录</Label>
                      <Input 
                        placeholder="/data/results/..."
                        className="h-10 bg-white border-slate-300 text-sm rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-400 tech-mono"
                        value={outputPath}
                        onChange={(e) => setOutputPath(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: Command Line Preview */}
          <Card className="border-slate-200 shadow-none rounded-md bg-white">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900 tech-mono uppercase">命令行代码预览</h2>
              </div>
              <button className="flex items-center gap-1.5 text-[#4096ff] hover:text-[#0958d9] text-xs font-medium transition-colors">
                <Copy className="w-3.5 h-3.5" />
                复制指令
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-[#111827] rounded-md p-5 text-[#f1f5f9] font-mono text-[13px] leading-relaxed shadow-inner border border-slate-800 break-all">
                <span className="text-blue-400">$</span> {finalCommandPreview}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] w-full p-0 overflow-hidden bg-[#f9fafb]">
          <DialogHeader className="p-6 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <CloudUpload className="w-5 h-5 text-[#4096ff]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800">批量上传窗口</DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">请上传所需的测序数据、分组信息及辅助分析文件</p>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[650px]">
            <div className="p-8 space-y-12">
              {/* 1. Sample Sequence Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#4096ff]/10 text-[#4096ff] hover:bg-[#4096ff]/20 border-none tech-mono h-5 px-1.5 min-w-[20px] justify-center">1</Badge>
                  <h3 className="text-sm font-bold text-slate-800">样本序列数据 (Sample Sequence Data)</h3>
                </div>
                <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden p-8">
                  <div className="flex flex-col items-center justify-center gap-4 py-10 border-2 border-dashed border-slate-200 rounded-lg hover:border-[#4096ff]/50 hover:bg-blue-50/20 transition-all cursor-pointer group mb-6">
                    <div className="p-4 rounded-full bg-slate-50 group-hover:bg-blue-100/50 transition-colors">
                      <FileCode className="w-10 h-10 text-slate-300 group-hover:text-[#4096ff]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">点击上传或将文件拖拽到此处</p>
                      <p className="text-xs text-slate-400 mt-2">支持批量上传 fastq/fastq.gz 格式文件</p>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-5 flex items-start gap-4 border border-blue-100/50">
                    <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-700">测序文件说明 (Description)</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          请上传制表符（TSV）或逗号分隔（CSV）的文件，该文件用于描述经过引物切除和低质量序列过滤处理的测序文件。
                        </p>
                        <div className="pt-2 space-y-1">
                          <div className="text-[10px] text-slate-600 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" /> 第一列必须为样本ID</div>
                          <div className="text-[10px] text-slate-600 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" /> 第二列为质控后的R1 fastq/fastq.gz文件路径，该路径需保证文件在平台中存在</div>
                          <div className="text-[10px] text-slate-600 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" /> 第三列为质控后的R2 fastq/fastq.gz文件路径，该路径需保证文件在平台中存在，单端数据时可为空</div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-blue-100 mt-2">
                        <button className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1.5">
                          <Download className="w-3 h-3" /> 下载示例模板
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Sample Grouping Info - Only for non-QC */}
              {!isQC && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#4096ff]/10 text-[#4096ff] hover:bg-[#4096ff]/20 border-none tech-mono h-5 px-1.5 min-w-[20px] justify-center">2</Badge>
                      <h3 className="text-sm font-bold text-slate-800">样本分组信息 (Metadata Upload)</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6 bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                      <div className="border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-3 bg-slate-50 hover:border-[#4096ff]/50 hover:bg-white transition-all cursor-pointer group py-12">
                        <CloudUpload className="w-8 h-8 text-slate-300 group-hover:text-[#4096ff]" />
                        <p className="text-[11px] font-bold text-slate-600">上传分组表格 (TSV/CSV)</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-5 text-[10px] text-blue-300 font-mono flex flex-col justify-center border border-slate-800 shadow-lg">
                        <div className="space-y-1.5">
                          <div className="text-blue-400 mb-2 border-b border-white/10 pb-1 uppercase tracking-widest font-bold flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            Metadata Requirement
                          </div>
                          <p className="text-[9px] text-slate-500 mb-3 leading-relaxed">请上传制表符（TSV）或逗号分隔（CSV）格式的样本分组信息表。该文件用于分组展示、组间差异分析、功能预测分组统计等</p>
                          <div className="space-y-1 text-[9px]">
                            <div className="opacity-90 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500" /> 第一列为样本名称（Sample ID）</div>
                            <div className="opacity-90 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500" /> 第二列为默认的分组列</div>
                            <div className="opacity-90 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500" /> 其他列为可选列</div>
                          </div>
                          <div className="flex justify-end mt-1">
                             <button className="text-[9px] font-bold text-blue-400 hover:text-white transition-colors flex items-center gap-1">
                               <Download className="w-2.5 h-2.5" /> 下载模板
                             </button>
                          </div>
                          <div className="mt-3 pt-2 border-t border-white/5">
                            <div className="text-[8px] text-slate-600 mb-1">Example:</div>
                            <div className="opacity-60 whitespace-pre font-mono text-[8px]">
    {`sample	Group	GeneExpress
    sample1	Case	KO
    sample2	Case	KO
    sample3	Control	WT`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Environmental Factors Table */}
                  <div className="space-y-4 pb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#4096ff]/10 text-[#4096ff] hover:bg-[#4096ff]/20 border-none tech-mono h-5 px-1.5 min-w-[20px] justify-center">3</Badge>
                      <h3 className="text-sm font-bold text-slate-800">环境因子表 (Environmental Factors Table)</h3>
                    </div>
                    <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                       <div className="flex items-center justify-between gap-6">
                         <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg py-8 flex flex-col items-center justify-center bg-slate-50 hover:border-[#4096ff]/50 hover:bg-white transition-all cursor-pointer group">
                            <Plus className="w-6 h-6 text-slate-300 group-hover:text-[#4096ff]" />
                            <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tight">上传环境因子表</span>
                         </div>
                         <div className="flex-1 p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center gap-2 min-h-[100px]">
                            <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px]">
                              <Info className="w-3.5 h-3.5 text-blue-400" />
                              文件格式说明
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal">用于物种-环境因子相关性分析。第一列为样本ID，之后为数值型环境因子变量。若无需此项分析可跳过。</p>
                            <div className="flex justify-end pt-1 border-t border-slate-200 mt-1">
                              <button className="text-[9px] font-bold text-blue-500 hover:underline flex items-center gap-1.5">
                                <Download className="w-3 h-3" /> 下载示例模板
                              </button>
                            </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-white flex justify-end gap-3 items-center px-6">
             <Button variant="ghost" size="sm" className="h-9 px-6 font-bold text-slate-500" onClick={() => setIsUploadDialogOpen(false)}>取消</Button>
             <Button size="sm" className="h-9 px-10 font-bold bg-[#4096ff] hover:bg-[#0958d9] text-white shadow-lg shadow-blue-500/20" onClick={() => setIsUploadDialogOpen(false)}>确认并提交队列</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

