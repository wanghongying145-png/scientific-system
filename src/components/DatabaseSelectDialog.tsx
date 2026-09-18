import React, { useState, useMemo } from "react";
import {
  Database,
  Search,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Layers,
  Sparkles,
  Dna,
  ShieldAlert,
  HardDrive
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface DatabaseFileItem {
  id: string;
  name: string;
  path: string;
  size: string;
  type: string;
  description?: string;
}

export interface DatabaseCategoryItem {
  id: string;
  name: string;
  version: string;
  rootPath: string;
  description: string;
  category: "pathogen" | "immunogenomics" | "protein" | "custom";
  species?: string;
  updateDate: string;
  files: DatabaseFileItem[];
}

export const DATABASE_MODULES = [
  {
    id: "pathogen",
    name: "病原微生物数据库",
    icon: ShieldAlert,
    color: "text-amber-500 bg-amber-50 border-amber-200",
    desc: "16S/18S/ITS、细菌、病毒、真菌全基因组及耐药/毒力特征库",
  },
  {
    id: "immunogenomics",
    name: "免疫基因组学综合数据库",
    icon: Dna,
    color: "text-blue-500 bg-blue-50 border-blue-200",
    desc: "TCR/BCR 免疫组库、CDR3 结构域、IMGT 参考集与抗原表位",
  },
  {
    id: "protein",
    name: "蛋白石结构预测专用数据库",
    icon: Sparkles,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    desc: "AlphaFold/ESMFold/UniRef/PDB70 结构同源建模与多聚体库",
  },
  {
    id: "custom",
    name: "自建数据库",
    icon: HardDrive,
    color: "text-purple-500 bg-purple-50 border-purple-200",
    desc: "课题组与实验室私有测序构建的非冗余参考集与注释文件",
  },
] as const;

export const PRESET_DATABASES: DatabaseCategoryItem[] = [
  // 1. 病原微生物数据库
  {
    id: "db-pathogen-1",
    name: "SILVA 138.1 SSU rRNA SINTAX 物种注释库",
    version: "v138.1 (QIIME2/SINTAX)",
    rootPath: "/data-nfs/nextflow/database/taxonomy_database/silva138_99_qiime2_sintax.fa.gz",
    description: "经典核糖体小亚基 rRNA 参考数据库，经过 99% 聚类与 SINTAX 分类格式化处理，适用于扩增子物种分类鉴定。",
    category: "pathogen",
    species: "Bacteria / Archaea / Eukaryota",
    updateDate: "2026-06-12",
    files: [
      {
        id: "f-silva-1",
        name: "silva138_99_qiime2_sintax.fa.gz",
        path: "/data-nfs/nextflow/database/taxonomy_database/silva138_99_qiime2_sintax.fa.gz",
        size: "182.4 MB",
        type: "FASTA GZ",
        description: "包含 taxonomy 格式头信息的标准 SINTAX 代表序列压缩包（推荐）",
      },
      {
        id: "f-silva-2",
        name: "silva138.1_ssu_tax_curated.tsv",
        path: "/data-nfs/nextflow/database/taxonomy_database/silva138.1_ssu_tax_curated.tsv",
        size: "45.1 MB",
        type: "TSV",
        description: "七级物种分类层级全表（界门纲目科属种）",
      },
      {
        id: "f-silva-3",
        name: "silva138_full_unclustered.fasta",
        path: "/data-nfs/nextflow/database/taxonomy_database/silva138_full_unclustered.fasta",
        size: "620.0 MB",
        type: "FASTA",
        description: "未去冗余全长 16S/18S 序列参考集",
      },
    ],
  },
  {
    id: "db-pathogen-2",
    name: "Greengenes2 2022.10 rRNA 注释数据库",
    version: "2022.10 Backbone",
    rootPath: "/data-nfs/nextflow/database/taxonomy_database/gg2_2022.10_backbone.fa.gz",
    description: "基于系统发育树统一构建的最新 Greengenes2 基因组级全长与扩增子物种分类参考骨架。",
    category: "pathogen",
    species: "Prokaryotes",
    updateDate: "2026-04-10",
    files: [
      {
        id: "f-gg2-1",
        name: "gg2_2022.10_backbone.fa.gz",
        path: "/data-nfs/nextflow/database/taxonomy_database/gg2_2022.10_backbone.fa.gz",
        size: "210.8 MB",
        type: "FASTA GZ",
        description: "Greengenes2 主干比对参考序列库",
      },
      {
        id: "f-gg2-2",
        name: "gg2_taxonomy_lineages.tsv",
        path: "/data-nfs/nextflow/database/taxonomy_database/gg2_taxonomy_lineages.tsv",
        size: "38.6 MB",
        type: "TSV",
        description: "GTDB 规范化物种分类谱系映射表",
      },
    ],
  },
  {
    id: "db-pathogen-3",
    name: "NCBI RefSeq 细菌/真菌完整基因组参考集",
    version: "Release 224",
    rootPath: "/data-nfs/database/pathogen/ncbi_refseq_bacteria_v224.fa",
    description: "NCBI 官方精选高质量已完成装配细菌与病原真菌参考基因组全集，支持全长宏基因组对比。",
    category: "pathogen",
    species: "Pathogenic Microbes",
    updateDate: "2026-07-01",
    files: [
      {
        id: "f-refseq-1",
        name: "ncbi_refseq_bacteria_v224.fa",
        path: "/data-nfs/database/pathogen/ncbi_refseq_bacteria_v224.fa",
        size: "14.2 GB",
        type: "FASTA",
        description: "高置信度完整装配病原细菌基因组 FASTA",
      },
      {
        id: "f-refseq-2",
        name: "refseq_genomic_annotations.gff3",
        path: "/data-nfs/database/pathogen/refseq_genomic_annotations.gff3",
        size: "2.1 GB",
        type: "GFF3",
        description: "功能结构域与编码区 GFF 注释信息",
      },
    ],
  },
  {
    id: "db-pathogen-4",
    name: "VFDB 毒力因子 & CARD 耐药基因核心库",
    version: "v3.2.4 (2026)",
    rootPath: "/data-nfs/database/pathogen/card_aro_v3.2.fa",
    description: "全面覆盖病原菌抗生素耐药本体 (ARO)、毒力岛、质粒转移与生物被膜致病基因。",
    category: "pathogen",
    species: "AMR & Virulence",
    updateDate: "2026-05-20",
    files: [
      {
        id: "f-card-1",
        name: "card_aro_v3.2.fa",
        path: "/data-nfs/database/pathogen/card_aro_v3.2.fa",
        size: "34.5 MB",
        type: "FASTA",
        description: "CARD 耐药决定基因及变异核酸序列集",
      },
      {
        id: "f-vfdb-1",
        name: "vfdb_core_virulence_factors.fa",
        path: "/data-nfs/database/pathogen/vfdb_core_virulence_factors.fa",
        size: "28.1 MB",
        type: "FASTA",
        description: "VFDB 核心已知毒力致病因子核酸集",
      },
    ],
  },

  // 2. 免疫基因组学综合数据库
  {
    id: "db-immuno-1",
    name: "IMGT/GENE-DB 免疫球蛋白与TCR参考集",
    version: "v2026.04",
    rootPath: "/data-nfs/database/immunogenomics/imgt_human_vquest_ref.fasta",
    description: "国际免疫遗传学信息系统官方发布的 Human/Mouse V-D-J-C 种系等位基因全集及 CDR 分区锚定点。",
    category: "immunogenomics",
    species: "Homo sapiens / Mus musculus",
    updateDate: "2026-05-15",
    files: [
      {
        id: "f-imgt-1",
        name: "imgt_human_vquest_ref.fasta",
        path: "/data-nfs/database/immunogenomics/imgt_human_vquest_ref.fasta",
        size: "12.4 MB",
        type: "FASTA",
        description: "人类全系 TR/IG 种系基因片段库 (V, D, J, C)",
      },
      {
        id: "f-imgt-2",
        name: "imgt_germline_alleles.tsv",
        path: "/data-nfs/database/immunogenomics/imgt_germline_alleles.tsv",
        size: "4.8 MB",
        type: "TSV",
        description: "等位基因多态性分型与 CDR3 位置定义规范",
      },
    ],
  },
  {
    id: "db-immuno-2",
    name: "TCR-Seq 感染与肿瘤抗原特异性克隆库",
    version: "v2026.07",
    rootPath: "/data-nfs/database/immunogenomics/tcr_tuberculosis_v2026.tsv",
    description: "汇聚结核分枝杆菌、病毒感染与实体瘤新抗原反应性 TCR CDR3 克隆型及 HLA 限制性配对信息。",
    category: "immunogenomics",
    species: "Homo sapiens",
    updateDate: "2026-07-28",
    files: [
      {
        id: "f-tcr-1",
        name: "tcr_tuberculosis_v2026.tsv",
        path: "/data-nfs/database/immunogenomics/tcr_tuberculosis_v2026.tsv",
        size: "76.2 MB",
        type: "TSV",
        description: "TCR-Seq 结核病临床免疫监视克隆型矩阵",
      },
      {
        id: "f-tcr-2",
        name: "tcr_cdr3_motifs.fasta",
        path: "/data-nfs/database/immunogenomics/tcr_cdr3_motifs.fasta",
        size: "18.3 MB",
        type: "FASTA",
        description: "CDR3 特异性结构基序与抗原配对序列集",
      },
    ],
  },

  // 3. 蛋白石结构预测专用数据库
  {
    id: "db-protein-1",
    name: "AlphaFold2 / ColabFold UniRef30 + BFD 多序列比对库",
    version: "UniRef30 2023_02",
    rootPath: "/data-nfs/database/protein_structure/uniref30_2302.tar.gz",
    description: "专用于 MSA 构建与同源深度搜索的高质量环境多聚体与非冗余簇索引，支持单体与复合体预测。",
    category: "protein",
    species: "Universal Protein Universe",
    updateDate: "2026-03-10",
    files: [
      {
        id: "f-af-1",
        name: "uniref30_2302.tar.gz",
        path: "/data-nfs/database/protein_structure/uniref30_2302.tar.gz",
        size: "68.4 GB",
        type: "TAR.GZ",
        description: "UniRef30 MMseqs2 预索引比对包",
      },
      {
        id: "f-af-2",
        name: "bfd_metaclust_clu.tar.gz",
        path: "/data-nfs/database/protein_structure/bfd_metaclust_clu.tar.gz",
        size: "120.0 GB",
        type: "TAR.GZ",
        description: "Big Fantastic Database 宏基因组蛋白质多样性库",
      },
    ],
  },
  {
    id: "db-protein-2",
    name: "PDB70 结构模板库 & UniProt 蛋白质序列库",
    version: "PDB70 2026.06",
    rootPath: "/data-nfs/database/protein_structure/pdb70_a3m.ffdata",
    description: "70% 序列相似性聚类的已知实验解析 3D 结构模板集合，用于结构模板比对与评分。",
    category: "protein",
    species: "Structure Templates",
    updateDate: "2026-06-18",
    files: [
      {
        id: "f-pdb-1",
        name: "pdb70_a3m.ffdata",
        path: "/data-nfs/database/protein_structure/pdb70_a3m.ffdata",
        size: "32.1 GB",
        type: "FFDATA",
        description: "PDB70 HHsuite 格式模板特征矩阵",
      },
      {
        id: "f-pdb-2",
        name: "uniprot_sprot_2026_02.fasta",
        path: "/data-nfs/database/protein_structure/uniprot_sprot_2026_02.fasta",
        size: "260.5 MB",
        type: "FASTA",
        description: "Swiss-Prot 人工精审蛋白质序列金标准集",
      },
    ],
  },

  // 4. 自建数据库
  {
    id: "db-custom-1",
    name: "实验室内部 16S V3-V4 扩增子高精注释库",
    version: "Lab-Custom v2.1",
    rootPath: "/data-nfs/custom_db/amplicon/lab_v3v4_sintax_ref.fa.gz",
    description: "本实验室基于多批次肠道与呼吸道样本深度重测序构建的专有 16S SINTAX 分类基准库。",
    category: "custom",
    species: "Microbiome / Lab Isolates",
    updateDate: "2026-08-10",
    files: [
      {
        id: "f-cust-1",
        name: "lab_v3v4_sintax_ref.fa.gz",
        path: "/data-nfs/custom_db/amplicon/lab_v3v4_sintax_ref.fa.gz",
        size: "52.4 MB",
        type: "FASTA GZ",
        description: "实验室自研 V3-V4 区域高置信度标定 FASTA",
      },
      {
        id: "f-cust-2",
        name: "tax_hierarchy_custom.tsv",
        path: "/data-nfs/custom_db/amplicon/tax_hierarchy_custom.tsv",
        size: "8.2 MB",
        type: "TSV",
        description: "补充特定临床耐药亚种的分类层级树",
      },
    ],
  },
  {
    id: "db-custom-2",
    name: "肠道微生态自建非冗余基因集与耐药突变库",
    version: "PRJ-2026-Custom",
    rootPath: "/data-nfs/custom_db/user_lab/gut_microbiome_custom_catalog.fasta",
    description: "结合课题组临床随访队列提取的菌群代谢通路和特异突变特征集。",
    category: "custom",
    species: "Human Gut Isolates",
    updateDate: "2026-08-15",
    files: [
      {
        id: "f-cust-3",
        name: "gut_microbiome_custom_catalog.fasta",
        path: "/data-nfs/custom_db/user_lab/gut_microbiome_custom_catalog.fasta",
        size: "145.0 MB",
        type: "FASTA",
        description: "非冗余基因目录 FASTA 文件",
      },
      {
        id: "f-cust-4",
        name: "amr_mutations_202608.fasta",
        path: "/data-nfs/custom_db/clinical_lab/amr_mutations_202608.fasta",
        size: "16.8 MB",
        type: "FASTA",
        description: "临床样本高频耐药突变靶点",
      },
    ],
  },
];

interface DatabaseSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentValue: string;
  onSelect: (selectedPaths: string) => void;
}

