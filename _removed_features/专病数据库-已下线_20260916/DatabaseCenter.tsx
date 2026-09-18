import { useState, useMemo } from "react";
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Info, 
  ArrowUpRight, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Globe,
  FileSearch,
  Check, 
  RefreshCw, 
  FolderOpen, 
  MapPin, 
  File, 
  Radio, 
  Sliders, 
  BookOpen, 
  Dna, 
  Workflow, 
  Activity, 
  Folder,
  X,
  User,
  Shield,
  FileSpreadsheet,
  DownloadCloud,
  Plus,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SequenceDetailPage } from "./SequenceDetailPage";

// Define mock metadata for databases
interface DatabaseMetadata {
  id: string;
  type: 'builtin' | 'self' | 'external';
  name: string;
  category: string;
  version: string;
  securityLevel: '绝密' | '机密' | '秘密' | '内部' | '公开';
  maintainer: string;
  updateTime: string;
  description: string;
  sampleCount?: number;
  recordCount: number;
  mountPath?: string;
  externalUrl?: string;
  fileList?: Array<{ name: string; size: string; type: string }>;
  dataType?: string;
  size?: string;
  uploader?: string;
  source?: string;
  db_code?: string;
  covered_species?: string;
  original_source?: string;
  download_date?: string;
  sha256?: string;
  matrixAttribution?: string;
  chainsCount?: number;
}

const MOCK_DATABASES: DatabaseMetadata[] = [
  {
    id: "DB-01",
    type: "builtin",
    name: "TCR-Seq 结核病免疫监视专项数据库",
    category: "TCR",
    version: "v2026.05",
    securityLevel: "机密",
    maintainer: "张教授团队",
    updateTime: "2026-05-18",
    description: "本数据收集研究了结核分枝杆菌在临床感染前后的T细胞受体 (TCR) CDR3库特征、V基因多态性等AIRR标准化信息。",
    recordCount: 154000,
    sampleCount: 48,
    mountPath: "/data/builtin/db/tcr_tuberculosis_v1/",
    fileList: [
      { name: "tcr_tuberculosis_airr.tsv", size: "412 MB", type: "TSV" },
      { name: "metadata.xlsx", size: "124 KB", type: "Excel" },
      { name: "qc_report.pdf", size: "2.1 MB", type: "PDF" }
    ],
    dataType: "TCR 克隆库",
    size: "414.2 MB",
    uploader: "王工程师",
    source: "国家生物科学中心"
  },
  {
    id: "DB-02",
    type: "self",
    name: "BCR-Seq 获得性免疫缺陷(HIV)高通量序列数据库",
    category: "BCR",
    version: "v2026.02",
    securityLevel: "绝密",
    maintainer: "陈研究员",
    updateTime: "2026-03-01",
    description: "整合并标准了全期感染者的B细胞受体序列重排数据，侧重于广谱中和抗体的深度动力学演化克隆轨迹分析。",
    recordCount: 945000,
    sampleCount: 24,
    mountPath: "/data/self/db/bcr_hiv_depth/",
    fileList: [
      { name: "bcr_hiv_clone_v2.tsv", size: "1.8 GB", type: "TSV" },
      { name: "sample_mappings.json", size: "89 KB", type: "JSON" },
      { name: "expression_matrix_associated.h5ad", size: "1.2 GB", type: "h5ad" }
    ],
    dataType: "BCR 库重排",
    size: "3.08 GB",
    uploader: "陈研究员",
    source: "自测序列数据"
  },
  {
    id: "DB-03",
    type: "builtin",
    name: "通用人类免疫细胞基因公共库",
    category: "表达矩阵",
    version: "v2024.11",
    securityLevel: "公开",
    maintainer: "物理生物科学组",
    updateTime: "2024-11-05",
    description: "覆盖20余种常见炎性疾病及健康双侧单细胞转录组，提供高质量细胞聚类及标准表达矩阵信息。",
    recordCount: 4500000,
    sampleCount: 100,
    mountPath: "/data/common/db/human_immune_atlas/",
    fileList: [
      { name: "human_immune_matrix.mtx", size: "3.2 GB", type: "Matrix" },
      { name: "barcodes.tsv", size: "48 MB", type: "TSV" },
      { name: "genes.tsv", size: "12 MB", type: "TSV" }
    ],
    dataType: "单细胞转录组矩阵",
    size: "3.26 GB",
    uploader: "黄助理研究员",
    source: "GEO (GSE120448)",
    db_code: "human_immune_atlas",
    covered_species: "单物种 (Homo sapiens)",
    original_source: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE120448",
    download_date: "2024-11-04 (管理员: 黄助理研究员)",
    sha256: "b4fc7c251d1e8b8098c772ea4e51854ea0131ee68f9be35ee8b896932a3fc55a",
    matrixAttribution: "GEO人类免疫图谱项目中心归属",
    chainsCount: 0
  },
  {
    id: "DB-04",
    type: "external",
    name: "IEDB 免疫表位数据库与分析资源 (外链)",
    category: "通用公共",
    version: "v2026.04",
    securityLevel: "公开",
    maintainer: "IEDB Consortium",
    updateTime: "2026-04-10",
    description: "提供抗体与T细胞表位实验数据的多维检索分析平台，适用于疫苗设计与免疫原性评估。",
    recordCount: 2400000,
    externalUrl: "https://www.iedb.org"
  },
  {
    id: "DB-05",
    type: "self",
    name: "自建高敏抗原特异性 BCR 序列诊断仓库",
    category: "BCR",
    version: "v1.2.0",
    securityLevel: "机密",
    maintainer: "生信分析小组",
    updateTime: "2026-05-25",
    description: "本项目针对特定肺癌及自身免疫疾病，高敏感度捕捉患者血清中的抗原特异性 BCR 序列。",
    recordCount: 420000,
    sampleCount: 36,
    mountPath: "/data/self/db/bcr_lung_cancer/",
    fileList: [
      { name: "bcr_seqs_cancer_all.tsv", size: "900 MB", type: "TSV" },
      { name: "patient_stages.xlsx", size: "45 KB", type: "Excel" }
    ],
    dataType: "BCR 序列克隆群",
    size: "900.05 MB",
    uploader: "林分析师",
    source: "合作医院病理组"
  },
  {
    id: "DB-06",
    type: "builtin",
    name: "内置新型冠状病毒 (SARS-CoV-2) 特异性 TCR 对照库",
    category: "TCR",
    version: "v2023.01",
    securityLevel: "秘密",
    maintainer: "国家重点实验室",
    updateTime: "2023-01-20",
    description: "专为新冠感染、接种后群体设计的特异性 TCR CDR3 克隆型对照库，完美支持变异株特异性筛查。",
    recordCount: 310000,
    sampleCount: 15,
    mountPath: "/data/builtin/db/sars_cov2_tcr/",
    fileList: [
      { name: "sars_cov2_tcr_cdr3.tsv", size: "520 MB", type: "TSV" },
      { name: "donor_qc.csv", size: "28 KB", type: "CSV" }
    ],
    dataType: "TCR CDR3 克隆型库",
    size: "520.03 MB",
    uploader: "赵组长",
    source: "国家共享中心"
  },
  {
    id: "DB-07",
    type: "builtin",
    name: "健康人群抗体库 BCR 测序多样性数据集",
    category: "BCR",
    version: "v2025.01",
    securityLevel: "公开",
    maintainer: "AIRR Community",
    updateTime: "2025-01-14",
    description: "高通量测序获取的健康人IgG/IgM库重排比对分析数据，支持克隆扩增与动力学比对。",
    recordCount: 1200000,
    sampleCount: 60,
    mountPath: "/data/common/db/caucasian_airr_v1/",
    fileList: [
      { name: "caucasian_igh_clone.tsv", size: "1.1 GB", type: "TSV" }
    ],
    dataType: "BCR 重排克隆",
    size: "1.10 GB",
    uploader: "李生物学者",
    source: "NCBI BioProject (PRJNA6620)",
    db_code: "caucasian_airr_v1",
    covered_species: "单物种 (Homo sapiens)",
    original_source: "https://www.ncbi.nlm.nih.gov/bioproject/PRJNA6620",
    download_date: "2025-01-12 (管理员: 李生物学者)",
    sha256: "e72a8c351f1f8b8098c772ea4e51854ea0131ee68f9be35ee8b896932a3fc13b",
    matrixAttribution: "AIRR Community 多样性抗体中心归属",
    chainsCount: 2
  },
  {
    id: "DB-08",
    type: "builtin",
    name: "结核分枝杆菌肺部感染宿主 TCR-Seq 共享库",
    category: "TCR",
    version: "v2025.03",
    securityLevel: "公开",
    maintainer: "病毒免疫课题组",
    updateTime: "2025-03-22",
    description: "专为呼吸道及肺部结核分枝杆菌潜伏感染宿主随访设计，包含多时间点的高特异性 TCR CDR3 克隆型库。",
    recordCount: 890000,
    sampleCount: 30,
    mountPath: "/data/common/db/covid_recovered_tcr/",
    fileList: [
      { name: "covid_tcr_repertoire.tsv", size: "820 MB", type: "TSV" }
    ],
    dataType: "TCR CDR3 高通序",
    size: "820 MB",
    uploader: "王研究员",
    source: "SRA (SRP19208)",
    db_code: "covid_recovered_tcr",
    covered_species: "单物种 (Homo sapiens)",
    original_source: "https://www.ncbi.nlm.nih.gov/sra/?term=SRP19208",
    download_date: "2025-03-20 (管理员: 王研究员)",
    sha256: "c1a2d3ac1b1b8b8098c772ea4e51854ea0131ee68f9be35ee8b896932a3fc421",
    matrixAttribution: "SRA 宿主与病毒免疫交互中心归属",
    chainsCount: 2
  },
  {
    id: "DB-09",
    type: "builtin",
    name: "Kraken2 标准数据库",
    category: "物种鉴定",
    version: "v2.1.2",
    securityLevel: "公开",
    maintainer: "张工",
    updateTime: "2026-05-20",
    description: "病原微生物分类参考指数、菌群测序注释、多物种宏基因组组装基因目录匹配。",
    recordCount: 45000000,
    sampleCount: 160,
    mountPath: "/data/biodb/kraken2_standard/",
    fileList: [
      { name: "hash.k2d", size: "52 GB", type: "Index" },
      { name: "taxo.k2d", size: "16 GB", type: "Index" }
    ],
    dataType: "病原微生物分类",
    size: "68 GB",
    uploader: "张工",
    source: "https://benlangmead.github.io/aws-indexes/k2",
    db_code: "kraken2_standard",
    covered_species: "细菌 28,420, 病毒 3,156, 真菌 842",
    original_source: "https://benlangmead.github.io/aws-indexes/k2",
    download_date: "2026-05-18 (管理员: 张工)",
    sha256: "a3f80c65511b8b8098c772ea4e51854ea0131ee68f9be35ee8b896932a3fc421"
  }
];

