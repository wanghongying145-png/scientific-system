import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  Download, 
  Search, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ExternalLink,
  RefreshCw,
  Dna,
  Database,
  ArrowUpDown,
  Filter,
  Layers,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TargetItem {
  rank: number;
  gene: string;
  ensemblId: string;
  fullName: string;
  species: string;
  score: number;
  mouseHomolog: {
    gene: string;
    ensemblId: string;
    mgiId: string;
    homologyType: string;
    highConfidence: boolean;
    identityHumanToMouse: number;
    identityMouseToHuman: number;
  } | null;
  mouseEvidence: {
    type: 'disease' | 'general' | 'none' | 'error';
    score?: number;
    count?: number;
    errorMsg?: string;
  };
  evidenceBreakdown: {
    geneticAssociation: number;
    rnaExpression: number;
    literature: number;
    knownDrug: number;
    animalModel: number;
  };
  sources: {
    gwas: { score: number; desc: string };
    europePmc: { score: number; desc: string };
    expressionAtlas: { score: number; desc: string };
    chembl: { score: number; desc: string };
  };
  impcDiseaseEvidence?: {
    model: string;
    phenotype: string;
    score: number;
    source: string;
  };
  generalPhenotypes?: Array<{
    mpId: string;
    name: string;
    category: string;
    source: string;
  }>;
}

