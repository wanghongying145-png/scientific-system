import React, { useState } from "react";
import { 
  ChevronLeft, 
  RefreshCw, 
  Database, 
  Scissors, 
  Dna, 
  Layers, 
  Filter, 
  Settings2, 
  FileCheck, 
  Plus, 
  Trash2, 
  Info,
  Server,
  Play,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface RetryTaskConfigProps {
  task: any;
  onBack: () => void;
  onConfirmRetry: (updatedTask: any) => void;
}

export function RetryTaskConfig({ task, onBack, onConfirmRetry }: RetryTaskConfigProps) {
  const is16S = task.name.includes("16S");
  const [taskName, setTaskName] = useState(`${task.name} (重试运行)`);
  const [projectId, setProjectId] = useState(task.params.projectId || "病原微生物研究项目_2024");
  const [params, setParams] = useState<Record<string, any>>({ ...task.params });
  const [queue, setQueue] = useState("normal");
  const [nodeType, setNodeType] = useState("cpu-standard");

  // Handle parameter edits
  const handleParamChange = (key: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Samples helpers
  const handleSampleChange = (index: number, field: string, value: string) => {
    const updatedSamples = [...(params.samples || [])];
    updatedSamples[index] = {
      ...updatedSamples[index],
      [field]: value
    };
    handleParamChange("samples", updatedSamples);
  };

  const addSample = () => {
    const currentSamples = params.samples || [];
    const newIdx = currentSamples.length + 1;
    const newSampleId = `SAM-${String(newIdx).padStart(3, '0')}`;
    const newSample = {
      id: newSampleId,
      batch: `BATCH-${String(newIdx).padStart(2, '0')}`,
      f1: `${newSampleId}_R1.fq.gz`,
      f2: `${newSampleId}_R2.fq.gz`
    };
    handleParamChange("samples", [...currentSamples, newSample]);
  };

  const removeSample = (index: number) => {
    const updatedSamples = (params.samples || []).filter((_: any, i: number) => i !== index);
    handleParamChange("samples", updatedSamples);
  };

  // Submit revamped task
  const handleSubmit = () => {
    // Merge projectId into params
    const updatedParams = {
      ...params,
      projectId: projectId
    };

    const updatedTask = {
      ...task,
      name: taskName,
      params: updatedParams,
      status: "running" as const,
      progress: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      logs: [
        `[${new Date().toLocaleTimeString()}] 已通过高级重试配置界面重新拼装任务流...`,
        `[${new Date().toLocaleTimeString()}] 应用修改后的参数。项目编号: ${projectId}`,
        `[${new Date().toLocaleTimeString()}] 开始指派算力集群并初始化 NextFlow DSL2 pipeline...`
      ]
    };
    onConfirmRetry(updatedTask);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Top Bar for Retry Page */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-primary hover:bg-primary/5 -ml-2 h-8 px-2.5 font-semibold text-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回列表
          </Button>
          <div className="h-5 w-[1px] bg-slate-200" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-extrabold tech-mono bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-md">
                RETRY PANEL
              </span>
              <h1 className="text-sm font-bold text-slate-900">重新配置并提交运行</h1>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              源任务 ID: {task.id} • 当前编辑基础: 历史输入参数
            </span>
          </div>
        </div>

        {/* Start retry task in top right */}
        <Button 
          type="button" 
          onClick={handleSubmit}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs px-4 rounded-lg flex items-center gap-2 shadow-md shadow-orange-600/10 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          开始重试运行
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1000px] mx-auto space-y-10 pb-24">
          
          {/* SECTION 1: Data sum list */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#02A1C8] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#02A1C8]/20">1</div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  数据上传详情汇总
                  <Badge variant="outline" className="text-[10px] bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1] font-bold">
                    样本数: {params.samples?.length || 0}
                  </Badge>
                </h2>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addSample}
                className="h-7 text-[10px] font-bold text-[#02A1C8] border-[#02A1C8]/20 bg-[#02A1C8]/5 hover:bg-[#02A1C8]/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                新增样本项
              </Button>
            </div>

            <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 rounded-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-2 text-xs w-full max-w-xl">
                  <Database className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-500 uppercase tracking-wider tech-mono shrink-0">所属项目</span>
                  <Input 
                    placeholder="请输入所属项目编号"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="h-8 max-w-sm text-xs font-bold text-slate-700 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-1 focus:ring-[#02A1C8]/40"
                  />
                </div>
              </div>

              {/* Editable Sample Table */}
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="h-10 hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold text-slate-500 w-[20%]">样本编号</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-500 w-[20%]">测序批次</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-500 w-[25%]">FASTQ Forward (R1)</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-500 w-[25%]">FASTQ Reverse (R2)</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-500 w-[10%] text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(params.samples || []).map((s: any, idx: number) => (
                      <TableRow key={idx} className="h-10 hover:bg-slate-50/50">
                        {/* Sample ID */}
                        <TableCell className="p-1">
                          <input 
                            type="text"
                            value={s.id || ""}
                            onChange={(e) => handleSampleChange(idx, "id", e.target.value)}
                            className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#02A1C8]/40 h-8 px-2 text-xs font-bold text-slate-700 outline-none rounded transition-all"
                            placeholder="样本编号"
                          />
                        </TableCell>
                        {/* Batch */}
                        <TableCell className="p-1">
                          <input 
                            type="text"
                            value={s.batch || ""}
                            onChange={(e) => handleSampleChange(idx, "batch", e.target.value)}
                            className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#02A1C8]/40 h-8 px-2 text-[10px] tech-mono text-slate-500 outline-none rounded transition-all"
                            placeholder="测序批次"
                          />
                        </TableCell>
                        {/* Fastq Forward R1 */}
                        <TableCell className="p-1">
                          <input 
                            type="text"
                            value={s.f1 || ""}
                            onChange={(e) => handleSampleChange(idx, "f1", e.target.value)}
                            className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#02A1C8]/40 h-8 px-2 text-[10px] tech-mono text-[#02A1C8] underline decoration-dotted outline-none rounded font-medium transition-all"
                            placeholder="Forward Reads fq.gz"
                          />
                        </TableCell>
                        {/* Fastq Reverse R2 */}
                        <TableCell className="p-1">
                          <input 
                            type="text"
                            value={s.f2 || ""}
                            onChange={(e) => handleSampleChange(idx, "f2", e.target.value)}
                            className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#02A1C8]/40 h-8 px-2 text-[10px] tech-mono text-[#02A1C8] underline decoration-dotted outline-none rounded font-medium transition-all"
                            placeholder="Reverse Reads fq.gz"
                          />
                        </TableCell>
                        {/* Action Delete button */}
                        <TableCell className="p-1 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeSample(idx)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </section>

          {/* SECTION 2: Dynamic editable params block exactly matching the 16S details view */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#02A1C8] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#02A1C8]/20">2</div>
              <h2 className="text-sm font-bold text-slate-800">参数配置回顾 (Parameters Review)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. Primer Configurations */}
              <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Scissors className="w-4 h-4 text-[#02A1C8]" />
                  <span className="text-xs font-bold text-slate-800">引物序列配置 (Cutadapt)</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Forward Primer</span>
                    <Input 
                      placeholder="Enter Forward Primer"
                      value={params.primerForward || ""}
                      onChange={(e) => handleParamChange("primerForward", e.target.value)}
                      className="text-xs font-bold tech-mono p-2 bg-slate-50/50 border-slate-100 h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Reverse Primer</span>
                    <Input 
                      placeholder="Enter Reverse Primer"
                      value={params.primerReverse || ""}
                      onChange={(e) => handleParamChange("primerReverse", e.target.value)}
                      className="text-xs font-bold tech-mono p-2 bg-slate-50/50 border-slate-100 h-9"
                    />
                  </div>
                </div>
              </Card>

              {/* 2. Sequence processing settings */}
              <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Dna className="w-4 h-4 text-[#02A1C8]" />
                  <span className="text-xs font-bold text-slate-800">序列处理与聚类</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  
                  {/* Min Overlap */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">最小重叠</span>
                    <div className="relative">
                      <Input 
                        type="number"
                        value={params.minOverlap === undefined ? "" : params.minOverlap}
                        onChange={(e) => handleParamChange("minOverlap", parseInt(e.target.value) || 0)}
                        className="text-xs font-bold text-slate-700 h-9 pr-8"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 font-medium">bp</span>
                    </div>
                  </div>

                  {/* Max Mismatch */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">最大错配</span>
                    <Input 
                      type="number"
                      value={params.maxMismatch === undefined ? "" : params.maxMismatch}
                      onChange={(e) => handleParamChange("maxMismatch", parseInt(e.target.value) || 0)}
                      className="text-xs font-bold text-slate-700 h-9"
                    />
                  </div>

                  {/* Max Error Rate */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">最大错误率</span>
                    <Input 
                      type="number"
                      step="0.1"
                      value={params.maxError === undefined ? "" : params.maxError}
                      onChange={(e) => handleParamChange("maxError", parseFloat(e.target.value) || 0)}
                      className="text-xs font-bold text-slate-700 h-9"
                    />
                  </div>

                  {/* Range Limit bounds (minLen - maxLen) */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">长度范围</span>
                    <div className="flex items-center gap-1.5">
                      <Input 
                        type="number"
                        placeholder="Min"
                        value={params.minLen === undefined ? "" : params.minLen}
                        onChange={(e) => handleParamChange("minLen", parseInt(e.target.value) || 0)}
                        className="text-xs font-bold text-slate-700 h-9 px-1.5 text-center"
                      />
                      <span className="text-slate-300 font-mono text-xs">-</span>
                      <Input 
                        type="number"
                        placeholder="Max"
                        value={params.maxLen === undefined ? "" : params.maxLen}
                        onChange={(e) => handleParamChange("maxLen", parseInt(e.target.value) || 0)}
                        className="text-xs font-bold text-slate-700 h-9 px-1.5 text-center"
                      />
                    </div>
                  </div>

                  {/* Max N */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">模糊碱基</span>
                    <Input 
                      type="number"
                      value={params.maxN === undefined ? "" : params.maxN}
                      onChange={(e) => handleParamChange("maxN", parseInt(e.target.value) || 0)}
                      className="text-xs font-bold text-slate-700 h-9"
                    />
                  </div>

                  {/* Confidence相似度 */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">聚类相似度</span>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.97"
                      value={params.confidence === undefined ? "" : params.confidence}
                      onChange={(e) => handleParamChange("confidence", parseFloat(e.target.value) || 0.97)}
                      className="text-xs font-bold text-slate-700 h-9"
                    />
                  </div>

                </div>
              </Card>

              {/* 3. Diversity Configurations */}
              <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Layers className="w-4 h-4 text-[#02A1C8]" />
                  <span className="text-xs font-bold text-slate-800">多样性分析配置 (Alpha & Beta)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Alpha 指数</span>
                    <select
                      value={params.alphaIndex || "shannon"}
                      onChange={(e) => handleParamChange("alphaIndex", e.target.value)}
                      className="w-full text-xs h-9 bg-slate-50 border border-transparent rounded-lg px-2.5 outline-none font-bold tech-mono text-slate-700 focus:bg-white focus:border-slate-200"
                    >
                      <option value="shannon">SHANNON</option>
                      <option value="simpson">SIMPSON</option>
                      <option value="chao1">CHAO1</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">相异矩阵</span>
                    <select
                      value={params.distMatrix || "braycurtis"}
                      onChange={(e) => handleParamChange("distMatrix", e.target.value)}
                      className="w-full text-xs h-9 bg-slate-50 border border-transparent rounded-lg px-2.5 outline-none font-bold tech-mono text-slate-700 focus:bg-white focus:border-slate-200"
                    >
                      <option value="braycurtis">BRAYCURTIS</option>
                      <option value="jaccard">JACCARD</option>
                      <option value="unifrac">UNIFRAC</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* 4. LEfSe Differential Settings */}
              <Card className="border-none bg-white p-6 shadow-sm border border-slate-100 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                  <Filter className="w-4 h-4 text-[#02A1C8]" />
                  <span className="text-xs font-bold text-slate-800">差异分析参数 (LEfSe)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">分组列</span>
                    <Input 
                      placeholder="e.g. Group"
                      value={params.groupCol || ""}
                      onChange={(e) => handleParamChange("groupCol", e.target.value)}
                      className="text-xs font-bold tech-mono p-2 bg-slate-50/50 border-slate-100 h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">显著性阈值</span>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-medium text-slate-400">p &lt;</span>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.05"
                        value={params.pValue === undefined ? "" : params.pValue}
                        onChange={(e) => handleParamChange("pValue", parseFloat(e.target.value) || 0.05)}
                        className="text-xs font-bold tech-mono h-9 pl-9"
                      />
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          </section>

          {/* SECTION 3: Environment topologys & Task title setup */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#02A1C8] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#02A1C8]/20 font-mono">3</div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                运行环境与元信息
                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">

              {/* Task name configuration card */}
              <Card className="w-full border-none bg-white p-6 shadow-sm border border-slate-100 rounded-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <FileCheck className="w-3 h-3" />
                    任务名称 (Job Name)
                  </div>
                  <Input 
                    placeholder="输入新重试任务名称"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="text-sm font-black text-slate-850 tech-mono bg-slate-50/30 border-slate-200/50 h-10 w-full"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal mt-1">推荐附带时间戳或修订标识，以便在主控板精确检索对比运行指标状态。</p>
                </div>
              </Card>
            </div>
          </section>

          {/* Prompt banner & Final Action button row */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-[11px] leading-relaxed text-amber-700 flex gap-2 w-full mt-6">
            <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">重置启动校验：</span>新任务启动后将在后台进入 <span className="font-bold tech-mono">Running</span> 状态。我们为您预置了逼真且高性能的数据流日志生成器。点击右下角按钮或右上角的 “开始重试运行” 即可开始自动监控最新进展。
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="text-xs h-9 px-4 font-bold border-slate-200 bg-white"
            >
              取消
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs px-5 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              保存配置并重新启动
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
