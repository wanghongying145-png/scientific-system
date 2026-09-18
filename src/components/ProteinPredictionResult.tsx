import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  Download, 
  RotateCcw, 
  Info, 
  Activity, 
  Layers, 
  Eye, 
  CheckCircle2, 
  Edit3, 
  Check, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  BarChart3,
  Grid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  CartesianGrid,
  Brush
} from "recharts";

// Helper for pLDDT Color Coding
function getPlddtColorInfo(plddt: number) {
  if (plddt >= 90) {
    return {
      level: "极高",
      levelEn: "Very High",
      color: "#1D4ED8", // Dark Blue
      bgClass: "bg-blue-700 text-white",
      textClass: "text-blue-700 font-bold",
      borderClass: "border-blue-700",
      badgeBg: "bg-blue-100 text-blue-800 border-blue-300"
    };
  } else if (plddt >= 70) {
    return {
      level: "可信",
      levelEn: "Confident",
      color: "#60A5FA", // Light Blue
      bgClass: "bg-blue-400 text-white",
      textClass: "text-blue-500 font-bold",
      borderClass: "border-blue-400",
      badgeBg: "bg-sky-100 text-sky-800 border-sky-300"
    };
  } else if (plddt >= 50) {
    return {
      level: "较低",
      levelEn: "Low",
      color: "#FACC15", // Yellow
      bgClass: "bg-amber-400 text-slate-900",
      textClass: "text-amber-600 font-bold",
      borderClass: "border-amber-400",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-300"
    };
  } else {
    return {
      level: "极低",
      levelEn: "Very Low",
      color: "#F97316", // Orange / Red
      bgClass: "bg-orange-500 text-white",
      textClass: "text-orange-600 font-bold",
      borderClass: "border-orange-500",
      badgeBg: "bg-orange-100 text-orange-800 border-orange-300"
    };
  }
}

// 126 Residues Mock Sequence Data
const AMINO_ACIDS = ["M","H","G","R","V","V","L","A","V","V","L","V","V","L","L","V","V","L","L","V","V","L","L","V","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","K","T","S","P","D","G","E","F","R","T","Y","W","A","K","L","P","Q","S","V","I","K","E","L","G","A","H","Y","I","V","L","D","S","E","N","A","T","F","K","L","E","G","F","S","D","R","Y","I","T","V","K","L","A","G","V","D","P","S","E","R","L","E","A","I","T","E","K","F","G","L","K","A","V","P","S","G","Q","R","I","L","G","E","L","S","T"];

// Sample candidate models data
const CANDIDATE_MODELS = [
  { rank: 1, name: "model_1", avgPlddt: 86.4, highConfRatio: "87.5%", lowConfRegions: "2个" },
  { rank: 2, name: "model_2", avgPlddt: 84.1, highConfRatio: "85%", lowConfRegions: "2个" },
  { rank: 3, name: "model_3", avgPlddt: 81.5, highConfRatio: "81.2%", lowConfRegions: "3个" },
  { rank: 4, name: "model_4", avgPlddt: 78.2, highConfRatio: "76.4%", lowConfRegions: "4个" },
  { rank: 5, name: "model_5", avgPlddt: 71.8, highConfRatio: "68.0%", lowConfRegions: "5个" },
];