// Mock sequence data for TCR/BCR SEQUENCE SEARCH
interface SequenceRecord {
  sequence_id: string;
  cdr3_aa: string;
  v_call: string;
  j_call: string;
  locus: string;
  disease_type: string;
  sample_type: string;
  source_db: string;
  age: number;
  gender: string;
  pmid: string;
  // full properties
  d_call: string;
  productive: string;
  consensus_count: number;
  v_identity: number;
  junction_aa: string;
  dataset_name: string;
}

const MOCK_SEQUENCES: SequenceRecord[] = [
  {
    sequence_id: "SRR8945120-001",
    cdr3_aa: "CASSLAPGATNEKLFF",
    v_call: "TRBV9",
    j_call: "TRBJ1-4",
    locus: "TRB",
    disease_type: "活动性结核",
    sample_type: "外周血",
    source_db: "iReceptor",
    age: 38,
    gender: "男",
    pmid: "38245123",
    d_call: "TRBD1",
    productive: "T",
    consensus_count: 820,
    v_identity: 99.2,
    junction_aa: "CASSLAPGATNEKLFF",
    dataset_name: "Tuberculosis TCR Reconstruction Dataset (PRJNA49241)"
  },
  {
    sequence_id: "SRR8945120-002",
    cdr3_aa: "CASSYTGGNQPQHF",
    v_call: "TRBV6-1",
    j_call: "TRBJ1-5",
    locus: "TRB",
    disease_type: "活动性结核",
    sample_type: "外周血",
    source_db: "iReceptor",
    age: 41,
    gender: "女",
    pmid: "38245123",
    d_call: "TRBD2",
    productive: "T",
    consensus_count: 421,
    v_identity: 98.4,
    junction_aa: "CASSYTGGNQPQHF",
    dataset_name: "Tuberculosis TCR Reconstruction Dataset (PRJNA49241)"
  },
  {
    sequence_id: "VDJ-89231",
    cdr3_aa: "CARDRVTGSWFDPW",
    v_call: "IGHV4-59",
    j_call: "IGHJ5",
    locus: "IGH",
    disease_type: "潜伏性结核",
    sample_type: "外周血",
    source_db: "VDJdb",
    age: 29,
    gender: "男",
    pmid: "37891022",
    d_call: "IGHD1-1",
    productive: "T",
    consensus_count: 1420,
    v_identity: 96.5,
    junction_aa: "CARDRVTGSWFDPW",
    dataset_name: "Latent TB Immune Mapping (VDJdb-2024-LTB)"
  },
  {
    sequence_id: "VDJ-89232",
    cdr3_aa: "CAREGGYNWFDPW",
    v_call: "IGHV3-23",
    j_call: "IGHJ5",
    locus: "IGH",
    disease_type: "潜伏性结核",
    sample_type: "外周血",
    source_db: "VDJdb",
    age: 53,
    gender: "男",
    pmid: "37891022",
    d_call: "IGHD3-3",
    productive: "T",
    consensus_count: 2201,
    v_identity: 97.8,
    junction_aa: "CAREGGYNWFDPW",
    dataset_name: "Latent TB Immune Mapping (VDJdb-2024-LTB)"
  },
  ...Array.from({ length: 41 }).map((_, idx) => {
    const loci = ["TRA", "TRB", "IGH", "IGK", "IGL", "TRD", "TRG"];
    const locus = loci[idx % loci.length];
    const isBcell = ["IGH", "IGK", "IGL"].includes(locus);
    
    // Mix diseases to look rich
    const diseaseList = ["健康对照", "活动性结核", "潜伏性结核", "艾滋", "乙肝"];
    const disease_type = diseaseList[idx % diseaseList.length];
    const sample_type = idx % 2 === 0 ? "外周血" : "PBMC";
    const source_db = idx % 2 === 0 ? "iReceptor" : "VDJdb";

    const v_call = isBcell 
      ? `IGHV${3 + (idx % 3)}-${10 + (idx % 10)}` 
      : locus === "TRA" ? `TRAV${1 + (idx % 4)}-${2 + (idx % 8)}` : `TRBV${5 + (idx % 3)}-${1 + (idx % 8)}`;
    const j_call = isBcell
      ? `IGHJ${4 + (idx % 2)}`
      : locus === "TRA" ? `TRAJ${10 + (idx % 10)}` : `TRBJ${1 + (idx % 2)}-${1 + (idx % 2)}`;

    const cdr3s = [
      "CASSFGQGADEQFF", "CASSLSFEGYTF", "CAVREDGNYKYVF", "CASSLGAGNSPLHF", 
      "CDRVTYYYFDYW", "CASSYQGGHFEAFF", "CAGQDGGATNKLIF", "CASSLWTGESYGYTF"
    ];
    const cdr3 = cdr3s[idx % cdr3s.length];

    const datasetNames = [
      "TB-Control-Bulk-Repertoire-GSE194562",
      "Beijing TB Cohort Deep Sequencing",
      "iReceptor Pulmonary Tuberculosis Project",
      "EBI-ENA-High-throughput-VDJ-Seq",
      "Healthy Donors PBMC Profiling v2"
    ];
    const dataset_name = datasetNames[idx % datasetNames.length];

    return {
      sequence_id: `SEQ-${200000 + idx}`,
      cdr3_aa: cdr3,
      v_call,
      j_call,
      locus,
      disease_type,
      sample_type,
      source_db,
      age: 20 + (idx * 3) % 45,
      gender: idx % 2 === 0 ? "男" : "女",
      pmid: `37891${100 + idx}`,
      d_call: isBcell ? "IGHD1-1" : "TRBD1",
      productive: "T",
      consensus_count: 300 + idx * 80,
      v_identity: 95.5 + (idx % 5) * 0.5,
      junction_aa: cdr3,
      dataset_name
    };
  })
];

interface CellTypeComment {
  name: string;
  count: number;
}

// Mock expression matrices data
interface ExpressionMatrix {
  id: string;
  name: string;
  disease: string;
  tissue: string;
  cellCount: number;
  geneCount: number;
  platform: string;
  literature: string;
  fullLiterature?: string;
  doi?: string;
  pmid?: string;
  fileSize: string;
  sampleCountText?: string;
  sampleCount: number;
  uploader: string;
  description: string;
  statusBadge: "公开" | "内部";
  species: string;
  matrixName: string;
  updatedAt: string;
  cellTypes?: CellTypeComment[];
}

