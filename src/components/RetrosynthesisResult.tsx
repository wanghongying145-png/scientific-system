import React, { useState } from "react";
import { 
  ChevronLeft, 
  Download, 
  Layers, 
  FlaskConical, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Info,
  Sliders,
  Beaker,
  Database,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RouteDetail {
  id: string;
  name: string;        // Route scheme name, e.g. "经典乙酰化路线"
  label: string;       // Route identifier, e.g. "RS-Route-01"
  steps: number;       // Total reaction steps
  isSolved: boolean;   // Whether it is solved (是否已解)
  score: number;       // Feasibility score (可行性评分)
  description: string;
  catalyst: string;
  reactant1: {
    name: string;
    smiles: string;
    formula: string;
  };
  reactant2: {
    name: string;
    smiles: string;
    formula: string;
  };
  product: {
    name: string;
    smiles: string;
    formula: string;
  };
}

export function RetrosynthesisResult({ onBack, taskId = "RS-20260420-001" }: { onBack: () => void; taskId?: string }) {
  // Configured mock data based on exact image outline and design guidelines
  const routesData: RouteDetail[] = [
    { 
      id: "Route-1", 
      name: "经典乙酰化法 (Classic Acetylation)", 
      label: "RS-Route-01",
      steps: 1, 
      isSolved: true,
      score: 93.5, 
      description: "以水杨酸与乙酸酐为原料，常压催化在 70-80°C 进行一阶段酯化。副产物仅为乙酸，纯化回收极易，是当前主要的产业化路径。",
      catalyst: "无机酸催化 (浓 H₂SO₄), 70-80℃ 反应",
      reactant1: {
        name: "乙酸酐 (Acetic anhydride)",
        smiles: "CC(=O)OC(=O)C",
        formula: "C₄H₆O₃"
      },
      reactant2: {
        name: "水杨酸 (Salicylic acid)",
        smiles: "C₁=CC=C(C(=C1)O)C(=O)O",
        formula: "C₇H₆O₃"
      },
      product: {
        name: "阿司匹林 (Aspirin)",
        smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
        formula: "C₉H₈O₄"
      }
    },
    { 
      id: "Route-2", 
      name: "酰氯偶联法 (Acid Chloride Coupling)", 
      label: "RS-Route-02",
      steps: 1, 
      isSolved: true,
      score: 87.2, 
      description: "以水杨酸与乙酰氯为原料，配合有机碱（如三乙胺或吡啶）作为缚酸剂在室温下进行酯化反应。反应活性高反应速度极快。",
      catalyst: "碱性缚酸催化 (三乙胺 / 吡啶), r.t. (室温)",
      reactant1: {
        name: "乙酰氯 (Acetyl chloride)",
        smiles: "CC(=O)Cl",
        formula: "C₂H₃ClO"
      },
      reactant2: {
        name: "水杨酸 (Salicylic acid)",
        smiles: "C₁=CC=C(C(=C1)O)C(=O)O",
        formula: "C₇H₆O₃"
      },
      product: {
        name: "阿司匹林 (Aspirin)",
        smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
        formula: "C₉H₈O₄"
      }
    },
    { 
      id: "Route-3", 
      name: "直接催化脱水缩合法 (Direct Esterification)", 
      label: "RS-Route-03",
      steps: 1, 
      isSolved: true,
      score: 79.8, 
      description: "使用乙酸和水杨酸在催化缩合试剂 DCC 或 EDCI/DMAP 协助下进行直接分子间酯化脱水。反应条件极温和，设备要求低。",
      catalyst: "缩合偶联试剂 (DCC, DMAP), DCM 25℃",
      reactant1: {
        name: "乙酸 (Acetic acid)",
        smiles: "CC(=O)O",
        formula: "C₂H₄O₂"
      },
      reactant2: {
        name: "水杨酸 (Salicylic acid)",
        smiles: "C₁=CC=C(C(=C1)O)C(=O)O",
        formula: "C₇H₆O₃"
      },
      product: {
        name: "阿司匹林 (Aspirin)",
        smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
        formula: "C₉H₈O₄"
      }
    }
  ];

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const activeRoute = routesData.find(r => r.id === selectedRouteId) || null;

  // Render beautifully tailored chemical SVGs matching coordinates exactly
  const renderChemicalSvg = (routeId: string, nodeType: "reactant1" | "reactant2" | "product") => {
    if (routeId === "Route-1") {
      if (nodeType === "reactant1") {
        // 乙酸酐 Acetic Anhydride
        return (
          <svg viewBox="0 0 120 70" className="w-24 h-14 mx-auto">
            <path d="M 15,20 L 40,35 L 56,25" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 66,25 L 82,35 L 107,20" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 38,35 L 38,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <path d="M 42,35 L 42,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <path d="M 80,35 L 80,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <path d="M 84,35 L 84,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <text x="61" y="24" fill="#EF4444" fontSize="12" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">O</text>
            <text x="40" y="66" fill="#EF4444" fontSize="11" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">O</text>
            <text x="82" y="66" fill="#EF4444" fontSize="11" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">O</text>
          </svg>
        );
      } else if (nodeType === "reactant2") {
        // 水杨酸 Salicylic Acid
        return (
          <svg viewBox="0 0 120 90" className="w-24 h-18 mx-auto">
            <polygon points="45,25 65,36.5 65,60 45,71.5 25,60 25,36.5" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
            <line x1="45" y1="29" x2="61.5" y2="38.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="61.5" y1="58" x2="45" y2="67.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="28.5" y1="58" x2="28.5" y2="38.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="65" y1="36.5" x2="80" y2="28" stroke="#0F172A" strokeWidth="2" />
            <text x="88" y="27" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
            <line x1="65" y1="60" x2="82" y2="65" stroke="#0F172A" strokeWidth="2" />
            <line x1="81" y1="64" x2="90" y2="52" stroke="#EF4444" strokeWidth="2" />
            <line x1="84.5" y1="66" x2="93.5" y2="54" stroke="#EF4444" strokeWidth="2" />
            <text x="96" y="52" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="82" y1="65" x2="91" y2="78" stroke="#0F172A" strokeWidth="2" />
            <text x="93" y="83" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
          </svg>
        );
      } else {
        // 阿司匹林 Aspirin
        return (
          <svg viewBox="0 0 160 110" className="w-32 h-22 mx-auto">
            <polygon points="65,30 85,41.5 85,65 65,76.5 45,65 45,41.5" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
            <line x1="65" y1="34" x2="81.5" y2="43.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="81.5" y1="63" x2="65" y2="72.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="48.5" y1="63" x2="48.5" y2="43.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="45" y1="65" x2="30" y2="57" stroke="#0F172A" strokeWidth="2" />
            <text x="18" y="58" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="16" y1="62" x2="24" y2="72" stroke="#0F172A" strokeWidth="2" />
            <line x1="22" y1="71" x2="22" y2="85" stroke="#EF4444" strokeWidth="2" />
            <line x1="26" y1="71" x2="26" y2="85" stroke="#EF4444" strokeWidth="2" />
            <text x="20" y="96" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="24" y1="72" x2="10" y2="80" stroke="#0F172A" strokeWidth="2" />
            <line x1="85" y1="65" x2="102" y2="70" stroke="#0F172A" strokeWidth="2" />
            <line x1="101" y1="69" x2="110" y2="57" stroke="#EF4444" strokeWidth="2" />
            <line x1="104.5" y1="71" x2="113.5" y2="59" stroke="#EF4444" strokeWidth="2" />
            <text x="115" y="57" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="102" y1="70" x2="111" y2="83" stroke="#0F172A" strokeWidth="2" />
            <text x="113" y="88" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
          </svg>
        );
      }
    } else if (routeId === "Route-2") {
      if (nodeType === "reactant1") {
        // 乙酰氯 Acetyl chloride
        return (
          <svg viewBox="0 0 120 70" className="w-24 h-14 mx-auto">
            <path d="M 25,35 L 55,35 L 85,15" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 53,35 L 53,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <path d="M 57,35 L 57,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <text x="55" y="66" fill="#EF4444" fontSize="12" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">O</text>
            <text x="92" y="16" fill="#10B981" fontSize="12" fontWeight="extrabold" fontFamily="sans-serif">Cl</text>
          </svg>
        );
      } else if (nodeType === "reactant2") {
        // 水杨酸 Salicylic Acid
        return (
          <svg viewBox="0 0 120 90" className="w-24 h-18 mx-auto">
            <polygon points="45,25 65,36.5 65,60 45,71.5 25,60 25,36.5" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
            <line x1="45" y1="29" x2="61.5" y2="38.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="61.5" y1="58" x2="45" y2="67.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="28.5" y1="58" x2="28.5" y2="38.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="65" y1="36.5" x2="80" y2="28" stroke="#0F172A" strokeWidth="2" />
            <text x="88" y="27" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
            <line x1="65" y1="60" x2="82" y2="65" stroke="#0F172A" strokeWidth="2" />
            <line x1="81" y1="64" x2="90" y2="52" stroke="#EF4444" strokeWidth="2" />
            <line x1="84.5" y1="66" x2="93.5" y2="54" stroke="#EF4444" strokeWidth="2" />
            <text x="96" y="52" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="82" y1="65" x2="91" y2="78" stroke="#0F172A" strokeWidth="2" />
            <text x="93" y="83" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
          </svg>
        );
      } else {
        // 阿司匹林 Aspirin
        return (
          <svg viewBox="0 0 160 110" className="w-32 h-22 mx-auto">
            <polygon points="65,30 85,41.5 85,65 65,76.5 45,65 45,41.5" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
            <line x1="65" y1="34" x2="81.5" y2="43.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="81.5" y1="63" x2="65" y2="72.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="48.5" y1="63" x2="48.5" y2="43.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="45" y1="65" x2="30" y2="57" stroke="#0F172A" strokeWidth="2" />
            <text x="18" y="58" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="16" y1="62" x2="24" y2="72" stroke="#0F172A" strokeWidth="2" />
            <line x1="22" y1="71" x2="22" y2="85" stroke="#EF4444" strokeWidth="2" />
            <line x1="26" y1="71" x2="26" y2="85" stroke="#EF4444" strokeWidth="2" />
            <text x="20" y="96" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="24" y1="72" x2="10" y2="80" stroke="#0F172A" strokeWidth="2" />
            <line x1="85" y1="65" x2="102" y2="70" stroke="#0F172A" strokeWidth="2" />
            <line x1="101" y1="69" x2="110" y2="57" stroke="#EF4444" strokeWidth="2" />
            <line x1="104.5" y1="71" x2="113.5" y2="59" stroke="#EF4444" strokeWidth="2" />
            <text x="115" y="57" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="102" y1="70" x2="111" y2="83" stroke="#0F172A" strokeWidth="2" />
            <text x="113" y="88" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
          </svg>
        );
      }
    } else {
      if (nodeType === "reactant1") {
        // 乙酸 Acetic acid
        return (
          <svg viewBox="0 0 120 70" className="w-24 h-14 mx-auto">
            <path d="M 25,35 L 55,35 L 85,15" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 53,35 L 53,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <path d="M 57,35 L 57,55" fill="none" stroke="#EF4444" strokeWidth="2" />
            <text x="55" y="66" fill="#EF4444" fontSize="12" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">O</text>
            <text x="88" y="16" fill="#EF4444" fontSize="12" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
          </svg>
        );
      } else if (nodeType === "reactant2") {
        // 水杨酸 Salicylic Acid
        return (
          <svg viewBox="0 0 120 90" className="w-24 h-18 mx-auto">
            <polygon points="45,25 65,36.5 65,60 45,71.5 25,60 25,36.5" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
            <line x1="45" y1="29" x2="61.5" y2="38.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="61.5" y1="58" x2="45" y2="67.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="28.5" y1="58" x2="28.5" y2="38.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="65" y1="36.5" x2="80" y2="28" stroke="#0F172A" strokeWidth="2" />
            <text x="88" y="27" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
            <line x1="65" y1="60" x2="82" y2="65" stroke="#0F172A" strokeWidth="2" />
            <line x1="81" y1="64" x2="90" y2="52" stroke="#EF4444" strokeWidth="2" />
            <line x1="84.5" y1="66" x2="93.5" y2="54" stroke="#EF4444" strokeWidth="2" />
            <text x="96" y="52" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="82" y1="65" x2="91" y2="78" stroke="#0F172A" strokeWidth="2" />
            <text x="93" y="83" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
          </svg>
        );
      } else {
        // 阿司匹林 Aspirin
        return (
          <svg viewBox="0 0 160 110" className="w-32 h-22 mx-auto">
            <polygon points="65,30 85,41.5 85,65 65,76.5 45,65 45,41.5" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
            <line x1="65" y1="34" x2="81.5" y2="43.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="81.5" y1="63" x2="65" y2="72.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="48.5" y1="63" x2="48.5" y2="43.5" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="45" y1="65" x2="30" y2="57" stroke="#0F172A" strokeWidth="2" />
            <text x="18" y="58" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="16" y1="62" x2="24" y2="72" stroke="#0F172A" strokeWidth="2" />
            <line x1="22" y1="71" x2="22" y2="85" stroke="#EF4444" strokeWidth="2" />
            <line x1="26" y1="71" x2="26" y2="85" stroke="#EF4444" strokeWidth="2" />
            <text x="20" y="96" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="24" y1="72" x2="10" y2="80" stroke="#0F172A" strokeWidth="2" />
            <line x1="85" y1="65" x2="102" y2="70" stroke="#0F172A" strokeWidth="2" />
            <line x1="101" y1="69" x2="110" y2="57" stroke="#EF4444" strokeWidth="2" />
            <line x1="104.5" y1="71" x2="113.5" y2="59" stroke="#EF4444" strokeWidth="2" />
            <text x="115" y="57" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">O</text>
            <line x1="102" y1="70" x2="111" y2="83" stroke="#0F172A" strokeWidth="2" />
            <text x="113" y="88" fill="#EF4444" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">OH</text>
          </svg>
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] text-slate-800 font-sans">
      {/* Top Header matching core responsive UI principles */}
      <div className="bg-white border-b border-slate-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="flex items-center gap-1.5 text-slate-650 hover:text-slate-950 font-medium text-xs h-8 px-2.5 rounded-lg border border-slate-100 hover:border-slate-250 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
            返回模型中心
          </Button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <span className="text-slate-400 text-xs font-mono">任务分析报告 / 合成路线规划输出</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8.5 text-[11px] font-bold border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1 shadow-sm">
             <Download className="w-3.5 h-3.5" />
             下载报告
          </Button>
          <Button size="sm" className="h-8.5 text-[11px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 shadow-sm">
             导出 PDF 格式
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[1000px] mx-auto pb-40 space-y-8 text-left animate-in fade-in duration-300">
          
          {/* Output Mode Sub-Banner Description */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900">逆向合成与多路径规划完成</h2>
                <Badge className="bg-indigo-50 text-indigo-600 border-none text-[9.5px] font-black h-4.5 px-2">AI RETROSYNTHESIS SUCCESS</Badge>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                算法基于大规模真实化学反应反应库及专家决策树，针对靶分子提供 {routesData.length} 条兼顾前期原料采购可及性、步骤数和商业可行性的优质合成方案。
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-medium block">分析批次时间</span>
              <span className="text-xs font-bold font-mono text-slate-700">{new Date().toISOString().split('T')[0]} 14:15</span>
            </div>
          </div>

          {/* —— 1. 路线概览列表 (Synthesis Routes Overview) —— */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-4 bg-[#02A1C8]" />
              <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">路线概览列表</h3>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden bg-white rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-rose-50/10 text-slate-450">
                      <th className="px-6 py-3.5 text-[10.5px] font-black uppercase tracking-wider w-20">序号</th>
                      <th className="px-6 py-3.5 text-[10.5px] font-black uppercase tracking-wider">路线标识</th>
                      <th className="px-6 py-3.5 text-[10.5px] font-black uppercase tracking-wider w-32 text-center">总反应步骤数</th>
                      <th className="px-6 py-3.5 text-[10.5px] font-black uppercase tracking-wider w-24 text-center">是否已解</th>
                      <th className="px-6 py-3.5 text-[10.5px] font-black uppercase tracking-wider w-28 text-center">可行性评分</th>
                      <th className="px-6 py-3.5 text-right text-[10.5px] font-black uppercase tracking-wider w-24">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {routesData.map((route, idx) => {
                      const isActive = route.id === selectedRouteId;
                      return (
                        <tr 
                          key={route.id} 
                          className={cn(
                            "transition-colors duration-150 group",
                            isActive ? "bg-indigo-50/20" : "hover:bg-slate-50/55"
                          )}
                        >
                          {/* 序号 */}
                          <td className="px-6 py-4 font-mono">
                            <span className="text-[10.5px] font-black tracking-tight text-slate-505">
                              {idx + 1}
                            </span>
                          </td>
                          {/* 路线标识 */}
                          <td className="px-6 py-4 font-mono font-bold text-[#02A1C8]">
                            {route.label}
                          </td>
                          {/* 总反应步骤数 */}
                          <td className="px-6 py-4 text-center font-semibold text-slate-700">
                            {route.steps} 步
                          </td>
                          {/* 是否已解 */}
                          <td className="px-6 py-4 text-center">
                            {route.isSolved ? (
                              <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50/80 border-none font-bold text-[10px] space-x-1 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-2.5 h-2.5 inline-block text-emerald-600 mr-0.5" />
                                已解
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-450 border-none font-bold text-[10px] px-1.5 py-0.5 rounded">
                                未解
                              </Badge>
                            )}
                          </td>
                          {/* 可行性评分 */}
                          <td className="px-6 py-4 text-center font-mono font-bold text-indigo-650">
                            {route.score.toFixed(1)}
                          </td>
                          {/* 操作（查看详情） */}
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedRouteId(route.id)}
                              className={cn(
                                "h-7 text-[10.5px] font-bold rounded-md transition-all px-3",
                                isActive 
                                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" 
                                  : "text-indigo-600 border-indigo-200 hover:bg-indigo-50/40"
                              )}
                            >
                              详情
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* —— 2. 路线详情 (Route Details - Visible only after details selected) —— */}
          {activeRoute ? (
            <div className="space-y-4 pt-2 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-[3px] h-4 bg-indigo-650" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                    路线方案详情评估 ({activeRoute.label})
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs font-bold text-indigo-700 bg-indigo-50/50 border-none">
                  结构反应示意图及硬度分析
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column: 1-Step Schematic diagram strictly matching users design sample */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
                    <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">合成路线示意图</span>
                      <Badge variant="secondary" className="text-[10px] bg-indigo-50 border-none text-indigo-600 font-bold px-1.5 h-4.5">
                        一阶段协同反应 deconstruct
                      </Badge>
                    </div>
                    
                    {/* Schematic Flow Area */}
                    <div className="p-6 bg-slate-50/10 min-h-[340px] flex flex-col justify-center relative">
                      
                      <div className="w-full flex items-center justify-between gap-4 md:gap-8 max-w-3xl mx-auto">
                        
                        {/* Left Column (Reactants with emerald borders) */}
                        <div className="flex flex-col justify-between h-[254px]" style={{ width: "220px" }}>
                          {/* Reactant 1 Box */}
                          <div className="border border-emerald-500 bg-white hover:bg-emerald-50/10 transition-colors shadow-sm rounded-xl p-3 text-left flex flex-col justify-between h-[116px]">
                            <div>
                              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">原料一 Reactant 1</span>
                              <p className="text-[10.5px] font-extrabold text-slate-900 leading-tight truncate">
                                {activeRoute.reactant1.name}
                              </p>
                              <span className="text-[8.5px] font-mono text-slate-400 block truncate" style={{ direction: "rtl", textAlign: "left" }}>
                                {activeRoute.reactant1.smiles}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center justify-center p-1 overflow-hidden mt-1 border-t border-slate-50">
                              {renderChemicalSvg(activeRoute.id, "reactant1")}
                            </div>
                          </div>

                          {/* Reactant 2 Box */}
                          <div className="border border-emerald-500 bg-white hover:bg-emerald-50/10 transition-colors shadow-sm rounded-xl p-3 text-left flex flex-col justify-between h-[116px]">
                            <div>
                              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">原料二 Reactant 2</span>
                              <p className="text-[10.5px] font-extrabold text-slate-900 leading-tight truncate">
                                {activeRoute.reactant2.name}
                              </p>
                              <span className="text-[8.5px] font-mono text-slate-400 block truncate" style={{ direction: "rtl", textAlign: "left" }}>
                                {activeRoute.reactant2.smiles}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center justify-center p-1 overflow-hidden mt-1 border-t border-slate-50">
                              {renderChemicalSvg(activeRoute.id, "reactant2")}
                            </div>
                          </div>
                        </div>

                        {/* Middle Connection Gray Lines & Junction Black Dot */}
                        <div className="flex-1 relative h-[254px] flex items-center justify-center min-w-[50px]">
                          <svg className="w-full h-full" viewBox="0 0 100 200" preserveAspectRatio="none">
                            {/* Horizontal connect lines from boundaries */}
                            <path d="M 0,44 L 45,44" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            <path d="M 0,156 L 45,156" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            
                            {/* Vertical trunk line */}
                            <path d="M 45,44 L 45,156" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            
                            {/* Middle horizontal branch toward junction dot */}
                            <path d="M 45,100 L 70,100" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            {/* Branch continuing from junction dot to right card edge */}
                            <path d="M 70,100 L 100,100" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            
                            {/* Junction Central Solid Circle Dot corresponding to ● */}
                            <circle cx="70" cy="100" r="4.5" fill="#000000" />
                          </svg>
                          
                          {/* Floating Catalyst Conditions Pill */}
                          <div className="absolute top-[108px] left-[2%] right-[2%] text-center">
                            <span className="bg-slate-950 text-white font-mono text-[8px] sm:text-[9.5px] px-2 py-0.5 rounded shadow-sm inline-block font-semibold">
                              {activeRoute.catalyst}
                            </span>
                          </div>
                        </div>

                        {/* Right Column (Product with amber border) */}
                        <div className="border border-amber-500 bg-white hover:bg-amber-50/10 transition-colors shadow-sm rounded-xl p-3 text-left flex flex-col justify-between h-[254px]" style={{ width: "220px" }}>
                          <div>
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">目标产物 Product Target</span>
                            <h4 className="text-[10.5px] font-extrabold text-slate-900 leading-tight">
                              {activeRoute.product.name}
                            </h4>
                            <span className="text-[8.5px] font-mono text-slate-400 block truncate" style={{ direction: "rtl", textAlign: "left" }}>
                              {activeRoute.product.smiles}
                            </span>
                          </div>
                          
                          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden my-2 border-t border-slate-50">
                            {renderChemicalSvg(activeRoute.id, "product")}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                            <span>化学式</span>
                            <span className="font-bold text-slate-600">{activeRoute.product.formula}</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Column: 路线评估及其他指标 (Feasibility, Total Steps, Reaction Types) */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
                    <div className="p-4 bg-slate-50/60 border-b border-slate-100 text-left">
                      <span className="text-xs font-bold text-slate-700">路线评估综合指标</span>
                    </div>
                    
                    <div className="p-5 space-y-5 text-left">
                      
                      {/* 可行性评分 feasibility */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">可行性评分</span>
                          <span className="text-[#02A1C8] text-lg font-black font-mono tracking-tight">{activeRoute.score.toFixed(1)} <span className="text-[10px] text-slate-400 font-medium">/ 100</span></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#02A1C8] rounded-full transition-all duration-500" 
                            style={{ width: `${activeRoute.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      {/* 总反应步骤数 total steps */}
                      <div className="flex items-center justify-between py-1">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-500 font-medium block">总反应步骤数</span>
                        </div>
                        <div className="bg-indigo-50 text-indigo-700 font-bold px-4 py-1.5 rounded-xl border border-indigo-100 text-sm font-mono">
                          {activeRoute.steps} 步反应
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 py-16 text-center text-slate-400 text-xs shadow-sm flex flex-col items-center justify-center gap-2">
              <Layers className="w-6 h-6 text-slate-355" />
              <p className="font-medium">请在上方路线概览列表中点击 【详情】 按钮展开相应的可达路线示意图、催化技术条件和多维度极其精准评价。</p>
            </div>
          )}

        </div>
      </ScrollArea>

      {/* Sticky Bottom Actions */}
      <div className="bg-white border-t border-slate-100 px-8 py-3.5 flex items-center justify-between sticky bottom-0 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.032)] backdrop-blur-md bg-white/95">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center">
               <Database className="w-4 h-4 text-slate-500" />
            </div>
            <div>
               <p className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider text-left">原料可得性校验</p>
               <p className="text-[9.5px] text-slate-450 font-sans font-medium text-left">已覆盖全球 12 余家极速商业化化合物合规库存</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <Button 
              className="h-9 w-40 text-xs font-bold text-indigo-650 bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200 rounded-lg"
              onClick={onBack}
            >
              返回任务列表
            </Button>
            <Button 
              className="h-9 px-8 text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-md rounded-lg"
              onClick={onBack}
            >
              一键采购起始物料
            </Button>
         </div>
      </div>
    </div>
  );
}

