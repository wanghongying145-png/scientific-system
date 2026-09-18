import React, { useState, useMemo, Fragment } from "react";
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Shield, 
  Activity,
  Dna,
  LineChart,
  ChevronRight,
  ChevronLeft,
  Lock,
  Unlock,
  Eye,
  Globe,
  FileSearch,
  Zap,
  Plus,
  ArrowUpRight,
  Info,
  Users,
  BarChart3,
  Upload,
  FileText,
  AlertCircle,
  ArrowUp,
  Check,
  AlertTriangle,
  RefreshCw,
  Play,
  Sliders,
  CheckCircle,
  PlayCircle,
  Bell,
  X
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ImmunoDatabaseRecord, ImmunoSampleInfo, UserQCData } from "@/src/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  Line,
  ComposedChart
} from 'recharts';

const MOCK_DATASETS: ImmunoDatabaseRecord[] = [
  {
    id: "DS-001",
    databaseName: "TCR/BCR v1 注释库",
    databaseDescription: "内置公共来源的结核，艾滋，乙肝感染性疾病患者或健康人群的BCR和TCR序列注释数据库，需包含近10年PUBMED、NCBIGEO收录发表的公共BCR/TCR数据",
    dataType: "TCR/BCR",
    sequencingType: "TCR",
    disease: "结核",
    sampleCountDisplay: "--",
    sampleCount: 0,
    chainsCount: 528756,
    matrixCount: 0,
    tcrBcrMatrix: "Chains: 528756",
    sourceDatabase: "IEDB; McPAS-TCR; VDJdb",
    source: "PubMed",
    currentVersion: "v1_20260610",
    releaseTime: "2026-06-10",
    permission: "public",
    accessibleRoles: ["管理员", "研究员"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/37000000/",
    geoUrl: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456",
    creator: "刘研究员"
  },
  {
    id: "DS-002",
    databaseName: "公共基因表达达矩阵库",
    databaseDescription: "汇集 NCBI GEO 与 CELLxGENE Census 公开发布的基因表达矩阵，覆盖多种疾病，含 单细胞 RNA-seq 数据。",
    dataType: "scRNA",
    sequencingType: "scRNA",
    disease: "HIV",
    sampleCountDisplay: "634,879",
    sampleCount: 634879,
    chainsCount: 0,
    matrixCount: 12404,
    tcrBcrMatrix: "表达矩阵: 12,404",
    sourceDatabase: "GEO; cellxgene_census",
    source: "GEO",
    currentVersion: "v1_20260610",
    releaseTime: "2026-06-10",
    permission: "restricted",
    accessibleRoles: ["管理员"],
    geoUrl: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE789012",
    creator: "张工程师"
  },
  {
    id: "DS-003",
    databaseName: "慢性乙肝感染者 BCR 克隆库",
    databaseDescription: "收集整合慢性乙型肝炎（CHB）患者的抗体克隆基因型 and 多样性频数分布信息。",
    dataType: "BCR",
    sequencingType: "BCR",
    disease: "HBV",
    sampleCountDisplay: "985",
    sampleCount: 985,
    chainsCount: 284100,
    matrixCount: 0,
    tcrBcrMatrix: "Chains: 284,100",
    sourceDatabase: "NCBI BioProject",
    source: "NCBI",
    currentVersion: "v1_20260315",
    releaseTime: "2026-03-15",
    permission: "public",
    accessibleRoles: ["管理员", "研究员", "普通用户"],
    ncbiUrl: "https://www.ncbi.nlm.nih.gov/bioproject/PRJNA123456",
    creator: "陈高级研究员"
  },
  {
    id: "DS-004",
    databaseName: "健康人群全血 TCR-seq 高精比对库",
    databaseDescription: "系统性的无偏向 TCR beta 链全深测序，建立用于背景杂音过滤的健康基底数据集。",
    dataType: "TCR",
    sequencingType: "TCR",
    disease: "健康人群",
    sampleCountDisplay: "100",
    sampleCount: 100,
    chainsCount: 5000000,
    matrixCount: 50,
    tcrBcrMatrix: "表达矩阵: 50",
    sourceDatabase: "本地物理库",
    source: "本地",
    currentVersion: "v2_20260520",
    releaseTime: "2026-05-20",
    permission: "restricted",
    accessibleRoles: ["管理员", "研究员"],
    creator: "李工"
  }
];

const MOCK_SAMPLE_INFO: ImmunoSampleInfo[] = [
  { id: "SAM-001", individualId: "IND-001", diseaseStatus: "患者", age: 45, gender: "男", experimentType: "TCR-Seq" },
  { id: "SAM-002", individualId: "IND-002", diseaseStatus: "患者", age: 38, gender: "女", experimentType: "TCR-Seq" },
  { id: "SAM-003", individualId: "IND-003", diseaseStatus: "健康", age: 29, gender: "男", experimentType: "TCR-Seq" },
  { id: "SAM-004", individualId: "IND-004", diseaseStatus: "健康", age: 32, gender: "女", experimentType: "TCR-Seq" },
];

const MOCK_QC_RECORDS: UserQCData[] = [
  { id: "QC-001", sampleId: "SAM-001", datasetId: "DS-001", experimentType: "TCR", readsCount: 12500000, q30Ratio: 94.2, gcContent: 45.6, mappingRate: 98.5, duplicationRate: 12.4, timestamp: "2024-04-01" },
  { id: "QC-002", sampleId: "SAM-002", datasetId: "DS-001", experimentType: "TCR", readsCount: 10800000, q30Ratio: 92.5, gcContent: 48.2, mappingRate: 97.8, duplicationRate: 15.1, timestamp: "2024-04-01" },
  { id: "QC-003", sampleId: "SAM-003", datasetId: "DS-001", experimentType: "TCR", readsCount: 15200000, q30Ratio: 95.8, gcContent: 44.1, mappingRate: 99.1, duplicationRate: 10.8, timestamp: "2024-04-02" },
  { id: "QC-004", sampleId: "SAM-004", datasetId: "DS-001", experimentType: "TCR", readsCount: 9500000, q30Ratio: 91.2, gcContent: 46.5, mappingRate: 96.5, duplicationRate: 18.2, timestamp: "2024-04-02" },
];

export function BCRTCRDatabase() {
  const [activeTab, setActiveTab] = useState("datasets");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    disease: "all",
    source: "all",
    permission: "all"
  });

  // Convert default datasets to editable state
  const [datasets, setDatasets] = useState<ImmunoDatabaseRecord[]>(() => {
    return MOCK_DATASETS.map(d => ({
      ...d,
      viewPermissionType: d.permission === 'public' ? 'public' : 'restricted',
      viewRoles: d.accessibleRoles,
      downloadPermissionType: d.permission === 'public' ? 'public' : 'restricted',
      downloadRoles: d.accessibleRoles.filter(r => r !== '普通用户' && r !== 'Guest')
    }));
  });

  const [selectedDataset, setSelectedDataset] = useState<ImmunoDatabaseRecord | null>(null);

  // Sync selected dataset with latest dynamic state
  const currentSelectedState = useMemo(() => {
    if (!selectedDataset) return null;
    return datasets.find(d => d.id === selectedDataset.id) || selectedDataset;
  }, [datasets, selectedDataset]);

  // Data Import tab states
  const [importDbName, setImportDbName] = useState("");
  const [importDbVersion, setImportDbVersion] = useState("v1.0");
  const [importDbDataType, setImportDbDataType] = useState("");
  const [importDbDescription, setImportDbDescription] = useState("");
  const [importDbSource, setImportDbSource] = useState("");
  const [importDbSampleCount, setImportDbSampleCount] = useState<number | "">("");
  const [importDbMatrixCount, setImportDbMatrixCount] = useState<number | "">("");
  const [importDbChainsCount, setImportDbChainsCount] = useState<number | "">("");
  const [importDbCreator, setImportDbCreator] = useState("当前用户");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Database Update Monitor States
  const [monitoredDbs, setMonitoredDbs] = useState([
    { 
      id: "MDB-001", 
      name: "NCBI GEO", 
      fullName: "NCBI Gene Expression Omnibus Database", 
      type: "基因表达数据库", 
      currentVersion: "2025-05-15", 
      latestVersion: "2025-07-01", 
      lastChecked: "2025-07-06 09:00:00", 
      status: "success", 
      hasUpdate: true, 
      logo: "GEO", 
      unread: true,
      url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi", 
      parseRule: "geo_release_\\d{4}-\\d{2}-\\d{2}", 
      history: [
        { version: "2025-05-15", date: "2025-05-15", desc: "常规生物表达数据与高通量测序索引同步" }, 
        { version: "2025-02-10", date: "2025-02-10", desc: "历史关联记录格式调整" }
      ] 
    },
    { 
      id: "MDB-002", 
      name: "VDJdb", 
      fullName: "VDJdb T-Cell Receptor Database", 
      type: "免疫受体数据库", 
      currentVersion: "2025-04-20", 
      latestVersion: "2025-04-20", 
      lastChecked: "2025-07-06 09:00:00", 
      status: "success", 
      hasUpdate: false, 
      logo: "VDJ", 
      unread: false,
      url: "https://vdjdb.cdr3.net/api/v1/downloads", 
      parseRule: "vdjdb_release_\\d{4}-\\d{2}-\\d{2}", 
      history: [
        { version: "2025-04-20", date: "2025-04-20", desc: "增量TCR/MHC特异性相互作用条目入库" }
      ] 
    },
    { 
      id: "MDB-003", 
      name: "McPAS-TCR", 
      fullName: "McPAS-TCR Pathology-associated TCR Database", 
      type: "TCR数据库", 
      currentVersion: "2024-12-01", 
      latestVersion: "2025-06-10", 
      lastChecked: "2025-07-06 09:00:00", 
      status: "success", 
      hasUpdate: true, 
      logo: "McP", 
      unread: false,
      url: "http://stb.technion.ac.il/McPAS-TCR/download", 
      parseRule: "mcpas_tcr_\\d{4}-\\d{2}-\\d{2}", 
      history: [
        { version: "2024-12-01", date: "2024-12-01", desc: "新增传染病及肿瘤浸润TCR克隆型记录" }
      ] 
    },
    { 
      id: "MDB-004", 
      name: "CELLxGENE Census", 
      fullName: "CELLxGENE Census Single-Cell Data Resource", 
      type: "单细胞数据资源库", 
      currentVersion: "2025-02-10", 
      latestVersion: "2025-02-10", 
      lastChecked: "2025-07-06 09:00:00", 
      status: "success", 
      hasUpdate: false, 
      logo: "CXG", 
      unread: false,
      url: "https://chanzuckerberg.github.io/cellxgene-census/release_notes", 
      parseRule: "census_version_\\d{4}-\\d{2}-\\d{2}", 
      history: [
        { version: "2025-02-10", date: "2025-02-10", desc: "最新版本单细胞多组学矩阵与注释数据更新" }
      ] 
    },
    { 
      id: "MDB-005", 
      name: "IEDB", 
      fullName: "Immune Epitope Database", 
      type: "免疫表位数据库", 
      currentVersion: "2025-06-01", 
      latestVersion: "---", 
      lastChecked: "2025-07-06 09:00:00", 
      status: "failed", 
      hasUpdate: false, 
      logo: "EDB", 
      unread: false,
      url: "https://www.iedb.org/downloader.php", 
      parseRule: "iedb_full_release_\\d{8}.zip", 
      history: [] 
    }
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [selectedMonitorDb, setSelectedMonitorDb] = useState<any | null>(null);

  const selectedDbDetails = useMemo(() => {
    if (!selectedMonitorDb) return null;
    const dbName = selectedMonitorDb.name;
    switch (dbName) {
      case "NCBI GEO":
        return {
          description: "全球基因表达数据公共仓储，收录芯片、高通量测序等实验数据及元信息。",
          checkMethod: "API 接口",
          checkUrl: "https://www.ncbi.nlm.nih.gov/geo/",
          versionDesc: "GEO 数据库每日更新，最新版本包含截至 2025-07-01 的所有入库数据。",
          historyList: [
            { time: "2025-07-06 09:00:00", version: "2025-07-01", result: "有更新", operator: "系统任务" },
            { time: "2025-06-29 09:00:00", version: "2025-06-25", result: "有更新", operator: "系统任务" },
            { time: "2025-06-22 09:00:00", version: "2025-06-19", result: "有更新", operator: "系统任务" },
            { time: "2025-06-15 09:00:00", version: "2025-06-11", result: "无更新", operator: "系统任务" }
          ]
        };
      case "VDJdb":
        return {
          description: "高品质T细胞受体（TCR）及其特异性抗原表位相互作用的数据库，基于文献记录和专家审核。",
          checkMethod: "网页解析",
          checkUrl: "https://vdjdb.cdr3.net/",
          versionDesc: "VDJdb 每季度或半年发布全量包，当前本地版本已与外部源完全一致。",
          historyList: [
            { time: "2025-07-06 09:00:00", version: "2025-04-20", result: "无更新", operator: "系统任务" },
            { time: "2025-06-29 09:00:00", version: "2025-04-20", result: "无更新", operator: "系统任务" },
            { time: "2025-06-22 09:00:00", version: "2025-04-20", result: "无更新", operator: "系统任务" }
          ]
        };
      case "McPAS-TCR":
        return {
          description: "手工整理的病理学（传染病、自身免疫性疾病及癌症）相关T细胞受体序列数据库。",
          checkMethod: "API 接口",
          checkUrl: "http://stb.technion.ac.il/McPAS-TCR/",
          versionDesc: "McPAS-TCR 定期更新，包含各种病理学条件下的TCR序列对。",
          historyList: [
            { time: "2025-07-06 09:00:00", version: "2025-06-10", result: "有更新", operator: "系统任务" },
            { time: "2025-06-29 09:00:00", version: "2025-06-10", result: "有更新", operator: "系统任务" },
            { time: "2025-06-22 09:00:00", version: "2024-12-01", result: "无更新", operator: "系统任务" }
          ]
        };
      case "CELLxGENE Census":
        return {
          description: "Chan Zuckerberg Initiative 提供的全球大规模、标准化单细胞RNA-seq及多组学融合资源门户。",
          checkMethod: "API 接口",
          checkUrl: "https://chanzuckerberg.github.io/cellxgene-census/",
          versionDesc: "CELLxGENE Census 每月同步多组学矩阵与注释数据。当前本地版本为最新状态。",
          historyList: [
            { time: "2025-07-06 09:00:00", version: "2025-02-10", result: "无更新", operator: "系统任务" },
            { time: "2025-06-29 09:00:00", version: "2025-02-10", result: "无更新", operator: "系统任务" }
          ]
        };
      case "IEDB":
      default:
        return {
          description: "免疫表位数据库与分析资源（IEDB），包含抗体和T细胞表位的实验数据及预测工具。",
          checkMethod: "网页解析",
          checkUrl: "https://www.iedb.org/",
          versionDesc: "无法读取外部服务版本。请稍后重试检测。",
          historyList: [
            { time: "2025-07-06 09:00:00", version: "---", result: "检测失败", operator: "系统任务" },
            { time: "2025-06-29 09:00:00", version: "2025-06-01", result: "无更新", operator: "系统任务" }
          ]
        };
    }
  }, [selectedMonitorDb]);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [configForm, setConfigForm] = useState({
    frequency: "weekly",
    email: "wanghongying145@gmail.com",
    retry: 3,
    notifyOnSuccess: true,
    sources: { ncbi: true, ebi: true, pdb: true, uniprot: true }
  });

  const [isCheckFlowOpen, setIsCheckFlowOpen] = useState(false);
  const [checkFlowStep, setCheckFlowStep] = useState<1 | 2 | 3>(1);
  const [checkFlowScope, setCheckFlowScope] = useState<'all' | 'failed_only'>('all');
  const [checkFlowMethod, setCheckFlowMethod] = useState<'now' | 'scheduled'>('now');
  const [checkingProgressIdx, setCheckingProgressIdx] = useState(0);
  const [checkIntervalId, setCheckIntervalId] = useState<any>(null);

  const checkItems = [
    { name: "NCBI GEO", version: "2025-07-01", updateStatus: "有更新" },
    { name: "VDJdb", version: "2025-04-20", updateStatus: "无更新" },
    { name: "McPAS-TCR", version: "2025-06-10", updateStatus: "有更新" },
    { name: "CELLxGENE Census", version: "2025-02-10", updateStatus: "无更新" },
    { name: "IEDB", version: "---", updateStatus: "检测失败" }
  ];

  const handleTriggerCheck = () => {
    setIsCheckFlowOpen(true);
    setCheckFlowStep(1);
    setCheckingProgressIdx(0);
    if (checkIntervalId) {
      clearInterval(checkIntervalId);
      setCheckIntervalId(null);
    }
  };

  const startImmediateCheck = () => {
    setCheckFlowStep(2);
    setCheckingProgressIdx(0);
    setIsChecking(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setCheckingProgressIdx(progress);
      if (progress >= 5) {
        clearInterval(interval);
        setCheckIntervalId(null);
        setTimeout(() => {
          setCheckFlowStep(3);
          setIsChecking(false);
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 10) + " 09:00:00";
          setMonitoredDbs(prev => prev.map(db => {
            if (db.name === "NCBI GEO") {
              return { ...db, lastChecked: nowStr, latestVersion: "2025-07-01", status: "success", hasUpdate: true };
            } else if (db.name === "VDJdb") {
              return { ...db, lastChecked: nowStr, latestVersion: "2025-04-20", status: "success", hasUpdate: false };
            } else if (db.name === "McPAS-TCR") {
              return { ...db, lastChecked: nowStr, latestVersion: "2025-06-10", status: "success", hasUpdate: true };
            } else if (db.name === "CELLxGENE Census") {
              return { ...db, lastChecked: nowStr, latestVersion: "2025-02-10", status: "success", hasUpdate: false };
            } else if (db.name === "IEDB") {
              return { ...db, lastChecked: nowStr, latestVersion: "---", status: "failed", hasUpdate: false };
            }
            return { ...db, lastChecked: nowStr };
          }));
        }, 1000);
      }
    }, 1200);
    setCheckIntervalId(interval);
  };

  const cancelImmediateCheck = () => {
    if (checkIntervalId) {
      clearInterval(checkIntervalId);
      setCheckIntervalId(null);
    }
    setIsChecking(false);
    setIsCheckFlowOpen(false);
    setCheckFlowStep(1);
    setCheckingProgressIdx(0);
  };

  const [copiedUrl, setCopiedUrl] = useState(false);
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSyncDb = (dbId: string) => {
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setMonitoredDbs(prevDbs => prevDbs.map(db => {
            if (db.id === dbId) {
              return {
                ...db,
                currentVersion: db.latestVersion,
                hasUpdate: false,
                history: [
                  { version: db.latestVersion, date: new Date().toISOString().split('T')[0], desc: `通过更新监控自动同步下载，升级到版本 ${db.latestVersion}` },
                  ...db.history
                ]
              };
            }
            return db;
          }));
          alert("数据同步成功！已将本地版本升级到最新外部版本。");
          return 0;
        }
        return prev + 10;
      });
    }, 120);
  };

  const handleViewMonitorDetail = (db: any) => {
    setSelectedMonitorDb(db);
    if (db.unread) {
      setMonitoredDbs(prev => prev.map(d => d.id === db.id ? { ...d, unread: false } : d));
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigOpen(false);
    alert("更新检测配置保存成功！");
  };

  const monitorStats = useMemo(() => {
    const total = monitoredDbs.length;
    const hasUpdate = monitoredDbs.filter(d => d.status === "success" && d.hasUpdate).length;
    const noUpdate = monitoredDbs.filter(d => d.status === "success" && !d.hasUpdate).length;
    const failed = monitoredDbs.filter(d => d.status === "failed").length;
    const unconfigured = monitoredDbs.filter(d => d.status === "unconfigured").length;
    return { total, hasUpdate, noUpdate, failed, unconfigured };
  }, [monitoredDbs]);

  const nextGeneratedId = useMemo(() => {
    const nextNum = datasets.length + 1;
    return `DS-${String(nextNum).padStart(3, "0")}`;
  }, [datasets]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleImportDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importDbName) {
      alert("请输入数据库名称");
      return;
    }
    const sampleVal = importDbSampleCount === "" ? 0 : Number(importDbSampleCount);
    const matrixVal = importDbMatrixCount === "" ? 0 : Number(importDbMatrixCount);
    const chainsVal = importDbChainsCount === "" ? 0 : Number(importDbChainsCount);

    const newRecord: ImmunoDatabaseRecord = {
      id: nextGeneratedId,
      databaseName: importDbName,
      databaseDescription: importDbDescription || "暂无描述",
      dataType: importDbDataType || "TCR/BCR",
      sequencingType: (importDbDataType || "TCR/BCR") as any,
      disease: "健康人群",
      sampleCountDisplay: sampleVal.toLocaleString(),
      sampleCount: sampleVal,
      chainsCount: chainsVal,
      matrixCount: matrixVal,
      tcrBcrMatrix: `表达矩阵: ${matrixVal}`,
      sourceDatabase: importDbSource || "本地物理库",
      source: "本地" as any,
      currentVersion: importDbVersion || "v1.0",
      releaseTime: new Date().toISOString().split('T')[0],
      permission: "public",
      accessibleRoles: ["管理员", "研究员", "普通用户"],
      creator: importDbCreator || "当前用户",
      viewPermissionType: "public",
      viewRoles: ["管理员", "研究员", "普通用户"],
      downloadPermissionType: "public",
      downloadRoles: ["管理员", "研究员", "普通用户"]
    };

    setDatasets(prev => [newRecord, ...prev]);

    // Reset forms
    setImportDbName("");
    setImportDbVersion("v1.0");
    setImportDbDataType("");
    setImportDbDescription("");
    setImportDbSource("");
    setImportDbSampleCount("");
    setImportDbMatrixCount("");
    setImportDbChainsCount("");
    setImportDbCreator("当前用户");
    setUploadedFileName("");

    alert(`导入成功！已生成数据集：${nextGeneratedId} (${importDbName})`);
    setActiveTab("datasets");
  };

  // Fields for General Info Dataset Editing
  const [editingDataset, setEditingDataset] = useState<ImmunoDatabaseRecord | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);

  const [editDbName, setEditDbName] = useState("");
  const [editDbVersion, setEditDbVersion] = useState("");
  const [editDbDataType, setEditDbDataType] = useState("");
  const [editDbDescription, setEditDbDescription] = useState("");
  const [editDbSource, setEditDbSource] = useState("");
  const [editDbSampleCount, setEditDbSampleCount] = useState<number>(0);
  const [editDbMatrixCount, setEditDbMatrixCount] = useState<number>(0);
  const [editDbChainsCount, setEditDbChainsCount] = useState<number>(0);
  const [editDbCreator, setEditDbCreator] = useState("");

  const handleOpenDatasetEdit = (d: ImmunoDatabaseRecord) => {
    setEditingDataset(d);
    setEditDbName(d.databaseName || "");
    setEditDbVersion(d.currentVersion || "");
    setEditDbDataType(d.dataType || d.sequencingType || "");
    setEditDbDescription(d.databaseDescription || "");
    setEditDbSource(d.sourceDatabase || d.source || "");
    setEditDbSampleCount(d.sampleCount || 0);
    setEditDbMatrixCount(d.matrixCount || 0);
    setEditDbChainsCount(d.chainsCount || 0);
    setEditDbCreator(d.creator || "管理员");
    setIsPermissionDialogOpen(true);
  };

  const handleSaveDatasetChanges = () => {
    if (!editingDataset) return;
    setDatasets(prev => 
      prev.map(d => {
        if (d.id === editingDataset.id) {
          return {
            ...d,
            databaseName: editDbName,
            currentVersion: editDbVersion,
            dataType: editDbDataType,
            databaseDescription: editDbDescription,
            sourceDatabase: editDbSource,
            source: (['GEO', 'PubMed', 'NCBI', '本地'].includes(editDbSource) ? editDbSource : d.source) as any,
            sampleCount: editDbSampleCount,
            sampleCountDisplay: editDbSampleCount.toLocaleString(),
            matrixCount: editDbMatrixCount,
            chainsCount: editDbChainsCount,
            creator: editDbCreator
          };
        }
        return d;
      })
    );
    setIsPermissionDialogOpen(false);
    setEditingDataset(null);
  };

  const filteredDatasets = useMemo(() => {
    return datasets.filter(d => {
      const matchSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.databaseName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                          (d.databaseDescription?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchType = filters.type === "all" || d.sequencingType === filters.type;
      const matchDisease = filters.disease === "all" || d.disease === filters.disease;
      const matchSource = filters.source === "all" || d.source === filters.source;
      const matchPermission = filters.permission === "all" || d.permission === filters.permission;
      return matchSearch && matchType && matchDisease && matchSource && matchPermission;
    });
  }, [datasets, searchTerm, filters]);

  const qcChartData = useMemo(() => {
    return MOCK_QC_RECORDS.map(r => ({
      name: r.sampleId,
      reads: r.readsCount / 1000000,
      q30: r.q30Ratio
    }));
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">免疫基因组学综合数据库</h2>
          <p className="text-muted-foreground text-sm tech-mono">
            Immune Genomics Database - 整合 BCR/TCR/scRNA 多维免疫组学数据与质控分析。
          </p>
        </div>

      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col gap-4">
        <TabsList className="grid w-fit grid-cols-3 tech-border p-1 bg-muted/20">
          <TabsTrigger value="datasets" className="tech-mono text-xs px-6">数据集管理</TabsTrigger>
          <TabsTrigger value="permissions" className="tech-mono text-xs px-6">权限管理</TabsTrigger>
          <TabsTrigger value="monitor" className="tech-mono text-xs px-6">数据库监控</TabsTrigger>
        </TabsList>

        {/* Page 1: Dataset Management */}
        <TabsContent value="datasets" className="flex-1 flex flex-col gap-4 mt-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索数据集ID、疾病..."
                className="pl-8 tech-mono text-xs h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="all">所有类型</option>
              <option value="BCR">BCR</option>
              <option value="TCR">TCR</option>
              <option value="scRNA">scRNA</option>
            </select>
            <select 
              className="h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
              value={filters.disease}
              onChange={(e) => setFilters({...filters, disease: e.target.value})}
            >
              <option value="all">所有疾病</option>
              <option value="结核">结核</option>
              <option value="HIV">HIV</option>
              <option value="HBV">HBV</option>
              <option value="健康人群">健康人群</option>
            </select>
            <select 
              className="h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
              value={filters.source}
              onChange={(e) => setFilters({...filters, source: e.target.value})}
            >
              <option value="all">所有来源</option>
              <option value="GEO">GEO</option>
              <option value="PubMed">PubMed</option>
              <option value="NCBI">NCBI</option>
              <option value="本地">本地</option>
            </select>
            <select 
              className="h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
              value={filters.permission}
              onChange={(e) => setFilters({...filters, permission: e.target.value})}
            >
              <option value="all">所有权限</option>
              <option value="public">Public</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          <Card className="tech-border bg-background/50 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="tech-bg-soft sticky top-0 z-10 border-b">
                  <TableRow>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">数据库ID</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">database_id</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">数据库名称</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">&nbsp;</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">当前版本</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">version</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">数据类型</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">data_type</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3 max-w-[280px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">数据库描述</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">&nbsp;</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">数据来源</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">source</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">样本数</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">samples</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">矩阵数</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">matrices</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">TCR/BCR_链数</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">chains</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">创建人</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">creator</span>
                      </div>
                    </TableHead>
                    <TableHead className="tech-header py-3 text-right">
                      <div className="flex flex-col text-right">
                        <span className="font-semibold text-slate-800">操作</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal lowercase mt-0.5">&nbsp;</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatasets.map((d) => (
                    <Fragment key={d.id}>
                      <Dialog>
                      <TableRow className="hover:bg-muted/35 hover:text-slate-900 transition-colors">
                        <TableCell className="text-xs font-bold tech-mono">
                          <DialogTrigger asChild>
                            <button
                              className="text-[#02A1C8] hover:underline font-bold cursor-pointer text-left focus:outline-hidden"
                              onClick={() => setSelectedDataset(d)}
                            >
                              {d.id}
                            </button>
                          </DialogTrigger>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800 max-w-[150px] truncate" title={d.databaseName}>
                          {d.databaseName || "未命名"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {d.currentVersion || "v1_20260610"}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700">
                          {d.dataType || d.sequencingType}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-[280px] break-all leading-normal py-3 whitespace-normal align-top font-sans" title={d.databaseDescription}>
                          {d.databaseDescription || "暂无描述"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 whitespace-normal leading-relaxed max-w-[150px]" title={d.sourceDatabase}>
                          {d.sourceDatabase || d.source}
                        </TableCell>
                        <TableCell className="text-xs tech-mono text-slate-600">
                          {d.sampleCountDisplay || (d.sampleCount > 0 ? d.sampleCount.toLocaleString() : "--")}
                        </TableCell>
                        <TableCell className="text-xs tech-mono text-slate-600">
                          {d.matrixCount > 0 ? d.matrixCount.toLocaleString() : "--"}
                        </TableCell>
                        <TableCell className="text-xs tech-mono text-slate-600">
                          {d.chainsCount > 0 ? d.chainsCount.toLocaleString() : "--"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 font-medium whitespace-nowrap">
                          {d.creator || "管理员"}
                        </TableCell>
                        <TableCell className="text-xs text-right whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-[#02A1C8] hover:text-[#017ea0] font-semibold hover:bg-[#02A1C8]/10 cursor-pointer px-2"
                            onClick={() => handleOpenDatasetEdit(d)}
                          >
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            数据集详情: {currentSelectedState?.id}
                            {currentSelectedState?.permission === 'restricted' ? (
                              <Badge variant="outline" className="text-orange-500 border-orange-500/20">
                                <Lock className="w-3 h-3 mr-1" /> 受限访问 (仅 {currentSelectedState?.viewRoles?.join(', ') || '无'})
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-500 border-green-500/20">
                                <Unlock className="w-3 h-3 mr-1" /> 公开访问
                              </Badge>
                            )}
                          </DialogTitle>
                          <DialogDescription className="tech-mono text-[10px]">
                            详细元数据、统计指标及样本列表。
                          </DialogDescription>
                        </DialogHeader>
                        
                        <ScrollArea className="flex-1 pr-4">
                          <div className="space-y-6 py-4">
                            {/* 1. 基本信息 */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tech-mono">疾病</p>
                                <p className="text-sm font-bold">{currentSelectedState?.disease}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tech-mono">数据类型</p>
                                <p className="text-sm font-bold">{currentSelectedState?.dataType || currentSelectedState?.sequencingType}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tech-mono">数据来源</p>
                                <p className="text-sm font-bold">{currentSelectedState?.sourceDatabase || currentSelectedState?.source}</p>
                              </div>
                              {currentSelectedState?.pubmedUrl && (
                                <div className="col-span-3 space-y-1">
                                  <p className="text-[10px] text-muted-foreground uppercase tech-mono">文献链接 (PubMed)</p>
                                  <a href={currentSelectedState.pubmedUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    {currentSelectedState.pubmedUrl} <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* 2. 数据统计 */}
                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg tech-border">
                              <div className="text-center">
                                <p className="text-[10px] text-muted-foreground tech-mono">样本数</p>
                                <p className="text-xl font-bold tech-mono">
                                  {currentSelectedState?.sampleCountDisplay && currentSelectedState.sampleCountDisplay !== "--" 
                                    ? currentSelectedState.sampleCountDisplay 
                                    : (currentSelectedState?.sampleCount || 0)}
                                </p>
                              </div>
                              <div className="text-center border-x">
                                <p className="text-[10px] text-muted-foreground tech-mono">表达矩阵数</p>
                                <p className="text-xl font-bold tech-mono">{currentSelectedState?.matrixCount}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-muted-foreground tech-mono">TCR/BCR Chains</p>
                                <p className="text-xl font-bold tech-mono">{currentSelectedState?.chainsCount.toLocaleString()}</p>
                              </div>
                            </div>

                            {/* 3. 样本信息表 */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold flex items-center gap-2">
                                <Users className="w-3 h-3" /> 样本信息表
                              </h4>
                              <div className="border rounded-md overflow-hidden">
                                <Table>
                                  <TableHeader className="bg-muted/50">
                                    <TableRow>
                                      <TableHead className="h-8 text-[10px] tech-mono">样本ID</TableHead>
                                      <TableHead className="h-8 text-[10px] tech-mono">个体ID</TableHead>
                                      <TableHead className="h-8 text-[10px] tech-mono">状态</TableHead>
                                      <TableHead className="h-8 text-[10px] tech-mono">年龄/性别</TableHead>
                                      <TableHead className="h-8 text-[10px] tech-mono">实验类型</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {MOCK_SAMPLE_INFO.map(s => (
                                      <TableRow key={s.id}>
                                        <TableCell className="py-2 text-[10px] tech-mono">{s.id}</TableCell>
                                        <TableCell className="py-2 text-[10px] tech-mono">{s.individualId}</TableCell>
                                        <TableCell className="py-2 text-[10px]">
                                          <Badge variant="outline" className={cn("text-[8px] px-1 h-4", s.diseaseStatus === '患者' ? "text-red-500" : "text-green-500")}>
                                            {s.diseaseStatus}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="py-2 text-[10px] tech-mono">{s.age} / {s.gender}</TableCell>
                                        <TableCell className="py-2 text-[10px]">{s.experimentType}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>

                            {/* 4. 数据下载 */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold flex items-center gap-2">
                                <Download className="w-3 h-3" /> 数据下载
                              </h4>
                              <div className="grid grid-cols-3 gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-[10px] tech-mono" 
                                  disabled={
                                    currentSelectedState?.downloadPermissionType === 'private' || 
                                    currentSelectedState?.downloadPermissionType === 'restricted'
                                  }
                                >
                                  表达矩阵下载
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-[10px] tech-mono" 
                                  disabled={
                                    currentSelectedState?.downloadPermissionType === 'private' || 
                                    currentSelectedState?.downloadPermissionType === 'restricted'
                                  }
                                >
                                  序列下载
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-[10px] tech-mono" 
                                  disabled={
                                    currentSelectedState?.downloadPermissionType === 'private' || 
                                    currentSelectedState?.downloadPermissionType === 'restricted'
                                  }
                                >
                                  Metadata下载
                                </Button>
                              </div>
                              {currentSelectedState?.downloadPermissionType === 'private' && (
                                <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-600">
                                  <AlertCircle className="w-3 h-3" />
                                  该数据集已完全禁止外部直接下载。
                                </div>
                              )}
                              {currentSelectedState?.downloadPermissionType === 'restricted' && (
                                <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-600 flex-wrap">
                                  <AlertCircle className="w-3 h-3" />
                                  该数据集下载模块已受限，仅特定角色可下载 (授权角色: {currentSelectedState?.downloadRoles?.join(', ') || '无'})。
                                  <Button variant="link" className="h-auto p-0 text-[10px] text-orange-600 font-bold underline">申请下载特权</Button>
                                </div>
                              )}
                            </div>

                            {/* 5. 外部数据库链接 */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold flex items-center gap-2">
                                <Globe className="w-3 h-3" /> 外部数据库链接
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {currentSelectedState?.geoUrl && (
                                  <Button variant="secondary" size="sm" className="h-7 text-[10px] tech-mono" nativeButton={false} render={<a href={currentSelectedState.geoUrl} target="_blank" rel="noreferrer" />}>
                                    GEO: {currentSelectedState.id}
                                  </Button>
                                )}
                                {currentSelectedState?.pubmedUrl && (
                                  <Button variant="secondary" size="sm" className="h-7 text-[10px] tech-mono" nativeButton={false} render={<a href={currentSelectedState.pubmedUrl} target="_blank" rel="noreferrer" />}>
                                    PubMed
                                  </Button>
                                )}
                                {currentSelectedState?.ncbiUrl && (
                                  <Button variant="secondary" size="sm" className="h-7 text-[10px] tech-mono" nativeButton={false} render={<a href={currentSelectedState.ncbiUrl} target="_blank" rel="noreferrer" />}>
                                    NCBI
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </Fragment>
                ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Page 3: Data Import */}
        <TabsContent value="import" className="flex-1 mt-0">
          <div className="max-w-2xl mx-auto space-y-6 py-6">
            <div className="text-center space-y-1.55">
              <h3 className="text-lg font-bold text-slate-950 font-sans">数据集数据导入</h3>
              <p className="text-xs text-muted-foreground font-sans">配置数据集元数据并导入序列或矩阵文件。上传成功后新数据集会自动同步至数据集列表中。</p>
            </div>
            
            <Card className="tech-border bg-white shadow-3xs rounded-xl overflow-hidden border border-slate-200">
              <form onSubmit={handleImportDataset}>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4 text-left font-sans">
                    {/* Database ID */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        数据库ID <span className="text-[10px] text-slate-400 font-mono font-normal">(系统自动生成)</span>
                      </label>
                      <Input 
                        value={nextGeneratedId} 
                        readOnly 
                        className="h-9 text-xs font-mono bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed select-none" 
                      />
                    </div>

                    {/* Database Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">数据库名称 <span className="text-rose-500">*</span></label>
                      <Input 
                        placeholder="请输入数据库名称" 
                        value={importDbName} 
                        onChange={e => setImportDbName(e.target.value)} 
                        required
                        className="h-9 text-xs border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* Current Version */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">当前版本 <span className="text-rose-500">*</span></label>
                      <Input 
                        placeholder="e.g. v1.0" 
                        value={importDbVersion} 
                        onChange={e => setImportDbVersion(e.target.value)} 
                        required
                        className="h-9 text-xs font-mono border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* Data Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">数据类型 <span className="text-rose-500">*</span></label>
                      <Input 
                        placeholder="e.g. TCR, BCR, scRNA" 
                        value={importDbDataType} 
                        onChange={e => setImportDbDataType(e.target.value)} 
                        required
                        className="h-9 text-xs border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* Data Source */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">数据来源 <span className="text-rose-500">*</span></label>
                      <Input 
                        placeholder="e.g. GEO (GSE123456), PubMed" 
                        value={importDbSource} 
                        onChange={e => setImportDbSource(e.target.value)} 
                        required
                        className="h-9 text-xs border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* Creator */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">创建人</label>
                      <Input 
                        placeholder="当前用户" 
                        value={importDbCreator} 
                        onChange={e => setImportDbCreator(e.target.value)} 
                        className="h-9 text-xs border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* Sample Count */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">样本数</label>
                      <Input 
                        type="number"
                        placeholder="0" 
                        value={importDbSampleCount} 
                        onChange={e => setImportDbSampleCount(e.target.value === "" ? "" : Number(e.target.value))} 
                        min={0}
                        className="h-9 text-xs font-mono border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* Matrix Count */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">矩阵数</label>
                      <Input 
                        type="number"
                        placeholder="0" 
                        value={importDbMatrixCount} 
                        onChange={e => setImportDbMatrixCount(e.target.value === "" ? "" : Number(e.target.value))} 
                        min={0}
                        className="h-9 text-xs font-mono border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* TCR/BCR Chains Count */}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">TCR/BCR链数</label>
                      <Input 
                        type="number"
                        placeholder="0" 
                        value={importDbChainsCount} 
                        onChange={e => setImportDbChainsCount(e.target.value === "" ? "" : Number(e.target.value))} 
                        min={0}
                        className="h-9 text-xs font-mono border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25" 
                      />
                    </div>

                    {/* Database Description */}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">数据库描述</label>
                      <textarea 
                        rows={3} 
                        placeholder="请输入该数据集的描述说明、适用病种或生物学背景信息..." 
                        value={importDbDescription}
                        onChange={e => setImportDbDescription(e.target.value)}
                        className="w-full text-xs font-sans border border-slate-200 rounded-lg p-2.5 outline-none focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8]/25 resize-none transition-all duration-150"
                      />
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2 text-left pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700">关联数据文件</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative flex flex-col items-center justify-center min-h-[140px]",
                        dragActive ? "border-[#02A1C8] bg-[#02A1C8]/10" : "border-slate-200 hover:border-[#02A1C8]/60 hover:bg-slate-50/50"
                      )}
                    >
                      <input 
                        type="file" 
                        id="import-file-uploader" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={handleFileChange}
                      />
                      {uploadedFileName ? (
                        <div className="space-y-2 animate-in zoom-in-95 duration-150">
                          <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 break-all max-w-sm mx-auto">{uploadedFileName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">文件已就绪。如需重新选择，请拖拽新文件或点击此处。</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setUploadedFileName("");
                            }}
                            className="text-[10px] font-bold text-rose-500 hover:underline inline-block"
                          >
                            移除文件
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-10 h-10 rounded-full bg-[#02A1C8]/5 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-[#02A1C8]/70" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">选择或拖拽本地 offline_package_*.zip 文件</p>
                            <span className="text-[10px] text-slate-400">支持 .zip, .csv, .tsv, .h5ad 等，上限 10 GB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold text-xs h-10 rounded-lg cursor-pointer mt-5 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    创建并导入数据集
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>
        </TabsContent>

        {/* Page 4: Permission Management */}
        <TabsContent value="permissions" className="flex-1 mt-0">
          <Card className="tech-border bg-background/50 overflow-hidden">
            <Table>
              <TableHeader className="tech-bg-soft">
                <TableRow>
                  <TableHead className="tech-header">数据集ID</TableHead>
                  <TableHead className="tech-header">查看权限制</TableHead>
                  <TableHead className="tech-header">下载权限制</TableHead>
                  <TableHead className="tech-header">最后修改</TableHead>
                  <TableHead className="tech-header text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map(d => (
                  <TableRow key={d.id} className="hover:bg-muted/10">
                    <TableCell className="text-xs font-bold tech-mono">{d.id}</TableCell>
                    <TableCell>
                      {d.viewPermissionType === 'public' ? (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] w-fit">
                            <Unlock className="w-3 h-3 mr-1" /> 公开 (Public)
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">任何角色均可检索及浏览</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] w-fit">
                            <Lock className="w-3 h-3 mr-1" /> 受限 (Restricted)
                          </Badge>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {d.viewRoles?.map(role => (
                              <Badge key={role} variant="secondary" className="text-[8px] px-1 h-4">{role}</Badge>
                            )) || <span className="text-[9px] text-red-500">无任何角色</span>}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.downloadPermissionType === 'public' ? (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] w-fit">
                            <Unlock className="w-3 h-3 mr-1" /> 公开 (Public)
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">全部检索角色均可直接下载</span>
                        </div>
                      ) : d.downloadPermissionType === 'private' ? (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] w-fit">
                            <Lock className="w-3 h-3 mr-1" /> 禁止下载 (Disabled)
                          </Badge>
                          <span className="text-[10px] text-zinc-500">外部检索角色无法下载任何数据</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] w-fit">
                            <Lock className="w-3 h-3 mr-1" /> 受限 (Restricted)
                          </Badge>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {d.downloadRoles?.map(role => (
                              <Badge key={role} variant="secondary" className="text-[8px] px-1 h-4">{role}</Badge>
                            )) || <span className="text-[10px] text-zinc-400">无任何角色</span>}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-[10px] tech-mono text-muted-foreground">2024-04-10</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[10px] tech-mono border-[#02A1C8]/40 hover:bg-[#02A1C8]/10 text-[#02A1C8] hover:text-[#02A1C8] font-semibold"
                        onClick={() => handleOpenDatasetEdit(d)}
                      >
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Page 5: Database Update Monitor */}
        <TabsContent value="monitor" className="flex-1 mt-0 flex flex-col gap-5">
          {/* Header row with Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2">
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-slate-800">数据库更新监控</h3>
                <Info className="w-4 h-4 text-slate-400 cursor-help" title="监控外部公共数据库是否发布新版本，仅提供更新提示，不自动下载或导入数据。" />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                监控外部公共数据库是否发布新版本，仅提供更新提示，不自动下载或导入数据。
              </p>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="h-9 px-4 border-[#02A1C8]/30 text-[#02A1C8] hover:bg-[#02A1C8]/10 hover:text-[#02A1C8] font-medium text-xs flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer bg-white"
                onClick={handleTriggerCheck}
                disabled={isChecking}
              >
                {isChecking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#02A1C8]" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-[#02A1C8] text-[#02A1C8]" />
                )}
                {isChecking ? "正在检测..." : "立即检测"}
              </Button>
              
              <Button
                variant="outline"
                className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer bg-white"
                onClick={() => setIsConfigOpen(true)}
              >
                <Sliders className="w-3.5 h-3.5" />
                检测配置
              </Button>
            </div>
          </div>

          {/* Overview Cards (5 Cards in 5 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Card 1: 监控数据库总数 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-lg">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-slate-400">监控数据库总数</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-slate-800">{monitorStats.total}</span>
                    <span className="text-xs text-blue-500 font-bold">↑</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 有更新 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-rose-500 flex items-center justify-center text-rose-500">
                    <ArrowUp className="w-3.5 h-3.5 font-black" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-slate-400">有更新</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-rose-500">{monitorStats.hasUpdate}</span>
                    <span className="text-xs text-rose-500 font-bold">↑</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: 无更新 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-slate-400">无更新</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-emerald-500">{monitorStats.noUpdate}</span>
                    <span className="text-xs text-emerald-500 font-bold">↑</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: 检测失败 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-slate-400">检测失败</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-amber-500">{monitorStats.failed}</span>
                    <span className="text-xs text-amber-500 font-bold">↑</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: 未配置检测地址 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-400 rounded-lg">
                  <Info className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-slate-400">未配置检测地址</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-slate-400">{monitorStats.unconfigured}</span>
                    <span className="text-xs text-slate-400 font-bold">↑</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <Card className="tech-border bg-white overflow-hidden shadow-3xs rounded-xl border border-slate-100 flex-1 flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/75 border-b border-slate-100">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-left pl-6">数据库名称</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-left">数据库类型</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-left">当前使用版本</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-left">外部最新版本</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-left">最近检测时间</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-center">更新提示</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-center">检测状态</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase h-11 py-3 text-right pr-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoredDbs.map((db) => {
                    const isRowFailed = db.status === "failed";
                    return (
                      <TableRow key={db.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                        {/* Name with custom logo */}
                        <TableCell className="py-4 text-left pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-sm bg-[#02A1C8]/10 border border-[#02A1C8]/20 flex items-center justify-center font-bold text-[10px] text-[#02A1C8] shadow-3xs">
                              {db.logo}
                            </div>
                            <span className="font-bold text-slate-800 text-xs">{db.name}</span>
                          </div>
                        </TableCell>
                        
                        {/* Type */}
                        <TableCell className="py-4 text-slate-600 text-xs text-left">
                          {db.type}
                        </TableCell>
                        
                        {/* Current version */}
                        <TableCell className="py-4 text-slate-600 font-mono text-xs text-left">
                          {db.currentVersion}
                        </TableCell>
                        
                        {/* Latest version */}
                        <TableCell className="py-4 font-mono text-xs text-left">
                          {db.hasUpdate ? (
                            <span className="text-slate-800 font-bold flex items-center gap-1">
                              {db.latestVersion}
                              <span className="text-rose-500 font-black">↑</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">{db.latestVersion}</span>
                          )}
                        </TableCell>
                        
                        {/* Last checked */}
                        <TableCell className="py-4 text-slate-500 font-mono text-xs text-left">
                          {db.lastChecked}
                        </TableCell>
                        
                        {/* Update prompt badge */}
                        <TableCell className="py-4 text-center">
                          {isRowFailed ? (
                            <span className="inline-flex items-center justify-center bg-amber-50 text-amber-500 border border-amber-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              检测失败
                            </span>
                          ) : db.hasUpdate ? (
                            <span className="inline-flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              有更新
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              无更新
                            </span>
                          )}
                        </TableCell>
                        
                        {/* Status badge */}
                        <TableCell className="py-4 text-center">
                          {isRowFailed ? (
                            <span className="inline-flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              检测失败
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              检测成功
                            </span>
                          )}
                        </TableCell>
                        
                        {/* Operations */}
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {db.unread && (
                              <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-[#f5222d] rounded-full">
                                1
                              </span>
                            )}
                            <button
                              className="text-[#02A1C8] hover:text-[#017ea0] hover:underline font-bold text-xs cursor-pointer"
                              onClick={() => handleViewMonitorDetail(db)}
                            >
                              查看
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/40">
              <div className="text-xs text-slate-400 font-medium">
                共 {monitoredDbs.length} 条
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-md border border-slate-250 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer disabled:opacity-50" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-md bg-[#02A1C8] text-white flex items-center justify-center text-xs font-bold shadow-3xs">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-md border border-slate-250 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer disabled:opacity-50" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="relative">
                  <select className="h-8 pl-2 pr-8 border border-slate-200 rounded-md text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#02A1C8] cursor-pointer">
                    <option value="10">10 条/页</option>
                    <option value="20">20 条/页</option>
                    <option value="50">50 条/页</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

      </Tabs>

      {/* 数据集属性修改弹窗 */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-2xl bg-white text-slate-900 border-[#02A1C8]/30 shadow-xl p-6 rounded-xl animate-in fade-in duration-200">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-[#02A1C8] font-bold text-base font-sans">
              <Database className="w-5 h-5 text-[#02A1C8]" />
              编辑数据集信息
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-sans mt-1">
              修改数据集标识为 <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{editingDataset?.id}</span> 的核心元数据字段。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              {/* 数据库名称 */}
              <div className="col-span-2 space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  数据库名称
                </label>
                <Input
                  type="text"
                  value={editDbName}
                  onChange={(e) => setEditDbName(e.target.value)}
                  className="w-full text-xs font-sans h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                  placeholder="请输入数据库名称"
                />
              </div>

              {/* 当前版本 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">当前版本</label>
                <Input
                  type="text"
                  value={editDbVersion}
                  onChange={(e) => setEditDbVersion(e.target.value)}
                  className="w-full text-xs font-mono h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                  placeholder="e.g. v2_20260520"
                />
              </div>

              {/* 数据类型 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">数据类型</label>
                <Input
                  type="text"
                  value={editDbDataType}
                  onChange={(e) => setEditDbDataType(e.target.value)}
                  className="w-full text-xs font-sans h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                  placeholder="e.g. scRNA-Seq"
                />
              </div>

              {/* 数据来源 */}
              <div className="col-span-2 space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">数据来源</label>
                <Input
                  type="text"
                  value={editDbSource}
                  onChange={(e) => setEditDbSource(e.target.value)}
                  className="w-full text-xs font-sans h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                  placeholder="请输入数据来源信息"
                />
              </div>

              {/* 样本数 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">样本数</label>
                <Input
                  type="number"
                  value={editDbSampleCount}
                  onChange={(e) => setEditDbSampleCount(Number(e.target.value))}
                  className="w-full text-xs font-mono h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                  min={0}
                />
              </div>

              {/* 矩阵数 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">矩阵数</label>
                <Input
                  type="number"
                  value={editDbMatrixCount}
                  onChange={(e) => setEditDbMatrixCount(Number(e.target.value))}
                  className="w-full text-xs font-mono h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                  min={0}
                />
              </div>

              {/* TCR/BCR_链数 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">TCR/BCR_链数</label>
                <Input
                  type="number"
                  value={editDbChainsCount}
                  onChange={(e) => setEditDbChainsCount(Number(e.target.value))}
                  className="w-full text-xs font-mono h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                  min={0}
                />
              </div>

              {/* 创建人 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">创建人</label>
                <Input
                  type="text"
                  value={editDbCreator}
                  onChange={(e) => setEditDbCreator(e.target.value)}
                  className="w-full text-xs font-sans h-9 border-slate-200 focus:border-[#02A1C8] focus:ring-[#02A1C8]/25"
                />
              </div>

              {/* 数据库描述 */}
              <div className="col-span-2 space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">数据库描述</label>
                <textarea
                  value={editDbDescription}
                  onChange={(e) => setEditDbDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-sans border border-slate-200 rounded-md p-2 focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8]/25 outline-none resize-none"
                  placeholder="请输入数据库的核心背景及描述信息..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-200 text-slate-600 hover:bg-slate-50 h-8 cursor-pointer text-xs"
              onClick={() => setIsPermissionDialogOpen(false)}
            >
              取消
            </Button>
            <Button 
              size="sm" 
              className="bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold h-8 cursor-pointer text-xs px-4"
              onClick={handleSaveDatasetChanges}
            >
              应用保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 数据库检测配置弹窗 */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-md bg-white text-slate-900 border-slate-200 shadow-xl p-6 rounded-xl animate-in fade-in duration-150">
          <DialogHeader className="border-b pb-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <Sliders className="w-5 h-5 text-[#02A1C8]" />
              数据库更新检测配置
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              配置外部公共生物信息学数据库的检测机制和通知策略。
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveConfig} className="space-y-4 py-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">检测频率 (Check Interval)</label>
              <select
                value={configForm.frequency}
                onChange={e => setConfigForm({ ...configForm, frequency: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-[#02A1C8] bg-white outline-none"
              >
                <option value="daily">每天自动检测 (Daily)</option>
                <option value="weekly">每周自动检测 (Weekly)</option>
                <option value="monthly">每月自动检测 (Monthly)</option>
                <option value="manual">手动触发检测 (Manual Only)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">异常重试次数</label>
              <input
                type="number"
                min={1}
                max={10}
                value={configForm.retry}
                onChange={e => setConfigForm({ ...configForm, retry: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-[#02A1C8] bg-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>通知邮箱地址</span>
                <span className="text-[10px] text-[#02A1C8]">用于异常与版本更新提醒</span>
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={configForm.email}
                onChange={e => setConfigForm({ ...configForm, email: e.target.value })}
                className="w-full text-xs h-9 border-slate-200 focus:border-[#02A1C8]"
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">仅有更新时发送通知</label>
              <input
                type="checkbox"
                checked={configForm.notifyOnSuccess}
                onChange={e => setConfigForm({ ...configForm, notifyOnSuccess: e.target.checked })}
                className="w-4 h-4 text-[#02A1C8] border-slate-200 rounded-sm focus:ring-[#02A1C8]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 h-8 cursor-pointer text-xs"
                onClick={() => setIsConfigOpen(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold h-8 cursor-pointer text-xs px-4"
              >
                保存配置
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 外部数据库检测详情弹窗 */}
      <Dialog open={selectedMonitorDb !== null} onOpenChange={(open) => !open && setSelectedMonitorDb(null)}>
        <DialogContent className="max-w-lg bg-white text-slate-900 border-slate-200 shadow-xl p-6 rounded-xl animate-in fade-in duration-150">
          <DialogHeader className="border-b pb-4 text-left">
            <DialogTitle className="text-slate-800 font-bold text-base">数据库详情</DialogTitle>
          </DialogHeader>

          {selectedMonitorDb && selectedDbDetails && (
            <div className="space-y-5 py-4 text-left">
              {/* Top info row: Icon, Name, Type-badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#02A1C8] font-bold text-xs flex items-center justify-center border border-blue-100/50 uppercase">
                  {selectedMonitorDb.logo}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-800">{selectedMonitorDb.name}</span>
                  <span className="bg-blue-50 text-[#02A1C8] border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedMonitorDb.type}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed">
                {selectedDbDetails.description}
              </p>

              {/* Grid properties */}
              <div className="space-y-3.5 text-xs border-b pb-5 border-slate-100">
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-slate-500 font-medium">当前使用版本</span>
                  <span className="text-slate-800 font-mono">{selectedMonitorDb.currentVersion}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-slate-500 font-medium">外部最新版本</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-mono">{selectedMonitorDb.latestVersion}</span>
                    {selectedMonitorDb.hasUpdate && (
                      <span className="inline-flex items-center bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        有更新
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-slate-500 font-medium">最近检测时间</span>
                  <span className="text-slate-800 font-mono">{selectedMonitorDb.lastChecked}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-slate-500 font-medium">检测状态</span>
                  <div>
                    {selectedMonitorDb.status === "failed" ? (
                      <span className="bg-rose-50 text-rose-500 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        检测失败
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                        检测成功
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-slate-500 font-medium">更新提示</span>
                  <div>
                    {selectedMonitorDb.status === "failed" ? (
                      <span className="bg-amber-50 text-amber-500 border border-amber-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                        检测失败
                      </span>
                    ) : selectedMonitorDb.hasUpdate ? (
                      <span className="bg-rose-50 text-rose-500 border border-rose-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                        有更新
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                        无更新
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-slate-500 font-medium">检测地址</span>
                  <a 
                    href={selectedDbDetails.checkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#02A1C8] hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {selectedDbDetails.checkUrl}
                    <ExternalLink className="w-3 h-3 text-[#02A1C8]/70" />
                  </a>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-slate-500 font-medium">检测方式</span>
                  <span className="text-slate-700">{selectedDbDetails.checkMethod}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-start">
                  <span className="text-slate-500 font-medium">版本说明</span>
                  <span className="text-slate-600 leading-relaxed">{selectedDbDetails.versionDesc}</span>
                </div>
              </div>

              {/* 检测结果 Box */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">检测结果</h4>
                <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
                  {selectedMonitorDb.status === "failed" ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-rose-500">检测外部数据库连接失败。</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          无法连接至检测源地址。请检查网络代理配置，或确认外部源网站是否正常在线，稍后重试。
                        </p>
                      </div>
                    </>
                  ) : selectedMonitorDb.hasUpdate ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-600">发现外部数据库存在新版本。</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          请由数据库管理员评估新版本数据是否符合本平台数据处理标准，确认后再进入离线数据处理流程。
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-600">外部数据库与当前使用版本一致。</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          未检测到外部新版本，当前本地数据库为最新状态，无需执行升级或导入操作。
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 检测历史 Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">检测历史</h4>
                  <button 
                    type="button"
                    className="text-[#02A1C8] hover:underline text-xs flex items-center gap-0.5 font-medium cursor-pointer"
                  >
                    查看历史 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-medium">
                        <th className="p-2.5 font-medium">检测时间</th>
                        <th className="p-2.5 font-medium">外部版本</th>
                        <th className="p-2.5 font-medium text-center">检测结果</th>
                        <th className="p-2.5 font-medium text-right">操作人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedDbDetails.historyList.map((hist, i) => (
                        <tr key={i} className="hover:bg-slate-50/20">
                          <td className="p-2.5 font-mono text-slate-500">{hist.time}</td>
                          <td className="p-2.5 font-mono">{hist.version}</td>
                          <td className="p-2.5 text-center">
                            {hist.result === "检测失败" ? (
                              <span className="text-rose-500 font-bold">{hist.result}</span>
                            ) : hist.result === "有更新" ? (
                              <span className="text-rose-500 font-bold">{hist.result}</span>
                            ) : (
                              <span className="text-emerald-500 font-bold">{hist.result}</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right text-slate-500">{hist.operator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action buttons including Synchronize simulation */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex-1 text-left">
                  {isSyncing && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#02A1C8] font-semibold">
                        <span>正在下载同步远程文件数据...</span>
                        <span>{syncProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#02A1C8] h-1.5 transition-all duration-150" style={{ width: `${syncProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9 cursor-pointer text-xs font-bold rounded-md px-4"
                    onClick={() => setSelectedMonitorDb(null)}
                    disabled={isSyncing}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 立即检测步骤式弹窗 */}
      <Dialog open={isCheckFlowOpen} onOpenChange={(open) => {
        if (!open) {
          if (checkIntervalId) {
            clearInterval(checkIntervalId);
            setCheckIntervalId(null);
          }
          setIsChecking(false);
          setIsCheckFlowOpen(false);
        }
      }}>
        <DialogContent className="max-w-md bg-white text-slate-900 border-slate-200 shadow-xl p-6 rounded-xl animate-in fade-in duration-150">
          {checkFlowStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">1</div>
                <h3 className="font-bold text-slate-800 text-sm">立即检测</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 text-left">
                系统将按照配置的检测地址和方式，对所有数据库进行版本检测。
              </p>

              <div className="space-y-4 text-left">
                {/* 检测范围 */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">检测范围</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="checkScope" 
                        checked={checkFlowScope === 'all'} 
                        onChange={() => setCheckFlowScope('all')}
                        className="w-4 h-4 text-[#02A1C8] focus:ring-[#02A1C8] border-slate-300"
                      />
                      <span className="text-xs text-slate-600">全部数据库 (5 个)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="checkScope" 
                        checked={checkFlowScope === 'failed_only'} 
                        onChange={() => setCheckFlowScope('failed_only')}
                        className="w-4 h-4 text-[#02A1C8] focus:ring-[#02A1C8] border-slate-300"
                      />
                      <span className="text-xs text-slate-600">仅检测有更新或先前检测失败的数据库</span>
                    </label>
                  </div>
                </div>

                {/* 检测方式 */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-700">检测方式</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="checkMethod" 
                        checked={checkFlowMethod === 'now'} 
                        onChange={() => setCheckFlowMethod('now')}
                        className="w-4 h-4 text-[#02A1C8] focus:ring-[#02A1C8] border-slate-300"
                      />
                      <span className="text-xs text-slate-600">立即检测</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="checkMethod" 
                        checked={checkFlowMethod === 'scheduled'} 
                        onChange={() => setCheckFlowMethod('scheduled')}
                        className="w-4 h-4 text-[#02A1C8] focus:ring-[#02A1C8] border-slate-300 opacity-60"
                        disabled
                      />
                      <span className="text-xs text-slate-400">定时检测 (按配置周期执行)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9 cursor-pointer text-xs font-bold px-4"
                  onClick={() => setIsCheckFlowOpen(false)}
                >
                  取消
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  className="bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold h-9 cursor-pointer text-xs px-4"
                  onClick={startImmediateCheck}
                >
                  开始检测
                </Button>
              </div>
            </div>
          )}

          {checkFlowStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">2</div>
                <h3 className="font-bold text-slate-800 text-sm">检测中</h3>
              </div>

              <div className="space-y-3.5 text-left">
                <p className="text-xs text-slate-500 font-medium">
                  正在检测数据库版本，请稍候... ({Math.min(5, checkingProgressIdx)}/5)
                </p>

                {/* Progress bar line */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#02A1C8] h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${Math.min(100, checkingProgressIdx * 20)}%` }} 
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-[#02A1C8] shrink-0 w-8 text-right">
                    {Math.min(100, checkingProgressIdx * 20)}%
                  </span>
                </div>

                {/* DB list */}
                <div className="pt-2 divide-y divide-slate-50 border-t border-slate-100">
                  {checkItems.map((item, idx) => {
                    let statusLabel = "";
                    let iconNode = null;
                    let textClass = "text-slate-500";

                    if (idx < checkingProgressIdx) {
                      if (item.updateStatus === "检测失败") {
                        statusLabel = "检测完成  外部版本: --- (检测失败)";
                        iconNode = <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
                        textClass = "text-amber-500 font-medium";
                      } else {
                        statusLabel = `检测完成  外部版本: ${item.version} (${item.updateStatus})`;
                        iconNode = <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
                        textClass = "text-emerald-500 font-medium";
                      }
                    } else if (idx === checkingProgressIdx) {
                      statusLabel = "检测中...";
                      iconNode = (
                        <div className="w-4 h-4 rounded-full border-2 border-[#02A1C8] border-t-transparent animate-spin shrink-0" />
                      );
                      textClass = "text-[#02A1C8] font-semibold animate-pulse";
                    } else {
                      statusLabel = "等待中...";
                      iconNode = <div className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0" />;
                      textClass = "text-slate-400";
                    }

                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {iconNode}
                          <span className={cn("text-[11px]", textClass)}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9 cursor-pointer text-xs font-bold px-4"
                  onClick={cancelImmediateCheck}
                >
                  取消检测
                </Button>
              </div>
            </div>
          )}

          {checkFlowStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">3</div>
                <h3 className="font-bold text-slate-800 text-sm">检测完成</h3>
              </div>

              <div className="py-2 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mt-3">数据库版本检测已完成!</h4>
                
                <p className="text-xs text-slate-400 mt-2">
                  共检测 5 个数据库，其中:
                </p>

                {/* 2x2 Grid of statistics */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 max-w-[280px] mx-auto text-left text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span>有更新: <strong className="text-rose-600 font-bold ml-1">2 个</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>无更新: <strong className="text-emerald-600 font-bold ml-1">2 个</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>检测失败: <strong className="text-amber-600 font-bold ml-1">1 个</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                    <span>未配置: <strong className="text-slate-600 font-bold ml-1">0 个</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9 cursor-pointer text-xs font-bold px-4"
                  onClick={() => setIsCheckFlowOpen(false)}
                >
                  查看结果
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  className="bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold h-9 cursor-pointer text-xs px-4"
                  onClick={() => setIsCheckFlowOpen(false)}
                >
                  完成
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