const MOCK_MATRICES: ExpressionMatrix[] = [
  {
    id: "MAT-01",
    name: "活动性结核 PBMC 单细胞图谱",
    disease: "活动性结核",
    tissue: "外周血 (PBMC)",
    species: "Homo sapiens",
    matrixName: "tb_pbmc_atlas_2024",
    cellCount: 68420,
    geneCount: 22184,
    platform: "10x Genomics",
    literature: "GSE194562 · Wang et al. 2024 · Nature Immunology",
    fullLiterature: "Wang et al. (2024). Single-cell landscape of peripheral immune cells in active tuberculosis patients reveals distinct CD8+ T cell exhaustion signatures. Nature Immunology, 25(8), 1421-1435.",
    pmid: "38245123",
    doi: "10.1038/s41590-024-1234-x",
    fileSize: "2.4 GB",
    sampleCountText: "67",
    sampleCount: 67,
    uploader: "张教授团队",
    description: "45 例活动性结核患者与 22 例健康对照 PBMC scRNA-seq 数据。",
    statusBadge: "公开",
    updatedAt: "2026-05-12",
    cellTypes: [
      { name: "CD4+ T", count: 18420 },
      { name: "CD8+ T", count: 14205 },
      { name: "NK", count: 8140 },
      { name: "B cell", count: 7820 },
      { name: "Monocyte", count: 12510 },
      { name: "DC", count: 3205 },
      { name: "Other", count: 4120 }
    ]
  },
  {
    id: "MAT-02",
    name: "HIV-1 感染 CD4+ T 细胞图谱",
    disease: "HIV-1 感染",
    tissue: "外周血 (PBMC)",
    species: "Homo sapiens",
    matrixName: "hiv_cd4_tcell_2024",
    cellCount: 42815,
    geneCount: 21442,
    platform: "10x Genomics",
    literature: "GSE198877 · Liu et al. 2024 · Cell Host & Microbe",
    fullLiterature: "Liu et al. (2024). Reprogramming of CD4+ T cell repertoire during antiretroviral therapy in HIV-1 infected individuals. Cell Host & Microbe, 32(3), 415-429.",
    pmid: "38411244",
    doi: "10.1016/j.chom.2024.01.011",
    fileSize: "1.8 GB",
    sampleCountText: "24",
    sampleCount: 24,
    uploader: "刘研究员",
    description: "HIV-1 感染者外周血 CD4+ T 细胞 scRNA-seq，含 ART 前后对照。",
    statusBadge: "公开",
    updatedAt: "2026-04-18",
    cellTypes: [
      { name: "Naive CD4+ T", count: 15410 },
      { name: "Memory CD4+ T", count: 18230 },
      { name: "Treg", count: 3120 },
      { name: "Tfh", count: 2850 },
      { name: "Other T", count: 3205 }
    ]
  },
  {
    id: "MAT-03",
    name: "慢性乙肝肝组织单细胞图谱",
    disease: "慢性乙肝",
    tissue: "肝脏组织",
    species: "Homo sapiens",
    matrixName: "hbv_liver_atlas_2024",
    cellCount: 31205,
    geneCount: 20816,
    platform: "10x Genomics",
    literature: "GSE205412 · Zhang et al. 2024 · Hepatology",
    fullLiterature: "Zhang et al. (2024). Single-cell dissection of liver-resident immune microenvironment in chronic hepatitis B patients. Hepatology, 79(2), 232-246.",
    pmid: "37981240",
    doi: "10.1002/hep.32890",
    fileSize: "1.2 GB",
    sampleCountText: "15",
    sampleCount: 15,
    uploader: "张教授团队",
    description: "慢性乙肝患者肝穿刺组织 scRNA-seq，识别耗竭性 T 细胞亚群。",
    statusBadge: "内部",
    updatedAt: "2026-03-05",
    cellTypes: [
      { name: "CD8+ Tex", count: 8420 },
      { name: "CD4+ T", count: 6205 },
      { name: "NK & NKT", count: 7140 },
      { name: "Kupffer Cells", count: 4210 },
      { name: "B cell & Plasma", count: 3120 },
      { name: "Other", count: 2110 }
    ]
  },
  {
    id: "MAT-04",
    name: "健康人群 PBMC 参考图谱",
    disease: "健康人群",
    tissue: "外周血 (PBMC)",
    species: "Homo sapiens",
    matrixName: "healthy_pbmc_ref_2024",
    cellCount: 156820,
    geneCount: 23011,
    platform: "10x Genomics",
    literature: "GSE201234 · Multi-center 2024",
    fullLiterature: "Multi-center Consortium. (2024). A standardized single-cell reference map of human peripheral blood mononuclear cells. bioRxiv, doi:10.1101/2024.02.15.580124.",
    pmid: "38912401",
    doi: "10.1101/2024.02.15.580124",
    fileSize: "5.1 GB",
    sampleCountText: "100",
    sampleCount: 100,
    uploader: "系统管理员",
    description: "100 例健康成人 PBMC scRNA-seq 参考数据集。",
    statusBadge: "公开",
    updatedAt: "2026-02-14",
    cellTypes: [
      { name: "CD4+ T", count: 48510 },
      { name: "CD8+ T", count: 32410 },
      { name: "NK", count: 21540 },
      { name: "B cell", count: 18230 },
      { name: "Monocyte", count: 25410 },
      { name: "DC", count: 6120 },
      { name: "Other", count: 4600 }
    ]
  }
];

export interface CommonPublicDB {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  version: string;
  species: string;
  size: string;
  maintainer: string;
  updateTime: string;
  db_code: string;
  covered_species: string;
  original_source: string;
  download_date: string;
  sha256: string;
  monthly_downloads: number;
  total_users: number;
  tools: string[];
  fileTreeText: string;
  sampleCount?: number;
  matrixAttribution?: string;
  chainsCount?: number;
}