const TARGET_DATA: TargetItem[] = [
  {
    rank: 1,
    gene: "FLG",
    ensemblId: "ENSG00000143631",
    fullName: "filaggrin",
    species: "人类 · 9606",
    score: 0.7445,
    mouseHomolog: {
      gene: "Flg",
      ensemblId: "ENSMUSG00000063236",
      mgiId: "MGI:95537",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 91.42,
      identityMouseToHuman: 90.86,
    },
    mouseEvidence: {
      type: "disease",
      score: 0.288,
    },
    evidenceBreakdown: {
      geneticAssociation: 0.8550,
      rnaExpression: 0.5815,
      literature: 0.6650,
      knownDrug: 0.4650,
      animalModel: 0.3880,
    },
    sources: {
      gwas: { score: 0.8550, desc: "来自GWAS Catalog/Open Targets Genetics评分最高变异映射" },
      europePmc: { score: 0.6650, desc: "共识文献挖掘得分与证据条目" },
      expressionAtlas: { score: 0.5815, desc: "组织/气道上皮差异表达数据支持" },
      chembl: { score: 0.4650, desc: "靶向该基因的临床期/表皮屏障调节分子活性" },
    },
    impcDiseaseEvidence: {
      model: "Flg^tm1.1(KOMP)Vlcg",
      phenotype: "表皮屏障缺陷、特应性皮炎及继发气道高反应性 (MP:0001799, MP:0003631)",
      score: 0.288,
      source: "IMPC / MGI Disease Models",
    },
    generalPhenotypes: [
      { mpId: "MP:0001799", name: "abnormal stratum corneum morphology", category: "integument phenotype", source: "IMPC" },
      { mpId: "MP:0003631", name: "abnormal skin barrier function", category: "integument phenotype", source: "IMPC" },
      { mpId: "MP:0005377", name: "increased circulating IgE level", category: "immune system phenotype", source: "MGI" },
      { mpId: "MP:0002152", name: "increased respiratory rate", category: "respiratory system phenotype", source: "IMPC" },
      { mpId: "MP:0001861", name: "abnormal hair follicle morphology", category: "integument phenotype", source: "IMPC" },
      { mpId: "MP:0002451", name: "increased inflammatory response", category: "immune system phenotype", source: "MGI" },
    ],
  },
  {
    rank: 2,
    gene: "IL4R",
    ensemblId: "ENSG00000077238",
    fullName: "interleukin 4 receptor",
    species: "人类 · 9606",
    score: 0.7303,
    mouseHomolog: {
      gene: "Il4ra",
      ensemblId: "ENSMUSG00000030588",
      mgiId: "MGI:96556",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 86.15,
      identityMouseToHuman: 85.90,
    },
    mouseEvidence: {
      type: "disease",
      score: 0.173,
    },
    evidenceBreakdown: {
      geneticAssociation: 0.8120,
      rnaExpression: 0.7420,
      literature: 0.7950,
      knownDrug: 0.9200,
      animalModel: 0.3520,
    },
    sources: {
      gwas: { score: 0.8120, desc: "GWAS显著位点rs1801275富集于儿童哮喘队列" },
      europePmc: { score: 0.7950, desc: "大量Th2免疫应答通路核心靶标文献支持" },
      expressionAtlas: { score: 0.7420, desc: "哮喘患者支气管上皮及PBMC高表达" },
      chembl: { score: 0.9200, desc: "Dupilumab等已上市靶向药物临床数据" },
    },
    impcDiseaseEvidence: {
      model: "Il4ra^tm1Fkn",
      phenotype: "减弱的卵清蛋白诱导哮喘气道嗜酸性粒细胞浸润 (MP:0008432)",
      score: 0.173,
      source: "IMPC / MGI Disease Models",
    },
    generalPhenotypes: [
      { mpId: "MP:0008432", name: "decreased eosinophil cell number", category: "immune system phenotype", source: "IMPC" },
      { mpId: "MP:0002410", name: "abnormal B cell proliferation", category: "immune system phenotype", source: "MGI" },
      { mpId: "MP:0001784", name: "abnormal adaptive immunity", category: "immune system phenotype", source: "IMPC" },
    ],
  },
  {
    rank: 3,
    gene: "IL13",
    ensemblId: "ENSG00000169194",
    fullName: "interleukin 13",
    species: "人类 · 9606",
    score: 0.7206,
    mouseHomolog: {
      gene: "Il13",
      ensemblId: "ENSMUSG00000020383",
      mgiId: "MGI:96543",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 78.30,
      identityMouseToHuman: 77.95,
    },
    mouseEvidence: {
      type: "general",
      count: 47,
    },
    evidenceBreakdown: {
      geneticAssociation: 0.7980,
      rnaExpression: 0.8150,
      literature: 0.8420,
      knownDrug: 0.8800,
      animalModel: 0.2800,
    },
    sources: {
      gwas: { score: 0.7980, desc: "5q31区域哮喘高易感基因多态性" },
      europePmc: { score: 0.8420, desc: "气道黏液高分泌与重塑驱动因子" },
      expressionAtlas: { score: 0.8150, desc: "重度哮喘患者诱导痰与肺组织高表达" },
      chembl: { score: 0.8800, desc: "Tralokinumab, Lebrikizumab 靶点" },
    },
    generalPhenotypes: [
      { mpId: "MP:0001799", name: "abnormal airway goblet cell morphology", category: "respiratory system phenotype", source: "IMPC" },
      { mpId: "MP:0002152", name: "airway hyperreactivity", category: "respiratory system phenotype", source: "MGI" },
      { mpId: "MP:0005377", name: "increased serum IgE level", category: "immune system phenotype", source: "IMPC" },
      { mpId: "MP:0002451", name: "mucus hypersecretion in lung", category: "respiratory system phenotype", source: "MGI" },
    ],
  },
  {
    rank: 4,
    gene: "TSLP",
    ensemblId: "ENSG00000145777",
    fullName: "thymic stromal lymphopoietin",
    species: "人类 · 9606",
    score: 0.7061,
    mouseHomolog: {
      gene: "Tslp",
      ensemblId: "ENSMUSG00000024379",
      mgiId: "MGI:1929284",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 64.20,
      identityMouseToHuman: 63.80,
    },
    mouseEvidence: {
      type: "general",
      count: 12,
    },
    evidenceBreakdown: {
      geneticAssociation: 0.7750,
      rnaExpression: 0.6920,
      literature: 0.7810,
      knownDrug: 0.9100,
      animalModel: 0.2450,
    },
    sources: {
      gwas: { score: 0.7750, desc: "rs1837253与儿童哮喘发生率显著相关" },
      europePmc: { score: 0.7810, desc: "上皮来源警报素 (alarmin) 活化树突细胞" },
      expressionAtlas: { score: 0.6920, desc: "气道刺激物暴露后快速上调" },
      chembl: { score: 0.9100, desc: "Tezepelumab 针对广谱哮喘获批上市" },
    },
    generalPhenotypes: [
      { mpId: "MP:0001861", name: "abnormal dendritic cell activation", category: "immune system phenotype", source: "IMPC" },
      { mpId: "MP:0005377", name: "increased Th2 cytokine level", category: "immune system phenotype", source: "MGI" },
    ],
  },
  {
    rank: 5,
    gene: "IL33",
    ensemblId: "ENSG00000136040",
    fullName: "interleukin 33",
    species: "人类 · 9606",
    score: 0.6970,
    mouseHomolog: {
      gene: "Il33",
      ensemblId: "ENSMUSG00000024765",
      mgiId: "MGI:2444399",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 72.50,
      identityMouseToHuman: 71.80,
    },
    mouseEvidence: {
      type: "general",
      count: 89,
    },
    evidenceBreakdown: {
      geneticAssociation: 0.8350,
      rnaExpression: 0.6120,
      literature: 0.7540,
      knownDrug: 0.6500,
      animalModel: 0.3120,
    },
    sources: {
      gwas: { score: 0.8350, desc: "9p24.1位点GWAS极显著关联" },
      europePmc: { score: 0.7540, desc: "ILC2细胞强效激活因子" },
      expressionAtlas: { score: 0.6120, desc: "气道基底细胞及内皮细胞表达" },
      chembl: { score: 0.6500, desc: "Itepekimab等II/III期临床管线" },
    },
    generalPhenotypes: [
      { mpId: "MP:0008432", name: "altered ILC2 cell proliferation", category: "immune system phenotype", source: "IMPC" },
      { mpId: "MP:0002152", name: "airway inflammation", category: "respiratory system phenotype", source: "MGI" },
    ],
  },
  {
    rank: 6,
    gene: "GSDMB",
    ensemblId: "ENSG00000073605",
    fullName: "gasdermin B",
    species: "人类 · 9606",
    score: 0.6865,
    mouseHomolog: null,
    mouseEvidence: {
      type: "none",
    },
    evidenceBreakdown: {
      geneticAssociation: 0.8920,
      rnaExpression: 0.5840,
      literature: 0.6120,
      knownDrug: 0.1200,
      animalModel: 0.0000,
    },
    sources: {
      gwas: { score: 0.8920, desc: "17q21儿童早期哮喘最强遗传风险位点" },
      europePmc: { score: 0.6120, desc: "焦亡 (pyroptosis) 与气道上皮损伤机制" },
      expressionAtlas: { score: 0.5840, desc: "支气管上皮特异性高表达" },
      chembl: { score: 0.1200, desc: "尚处早期靶标验证阶段" },
    },
  },
  {
    rank: 7,
    gene: "STAT6",
    ensemblId: "ENSG00000166888",
    fullName: "signal transducer and activator of transcription 6",
    species: "人类 · 9606",
    score: 0.6559,
    mouseHomolog: {
      gene: "Stat6",
      ensemblId: "ENSMUSG00000002147",
      mgiId: "MGI:103038",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 93.10,
      identityMouseToHuman: 92.80,
    },
    mouseEvidence: {
      type: "general",
      count: 103,
    },
    evidenceBreakdown: {
      geneticAssociation: 0.6850,
      rnaExpression: 0.6410,
      literature: 0.7890,
      knownDrug: 0.4500,
      animalModel: 0.3800,
    },
    sources: {
      gwas: { score: 0.6850, desc: "12q13.3位点单核苷酸多态性" },
      europePmc: { score: 0.7890, desc: "IL-4/IL-13下游信号转导中枢" },
      expressionAtlas: { score: 0.6410, desc: "各类淋巴细胞与髓系细胞中广谱表达" },
      chembl: { score: 0.4500, desc: "PROTAC降解剂与小分子变构抑制剂在研" },
    },
    generalPhenotypes: [
      { mpId: "MP:0005377", name: "decreased IgE class switching", category: "immune system phenotype", source: "IMPC" },
      { mpId: "MP:0002410", name: "abnormal Th2 cell differentiation", category: "immune system phenotype", source: "MGI" },
    ],
  },
  {
    rank: 8,
    gene: "SMAD3",
    ensemblId: "ENSG00000166949",
    fullName: "SMAD family member 3",
    species: "人类 · 9606",
    score: 0.6483,
    mouseHomolog: {
      gene: "Smad3",
      ensemblId: "ENSMUSG00000024391",
      mgiId: "MGI:1347040",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 98.40,
      identityMouseToHuman: 98.20,
    },
    mouseEvidence: {
      type: "general",
      count: 64,
    },
    evidenceBreakdown: {
      geneticAssociation: 0.7120,
      rnaExpression: 0.5890,
      literature: 0.6550,
      knownDrug: 0.3800,
      animalModel: 0.4200,
    },
    sources: {
      gwas: { score: 0.7120, desc: "15q22.33区域与肺功能下降显著相关" },
      europePmc: { score: 0.6550, desc: "TGF-beta通路气道平滑肌重塑关键介质" },
      expressionAtlas: { score: 0.5890, desc: "肺成纤维细胞及平滑肌细胞表达" },
      chembl: { score: 0.3800, desc: "抗纤维化与重塑小分子化合物" },
    },
    generalPhenotypes: [
      { mpId: "MP:0002152", name: "altered airway remodeling", category: "respiratory system phenotype", source: "IMPC" },
      { mpId: "MP:0003631", name: "abnormal extracellular matrix deposition", category: "cellular phenotype", source: "MGI" },
    ],
  },
  {
    rank: 9,
    gene: "CD14",
    ensemblId: "ENSG00000170458",
    fullName: "CD14 molecule",
    species: "人类 · 9606",
    score: 0.6436,
    mouseHomolog: {
      gene: "Cd14",
      ensemblId: "ENSMUSG00000051439",
      mgiId: "MGI:88318",
      homologyType: "一对一同源 (one2one)",
      highConfidence: true,
      identityHumanToMouse: 75.60,
      identityMouseToHuman: 74.90,
    },
    mouseEvidence: {
      type: "error",
      errorMsg: "IMPC 接口响应超时，点击重试",
    },
    evidenceBreakdown: {
      geneticAssociation: 0.6720,
      rnaExpression: 0.7150,
      literature: 0.7180,
      knownDrug: 0.2800,
      animalModel: 0.1500,
    },
    sources: {
      gwas: { score: 0.6720, desc: "CD14/-260 C/T启动子多态性与内毒素暴露环境交互" },
      europePmc: { score: 0.7180, desc: "天然免疫受体介导农场环境儿童哮喘保护效应" },
      expressionAtlas: { score: 0.7150, desc: "单核/巨噬细胞高表达" },
      chembl: { score: 0.2800, desc: "抗CD14抗体临床前免疫学研究" },
    },
  },
];