export function DatabaseSelectDialog({
  open,
  onOpenChange,
  currentValue,
  onSelect,
}: DatabaseSelectDialogProps) {
  const [selectedModule, setSelectedModule] = useState<
    "pathogen" | "immunogenomics" | "protein" | "custom"
  >("pathogen");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDbIds, setExpandedDbIds] = useState<Record<string, boolean>>({
    "db-pathogen-1": true,
  });

  // Keep track of selected file paths (Set of strings)
  const [selectedPaths, setSelectedPaths] = useState<string[]>(() => {
    if (!currentValue) return [];
    return currentValue
      .split(/[,;\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
  });

  // Reset or initialize when modal opens
  React.useEffect(() => {
    if (open) {
      if (currentValue) {
        const initial = currentValue
          .split(/[,;\n]/)
          .map((p) => p.trim())
          .filter(Boolean);
        setSelectedPaths(initial);
      }
    }
  }, [open, currentValue]);

  const toggleExpand = (id: string) => {
    setExpandedDbIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTogglePath = (path: string) => {
    setSelectedPaths((prev) => {
      if (prev.includes(path)) {
        return prev.filter((p) => p !== path);
      } else {
        return [...prev, path];
      }
    });
  };

  const handleSelectEntireDb = (db: DatabaseCategoryItem) => {
    const allFilePaths = db.files.map((f) => f.path);
    const areAllSelected = allFilePaths.every((p) => selectedPaths.includes(p));

    if (areAllSelected) {
      // Unselect all files in this db
      setSelectedPaths((prev) => prev.filter((p) => !allFilePaths.includes(p) && p !== db.rootPath));
    } else {
      // Select main rootPath or all files
      const newPaths = Array.from(new Set([...selectedPaths, ...allFilePaths]));
      setSelectedPaths(newPaths);
    }
  };

  const handleConfirm = () => {
    const result = selectedPaths.join(", ");
    onSelect(result);
    onOpenChange(false);
  };

  // Filtered databases based on category and search
  const filteredDatabases = useMemo(() => {
    return PRESET_DATABASES.filter((db) => {
      const matchCategory = db.category === selectedModule;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        db.name.toLowerCase().includes(q) ||
        db.rootPath.toLowerCase().includes(q) ||
        db.description.toLowerCase().includes(q) ||
        db.files.some(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.path.toLowerCase().includes(q) ||
            (f.description && f.description.toLowerCase().includes(q))
        )
      );
    });
  }, [selectedModule, searchQuery]);

  const activeModuleMeta = DATABASE_MODULES.find((m) => m.id === selectedModule)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-[95vw] md:w-[92vw] lg:w-[1160px] xl:w-[1260px] h-[86vh] max-h-[840px] min-h-[600px] p-0 flex flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200 flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                选择参考与注释数据库
                <Badge variant="outline" className="text-[11px] font-normal border-sky-200 bg-sky-50 text-sky-700">
                  支持多选 / 部分文件单选多选
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                从四大核心库区中选择所需数据库或展开具体文件，勾选后将自动拼接填充至物种注释命令参数中
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body Layout: Left Sidebar (4 categories) + Right Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Sidebar: 4 Major Database Modules */}
          <div className="w-72 md:w-80 bg-slate-50/90 border-r border-slate-200 p-3.5 space-y-2.5 shrink-0 flex flex-col">
            <div className="px-2 py-1 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-left">
              数据库模块分类
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {DATABASE_MODULES.map((mod) => {
                const isActive = selectedModule === mod.id;
                const count = PRESET_DATABASES.filter((d) => d.category === mod.id).length;

                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setSelectedModule(mod.id);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "w-full text-left px-3.5 py-2.5 rounded-xl transition-all border flex items-center justify-between cursor-pointer group",
                      isActive
                        ? "bg-white border-sky-300 text-slate-900 shadow-sm ring-1 ring-sky-200"
                        : "bg-white/60 border-slate-200/70 hover:bg-white hover:border-slate-300 text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span className={cn("text-xs font-bold truncate", isActive ? "text-sky-900 font-extrabold" : "text-slate-700")}>
                      {mod.name}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1.5",
                        isActive ? "bg-sky-100 text-sky-700" : "bg-slate-200/70 text-slate-500"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Count Indicator in Sidebar */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-left shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>当前已选路径</span>
                <Badge className="bg-[#0284c7] text-white hover:bg-[#0284c7] font-mono text-[11px] h-5 px-2">
                  {selectedPaths.length}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                确认后将自动填入输入框，并同步更新命令行中的 <code className="font-mono text-sky-700">--db</code> 参。
              </p>
            </div>
          </div>

          {/* Right Content Area: Database List & File Multi-select */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
            {/* Filter & Search Bar */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                  {activeModuleMeta.name}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">共 {filteredDatabases.length} 个数据库</span>
              </div>

              <div className="relative w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <Input
                  type="text"
                  placeholder="搜索数据库名称、路径或文件名..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-slate-50 border-slate-200 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Database Table / List Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {filteredDatabases.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                  <FolderOpen className="w-10 h-10 stroke-1 text-slate-300" />
                  <p className="text-xs">暂无匹配的数据库或文件</p>
                  <p className="text-[11px] text-slate-400">请尝试更换搜索关键字或切换左侧分类</p>
                </div>
              ) : (
                filteredDatabases.map((db) => {
                  const isExpanded = !!expandedDbIds[db.id];
                  const allFilePaths = db.files.map((f) => f.path);
                  const selectedFilesInDb = db.files.filter((f) => selectedPaths.includes(f.path));
                  const isFullySelected = allFilePaths.length > 0 && selectedFilesInDb.length === allFilePaths.length;
                  const isPartiallySelected = selectedFilesInDb.length > 0 && !isFullySelected;

                  return (
                    <div
                      key={db.id}
                      className={cn(
                        "rounded-xl border transition-all overflow-hidden",
                        isFullySelected || isPartiallySelected
                          ? "border-sky-300 bg-sky-50/20 shadow-xs"
                          : "border-slate-200/90 bg-white hover:border-slate-300"
                      )}
                    >
                      {/* Database Main Row */}
                      <div className="p-3.5 flex items-start gap-3 bg-white">
                        {/* Checkbox for Entire Database */}
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleSelectEntireDb(db)}
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer",
                              isFullySelected
                                ? "bg-[#0284c7] border-[#0284c7] text-white"
                                : isPartiallySelected
                                ? "bg-sky-100 border-[#0284c7] text-[#0284c7]"
                                : "border-slate-300 hover:border-slate-400 bg-white"
                            )}
                            title={isFullySelected ? "取消全选" : "全选该数据库所有文件"}
                          >
                            {isFullySelected && <Check className="w-3 h-3 stroke-[3]" />}
                            {isPartiallySelected && <span className="w-2 h-0.5 bg-[#0284c7] rounded-full"></span>}
                          </button>
                        </div>

                        {/* Database Info */}
                        <div className="flex-1 min-w-0 text-left space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{db.name}</h4>
                          </div>

                          {/* Database Root Path */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据库路径:</span>
                            <code className="text-[11px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 truncate max-w-[500px]">
                              {db.rootPath}
                            </code>
                          </div>
                        </div>

                        {/* Action: Expand Files Button */}
                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(db.id)}
                            className="text-xs text-slate-500 hover:text-sky-700 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-sky-200 hover:bg-sky-50/50 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>文件清单 ({db.files.length})</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable File List Section */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/60 p-3 pl-9 space-y-2">
                          <div className="text-[11px] font-semibold text-slate-500 text-left flex items-center justify-between">
                            <span>点击单选或多选具体文件路径：</span>
                            <span className="text-[10px] text-slate-400">已选中 {selectedFilesInDb.length} / {db.files.length} 个文件</span>
                          </div>

                          <div className="space-y-1.5">
                            {db.files.map((file) => {
                              const isFileSelected = selectedPaths.includes(file.path);
                              return (
                                <div
                                  key={file.id}
                                  onClick={() => handleTogglePath(file.path)}
                                  className={cn(
                                    "flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-left",
                                    isFileSelected
                                      ? "bg-white border-sky-400 shadow-2xs ring-1 ring-sky-200"
                                      : "bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300"
                                  )}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div
                                      className={cn(
                                        "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                                        isFileSelected
                                          ? "bg-[#0284c7] border-[#0284c7] text-white"
                                          : "border-slate-300 bg-white"
                                      )}
                                    >
                                      {isFileSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <FileCode className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                        <span className="text-xs font-bold text-slate-800 truncate font-mono">
                                          {file.name}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] font-mono px-1 py-0 h-4 border-slate-200 text-slate-500"
                                        >
                                          {file.type}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400">{file.size}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5 pl-5">
                                        {file.path}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Area with Selected Paths Summary and Confirm Button */}
        <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 flex sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">选定路径预览:</span>
              {selectedPaths.length > 0 ? (
                <span className="text-[11px] text-sky-700 font-mono truncate max-w-xl">
                  {selectedPaths.join(", ")}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">尚未选择任何数据库或文件</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 px-3 cursor-pointer"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedPaths.length === 0}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs h-8 px-4 font-bold shadow-xs cursor-pointer"
            >
              确定填充 ({selectedPaths.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