export const COMMON_PUBLIC_DBS: CommonPublicDB[] = [
  {
    id: "CP-01",
    name: "Kraken2 标准数据库",
    subtitle: "病原微生物分类参考",
    category: "物种鉴定",
    version: "v2.1.2",
    species: "多物种",
    size: "68 GB",
    maintainer: "张工",
    updateTime: "2026-05-20",
    db_code: "kraken2_standard",
    covered_species: "细菌 28,420, 病毒 3,156, 真菌 842",
    original_source: "https://benlangmead.github.io/aws-indexes/k2",
    download_date: "2026-05-18 (管理员: 张工)",
    sha256: "a3f80c65511b8b8098c772ea4e51854ea0131ee68f9be35ee8b896932a3fc421",
    monthly_downloads: 128,
    total_users: 52,
    tools: ["Kraken2 v2.1.2", "Bracken v2.7"],
    fileTreeText: `/data/biodb/kraken2_standard/
├── hash.k2d       (52 GB)  - 主索引文件
├── opts.k2d       (4 KB)   - 选项
├── taxo.k2d       (16 GB)  - 分类树
└── library/                - 原始序列
    ├── bacteria/
    ├── viral/
    ├── fungi/
    └── human/
└── README.md`,
    sampleCount: 250,
    matrixAttribution: "多物种宏基因组组学中心归属",
    chainsCount: 0
  },
  {
    id: "CP-02",
    name: "人类参考基因组 GRCh38",
    subtitle: "含 BWA / STAR / Bowtie2 索引",
    category: "参考基因组",
    version: "GRCh38.p14",
    species: "Homo sapiens",
    size: "3.2 GB",
    maintainer: "张工",
    updateTime: "2026-04-15",
    db_code: "grch38_p14_indexed",
    covered_species: "单物种 (Homo sapiens)",
    original_source: "https://www.ncbi.nlm.nih.gov/assembly/GCF_000001405.40",
    download_date: "2026-04-12 (管理员: 张工)",
    sha256: "d9e034ac2bdf1e6a9ee8b827e8a9392ab7168fefb09c916298db8f906f23bcf4",
    monthly_downloads: 356,
    total_users: 114,
    tools: ["BWA v0.7.17", "STAR v2.7.10", "Bowtie2 v2.5.1"],
    fileTreeText: `/data/biodb/reference/grch38/
├── genome.fa             (3.1 GB)  - 基因组FASTA文件
├── genome.fa.fai         (20 KB)   - FAI索引
├── bwa_index/                      - BWA序列索引目录
│   ├── genome.fa.amb
│   └── genome.fa.sa
├── star_index/                     - STAR拼接索引目录
└── bowtie2_index/                  - Bowtie2对比索引目录`
  },
  {
    id: "CP-03",
    name: "UniProt SwissProt",
    subtitle: "人工审编蛋白数据库",
    category: "蛋白库",
    version: "2026_03",
    species: "多物种",
    size: "1.8 GB",
    maintainer: "李工",
    updateTime: "2026-04-02",
    db_code: "uniprot_swissprot",
    covered_species: "多物种 (含人、小鼠等57万条高信度人工校对序列)",
    original_source: "https://ftp.uniprot.org/pub/databases/uniprot/current_release/knowledgebase",
    download_date: "2026-03-30 (管理员: 李工)",
    sha256: "f190eec0f4ae8da9e0618b76eb1a056a29be83be25c8cf3290de0183ca20a068",
    monthly_downloads: 184,
    total_users: 79,
    tools: ["BLAST+ v2.14", "Diamond v2.0.15", "HMMER v3.3"],
    fileTreeText: `/data/biodb/uniprot/
├── uniprot_sprot.fasta   (1.2 GB)  - 原始蛋白FASTA序列
├── uniprot_sprot.dmnd    (520 MB)  - Diamond格式二进制索引
├── uniprot_sprot.pin     (12 MB)   - BLAST格式索引
└── uniprot_metadata.tsv  (80 MB)   - 蛋白注释详情映射表`
  },
  {
    id: "CP-04",
    name: "KEGG Pathway 离线包",
    subtitle: "通路与功能注释",
    category: "通路库",
    version: "2026.04",
    species: "多物种",
    size: "620 MB",
    maintainer: "李工",
    updateTime: "2026-04-10",
    db_code: "kegg_pathway_offline",
    covered_species: "多物种 (代谢通路及KO功能关联描述)",
    original_source: "https://www.kegg.jp/kegg/download/",
    download_date: "2026-04-08 (管理员: 李工)",
    sha256: "9d8212e3cfba8a7e0c90d8108a8e10c73297ee61af92a95c96b7cd685f0ef3d1",
    monthly_downloads: 142,
    total_users: 66,
    tools: ["ClusterProfiler v4.8", "KOFAMSCAN v1.3"],
    fileTreeText: `/data/biodb/kegg/
├── kegg_pathway.json     (280 MB)  - 代谢通路层级JSON包
├── ko_definition.tsv    (140 MB)  - KO编号于功能描述映射
├── organism_list.txt     (50 KB)   - 支持物种代号列表
└── pathway_diagrams/     (200 MB)  - 离线高精度通路拓扑结构矢量图`
  },
  {
    id: "CP-05",
    name: "GENCODE 人类基因注释",
    subtitle: "GTF / GFF3 注释文件",
    category: "注释库",
    version: "v45",
    species: "Homo sapiens",
    size: "540 MB",
    maintainer: "张工",
    updateTime: "2026-03-18",
    db_code: "gencode_v45",
    covered_species: "单物种 (Homo sapiens)",
    original_source: "https://www.gencodegenes.org/human/",
    download_date: "2026-03-15 (管理员: 张工)",
    sha256: "887cf45a1cd1f543dcba7aef8a09ee6e28be7fefb09c916298dcbdcb62bce811",
    monthly_downloads: 220,
    total_users: 88,
    tools: ["FeatureCounts v2.0", "HTSeq-count v2.0", "StringTie v2.2"],
    fileTreeText: `/data/biodb/gencode/v45/
├── gencode.v45.annotation.gtf  (450 MB)  - 标准GTF基因注释
├── gencode.v45.annotation.gff3 (85 MB)   - GFF3多层级注释
├── gencode.v45.long_noncoding.gtf (5 MB) - LncRNA专项注释
└── README.txt                  (5 KB)    - 说明文档`
  },
  {
    id: "CP-06",
    name: "IMGT V/D/J 基因参考",
    subtitle: "免疫球蛋白 / TCR 基因命名",
    category: "注释库",
    version: "202605",
    species: "Homo sapiens",
    size: "45 MB",
    maintainer: "张工",
    updateTime: "2026-05-08",
    db_code: "imgt_vdj_human",
    covered_species: "单物种 (Homo sapiens 免疫球蛋白/TCR重排基准体)",
    original_source: "https://www.imgt.org/IMGT-GENE-DB/",
    download_date: "2026-05-05 (管理员: 张工)",
    sha256: "42bbf97ec224fefba09ee6e4a28be7fefb9cfefb09c916298db8f9cdcb334928",
    monthly_downloads: 112,
    total_users: 45,
    tools: ["MiXCR v4.3", "Immcantation v4.4", "CellRanger VDJ v7.1"],
    fileTreeText: `/data/biodb/imgt/human/
├── IMGT_vdj_reference.fasta  (35 MB)   - 包含的V/D/J重排对应碱基序列
├── gene_mapping_table.tsv    (8.2 MB)  - IMGT与NCBI官方标准重命名比对表
└── lcl_alleles.json           (1.8 MB)  - 等位基因突变位点序列高灵敏索引`
  }
];