export function TargetDiscoveryResult({ onBack, task }: { onBack: () => void; task?: any }) {
  const currentTask = task || {
    id: "TD-2026-08-31-1024",
    name: "儿童哮喘相关人类候选靶标发现与小鼠动物模型证据查询",
    model: "Open Targets 靶标发现与验证模型",
    params: {
      model: "Open Targets 靶标发现与验证模型",
      disease: "儿童哮喘 · MONDO_0004979",
      topN: "9",
      species: "人类 · Homo sapiens · 9606",
      mouseSpecies: "小鼠 · Mus musculus · 10090",
      enableMouse: true,
      dataVersion: "Open Targets Platform 26.06",
      dataSource: "Open Targets / Ensembl / MGI / IMPC",
      execTime: "2026-08-31 10:24",
    }
  };

  const [filterMouseEvidence, setFilterMouseEvidence] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTarget, setSelectedTarget] = useState<TargetItem | null>(TARGET_DATA[0]);
  const [drawerTab, setDrawerTab] = useState<'human' | 'mouse'>('human');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // Filter & Sort
  const processedData = useMemo(() => {
    return TARGET_DATA.filter((item) => {
      // search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = item.gene.toLowerCase().includes(q) || 
                      item.fullName.toLowerCase().includes(q) || 
                      item.ensemblId.toLowerCase().includes(q);
        if (!match) return false;
      }

      // mouse evidence filter
      if (filterMouseEvidence === "disease") return item.mouseEvidence.type === "disease";
      if (filterMouseEvidence === "general") return item.mouseEvidence.type === "general";
      if (filterMouseEvidence === "none") return item.mouseEvidence.type === "none";
      if (filterMouseEvidence === "error") return item.mouseEvidence.type === "error";

      return true;
    }).sort((a, b) => {
      if (sortOrder === "asc") return a.score - b.score;
      return b.score - a.score;
    });
  }, [searchQuery, filterMouseEvidence, sortOrder]);

  const handleExportCSV = () => {
    const headers = ["排名", "基因名", "Ensembl Gene ID", "基因标准全称", "靶标物种", "综合关联分", "小鼠同源基因", "小鼠证据类型"];
    const rows = processedData.map(item => [
      item.rank,
      item.gene,
      item.ensemblId,
      `"${item.fullName}"`,
      item.species,
      item.score.toFixed(4),
      item.mouseHomolog ? `${item.mouseHomolog.gene} (${item.mouseHomolog.ensemblId})` : "无同源映射",
      item.mouseEvidence.type === 'disease' ? `疾病相关 (${item.mouseEvidence.score})` : 
        item.mouseEvidence.type === 'general' ? `一般表型 (${item.mouseEvidence.count}项)` :
        item.mouseEvidence.type === 'none' ? '无小鼠证据' : '加载失败'
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Target_Discovery_${currentTask.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Top Banner / Header */}
      <div className="bg-white border-b px-8 py-4 sticky top-0 z-20 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 px-2.5 h-8 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>返回</span>
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h1 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              靶标发现与验证结果
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              任务 ID: {currentTask.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 CSV</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area + Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Table & Configurations */}
        <div className={cn(
          "flex-1 overflow-y-auto p-6 space-y-6 transition-all",
          isDrawerOpen ? "max-w-[calc(100%-480px)]" : "max-w-full"
        )}>
          {/* Card 1: 基本信息配置 */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-[#1E40AF] rounded-xs" />
                <h2 className="text-sm font-bold text-slate-900">基本信息配置</h2>
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-normal px-2 py-0.5">
                演示数据
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3.5 gap-x-6 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">模型:</span>
                <span className="text-slate-900 font-medium">{currentTask.params?.model || "Open Targets靶标发现与验证模型"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">疾病:</span>
                <span className="text-slate-900 font-medium">{currentTask.params?.disease || "儿童哮喘 · MONDO_0004979"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">候选靶标数量:</span>
                <span className="text-slate-900 font-bold font-mono">{currentTask.params?.topN || "9"}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">靶标物种:</span>
                <span className="text-slate-900 font-medium">{currentTask.params?.species || "人类 · Homo sapiens · 9606"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">动物模型物种:</span>
                <span className="text-slate-900 font-medium">{currentTask.params?.mouseSpecies || "小鼠 · Mus musculus · 10090"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">动物模型证据检索:</span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  {currentTask.params?.enableMouse !== false ? "已启用" : "未启用"}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">数据版本:</span>
                <span className="text-slate-900 font-mono">{currentTask.params?.dataVersion || "Open Targets Platform 26.06"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">数据来源:</span>
                <span className="text-slate-900 font-medium">{currentTask.params?.dataSource || "Open Targets / Ensembl / MGI / IMPC"}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 w-28 shrink-0">执行时间:</span>
                <span className="text-slate-900 font-mono">{currentTask.params?.execTime || "2026-08-31 10:24"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: 候选靶标列表 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            {/* Header with filters */}
            <div className="p-5 border-b border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#1E40AF] rounded-xs" />
                    <h2 className="text-sm font-bold text-slate-900">候选靶标列表</h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    候选对象均为人类靶标；小鼠数据作为独立证据展示，通用表型不代表当前疾病已验证。
                  </p>
                </div>

                {/* Right controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Filter mouse evidence */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-slate-500 text-[11px]">小鼠模型证据:</span>
                    <select 
                      value={filterMouseEvidence}
                      onChange={(e) => setFilterMouseEvidence(e.target.value)}
                      className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">全部</option>
                      <option value="disease">疾病相关证据</option>
                      <option value="general">仅一般表型</option>
                      <option value="none">无小鼠证据</option>
                      <option value="error">证据加载失败</option>
                    </select>
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-slate-500 text-[11px]">综合关联排序:</span>
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="desc">从高到低</option>
                      <option value="asc">从低到高</option>
                    </select>
                  </div>

                  {/* Export button */}
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={handleExportCSV}
                    className="h-8 px-2.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>导出 CSV</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-medium">
                  <tr className="whitespace-nowrap">
                    <th className="px-4 py-3 text-center w-12">排名</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">基因名</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">Ensembl Gene ID</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">基因标准全称</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">靶标物种</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">综合关联分</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">小鼠同源基因</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">小鼠模型证据</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-800">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.map((item) => {
                    const isSelected = selectedTarget?.gene === item.gene;
                    return (
                      <tr 
                        key={item.gene} 
                        className={cn(
                          "hover:bg-blue-50/40 transition-colors",
                          isSelected && "bg-blue-50/70 border-l-2 border-l-[#1E40AF]"
                        )}
                      >
                        {/* 排名 */}
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">
                          {item.rank}
                        </td>

                        {/* 基因名 */}
                        <td className="px-4 py-3.5 font-bold font-mono text-slate-900">
                          {item.gene}
                        </td>

                        {/* Ensembl Gene ID */}
                        <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">
                          {item.ensemblId}
                        </td>

                        {/* 基因标准全称 */}
                        <td className="px-4 py-3.5 text-slate-700 max-w-[200px] truncate" title={item.fullName}>
                          {item.fullName}
                        </td>

                        {/* 靶标物种 */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {item.species}
                          </span>
                        </td>

                        {/* 综合关联分 */}
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 text-xs">
                          {item.score.toFixed(4)}
                        </td>

                        {/* 小鼠同源基因 */}
                        <td className="px-4 py-3.5 text-slate-700">
                          {item.mouseHomolog ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-semibold text-slate-900">{item.mouseHomolog.gene}</span>
                              <p className="text-[10px] font-mono text-slate-400">{item.mouseHomolog.ensemblId}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">无同源映射</span>
                          )}
                        </td>

                        {/* 小鼠模型证据 */}
                        <td className="px-4 py-3.5">
                          {item.mouseEvidence.type === "disease" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              疾病相关证据 · {item.mouseEvidence.score?.toFixed(3)}
                            </span>
                          )}
                          {item.mouseEvidence.type === "general" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              仅一般表型 · {item.mouseEvidence.count}项
                            </span>
                          )}
                          {item.mouseEvidence.type === "none" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              无小鼠证据
                            </span>
                          )}
                          {item.mouseEvidence.type === "error" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
                              <AlertCircle className="w-3 h-3 text-red-500" />
                              证据加载失败
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("重新加载CD14小鼠IMPC证据...");
                                }}
                                className="underline hover:text-red-800 ml-1"
                              >
                                重新加载
                              </button>
                            </span>
                          )}
                        </td>

                        {/* 操作 */}
                        <td className="px-4 py-3.5 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTarget(item);
                              setIsDrawerOpen(true);
                            }}
                            className={cn(
                              "h-7 px-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1 mx-auto",
                              isSelected && "bg-blue-100/60 font-bold"
                            )}
                          >
                            <span>查看证据</span>
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div>
                显示 <span className="font-semibold text-slate-700">{processedData.length}</span> 条结果，共 <span className="font-semibold text-slate-700">{TARGET_DATA.length}</span> 条
              </div>
              <div className="text-[11px] text-slate-400 italic">
                综合关联分来自Open Targets direct预计算值
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: 靶标证据详情抽屉 (Slide-in Drawer) */}
        {isDrawerOpen && selectedTarget && (
          <div className="w-[480px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-[calc(100vh-65px)] shadow-xl z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 font-mono">{selectedTarget.gene}</h2>
                  <span className="text-xs text-slate-500 italic">({selectedTarget.fullName})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-[11px] px-2 py-0.5">
                    综合关联分 {selectedTarget.score.toFixed(4)}
                  </Badge>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDrawerOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-white text-xs">
              <button
                onClick={() => setDrawerTab('human')}
                className={cn(
                  "py-3 px-4 font-semibold border-b-2 transition-colors -mb-px flex items-center gap-1.5",
                  drawerTab === 'human'
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                <Dna className="w-3.5 h-3.5" />
                <span>人类靶标证据</span>
              </button>
              <button
                onClick={() => setDrawerTab('mouse')}
                className={cn(
                  "py-3 px-4 font-semibold border-b-2 transition-colors -mb-px flex items-center gap-1.5",
                  drawerTab === 'mouse'
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>小鼠动物模型证据</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {drawerTab === 'human' ? (
                /* Tab 1: 人类靶标证据 */
                <div className="space-y-6">
                  {/* Top Score Box */}
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/40 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-blue-700 font-medium block">Open Targets综合关联分</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">基于Open Targets Platform汇总计算的direct关联得分</p>
                    </div>
                    <span className="text-2xl font-bold font-mono text-blue-900">{selectedTarget.score.toFixed(4)}</span>
                  </div>

                  {/* 靶标基本信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                      <h3 className="text-xs font-bold text-slate-900">靶标基本信息</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 text-[10px] block">基因名</span>
                        <span className="font-mono font-semibold text-slate-800">{selectedTarget.gene}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">物种</span>
                        <span className="text-slate-800">{selectedTarget.species}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 text-[10px] block">Ensembl Gene ID</span>
                        <span className="font-mono text-slate-700">{selectedTarget.ensemblId}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 text-[10px] block">基因标准全称</span>
                        <span className="text-slate-800">{selectedTarget.fullName}</span>
                      </div>
                    </div>
                  </div>

                  {/* 证据分项 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                      <h3 className="text-xs font-bold text-slate-900">证据分项</h3>
                    </div>

                    <div className="space-y-2.5 bg-white p-3.5 rounded-lg border border-slate-200">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">遗传关联 (genetic_association)</span>
                          <span className="font-mono font-bold text-slate-800">{selectedTarget.evidenceBreakdown.geneticAssociation.toFixed(4)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedTarget.evidenceBreakdown.geneticAssociation * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">转录组证据 (rna_expression)</span>
                          <span className="font-mono font-bold text-slate-800">{selectedTarget.evidenceBreakdown.rnaExpression.toFixed(4)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedTarget.evidenceBreakdown.rnaExpression * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">文献证据 (literature)</span>
                          <span className="font-mono font-bold text-slate-800">{selectedTarget.evidenceBreakdown.literature.toFixed(4)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedTarget.evidenceBreakdown.literature * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">已知药物证据 (known_drug)</span>
                          <span className="font-mono font-bold text-slate-800">{selectedTarget.evidenceBreakdown.knownDrug.toFixed(4)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedTarget.evidenceBreakdown.knownDrug * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">动物模型 (animal_model)</span>
                          <span className="font-mono font-bold text-slate-800">{selectedTarget.evidenceBreakdown.animalModel.toFixed(4)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selectedTarget.evidenceBreakdown.animalModel * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 证据来源 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                      <h3 className="text-xs font-bold text-slate-900">证据来源</h3>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">GWAS / L2G</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{selectedTarget.sources.gwas.score.toFixed(4)}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">{selectedTarget.sources.gwas.desc}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">Europe PMC 文献</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{selectedTarget.sources.europePmc.score.toFixed(4)}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">{selectedTarget.sources.europePmc.desc}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">Expression Atlas</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{selectedTarget.sources.expressionAtlas.score.toFixed(4)}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">{selectedTarget.sources.expressionAtlas.desc}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">ChEMBL / 临床试验</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{selectedTarget.sources.chembl.score.toFixed(4)}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">{selectedTarget.sources.chembl.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom alert note */}
                  <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>仅展示接口明细中实际返回的PMID。Europe PMC和GWAS/L2G完整证明明细未包含在当前响应中。</span>
                  </div>
                </div>
              ) : (
                /* Tab 2: 小鼠动物模型证据 */
                <div className="space-y-6">
                  {/* 人鼠同源映射 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                      <h3 className="text-xs font-bold text-slate-900">人鼠同源映射</h3>
                    </div>

                    {selectedTarget.mouseHomolog ? (
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">小鼠基因</span>
                          <span className="font-mono font-bold text-slate-900">{selectedTarget.mouseHomolog.gene}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">MGI ID</span>
                          <span className="font-mono text-slate-800">{selectedTarget.mouseHomolog.mgiId}</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 text-[10px] block">Ensembl Mouse ID</span>
                          <span className="font-mono text-slate-700">{selectedTarget.mouseHomolog.ensemblId}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 text-[10px] block">同源关系</span>
                          <span className="text-slate-800">{selectedTarget.mouseHomolog.homologyType}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 text-[10px] block">高置信同源</span>
                          <span className="text-emerald-700 font-medium">是 (High Confidence)</span>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 text-[10px] block">人-&gt;鼠序列一致性</span>
                          <span className="font-mono text-slate-800">{selectedTarget.mouseHomolog.identityHumanToMouse}%</span>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 text-[10px] block">鼠-&gt;人序列一致性</span>
                          <span className="font-mono text-slate-800">{selectedTarget.mouseHomolog.identityMouseToHuman}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-center">
                        该人类靶标在当前Ensembl数据库中暂无直接对应的小鼠同源基因映射。
                      </div>
                    )}
                  </div>

                  {/* 当前疾病相关IMPC证据 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                        <h3 className="text-xs font-bold text-slate-900">当前疾病相关IMPC证据</h3>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                        疾病特异
                      </Badge>
                    </div>

                    {selectedTarget.impcDiseaseEvidence ? (
                      <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-slate-900 text-xs">{selectedTarget.impcDiseaseEvidence.model}</span>
                          <span className="text-[11px] font-mono font-semibold text-emerald-800">
                            IMPC 证据评分: {selectedTarget.impcDiseaseEvidence.score.toFixed(3)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {selectedTarget.impcDiseaseEvidence.phenotype}
                        </p>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-emerald-100 flex items-center justify-between">
                          <span>数据来源: {selectedTarget.impcDiseaseEvidence.source}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs leading-relaxed">
                        当前疾病在IMPC中暂未匹配到直接特异性疾病模型证据。
                      </div>
                    )}
                  </div>

                  {/* 通用小鼠表型 (非疾病特异) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                        <h3 className="text-xs font-bold text-slate-900">通用小鼠表型 (非疾病特异)</h3>
                      </div>
                      {selectedTarget.generalPhenotypes && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-mono">
                          {selectedTarget.generalPhenotypes.length} 条记录
                        </Badge>
                      )}
                    </div>

                    {/* Warning banner */}
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>通用小鼠表型来自IMPC及MGI常规表型筛查，反映基因基础生物学功能，不代表当前疾病已验证。</span>
                    </div>

                    {selectedTarget.generalPhenotypes && selectedTarget.generalPhenotypes.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <tr>
                              <th className="px-3 py-2 font-semibold">MP ID</th>
                              <th className="px-3 py-2 font-semibold">表型名称</th>
                              <th className="px-3 py-2 font-semibold">分类</th>
                              <th className="px-3 py-2 font-semibold">来源</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedTarget.generalPhenotypes.map((pt, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/70">
                                <td className="px-3 py-2 font-mono font-medium text-blue-600">{pt.mpId}</td>
                                <td className="px-3 py-2 text-slate-800">{pt.name}</td>
                                <td className="px-3 py-2 text-slate-500">{pt.category}</td>
                                <td className="px-3 py-2 font-mono text-slate-400">{pt.source}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-center text-xs">
                        暂无通用小鼠表型数据
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