export function ProteinPredictionResult({ onBack, taskId = "TASK_PP_2026032901" }: { onBack: () => void; taskId?: string }) {
  // Model selection state
  const [selectedModelName, setSelectedModelName] = useState("model_1");
  const [selectedChain, setSelectedChain] = useState("A");
  const selectedModel = useMemo(() => {
    return CANDIDATE_MODELS.find(m => m.name === selectedModelName) || CANDIDATE_MODELS[0];
  }, [selectedModelName]);

  // Color Mode state: pLDDT | 蛋白链 | 二级结构
  const [colorMode, setColorMode] = useState<"pLDDT" | "chain" | "secondary">("pLDDT");

  // Custom Region Names state & inline editing
  const [regionCustomNames, setRegionCustomNames] = useState<Record<string, string>>({
    reg_1: "区域1",
    reg_2: "区域2",
    reg_3: "区域3"
  });
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

  // Selected or hovered residue index (1-126)
  const [hoveredResidueIdx, setHoveredResidueIdx] = useState<number | null>(45); // LEU 45 default example
  const [focusedResidueIdx, setFocusedResidueIdx] = useState<number | null>(null);

  const [hoveredPaeCell, setHoveredPaeCell] = useState<{ r1: number; r2: number; val: number } | null>(null);

  // 3D Viewer camera tilt/rotation simulation
  const [rotation, setRotation] = useState({ x: 20, y: 35 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Collapsible Task Details
  const [showTaskInfo, setShowTaskInfo] = useState(false);

  // Generate sequence pLDDT data dynamically for the 126 residues based on selected model
  const sequenceData = useMemo(() => {
    const scaleFactor = selectedModel.avgPlddt / 86.4;
    return AMINO_ACIDS.map((aa, i) => {
      const pos = i + 1;
      let basePlddt = 85;
      let chain = "A";
      let secondary = "Helix"; // Helix, Sheet, Loop

      // Region 1: 1-42 (High)
      if (pos >= 1 && pos <= 42) {
        basePlddt = 92 + Math.sin(pos * 0.4) * 8;
        secondary = pos % 8 < 6 ? "Helix" : "Loop";
      } 
      // Region 2: 43-58 (Low)
      else if (pos >= 43 && pos <= 58) {
        basePlddt = 63 + Math.sin(pos * 0.8) * 18 - (pos === 45 ? 15 : 0);
        secondary = "Loop";
      } 
      // Region 3: 59-126 (High/Medium)
      else {
        basePlddt = 84 + Math.cos(pos * 0.3) * 10;
        secondary = pos % 12 < 8 ? "Sheet" : "Loop";
      }

      let plddt = Math.round(basePlddt * scaleFactor * 10) / 10;
      plddt = Math.min(100, Math.max(20, plddt));

      // Region ID
      let regionId = "reg_3";
      if (pos <= 42) regionId = "reg_1";
      else if (pos <= 58) regionId = "reg_2";

      const customName = regionCustomNames[regionId] || (regionId === "reg_1" ? "区域1" : regionId === "reg_2" ? "区域2" : "区域3");

      return {
        pos,
        aa,
        label: `${aa}${pos}`,
        plddt,
        chain,
        secondary,
        regionName: customName,
        regionId
      };
    });
  }, [selectedModel, regionCustomNames]);

  // Dynamic regions calculation based on sequenceData
  const regions = useMemo(() => {
    const regionDefs = [
      { id: "reg_1", defaultName: "区域1", range: "1–42", start: 1, end: 42, length: 42 },
      { id: "reg_2", defaultName: "区域2", range: "43–58", start: 43, end: 58, length: 16 },
      { id: "reg_3", defaultName: "区域3", range: "59–126", start: 59, end: 126, length: 68 },
    ];

    return regionDefs.map(r => {
      const subSeq = sequenceData.slice(r.start - 1, r.end);
      const avgNum = subSeq.reduce((acc, c) => acc + c.plddt, 0) / subSeq.length;
      const avgPlddt = avgNum.toFixed(1);
      const minPlddt = Math.min(...subSeq.map(c => c.plddt)).toFixed(1);
      const ge70Count = subSeq.filter(c => c.plddt >= 70).length;
      const plddt70Ratio = ((ge70Count / subSeq.length) * 100).toFixed(1) + "%";

      let level = "可信";
      if (avgNum >= 90) level = "极高";
      else if (avgNum >= 70) level = "可信";
      else if (avgNum >= 50) level = "较低";
      else level = "极低";

      const customName = regionCustomNames[r.id] || r.defaultName;

      return {
        ...r,
        customName,
        avgPlddt: parseFloat(avgPlddt),
        minPlddt: parseFloat(minPlddt),
        plddt70Ratio,
        level
      };
    });
  }, [sequenceData, regionCustomNames]);

  // Derived metrics based on sequence data & selected model
  const metrics = useMemo(() => {
    const total = sequenceData.length;
    const highCount = sequenceData.filter(d => d.plddt >= 70).length;
    const highRatio = ((highCount / total) * 100).toFixed(1) + "%";

    return {
      avgPlddt: selectedModel.avgPlddt.toFixed(1),
      highCount,
      totalCount: total,
      highRatio,
      lowRegionsCount: regions.filter(r => r.level === "较低" || r.level === "极低").length
    };
  }, [sequenceData, selectedModel, regions]);

  // PAE Matrix data scaled according to selected model confidence
  const paeMatrixResidue = useMemo(() => {
    const matrix = [];
    const step = 6; // Sampling 20 residues
    const paeScale = 86.4 / selectedModel.avgPlddt;
    for (let r1 = 1; r1 <= 126; r1 += step) {
      const row = [];
      for (let r2 = 1; r2 <= 126; r2 += step) {
        let distance = Math.abs(r1 - r2);
        let pae = (2 + (distance * 0.18) + (Math.sin(r1 + r2) * 2)) * paeScale;
        // Inter-domain region (e.g. 43-58 vs 1-42) has higher PAE
        if ((r1 >= 43 && r1 <= 58) !== (r2 >= 43 && r2 <= 58)) {
          pae += 8 * paeScale;
        }
        pae = Math.min(30, Math.max(0.5, Math.round(pae * 10) / 10));
        row.push({ r1, r2, pae });
      }
      matrix.push(row);
    }
    return matrix;
  }, [selectedModel]);

  const paeMatrixDomain = useMemo(() => {
    const paeScale = 86.4 / selectedModel.avgPlddt;
    const r1Name = regionCustomNames["reg_1"] || "区域1";
    const r2Name = regionCustomNames["reg_2"] || "区域2";
    const r3Name = regionCustomNames["reg_3"] || "区域3";
    return [
      [ { r1: r1Name, r2: r1Name, pae: Math.round(2.1 * paeScale * 10) / 10 }, { r1: r1Name, r2: r2Name, pae: Math.round(14.2 * paeScale * 10) / 10 }, { r1: r1Name, r2: r3Name, pae: Math.round(5.6 * paeScale * 10) / 10 } ],
      [ { r1: r2Name, r2: r1Name, pae: Math.round(14.2 * paeScale * 10) / 10 }, { r1: r2Name, r2: r2Name, pae: Math.round(6.8 * paeScale * 10) / 10 }, { r1: r2Name, r2: r3Name, pae: Math.round(18.5 * paeScale * 10) / 10 } ],
      [ { r1: r3Name, r2: r1Name, pae: Math.round(5.6 * paeScale * 10) / 10 }, { r1: r3Name, r2: r2Name, pae: Math.round(18.5 * paeScale * 10) / 10 }, { r1: r3Name, r2: r3Name, pae: Math.round(3.2 * paeScale * 10) / 10 } ]
    ];
  }, [selectedModel, regionCustomNames]);

  // Handle region selection
  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    const targetRegion = regions.find(r => r.id === regionId);
    if (targetRegion) {
      setHoveredResidueIdx(targetRegion.start + Math.floor(targetRegion.length / 2));
      setFocusedResidueIdx(targetRegion.start);
      // Automatically position, rotate and zoom 3D structure
      setRotation({ x: 30, y: 75 });
      setZoomLevel(1.35);
    }
  };

  // Inline editing region name
  const handleStartRename = (regId: string, currentName: string) => {
    setEditingRegionId(regId);
    setEditingNameValue(currentName);
  };

  const handleSaveRename = (regId: string) => {
    if (editingNameValue.trim()) {
      setRegionCustomNames(prev => ({ ...prev, [regId]: editingNameValue.trim() }));
    }
    setEditingRegionId(null);
  };

  // Active highlighted residue information
  const currentResidueData = sequenceData[(hoveredResidueIdx || 45) - 1] || sequenceData[0];
  const activeColorInfo = getPlddtColorInfo(currentResidueData.plddt);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] text-slate-800">
      {/* Sticky Header */}
      <div className="bg-white border-b px-6 py-3.5 flex flex-wrap items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100 h-8 w-8">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">任务详情: {taskId}</h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                已完成
              </Badge>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                AlphaFold2 / ESMFold
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">蛋白质结构预测与置信度多维度评估系统</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTaskInfo(!showTaskInfo)}
            className="h-8 text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Info className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            {showTaskInfo ? "收起任务信息" : "任务配置参数"}
            {showTaskInfo ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>

          <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50">
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            导出 PDB 结构
          </Button>

          <Button size="sm" className="h-8 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            重新提交预测
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-[1360px] mx-auto space-y-6">

          {/* Compressed Task Info Bar (Collapsible) */}
          {showTaskInfo && (
            <Card className="border border-slate-200 bg-white shadow-xs animate-in fade-in duration-200">
              <CardHeader className="py-2.5 px-4 bg-slate-50/80 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  预测任务元数据与参数
                </CardTitle>
                <span className="text-[10px] text-slate-400 font-mono">ID: {taskId}</span>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">任务名称:</span>
                  <span className="font-semibold text-slate-800 truncate block">Spike_Protein_RBD_Variant</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">上传时间:</span>
                  <span className="font-medium text-slate-700 font-mono">2026-03-29 12:14:41</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">预测模型/版本:</span>
                  <span className="font-medium text-indigo-600 font-mono">AlphaFold2 v2.3.1</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">序列总长度:</span>
                  <span className="font-medium text-slate-800 font-mono">126 残基 (aa)</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 1: 基础信息 (Basic Info Section) */}
          <Card className="border border-slate-200/80 bg-white shadow-2xs rounded-xl overflow-hidden">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/60">
              <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">基础信息</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 font-medium shrink-0 w-24">任务名称:</span>
                  <span className="font-semibold text-slate-800">蛋白质结构预测模型-20260724-1359</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 font-medium shrink-0 w-24">模型名称:</span>
                  <span className="font-semibold text-slate-800">蛋白质结构预测模型</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 font-medium shrink-0 w-24">创建时间:</span>
                  <span className="font-medium text-slate-700 font-mono">2026-07-24 13:59:54</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 font-medium shrink-0 w-24">序列输入类型:</span>
                  <span className="font-medium text-slate-800">单序列 (含序列标识)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 font-medium shrink-0 w-24">输入方式:</span>
                  <span className="font-medium text-slate-800">文本输入</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 font-medium shrink-0 w-24">生成结构数量:</span>
                  <span className="font-medium text-slate-800 font-mono">1</span>
                </div>
              </div>

              {/* 输入内容 Sequence box */}
              <div className="space-y-1.5 pt-1">
                <span className="text-slate-500 font-medium block">输入内容:</span>
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 font-mono text-[11px] text-slate-700 break-all leading-relaxed select-all">
                  GWSTELEKHREELKEFLKKEGITNVEIRIDNGRLEVRVEGGTERLKRFLEELRQKLERKGTYVDIKIE
                </div>
              </div>

              {/* 预览选择 & 结构文件 Dropdown */}
              <div className="pt-2 border-t border-slate-100">
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>预览选择</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">结构文件</span>
                    <select
                      value={selectedModelName}
                      onChange={(e) => setSelectedModelName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                    >
                      {CANDIDATE_MODELS.map((m) => (
                        <option key={m.name} value={m.name}>
                          ranked_{m.rank - 1}.pdb ({m.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: 候选模型对比与数据导出 (Candidate Models Comparison & Data Export) */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-800">二、候选模型对比与数据导出 (Candidate Models & Downloads)</CardTitle>
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                共生成 5 个候选结构
              </Badge>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              
              {/* Chain Selection bar */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    链的选择 (Chain Selection):
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer min-w-[140px]"
                    >
                      <option value="A">A 链 (Chain A)</option>
                      <option value="B">B 链 (Chain B)</option>
                      <option value="ALL">全部链 (All Chains)</option>
                    </select>
                    <Badge variant="outline" className="text-[10px] bg-indigo-50/80 text-indigo-700 border-indigo-200 font-normal">
                      已选择: {selectedChain === "ALL" ? "全部链 (A, B)" : `${selectedChain} 链`}
                    </Badge>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  根据上传序列匹配的多肽链列表
                </span>
              </div>

              {/* Candidate Models Comparison Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>候选模型对比表 (Candidate Model Ranking)</span>
                  <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    💡 点击“查看”可加载并实时联动切换下方 3D 结构、逐残基 pLDDT、区域表与 PAE 热图
                  </span>
                </h3>

                <div className="border rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b text-slate-600 font-semibold text-[11px]">
                        <th className="py-2.5 px-4 w-16">排名</th>
                        <th className="py-2.5 px-4 font-mono">模型</th>
                        <th className="py-2.5 px-4 font-mono">平均 pLDDT</th>
                        <th className="py-2.5 px-4 font-mono">高可信残基占比</th>
                        <th className="py-2.5 px-4 font-mono">低可信区域</th>
                        <th className="py-2.5 px-4 text-right w-24">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CANDIDATE_MODELS.map((model) => {
                        const isCurrent = model.name === selectedModelName;
                        return (
                          <tr 
                            key={model.name}
                            className={cn(
                              "transition-colors",
                              isCurrent ? "bg-indigo-50/70 font-medium" : "hover:bg-slate-50"
                            )}
                          >
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                              {model.rank}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                              {model.name}
                              {isCurrent && <span className="ml-2 text-[10px] text-indigo-600 font-normal">(当前已加载)</span>}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{model.avgPlddt}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-700">{model.highConfRatio}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-700">{model.lowConfRegions}</td>
                            <td className="py-2.5 px-4 text-right">
                              <Button 
                                size="sm"
                                variant={isCurrent ? "default" : "outline"}
                                onClick={() => setSelectedModelName(model.name)}
                                className={cn(
                                  "h-7 text-[11px] px-3 font-bold transition-all cursor-pointer",
                                  isCurrent ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs" : "hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                                )}
                              >
                                {isCurrent ? "已加载" : "查看"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Downloads Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">结果数据与分析报告下载 (Downloads)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="h-11 justify-start border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium">
                    <FileCode2 className="w-4 h-4 mr-2 text-indigo-600" />
                    <div className="text-left">
                      <span className="block font-bold">PDB / mmCIF 文件</span>
                      <span className="text-[10px] text-slate-400">三维原子坐标结构数据 ({selectedModel.name})</span>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-11 justify-start border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium">
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                    <div className="text-left">
                      <span className="block font-bold">置信度 JSON 数据</span>
                      <span className="text-[10px] text-slate-400">含 126 残基 pLDDT 评分</span>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-11 justify-start border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium">
                    <Grid className="w-4 h-4 mr-2 text-sky-600" />
                    <div className="text-left">
                      <span className="block font-bold">PAE 相对误差矩阵</span>
                      <span className="text-[10px] text-slate-400">PAE二维距离矩阵（.json）</span>
                    </div>
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Section 3: 三维结构展示区 (3D Structure Display) */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-800">三、三维结构展示 (3D Molecular Viewer)</CardTitle>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold">
                  当前模型: {selectedModel.name} (平均 pLDDT: {selectedModel.avgPlddt})
                </Badge>
              </div>

              {/* Color Mode Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">着色模式:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                  <button 
                    onClick={() => setColorMode("pLDDT")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all text-xs font-semibold cursor-pointer",
                      colorMode === "pLDDT" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    pLDDT 置信度
                  </button>
                  <button 
                    onClick={() => setColorMode("chain")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all text-xs font-semibold cursor-pointer",
                      colorMode === "chain" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    蛋白链 (Chain)
                  </button>
                  <button 
                    onClick={() => setColorMode("secondary")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all text-xs font-semibold cursor-pointer",
                      colorMode === "secondary" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    二级结构
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 relative min-h-[440px] bg-[#0F172A] flex flex-col md:flex-row overflow-hidden">
              
              {/* 3D Canvas / Ribbon simulation viewport */}
              <div className="flex-1 relative flex items-center justify-center p-6 min-h-[400px]">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>

                {/* 3D Simulated Ribbon Graphics */}
                <div 
                  className="relative transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
                  style={{ 
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoomLevel})`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <svg width="420" height="320" viewBox="0 0 420 320" className="overflow-visible drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]">
                    <defs>
                      <linearGradient id="plddtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1D4ED8" />   {/* Very High */}
                        <stop offset="35%" stopColor="#60A5FA" />  {/* High */}
                        <stop offset="55%" stopColor="#FACC15" />  {/* Yellow/Low */}
                        <stop offset="70%" stopColor="#F97316" />  {/* Orange/Very Low */}
                        <stop offset="100%" stopColor="#1D4ED8" /> {/* High */}
                      </linearGradient>

                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Ribbon Backbone Path 1 */}
                    <path 
                      d="M 40,240 C 90,80 140,280 210,140 C 260,30 320,220 380,110" 
                      fill="none" 
                      stroke={
                        colorMode === "pLDDT" ? "url(#plddtGrad)" :
                        colorMode === "chain" ? "#6366F1" : "#EC4899"
                      }
                      strokeWidth="14" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />

                    {/* Secondary Helix Overlays */}
                    <path 
                      d="M 40,240 Q 65,160 90,80 Q 115,180 140,280" 
                      fill="none" 
                      stroke="#1D4ED8" 
                      strokeWidth="10" 
                      opacity={colorMode === "pLDDT" ? "0.9" : "0.3"}
                    />

                    {/* Low Confidence Region Highlight Loop (Residues 43-58) */}
                    <g className="group cursor-pointer" onClick={() => handleSelectRegion("reg_2")}>
                      <path 
                        d="M 210,140 C 225,90 240,70 260,30" 
                        fill="none" 
                        stroke="#FACC15" 
                        strokeWidth={activeRegionId === "reg_2" ? "20" : "16"} 
                        strokeDasharray={activeRegionId === "reg_2" ? "6 2" : "none"}
                        filter={activeRegionId === "reg_2" ? "url(#glow)" : undefined}
                      />
                      {/* Pulse Indicator on Low Confidence Focus */}
                      <circle cx="235" cy="85" r="14" fill="#F97316" opacity="0.3" className="animate-ping" />
                      <circle cx="235" cy="85" r="6" fill="#FACC15" stroke="#FFFFFF" strokeWidth="2" />
                      
                      <text x="248" y="80" fill="#FACC15" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                        低可信区 (43–58)
                      </text>
                    </g>

                    {/* Interactive Residue Nodes */}
                    {sequenceData.filter((_, idx) => idx % 10 === 0).map((res) => {
                      const colorInfo = getPlddtColorInfo(res.plddt);
                      const isHovered = hoveredResidueIdx === res.pos;
                      return (
                        <g 
                          key={res.pos} 
                          className="cursor-pointer transition-transform hover:scale-125"
                          onClick={() => setHoveredResidueIdx(res.pos)}
                        >
                          <circle 
                            cx={50 + res.pos * 2.7} 
                            cy={150 + Math.sin(res.pos * 0.2) * 60} 
                            r={isHovered ? "8" : "5"} 
                            fill={colorMode === "pLDDT" ? colorInfo.color : "#38BDF8"} 
                            stroke="#FFFFFF" 
                            strokeWidth={isHovered ? "2.5" : "1"} 
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Left Top: Color Mode Legend */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 text-white text-[11px] shadow-lg max-w-[200px]">
                  <p className="font-bold text-slate-300 mb-2 text-[10px] uppercase tracking-wider">
                    {colorMode === "pLDDT" && "pLDDT 置信度色阶"}
                    {colorMode === "chain" && "蛋白链图例"}
                    {colorMode === "secondary" && "二级结构图例"}
                  </p>
                  
                  {colorMode === "pLDDT" && (
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]"></span>
                          90 – 100
                        </span>
                        <span className="text-blue-300 font-bold">极高 (Very High)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]"></span>
                          70 – 90
                        </span>
                        <span className="text-sky-300 font-bold">可信 (Confident)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]"></span>
                          50 – 70
                        </span>
                        <span className="text-amber-300 font-bold">较低 (Low)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
                          &lt; 50
                        </span>
                        <span className="text-orange-300 font-bold">极低 (Very Low)</span>
                      </div>
                    </div>
                  )}

                  {colorMode === "chain" && (
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Chain A (126 aa)</div>
                    </div>
                  )}

                  {colorMode === "secondary" && (
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Alpha Helix (α-螺旋)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Beta Sheet (β-折叠)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Coil / Loop (无规卷曲)</div>
                    </div>
                  )}
                </div>

                {/* Right Top Viewport Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700"
                    title="放大 3D 结构"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700"
                    title="缩小 3D 结构"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={() => { setRotation({ x: 20, y: 35 }); setZoomLevel(1); setActiveRegionId(null); }}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700"
                    title="复位视角"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Low confidence quick navigation banner */}
                <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-amber-500/40 rounded-xl px-3 py-2 text-white text-xs flex items-center gap-3">
                  <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                    <Info className="w-3.5 h-3.5" />
                    低可信区域提醒:
                  </span>
                  <span className="text-slate-300 text-[11px]">区域2 (残基 43–58) 平均 pLDDT 为 61.7</span>
                  <button 
                    onClick={() => handleSelectRegion("reg_2")}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    定位并高亮
                  </button>
                </div>

              </div>

              {/* Hovered / Selected Residue Info Panel (Floating / Sidebar on 3D view) */}
              <div className="w-full md:w-72 bg-slate-900/90 border-t md:border-t-0 md:border-l border-slate-800 p-5 text-white flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      当前选中残基详情
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] border-none font-bold", activeColorInfo.bgClass)}>
                      {activeColorInfo.level}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">残基 (Residue):</span>
                      <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2 py-0.5 rounded">
                        {currentResidueData.aa} {currentResidueData.pos}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">所属蛋白链:</span>
                      <span className="font-mono text-indigo-300 font-semibold">链 {currentResidueData.chain}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">pLDDT 得分:</span>
                      <span className="font-mono font-bold text-base" style={{ color: activeColorInfo.color }}>
                        {currentResidueData.plddt}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">所在结构区域:</span>
                      <span className="font-semibold text-slate-200">
                        {currentResidueData.regionName} ({regions.find(r=>r.id === currentResidueData.regionId)?.range || "1-126"})
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">可信等级:</span>
                      <span className="font-bold" style={{ color: activeColorInfo.color }}>
                        {activeColorInfo.level} ({activeColorInfo.levelEn})
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">二级结构:</span>
                      <span className="text-slate-300 font-medium">{currentResidueData.secondary}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  提示: 可在下方折线图中滑过/点击任意残基，3D视图与面板将自动同步联动。
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Section 3: 逐残基 pLDDT 区 (Sequence Confidence Bar & Line Chart) */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-800">三、逐残基 pLDDT 分析区 (Residue-level Confidence & Chart)</CardTitle>
              </div>
              <span className="text-[11px] text-slate-500">包含 50 / 70 / 90 阈值参考线，支持长序列区间拖动与双向联动</span>
            </CardHeader>

            <CardContent className="p-6 space-y-6">

              {/* pLDDT 折线图 (pLDDT Line Chart with 50, 70, 90 Reference Lines) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>pLDDT 连续分布折线图 (pLDDT Curve)</span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-700"></span> 90 (极高)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-400"></span> 70 (可信)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-amber-400"></span> 50 (较低)</span>
                  </div>
                </div>

                <div className="h-[260px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart 
                      data={sequenceData} 
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                      onMouseMove={(state) => {
                        if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                          setHoveredResidueIdx(Number(state.activeTooltipIndex) + 1);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="pos" 
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickFormatter={(val) => `${val}`}
                        label={{ value: '残基位置 (Residue Index)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94A3B8' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        ticks={[0, 25, 50, 70, 90, 100]}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        label={{ value: 'pLDDT 得分', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94A3B8' }}
                      />

                      {/* Threshold Reference Lines: 90, 70, 50 */}
                      <ReferenceLine y={90} stroke="#1D4ED8" strokeDasharray="4 4" label={{ value: '90 极高可信', fill: '#1D4ED8', fontSize: 10, position: 'right' }} />
                      <ReferenceLine y={70} stroke="#60A5FA" strokeDasharray="4 4" label={{ value: '70 可信', fill: '#3B82F6', fontSize: 10, position: 'right' }} />
                      <ReferenceLine y={50} stroke="#FACC15" strokeDasharray="4 4" label={{ value: '50 较低可信', fill: '#D97706', fontSize: 10, position: 'right' }} />

                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const cInfo = getPlddtColorInfo(data.plddt);
                            return (
                              <div className="bg-slate-900/95 text-white p-2.5 rounded-lg text-xs shadow-xl border border-slate-700 space-y-1">
                                <p className="font-bold text-indigo-300">残基: {data.aa} {data.pos}</p>
                                <p>pLDDT: <span className="font-mono font-bold" style={{ color: cInfo.color }}>{data.plddt}</span> ({cInfo.level})</p>
                                <p className="text-[10px] text-slate-400">区域: {data.regionName}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Line 
                        type="monotone" 
                        dataKey="plddt" 
                        stroke="#2563EB" 
                        strokeWidth={2.5} 
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          const isHovered = hoveredResidueIdx === payload.pos;
                          const cInfo = getPlddtColorInfo(payload.plddt);
                          return (
                            <circle 
                              key={payload.pos} 
                              cx={cx} 
                              cy={cy} 
                              r={isHovered ? 6 : 2} 
                              fill={cInfo.color} 
                              stroke="#FFFFFF" 
                              strokeWidth={isHovered ? 2 : 0} 
                            />
                          );
                        }}
                        activeDot={{ r: 7, strokeWidth: 2, fill: '#1D4ED8' }}
                      />

                      {/* Range slider for zooming long sequences */}
                      <Brush dataKey="pos" height={22} stroke="#94A3B8" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Section 4: 区域可信度表 (Region Confidence Table) */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-800">四、区域可信度表 (Region Confidence Table)</CardTitle>
              </div>
              <span className="text-[11px] text-slate-500">点击整行可同步选中 3D 结构与图线，点击名称可直接修改区域别名</span>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b text-slate-600 font-semibold text-[11px]">
                      <th className="py-3 px-4">区域名称</th>
                      <th className="py-3 px-4 font-mono">残基范围</th>
                      <th className="py-3 px-4 font-mono">长度 (aa)</th>
                      <th className="py-3 px-4 font-mono">平均 pLDDT</th>
                      <th className="py-3 px-4 font-mono">最低值</th>
                      <th className="py-3 px-4 font-mono">≥70 占比</th>
                      <th className="py-3 px-4">可信等级</th>
                      <th className="py-3 px-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regions.map((reg) => {
                      const isSelected = activeRegionId === reg.id;
                      const isEditing = editingRegionId === reg.id;

                      return (
                        <tr 
                          key={reg.id} 
                          onClick={() => handleSelectRegion(reg.id)}
                          className={cn(
                            "transition-colors cursor-pointer hover:bg-indigo-50/40",
                            isSelected ? "bg-indigo-50/80 font-medium" : ""
                          )}
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900" onClick={(e) => e.stopPropagation()}>
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input 
                                  type="text" 
                                  value={editingNameValue}
                                  onChange={(e) => setEditingNameValue(e.target.value)}
                                  className="border rounded px-2 py-1 text-xs bg-white text-slate-800 w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  placeholder="如: 结合位点"
                                  autoFocus
                                />
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={() => handleSaveRename(reg.id)}>
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400" onClick={() => setEditingRegionId(null)}>
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group">
                                <span>{reg.customName}</span>
                                <button 
                                  onClick={() => handleStartRename(reg.id, reg.customName)}
                                  className="text-slate-400 hover:text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity p-0.5"
                                  title="修改区域名称 (如: 结合位点/跨膜区)"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">{reg.range}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">{reg.length}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{reg.avgPlddt}</td>
                          <td className="py-3 px-4 font-mono text-amber-600 font-semibold">{reg.minPlddt}</td>
                          <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">{reg.plddt70Ratio}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={cn("text-[10px] font-bold", 
                              reg.level === "极高" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              reg.level === "可信" ? "bg-sky-50 text-sky-700 border-sky-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                              {reg.level}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              size="sm" 
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => handleSelectRegion(reg.id)}
                              className="h-7 text-[11px] px-2.5 font-medium"
                            >
                              {isSelected ? "已选中" : "高亮查看"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: PAE 热图区 (Predicted Aligned Error Heatmap) */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-800">五、PAE 相对位置可信度热图 (PAE Heatmap)</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Mandatory Page Notice Hint */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>专业说明：</strong> PAE (Predicted Aligned Error) 衡量两个区域相对位置的不确定性，不代表单个残基本身的结构质量。PAE 值越低 (颜色越深)，相对位置可信度越高。
                </p>
              </div>

              {/* PAE Heatmap Grid */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-center pt-2">
                
                {/* Heatmap Graphic Container */}
                <div className="relative p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="grid grid-cols-20 gap-0.5 w-[320px] h-[320px]">
                    {paeMatrixResidue.flatMap((row, ri) => 
                      row.map((cell, ci) => {
                        // Color mapping: 0-5 (Dark Green/Blue), 5-15 (Cyan/Yellow), 15+ (Orange/Red)
                        let bgHex = "#064E3B"; // low PAE
                        if (cell.pae > 18) bgHex = "#9A3412";
                        else if (cell.pae > 12) bgHex = "#D97706";
                        else if (cell.pae > 6) bgHex = "#0284C7";

                        return (
                          <div 
                            key={`${ri}-${ci}`}
                            onMouseEnter={() => setHoveredPaeCell({ r1: cell.r1, r2: cell.r2, val: cell.pae })}
                            className="w-full h-full rounded-xs transition-transform hover:scale-125 cursor-pointer"
                            style={{ backgroundColor: bgHex }}
                            title={`残基 ${cell.r1} vs 残基 ${cell.r2} | PAE: ${cell.pae} Å`}
                          />
                        );
                      })
                    )}
                  </div>

                  {/* Axis Labels */}
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 -rotate-90">
                    Scored Residue Index
                  </div>
                  <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400">
                    Aligned Residue Index
                  </div>
                </div>

                {/* Heatmap Legend & Tooltip Panel */}
                <div className="w-full md:w-64 space-y-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                      PAE 误差标尺 (Å)
                    </span>

                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-[#064E3B] via-[#0284C7] to-[#9A3412]" />

                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>0 Å (极好)</span>
                      <span>15 Å</span>
                      <span>30 Å (误差大)</span>
                    </div>
                  </div>

                  {/* Hover Cell Display */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      矩阵交互探针
                    </span>
                    {hoveredPaeCell ? (
                      <div className="space-y-1">
                        <p className="text-xs">残基 A: <span className="font-mono text-indigo-300 font-bold">{hoveredPaeCell.r1}</span></p>
                        <p className="text-xs">残基 B: <span className="font-mono text-indigo-300 font-bold">{hoveredPaeCell.r2}</span></p>
                        <p className="text-sm font-bold text-emerald-400">
                          PAE 相对误差: <span className="font-mono">{hoveredPaeCell.val} Å</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px] italic">
                        悬停热图矩阵单元格可即时查看两残基之间的相对 PAE 误差。
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
}