export function DatabaseCenter() {
  const [activeTab, setActiveTab] = useState<string>("center");

  // Global Simulator Role Selection
  // 'admin' (Data Manager) or 'researcher' (Researcher) or 'guest' (Guest)
  const [currentRole, setCurrentRole] = useState<'admin' | 'researcher' | 'guest'>('admin');

  // Dialog and Details States
  const [selectedDB, setSelectedDB] = useState<DatabaseMetadata | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedCenterCommonDB, setSelectedCenterCommonDB] = useState<DatabaseMetadata | null>(null);

  // Tab 1: Database list filter states
  const [listTab, setListTab] = useState<'builtin' | 'self' | 'external'>('builtin');
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSecurity, setFilterSecurity] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Tab 2: TCR/BCR search states
  const [tcrQuery, setTcrQuery] = useState({
    cdr3_aa: "",
    cdr3LengthMin: "",
    cdr3LengthMax: "",
    v_call: "不限",
    j_call: "不限",
    locus: ["IGH", "TRA", "TRB"] as string[], // prefilled corresponding to the mockup
    disease_type: "不限",
    sample_type: "不限",
    source_db: "不限",
    ageMin: "",
    ageMax: "",
    gender: "全部",
    showAdvanced: false
  });
  const [tcrSearchResults, setTcrSearchResults] = useState<SequenceRecord[]>(MOCK_SEQUENCES);
  const [tcrPage, setTcrPage] = useState<number>(0);
  const [selectedSeq, setSelectedSeq] = useState<SequenceRecord | null>(null);

  // Search filter drop-downs toggle
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Tab 3: Expression matrix search states
  const [matrixQuery, setMatrixQuery] = useState({
    disease: "全部",
    tissue: "全部",
    platform: "全部",
    cellCountRange: "不限",
    pmidGse: ""
  });
  const [selectedMatrix, setSelectedMatrix] = useState<ExpressionMatrix | null>(null);

  // Tab 4: General DB search states
  const [genQuery, setGenQuery] = useState({
    category: "all",
    keyword: "",
    version: "",
    species: "all"
  });
  const [selectedGenDB, setSelectedGenDB] = useState<DatabaseMetadata | null>(null);

  // States for Common Public DB Search (Image 1 and 2)
  const [commonCategory, setCommonCategory] = useState<string>("全部");
  const [commonSpeciesFilter, setCommonSpeciesFilter] = useState<string>("全部");
  const [commonKeyword, setCommonKeyword] = useState<string>("");
  const [selectedCommonDB, setSelectedCommonDB] = useState<CommonPublicDB | null>(null);

  const filteredCommonPublicDBs = useMemo(() => {
    return COMMON_PUBLIC_DBS.filter(db => {
      if (commonCategory !== "全部" && db.category !== commonCategory) return false;
      if (commonSpeciesFilter !== "全部" && db.species !== commonSpeciesFilter) return false;
      if (commonKeyword.trim() !== "") {
        const kw = commonKeyword.toLowerCase();
        return db.name.toLowerCase().includes(kw) || 
               db.subtitle.toLowerCase().includes(kw) || 
               db.category.toLowerCase().includes(kw) || 
               db.maintainer.toLowerCase().includes(kw);
      }
      return true;
    });
  }, [commonCategory, commonSpeciesFilter, commonKeyword]);

  // --- Helpers for Filtering & Checking Visibility ---
  const isSecurityVisible = (dbSec: string, role: string) => {
    if (role === 'admin') return true;
    if (role === 'researcher') {
      // Researchers can see 机密, 秘密, 内部, 公开. Cannot see 绝密
      return dbSec !== '绝密';
    }
    // Guests can only see internal and public (公开, 内部)
    return ['内部', '公开'].includes(dbSec);
  };

  const filteredDatabases = useMemo(() => {
    return MOCK_DATABASES.filter(db => {
      // 1. Filter by role security
      if (!isSecurityVisible(db.securityLevel, currentRole)) return false;

      // 2. Filter by sub tab database type
      if (db.type !== listTab) return false;

      // 3. Filter by category dropdown
      if (filterCategory !== "all" && db.category !== filterCategory) return false;

      // 4. Filter by security label dropdown
      if (filterSecurity !== "all" && db.securityLevel !== filterSecurity) return false;

      // 5. Filter by search keyword
      if (searchKeyword.trim() !== "") {
        const kw = searchKeyword.toLowerCase();
        return db.name.toLowerCase().includes(kw) || 
               db.maintainer.toLowerCase().includes(kw) || 
               db.description.toLowerCase().includes(kw) ||
               db.id.toLowerCase().includes(kw);
      }

      return true;
    });
  }, [listTab, filterCategory, filterSecurity, searchKeyword, currentRole]);

  // Handle Enter Search for direct redirection
  const handleEnterRetrieval = (db: DatabaseMetadata) => {
    setIsDetailOpen(false);
    if (db.category === "TCR" || db.category === "BCR") {
      setActiveTab("sequence");
      // Pre-fill search condition if appropriate
      setTcrQuery(prev => ({
        ...prev,
        source_db: db.maintainer.includes("张教授") ? "PubMed" : "本地克隆"
      }));
    } else if (db.category === "表达矩阵") {
      setActiveTab("expression");
      setMatrixQuery(prev => ({
        ...prev,
        name: db.name
      }));
    } else {
      setActiveTab("center");
      setListTab("common");
      setSelectedCenterCommonDB(db);
    }
  };

  // Check if current role has download permission
  const hasDownloadPermission = (dbSec: string, role: string) => {
    if (role === 'admin') return true;
    if (role === 'researcher') {
      return !['绝密'].includes(dbSec);
    }
    return false; // guests cannot download
  };

  // --- TCR/BCR SEQUENCE RETRIEVAL HANDLERS ---
  const handleTcrSearch = () => {
    const results = MOCK_SEQUENCES.filter(seq => {
      // cdr3
      if (tcrQuery.cdr3_aa.trim() !== "") {
        const queryVal = tcrQuery.cdr3_aa.trim().toUpperCase();
        if (queryVal.includes("*")) {
          const regexStr = "^" + queryVal.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&").replace(/\*/g, ".*") + "$";
          const regex = new RegExp(regexStr);
          if (!regex.test(seq.cdr3_aa.toUpperCase())) return false;
        } else {
          if (!seq.cdr3_aa.toUpperCase().includes(queryVal)) return false;
        }
      }
      
      // cdr3 length min/max
      if (tcrQuery.cdr3LengthMin !== "") {
        const minL = parseInt(tcrQuery.cdr3LengthMin);
        if (!isNaN(minL) && seq.cdr3_aa.length < minL) return false;
      }
      if (tcrQuery.cdr3LengthMax !== "") {
        const maxL = parseInt(tcrQuery.cdr3LengthMax);
        if (!isNaN(maxL) && seq.cdr3_aa.length > maxL) return false;
      }

      // V call
      if (tcrQuery.v_call !== "不限" && seq.v_call !== tcrQuery.v_call) return false;

      // J call
      if (tcrQuery.j_call !== "不限" && seq.j_call !== tcrQuery.j_call) return false;

      // Locus
      if (tcrQuery.locus.length > 0 && !tcrQuery.locus.includes(seq.locus)) return false;

      // Disease
      if (tcrQuery.disease_type !== "不限") {
        if (!seq.disease_type.includes(tcrQuery.disease_type)) return false;
      }

      // Sample
      if (tcrQuery.sample_type !== "不限" && seq.sample_type !== tcrQuery.sample_type) return false;

      // Source
      if (tcrQuery.source_db !== "不限" && seq.source_db !== tcrQuery.source_db) return false;

      // Age range
      if (tcrQuery.ageMin !== "" && seq.age < parseInt(tcrQuery.ageMin)) return false;
      if (tcrQuery.ageMax !== "" && seq.age > parseInt(tcrQuery.ageMax)) return false;

      // Gender
      if (tcrQuery.gender !== "全部" && seq.gender !== tcrQuery.gender) return false;

      return true;
    });

    setTcrSearchResults(results);
    setTcrPage(0);
  };

  const handleTcrReset = () => {
    setTcrQuery({
      cdr3_aa: "",
      cdr3LengthMin: "",
      cdr3LengthMax: "",
      v_call: "不限",
      j_call: "不限",
      locus: [],
      disease_type: "不限",
      sample_type: "不限",
      source_db: "不限",
      ageMin: "",
      ageMax: "",
      gender: "全部",
      showAdvanced: false
    });
    setTcrSearchResults(MOCK_SEQUENCES);
    setTcrPage(0);
  };

  // --- EXPRESSION MATRIX SEARCH HANDLERS ---
  const filteredMatrices = useMemo(() => {
    return MOCK_MATRICES.filter(mat => {
      // 1. Disease
      if (matrixQuery.disease !== "全部") {
        if (mat.disease !== matrixQuery.disease) return false;
      }
      // 2. Tissue
      if (matrixQuery.tissue !== "全部") {
        if (mat.tissue !== matrixQuery.tissue) return false;
      }
      // 3. Platform
      if (matrixQuery.platform !== "全部") {
        if (!mat.platform.toLowerCase().includes(matrixQuery.platform.toLowerCase())) return false;
      }
      // 4. Cell range
      if (matrixQuery.cellCountRange !== "不限") {
        const count = mat.cellCount;
        if (matrixQuery.cellCountRange === ">10万") {
          if (count <= 100000) return false;
        } else if (matrixQuery.cellCountRange === "5万-10万") {
          if (count < 50000 || count > 100000) return false;
        } else if (matrixQuery.cellCountRange === "<5万") {
          if (count >= 50000) return false;
        }
      }
      // 5. PMID / GSE
      if (matrixQuery.pmidGse.trim() !== "") {
        const query = matrixQuery.pmidGse.toLowerCase();
        if (!mat.literature.toLowerCase().includes(query) && 
            !mat.name.toLowerCase().includes(query) && 
            !(mat.id && mat.id.toLowerCase().includes(query))) return false;
      }
      return true;
    });
  }, [matrixQuery]);

  const handleMatrixReset = () => {
    setMatrixQuery({
      disease: "全部",
      tissue: "全部",
      platform: "全部",
      cellCountRange: "不限",
      pmidGse: ""
    });
  };

  // --- GENERAL SEARCH HANDLERS ---
  const filteredGenDBs = useMemo(() => {
    return MOCK_DATABASES.filter(db => {
      // basic filter
      if (!isSecurityVisible(db.securityLevel, currentRole)) return false;
      
      if (genQuery.category !== "all" && db.category !== genQuery.category) return false;
      if (genQuery.keyword.trim() !== "") {
        const kw = genQuery.keyword.toLowerCase();
        if (!db.name.toLowerCase().includes(kw) && !db.maintainer.toLowerCase().includes(kw)) return false;
      }
      if (genQuery.version.trim() !== "" && !db.version.toLowerCase().includes(genQuery.version.toLowerCase())) return false;
      
      return true;
    });
  }, [genQuery, currentRole]);

  const handleExport = (format: string) => {
    alert(`系统正在为检索出的 ${tcrSearchResults.length} 条 TCR/BCR 样本序列打包生成 ${format} 格式导出包，请保管好敏感科研信息。`);
  };

  // Multi-choice helper
  const handleToggleMultiSelect = (field: string, val: string) => {
    if (field === 'v_call' || field === 'j_call' || field === 'locus' || field === 'disease_type' || field === 'sample_type' || field === 'source_db') {
      setTcrQuery(prev => {
        const currentVals = prev[field] as string[];
        const newVal = currentVals.includes(val) 
          ? currentVals.filter(v => v !== val)
          : [...currentVals, val];
        return { ...prev, [field]: newVal };
      });
    } else if (field === 'matrix_disease' || field === 'matrix_tissue' || field === 'matrix_platform') {
      const qField = field.replace('matrix_', '') as 'disease' | 'tissue' | 'platform';
      setMatrixQuery(prev => {
        const currentVals = prev[qField] as string[];
        const newVal = currentVals.includes(val) 
          ? currentVals.filter(v => v !== val)
          : [...currentVals, val];
        return { ...prev, [qField]: newVal };
      });
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 selection:bg-[#02A1C8]/20">
      {/* 1. Page Header with Role Switcher Simulation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#02A1C8] rounded-full inline-block" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">免疫基因组学综合数据库</h2>
          </div>
          <p className="text-muted-foreground text-[11px] tech-mono mt-1">
            提供 TCR/BCR 高通量测序重排、单细胞表达谱矩阵、参考参考指数分类等检索、下载安全审计和离线数据包导入。
          </p>
        </div>


      </div>

      {/* 2. Primary Tabs List */}
      <div className="flex border-b border-slate-200 relative">
        <button
          onClick={() => setActiveTab("center")}
          className={cn(
            "flex items-center gap-2 py-3 px-6 text-xs font-semibold border-b-2 transition-all tech-mono",
            activeTab === "center"
              ? "border-[#02A1C8] text-[#02A1C8]"
              : "border-transparent text-muted-foreground hover:text-slate-800"
          )}
        >
          <Database className="w-4 h-4" />
          数据库中心
        </button>
        <button
          onClick={() => setActiveTab("sequence")}
          className={cn(
            "flex items-center gap-2 py-3 px-6 text-xs font-semibold border-b-2 transition-all tech-mono",
            activeTab === "sequence"
              ? "border-[#02A1C8] text-[#02A1C8]"
              : "border-transparent text-muted-foreground hover:text-slate-800"
          )}
        >
          <Dna className="w-4 h-4" />
          免疫序列(TCR/BCR)检索
        </button>
        <button
          onClick={() => setActiveTab("expression")}
          className={cn(
            "flex items-center gap-2 py-3 px-6 text-xs font-semibold border-b-2 transition-all tech-mono",
            activeTab === "expression"
              ? "border-[#02A1C8] text-[#02A1C8]"
              : "border-transparent text-muted-foreground hover:text-slate-800"
          )}
        >
          <Activity className="w-4 h-4" />
          表达矩阵检索
        </button>
      </div>

      {/* 3. Primary Tabs Content */}
      <div className="flex-1 min-w-0">
        
        {/* ==================================== TAB 1: DATABASE CENTER ==================================== */}
        {activeTab === "center" && (
          <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-200">


            {/* Sub Tabs for Database types */}
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex gap-2">
                {[
                  { id: "builtin", name: "内置专项库" },
                  { id: "self", name: "自建仓库" },
                  { id: "external", name: "外链库" }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setListTab(st.id as any);
                      setFilterCategory("all");
                      setSelectedCenterCommonDB(null);
                    }}
                    className={cn(
                      "text-xs px-4 py-1.5 rounded-lg border transition-all font-medium",
                      listTab === st.id
                        ? "bg-primary/5 text-primary border-primary/30 font-semibold"
                        : "bg-background text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200"
                    )}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>

            {listTab === 'external' ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header block with Globe */}
                <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50/80 flex items-center justify-center text-[#02A1C8]">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 font-sans">外部资源</h3>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">跳转到外部公开数据库（依赖网络配置）</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-550 font-sans font-medium">
                    共 <span className="font-bold text-[#02A1C8] text-sm">6</span> 个
                  </div>
                </div>

                {/* 6 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: "PubMed",
                      desc: "全球权威生物医学文献数据库，收录感染性疾病等领域研究文献，可作为序列与样本的文献溯源入口",
                      letter: "P",
                      bg: "bg-red-50 text-red-650 border border-red-100",
                      url: "https://pubmed.ncbi.nlm.nih.gov/"
                    },
                    {
                      name: "NCBI GEO",
                      desc: "NIH 维护的基因表达综合数据库，含 scRNA-seq、BCR/TCR 测序数据及表达矩阵，附带样本医学基本信息与实验元数据",
                      letter: "G",
                      bg: "bg-emerald-50 text-emerald-650 border border-emerald-100",
                      url: "https://www.ncbi.nlm.nih.gov/geo/"
                    },
                    {
                      name: "NCBI SRA",
                      desc: "NCBI 原始测序数据归档库，与 GEO 联动，提供 BCR/TCR、单细胞测序的原始数据下载入口",
                      letter: "S",
                      bg: "bg-amber-50 text-amber-650 border border-amber-100",
                      url: "https://www.ncbi.nlm.nih.gov/sra"
                    },
                    {
                      name: "VDJdb",
                      desc: "TCR/BCR 与抗原特异性注释数据库，收录 HIV、结核等感染相关受体序列及抗原表位信息，支持大规模受体序列检索",
                      letter: "V",
                      bg: "bg-blue-50 text-blue-650 border border-blue-100",
                      url: "https://vdjdb.cdr3.net/"
                    },
                    {
                      name: "McPAS-TCR",
                      desc: "手动整理的疾病和病原相关 TCR 数据库，涵盖感染性疾病、自身免疫病等类别，带 PubMed ID 溯源链接",
                      letter: "M",
                      bg: "bg-purple-50 text-purple-650 border border-purple-100",
                      url: "https://friedmanlab.weizmann.ac.il/McPAS-TCR/"
                    },
                    {
                      name: "CELLxGENE Census",
                      desc: "统一格式的大规模单细胞 scRNA-seq 数据入口，收录标准化处理的人 / 小鼠单细胞测序数据",
                      letter: "C",
                      bg: "bg-rose-50 text-rose-650 border border-rose-100",
                      url: "https://cellxgene.cziscience.com/census"
                    }
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 hover:shadow-md hover:border-[#02A1C8]/40 transition group cursor-pointer"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0", item.bg)}>
                        {item.letter}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-1 group-hover:text-[#02A1C8] transition-colors truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-2" title={item.desc}>
                          {item.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Filter controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="搜索数据库名称、维护人或特定描述..."
                      className="pl-8 text-xs font-sans h-9"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-background border tech-border rounded-lg px-2.5 text-xs font-sans h-9 cursor-pointer"
                    >
                      <option value="all">所有分类</option>
                      <option value="TCR">TCR 序列库</option>
                      <option value="BCR">BCR 序列库</option>
                      <option value="表达矩阵">表达矩阵谱</option>
                      <option value="通用公共">公共检索库</option>
                    </select>

                    <select
                      value={filterSecurity}
                      onChange={(e) => setFilterSecurity(e.target.value)}
                      className="bg-background border tech-border rounded-lg px-2.5 text-xs font-sans h-9 cursor-pointer"
                    >
                      <option value="all">所有安全等级</option>
                      <option value="公开">公开</option>
                      <option value="内部">内部</option>
                      <option value="秘密">秘密</option>
                      <option value="机密">机密</option>
                      <option value="绝密">绝密</option>
                    </select>
                  </div>

                  <div className="text-right flex items-center justify-end">
                    <span className="text-[11px] text-muted-foreground tech-mono">
                      过滤匹配数量: <span className="text-[#02A1C8] font-bold">{filteredDatabases.length}</span> 个数据库
                    </span>
                  </div>
                </div>

                {/* List and Grid display of databases */}
                {filteredDatabases.length === 0 ? (
                  <div className="text-center p-12 border border-dashed rounded-xl space-y-3 bg-muted/10">
                    <Database className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">没有查查找符合条件的数据库</p>
                    <p className="text-xs text-muted-foreground">可能因为当前角色级别不足或者当前类型下无满足条件的记录。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDatabases.map((db) => {
                      const viewPerm = isSecurityVisible(db.securityLevel, currentRole);
                      const dlPerm = hasDownloadPermission(db.securityLevel, currentRole);
                      
                      return (
                        <Card key={db.id} className="tech-border hover:shadow-md transition duration-200 overflow-hidden flex flex-col bg-background">
                          <CardHeader className="pb-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-muted text-muted-foreground font-mono text-[9px] px-1.5 h-5 rounded">
                                ID: {db.id}
                              </Badge>
                              <div className="flex gap-1.5">
                                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-[9px] px-1.5 h-5">
                                  {db.category}
                                </Badge>
                                <Badge 
                                  className={cn(
                                    "text-[9px] px-1.5 h-5 font-bold",
                                    db.securityLevel === '绝密' ? "bg-red-500/15 text-red-600 border-red-500/20" :
                                    db.securityLevel === '机密' ? "bg-orange-500/15 text-orange-600 border-orange-500/20" :
                                    db.securityLevel === '秘密' ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/20" :
                                    db.securityLevel === '内部' ? "bg-blue-500/15 text-blue-600 border-blue-500/20" :
                                    "bg-green-500/15 text-green-600 border-green-500/20"
                                  )}
                                >
                                  {db.securityLevel}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-sm font-bold tracking-tight text-slate-800 line-clamp-1 pt-1">
                              {db.name}
                            </CardTitle>
                            <CardDescription className="text-[10px] tech-mono flex items-center gap-2">
                              <span>版本: {db.version}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0 flex-1 flex flex-col justify-between space-y-4">
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                              {db.description}
                            </p>

                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-[10px] font-medium tech-mono flex-1 hover:bg-slate-200"
                                onClick={() => {
                                  setSelectedDB(db);
                                  setIsDetailOpen(true);
                                }}
                              >
                                查看详情
                              </Button>
                              
                              {db.type !== 'external' ? (
                                <>
                                  <Button
                                    size="sm"
                                    className="h-7 text-[10px] font-bold tech-mono flex-1 bg-[#02A1C8] hover:bg-[#02A1C8]/90 text-white"
                                    onClick={() => handleEnterRetrieval(db)}
                                  >
                                    进入检索
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-7 text-[10px] font-bold tech-mono flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                                  onClick={() => window.open(db.externalUrl, '_blank')}
                                >
                                  打开外部链接 <ArrowUpRight className="w-3 h-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================================== TAB 2: TCR/BCR SEQUENCE SEARCH ==================================== */}
        {activeTab === "sequence" && (
          selectedSeq ? (
            <SequenceDetailPage seq={selectedSeq} onBack={() => setSelectedSeq(null)} />
          ) : (
            <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-200">
              {/* Page Header aligning with Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight font-sans">
                  TCR / BCR 序列检索
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  检索范围：结核 BCR/TCR 注释库 · v2026.06 (42,180 条记录)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                onClick={() => setActiveTab("center")}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 返回数据库详情
              </Button>
            </div>

            {/* 检索条件 Card */}
            <Card className="border border-slate-200/85 bg-white shadow-xs rounded-xl overflow-hidden">
              <CardHeader className="py-3.5 px-5 bg-slate-50/40 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" /> 检索条件
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* LEFT COLUMN */}
                  <div className="space-y-4">
                    {/* CDR3 aa sequence input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        CDR3 氨基酸序列 (cdr3_aa)
                      </label>
                      <Input
                        placeholder="如: CASSLAPGATNEKLFF"
                        className="text-xs h-9 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition border-slate-200"
                        value={tcrQuery.cdr3_aa}
                        onChange={(e) => setTcrQuery({ ...tcrQuery, cdr3_aa: e.target.value })}
                      />
                      <p className="text-[10px] text-slate-400 font-sans pl-0.5 leading-none mt-1">
                        支持精确/模糊匹配，可使用通配符 *
                      </p>
                    </div>

                    {/* V Gene Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        V 基因 (v_call)
                      </label>
                      <select
                        value={tcrQuery.v_call}
                        onChange={(e) => setTcrQuery({ ...tcrQuery, v_call: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 text-xs h-9 cursor-pointer hover:bg-slate-50 transition"
                      >
                        <option value="不限">不限</option>
                        {Array.from(new Set(MOCK_SEQUENCES.map(s => s.v_call))).map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>



                    {/* Sample Type select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        样本类型 (sample_type)
                      </label>
                      <select
                        value={tcrQuery.sample_type}
                        onChange={(e) => setTcrQuery({ ...tcrQuery, sample_type: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 text-xs h-9 cursor-pointer hover:bg-slate-50 transition"
                      >
                        <option value="不限">不限</option>
                        <option value="外周血">外周血</option>
                        <option value="PBMC">PBMC</option>
                        <option value="全血">全血</option>
                        <option value="肿瘤浸润T细胞">肿瘤浸润T细胞</option>
                        <option value="脾脏组织">脾脏组织</option>
                      </select>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">
                    {/* J Gene select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        J 基因 (j_call)
                      </label>
                      <select
                        value={tcrQuery.j_call}
                        onChange={(e) => setTcrQuery({ ...tcrQuery, j_call: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 text-xs h-9 cursor-pointer hover:bg-slate-50 transition"
                      >
                        <option value="不限">不限</option>
                        {Array.from(new Set(MOCK_SEQUENCES.map(s => s.j_call))).map(j => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>

                    {/* Disease Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        疾病类型 (disease_type)
                      </label>
                      <select
                        value={tcrQuery.disease_type}
                        onChange={(e) => setTcrQuery({ ...tcrQuery, disease_type: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 text-xs h-9 cursor-pointer hover:bg-slate-50 transition"
                      >
                        <option value="不限">不限</option>
                        <option value="活动性结核">活动性结核</option>
                        <option value="潜伏性结核">潜伏性结核</option>
                        <option value="健康对照">健康对照</option>
                        <option value="艾滋">艾滋</option>
                        <option value="乙肝">乙肝</option>
                      </select>
                    </div>

                    {/* Source DB select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        数据来源 (source_db)
                      </label>
                      <select
                        value={tcrQuery.source_db}
                        onChange={(e) => setTcrQuery({ ...tcrQuery, source_db: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 text-xs h-9 cursor-pointer hover:bg-slate-50 transition"
                      >
                        <option value="不限">不限</option>
                        <option value="iReceptor">iReceptor</option>
                        <option value="VDJdb">VDJdb</option>
                        <option value="PubMed">PubMed</option>
                        <option value="GEO">GEO</option>
                        <option value="NCBI">NCBI</option>
                        <option value="本地克隆">本地克隆</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Button
                      size="sm"
                      className="h-9 bg-[#0c356a] hover:bg-[#0c356a]/90 text-white font-semibold flex items-center justify-center gap-1.5 px-5 shadow-xs text-xs rounded-lg min-w-28"
                      onClick={handleTcrSearch}
                    >
                      <Search className="w-3.5 h-3.5" /> 执行检索
                    </Button>
                  </div>

                  <div className="text-[11px] text-muted-foreground font-mono self-end sm:self-auto uppercase tracking-wide">
                    字段对应 AIRR Rearrangement Schema v1.5
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Title with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100 pl-1">
              <div className="text-xs font-medium text-slate-600 font-sans flex items-center gap-1">
                命中 <span className="font-bold text-slate-800 text-sm px-1 font-mono">{tcrSearchResults.length === MOCK_SEQUENCES.length ? "1,284" : tcrSearchResults.length}</span> 条记录 · 耗时 <span className="font-mono text-slate-600">0.23</span> 秒
              </div>
            </div>

            {/* Table layout of records */}
            <Card className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <CardContent className="p-0">
                <ScrollArea className="h-[420px]">
                  <Table>
                    <TableHeader className="bg-slate-50/70 border-b border-slate-100 font-sans sticky top-0 z-10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 h-9 text-slate-600 font-bold shrink-0 text-center">
                          <input type="checkbox" className="rounded border-slate-300 h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer" defaultChecked={false} />
                        </TableHead>
                        <TableHead className="h-9 text-xs text-slate-600 font-bold">sequence_id</TableHead>
                        <TableHead className="h-9 text-xs text-slate-600 font-bold">CDR3 aa</TableHead>
                        <TableHead className="h-9 text-xs text-slate-600 font-bold text-center w-20">locus</TableHead>
                        <TableHead className="h-9 text-xs text-slate-600 font-bold">V / J 基因</TableHead>
                        <TableHead className="h-9 text-xs text-slate-600 font-bold">疾病</TableHead>
                        <TableHead className="h-9 text-xs text-slate-600 font-bold">PMID</TableHead>
                        <TableHead className="h-9 text-xs text-slate-600 font-bold text-center w-20">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tcrSearchResults.slice(tcrPage * 15, (tcrPage + 1) * 15).map((seq) => (
                        <TableRow 
                          key={seq.sequence_id} 
                          className="hover:bg-slate-50/80 cursor-pointer border-b border-slate-100 transition duration-150"
                          onClick={() => setSelectedSeq(seq)}
                        >
                          <TableCell className="py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="rounded border-slate-300 h-3.5 w-3.5 text-[#0c356a] focus:ring-[#0c356a] cursor-pointer" />
                          </TableCell>
                          <TableCell className="py-2.5 text-xs font-mono text-slate-700 font-semibold">{seq.sequence_id}</TableCell>
                          <TableCell className="py-2.5 text-xs font-sans font-bold text-slate-900 tracking-wide">{seq.cdr3_aa}</TableCell>
                          <TableCell className="py-2.5 text-center">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] font-mono font-bold h-5 px-2 py-0 border",
                                ["TRA", "TRB"].includes(seq.locus)
                                  ? "border-amber-200 bg-amber-50/60 text-amber-700"
                                  : "border-blue-200 bg-blue-50/60 text-blue-700"
                              )}
                            >
                              {seq.locus}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs font-mono text-slate-600">{seq.v_call} / {seq.j_call}</TableCell>
                          <TableCell className="py-2.5 text-xs text-slate-700 font-medium">{seq.disease_type}</TableCell>
                          <TableCell className="py-2.5 text-xs font-mono text-[#02A1C8] hover:underline" onClick={(e) => e.stopPropagation()}>
                            <a href={`https://pubmed.ncbi.nlm.nih.gov/${seq.pmid}`} target="_blank" rel="noreferrer">
                              {seq.pmid}
                            </a>
                          </TableCell>
                          <TableCell className="py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="link" 
                              size="xs" 
                              className="text-[#02A1C8] hover:text-[#02A1C8]/80 font-bold p-0 h-auto text-xs"
                              onClick={() => setSelectedSeq(seq)}
                            >
                              详情
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Table pagination */}
                <div className="flex items-center justify-between p-4 border-t bg-slate-50/50">
                  <span className="text-xs text-slate-500 font-sans">
                    展示第 {tcrPage * 15 + 1}-{Math.min((tcrPage + 1) * 15, tcrSearchResults.length)} 条，共 {tcrSearchResults.length} 条记录 (每页 15 条)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={tcrPage === 0} 
                      className="h-7 w-7 p-0 rounded-md border-slate-200"
                      onClick={() => setTcrPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </Button>
                    <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-md text-slate-700">
                      {tcrPage + 1}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={(tcrPage + 1) * 15 >= tcrSearchResults.length} 
                      className="h-7 w-7 p-0 rounded-md border-slate-200"
                      onClick={() => setTcrPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )
        )}

        {/* ==================================== TAB 3: EXPRESSION MATRIX SEARCH ==================================== */}
        {activeTab === "expression" && (
          <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-200">
            {selectedMatrix === null ? (
              /* ==================== SCREEN 1: DATA OVERVIEW PAGE (Fig 1) ==================== */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      表达矩阵检索
                    </h2>
                    <p className="text-xs text-slate-500">
                      scRNA-seq 表达矩阵库 · 1,247 个矩阵 · 8.3M 细胞
                    </p>
                  </div>
                </div>

                {/* Filter Form Block */}
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                    {/* Disease */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">疾病</label>
                      <select
                        className="bg-white border text-xs h-8 px-2.5 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-[#02A1C8]/40 focus:border-[#02A1C8]"
                        value={matrixQuery.disease}
                        onChange={(e) => setMatrixQuery({ ...matrixQuery, disease: e.target.value })}
                      >
                        <option value="全部">全部</option>
                        <option value="活动性结核">活动性结核</option>
                        <option value="HIV-1 感染">HIV-1 感染</option>
                        <option value="慢性乙肝">慢性乙肝</option>
                        <option value="健康人群">健康人群</option>
                      </select>
                    </div>

                    {/* Tissue */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">组织</label>
                      <select
                        className="bg-white border text-xs h-8 px-2.5 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-[#02A1C8]/40 focus:border-[#02A1C8]"
                        value={matrixQuery.tissue}
                        onChange={(e) => setMatrixQuery({ ...matrixQuery, tissue: e.target.value })}
                      >
                        <option value="全部">全部</option>
                        <option value="外周血 (PBMC)">外周血 (PBMC)</option>
                        <option value="肝脏组织">肝脏组织</option>
                      </select>
                    </div>

                    {/* Platform */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">测序平台</label>
                      <select
                        className="bg-white border text-xs h-8 px-2.5 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-[#02A1C8]/40 focus:border-[#02A1C8]"
                        value={matrixQuery.platform}
                        onChange={(e) => setMatrixQuery({ ...matrixQuery, platform: e.target.value })}
                      >
                        <option value="全部">全部</option>
                        <option value="10x Genomics">10x Genomics</option>
                      </select>
                    </div>

                    {/* Cell count Range */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">细胞数</label>
                      <select
                        className="bg-white border text-xs h-8 px-2.5 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-[#02A1C8]/40 focus:border-[#02A1C8]"
                        value={matrixQuery.cellCountRange}
                        onChange={(e) => setMatrixQuery({ ...matrixQuery, cellCountRange: e.target.value })}
                      >
                        <option value="不限">不限</option>
                        <option value=">10万">&gt; 10万</option>
                        <option value="5万-10万">5万 - 10万</option>
                        <option value="<5万">&lt; 5万</option>
                      </select>
                    </div>

                    {/* GSE / PMID search term */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GSE / PMID</label>
                      <div className="relative flex items-center">
                        <Input
                          placeholder="如 GSE194562"
                          className="bg-white border text-xs h-8 px-2.5 pr-8 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-[#02A1C8]/40 focus:border-[#02A1C8] w-full"
                          value={matrixQuery.pmidGse}
                          onChange={(e) => setMatrixQuery({ ...matrixQuery, pmidGse: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
                    <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600 px-4" onClick={handleMatrixReset}>
                      重置
                    </Button>
                    <Button size="sm" className="bg-[#1e293b] hover:bg-slate-800 text-white h-8 text-xs font-semibold px-5" onClick={() => {}}>
                      检索
                    </Button>
                  </div>
                </div>

                {/* Hits Statement */}
                <div className="text-slate-500 font-sans text-xs">
                  命中 <span className="font-bold text-slate-800 text-sm">{filteredMatrices.length}</span> 个矩阵
                </div>

                {/* Grid of matrix cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredMatrices.map((mat) => {
                    const isPublic = mat.statusBadge === "公开";
                    return (
                      <div
                        key={mat.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer"
                        onClick={() => setSelectedMatrix(mat)}
                      >
                        <div className="space-y-2.5">
                          {/* Title & Badge */}
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug tracking-tight hover:text-[#02A1C8] transition">
                              {mat.name}
                            </h3>
                            <span className={`text-[10px] py-0.5 px-2 font-medium rounded-full border shrink-0 ${
                              isPublic 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-250" 
                              : "bg-amber-50 text-amber-600 border-amber-250"
                            }`}>
                              {mat.statusBadge}
                            </span>
                          </div>

                          {/* Meta & Literature details */}
                          <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1.5">
                            {mat.literature}
                          </p>

                          {/* Description info */}
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                            {mat.description}
                          </p>
                        </div>

                        {/* Divider + Bottom Stats */}
                        <div className="mt-5 pt-3.5 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <div className="flex items-center gap-4">
                            <span>{mat.cellCount.toLocaleString()} 细胞</span>
                            <span>{mat.geneCount.toLocaleString()} 基因</span>
                            <span>{mat.platform}</span>
                          </div>
                          <span className="text-[#02A1C8] font-bold text-xs hover:underline">查看详情 →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ==================== SCREEN 2: DETAIL VIEW PAGE (Fig 2) ==================== */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Breadcrumbs & Header bar */}
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                    表达矩阵检索 <span className="text-slate-300 mx-1.5">/</span> <span className="text-[#02A1C8] font-bold">矩阵详情</span>
                  </p>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {selectedMatrix.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 px-4"
                        onClick={() => setSelectedMatrix(null)}
                      >
                        ← 返回
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Grid breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column (2/3 width) */}
                  <div className="lg:col-span-2 space-y-7">
                    {/* Segment 1: Matrix Base Meta */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 tracking-wider">
                        <span className="w-1 h-3.5 bg-[#02A1C8] rounded-full inline-block"></span>
                        矩阵基础信息
                      </h3>
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-medium">矩阵名称</span>
                            <span className="font-mono font-bold text-slate-800 text-right">{selectedMatrix.matrixName}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-medium font-sans">物种</span>
                            <span className="font-semibold text-slate-800 text-right">{selectedMatrix.species}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-medium">测序平台</span>
                            <span className="font-semibold text-slate-800 text-right">{selectedMatrix.platform}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-medium">文件格式</span>
                            <span className="font-semibold text-slate-800 text-right">h5ad (AnnData)</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400 font-medium">基因数</span>
                            <span className="font-mono font-semibold text-slate-800 text-right">{selectedMatrix.geneCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2 sm:col-span-2">
                            <span className="text-slate-400 font-medium">样本数</span>
                            <span className="font-semibold text-[#02A1C8] text-right">{selectedMatrix.sampleCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>

                  {/* Right Column (1/3 width Sidebar) */}
                  <div className="space-y-6">
                    {/* Box 1: Downloader side rails */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                      <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 tracking-wider pb-2 border-b">
                        <span className="w-1 h-3.5 bg-[#02A1C8] rounded-full inline-block"></span>
                        下载样本
                      </h3>
                      <div className="space-y-2.5">
                        <Button 
                          className="w-full h-9 text-xs bg-[#02A1C8] hover:bg-[#02A1C8]/90 text-white font-bold inline-flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
                          onClick={() => alert(`准备下载表达矩阵 (.h5ad文件)...`)}
                        >
                          ↓ 表达矩阵 (h5ad)
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full h-9 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5 rounded-lg"
                          onClick={() => alert(`系统构建 TSV 多端比对描述格式文件下发通道...`)}
                        >
                          ↓ 细胞元信息 (TSV)
                        </Button>
                      </div>
                    </div>


                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================================== MODAL 1: DATABASE COMPLETE DETAILS ==================================== */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-white text-slate-900 border-[#02A1C8]/25 shadow-xl p-6">
          {selectedDB && (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-4 bg-[#02A1C8] rounded-full inline-block" />
                    <h3 className="text-base font-extrabold text-slate-800">{selectedDB.name}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground tech-mono">
                    ID: {selectedDB.id} • 类型: {selectedDB.type === 'builtin' ? '内置专项库' : selectedDB.type === 'self' ? '自建仓库' : selectedDB.type === 'common' ? '通用公共库' : '外链库'}
                  </p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Complete Metadata Display */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tech-mono">主分类</p>
                  <p className="font-semibold text-slate-800">{selectedDB.category}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tech-mono">发布版本</p>
                  <p className="font-semibold text-slate-800 tech-mono">{selectedDB.version}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tech-mono">维护责任人</p>
                  <p className="font-semibold text-slate-800">{selectedDB.maintainer}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tech-mono">最近一次同步更新时间</p>
                  <p className="font-semibold text-slate-800 tech-mono">{selectedDB.updateTime}</p>
                </div>

              </div>

              {/* Descriptions */}
              <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tech-mono">数据库内容与科研描述</p>
                <p className="text-xs leading-relaxed text-slate-700">{selectedDB.description}</p>
              </div>

              {/* Displays sample/record count statistics (specially for "自建仓库" self databases) */}
              {selectedDB.type === 'self' && (
                <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg space-y-2">
                  <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" /> 自建仓库本地统计指标 (Sample Statistics)
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white border rounded p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">本地关联样本数</p>
                      <p className="text-lg font-bold text-orange-700 tech-mono">{selectedDB.sampleCount || 12} 个 Sample</p>
                    </div>
                    <div className="bg-white border rounded p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">当前激活重排数</p>
                      <p className="text-lg font-bold text-slate-800 tech-mono">{(selectedDB.recordCount).toLocaleString()} 条</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 border-t pt-4">
                {selectedDB.type === 'external' ? (
                  <Button 
                    size="sm" 
                    className="bg-teal-600 text-white hover:bg-teal-700 font-bold"
                    onClick={() => window.open(selectedDB.externalUrl, '_blank')}
                  >
                    新窗口跳转外部数据库 <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-[#02A1C8] hover:bg-[#02A1C8]/90 text-white font-bold"
                    onClick={() => handleEnterRetrieval(selectedDB)}
                  >
                    进入检索中心
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
