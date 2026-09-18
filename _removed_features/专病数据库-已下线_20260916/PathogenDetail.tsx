import React from "react";
import { 
  ChevronLeft, 
  Share2, 
  Download, 
  ExternalLink, 
  Info, 
  Activity, 
  Dna, 
  CheckCircle2,
  Stethoscope,
  Syringe,
  Microscope,
  Baby,
  ActivitySquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PathogenDetailProps {
  pathogen?: any;
  onBack: () => void;
}

export function PathogenDetail({ pathogen, onBack }: PathogenDetailProps) {
  // Transform incoming pathogen to match the detailed structure
  const transformPathogen = (p: any) => {
    if (!p) return null;
    
    // If it's already in the detailed format (contains basicInfo and taxonomy), return
    if (p.basicInfo && p.taxonomy) return p;

    const tax = p.taxonomy || {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "厚壁菌门 (Firmicutes)",
      class: "梭菌纲 (Clostridia)",
      order: "梭菌目 (Clostridiales)",
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      species: p.name || "Clostridium innocuum (无害梭菌)"
    };

    return {
      id: p.id || `PAT-${p.ncbiTaxId || p.taxid || '000'}`,
      name: p.name || "无害梭菌",
      englishName: p.englishName || p.latinName || "Clostridium innocuum",
      type: p.type || "细菌",
      tags: [p.type, ...(p.bsl ? [p.bsl] : []), ...(p.isKey ? ["重点病原体"] : []), ...(p.alias || [])].filter(Boolean),
      taxId: p.ncbiTaxId || p.taxid || "29388",
      genBank: p.refSeqId || "NC_018610.1",
      source: p.source || "BV-BRC",
      isKey: p.isKey ?? true,
      rank: p.rank || "species",
      updateTime: p.updateTime || "2026-05-18",
      taxonomy: tax,
      basicInfo: {
        family: tax.family,
        genus: tax.genus,
        genomeType: (p.genomeSummary || "").split('，')[0] || "双链 DNA",
        genomeSize: (p.genomeSummary || "").split('，')[1] || "约 4.1 Mb",
        firstIdentified: "1962 年",
        primaryTarget: p.pathogenicity || "肠道黏膜、免疫缺失机会感染"
      },
      epidemiology: {
        globalInfections: "广泛定植",
        annualNewCases: "机会致病散发",
        annualDeaths: "极少直接致死",
        majorRegions: "全球人畜肠道",
        transmissionRoutes: p.transmission || "内源性移位、消化道传播",
        incubationPeriod: "视免疫状态而定"
      },
      sequences: [
        { label: "RefSeq 参考基因组", id: p.refSeqId || "NC_018610.1" },
        { label: "NCBI Taxon Record", id: p.ncbiTaxId || "29388" }
      ],
      genomeEncoding: p.genomeSummary || "双链 DNA 环状基因组，编码蛋白质及外毒素基因岛",
      transmissionPaths: (p.transmission || "消化道传播、菌群移位").split(/[、,，;]/).map((t: string) => ({
        label: t.trim(),
        icon: Activity,
        color: "text-blue-500",
        bg: "bg-blue-50"
      })).filter((t: any) => t.label),
      treatments: [
        { type: "相关疾病", content: p.relatedDiseases || "伪膜性肠炎、坏死性肠炎、败血症", variant: "blue" }
      ]
    };
  };

  const defaultPathogen = {
    name: "无害梭菌 (Clostridium innocuum)",
    englishName: "Clostridium innocuum",
    type: "细菌",
    tags: ["厚壁菌门", "梭菌纲", "BSL-1", "BV-BRC", "重点病原体"],
    taxId: "29388",
    genBank: "NC_018610.1",
    source: "BV-BRC · NCBI",
    isKey: true,
    rank: "species",
    updateTime: "2026-05-18",
    taxonomy: {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "厚壁菌门 (Firmicutes)",
      class: "梭菌纲 (Clostridia)",
      order: "梭菌目 (Clostridiales)",
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      species: "Clostridium innocuum (无害梭菌)"
    },
    basicInfo: {
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      genomeType: "双链 DNA",
      genomeSize: "约 4.1 Mb",
      firstIdentified: "1962 年",
      primaryTarget: "肠道共生、免疫功能受损移位"
    },
    epidemiology: {
      globalInfections: "全球定植",
      annualNewCases: "机会致病散发",
      annualDeaths: "罕见",
      majorRegions: "全球分布",
      transmissionRoutes: "内源性移位、消化道传播",
      incubationPeriod: "视免疫功能而定"
    },
    sequences: [
      { label: "RefSeq 参考序列", id: "NC_018610.1" },
      { label: "NCBI Taxonomy", id: "29388" }
    ],
    genomeEncoding: "编码万古霉素非典型耐药基因岛 (VanG) 及多种肠道代谢酶类。",
    transmissionPaths: [
      { label: "内源菌群移位", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "消化道摄入", icon: Syringe, color: "text-indigo-500", bg: "bg-indigo-50" }
    ],
    treatments: [
      { type: "相关疾病", content: "条件致病菌感染、肠道菌群失调、机会性败血症", variant: "blue" }
    ]
  };

  const data = transformPathogen(pathogen) || defaultPathogen;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Search Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b sticky top-0 z-20 overflow-hidden">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            <span className="font-bold text-sm">返回病原库列表</span>
          </Button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest tech-mono">病原微生物分类学与临床知识库</h2>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-slate-600 gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> 分享记录
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-slate-600 gap-1.5">
            <Download className="w-3.5 h-3.5" /> 导出 FASTA / JSON
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {/* Main Title Banner */}
          <Card className="border-none shadow-sm ring-1 ring-black/[0.03] overflow-hidden bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.name}</span>
                    <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 text-xs px-2.5 py-0.5">
                      {data.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 italic font-mono">{data.englishName}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {data.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[11px] bg-slate-100 text-slate-600 border-none font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-right space-y-1.5 tech-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <span className="text-slate-400 font-bold">NCBI TaxID:</span>
                    <span className="text-indigo-600 font-bold">{data.taxId}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <span className="text-slate-400 font-bold">RefSeq:</span>
                    <span className="text-slate-800 font-mono underline">{data.genBank}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <span className="text-slate-400 font-bold">来源:</span>
                    <span className="text-slate-600">{data.source}</span>
                  </div>
                  {data.isKey && (
                    <div className="flex items-center justify-end gap-1.5 text-[11px] text-emerald-600 font-bold pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>重点病原体</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Dedicated Taxonomy Card */}
          <Card className="border-none shadow-sm ring-1 ring-black/[0.03] bg-gradient-to-br from-indigo-50/30 to-white">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-indigo-950 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-indigo-600" /> 分类学信息 (Taxonomy Information)
                </div>
                <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                  Rank: {data.rank || 'species'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Tax ID</span>
                  <span className="text-xs font-bold tech-mono text-indigo-600">{data.taxId}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Rank (分类层级)</span>
                  <Badge variant="outline" className="text-[9px] bg-indigo-50 border-indigo-200 text-indigo-700 font-mono">
                    {data.rank || "species"}
                  </Badge>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">界 / 域 (Kingdom)</span>
                  <span className="text-xs font-bold text-slate-800">{data.taxonomy?.superkingdom || "Bacteria (细菌域)"}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">门 (Phylum)</span>
                  <span className="text-xs font-bold text-slate-800">{data.taxonomy?.phylum || "厚壁菌门 (Firmicutes)"}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">纲 (Class)</span>
                  <span className="text-xs font-bold text-slate-800">{data.taxonomy?.class || "梭菌纲 (Clostridia)"}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">目 (Order)</span>
                  <span className="text-xs font-bold text-slate-800">{data.taxonomy?.order || "梭菌目 (Clostridiales)"}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">科 (Family)</span>
                  <span className="text-xs font-bold text-slate-800">{data.taxonomy?.family || "梭菌科 (Clostridiaceae)"}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">属 (Genus)</span>
                  <span className="text-xs font-bold text-indigo-600">{data.taxonomy?.genus || "Clostridium (梭菌属)"}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">种 (Species)</span>
                  <span className="text-xs font-bold text-slate-900">{data.taxonomy?.species || data.name}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">数据来源与更新</span>
                  <span className="text-[11px] tech-mono font-medium text-slate-600">{data.source} · {data.updateTime || "2026-05-18"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Grid for Basic Info & Epidemiology */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                  <Info className="w-4 h-4 text-indigo-500" /> 生理与靶点
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Object.entries(data.basicInfo).map(([key, value]: [string, any], i) => {
                    const labels: Record<string, string> = {
                      family: "科",
                      genus: "属",
                      genomeType: "基因组类型",
                      genomeSize: "基因组大小",
                      firstIdentified: "首次鉴定",
                      primaryTarget: "主要攻击靶点"
                    };
                    return (
                      <div key={i} className="flex items-center justify-between group hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <span className="text-xs text-slate-400 font-medium">{labels[key]}</span>
                        <span className="text-xs text-slate-900 font-bold">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Epidemiology */}
            <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-emerald-500" /> 流行病学特征
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Object.entries(data.epidemiology).map(([key, value]: [string, any], i) => {
                    const labels: Record<string, string> = {
                      globalInfections: "全球定植/感染",
                      annualNewCases: "年新增病例",
                      annualDeaths: "年死亡人数",
                      majorRegions: "主要流行区",
                      transmissionRoutes: "传播途径",
                      incubationPeriod: "潜伏期"
                    };
                    return (
                      <div key={i} className="flex items-center justify-between group hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <span className="text-xs text-slate-400 font-medium">{labels[key]}</span>
                        <span className="text-xs font-bold text-slate-900">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Genomics */}
          <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <Dna className="w-4 h-4 text-blue-500" /> 基因组与序列标识
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {data.genomeEncoding}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {data.sequences.map((seq: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">{seq.label}</span>
                    <a 
                      href={`https://www.ncbi.nlm.nih.gov/nuccore/${seq.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {seq.id}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
