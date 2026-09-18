import React, { useState, useMemo } from "react";
import { 
  Database, 
  Upload, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  HardDrive, 
  Folder, 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  ArrowRight, 
  Sliders, 
  FileSpreadsheet, 
  Info,
  Server,
  Key,
  ExternalLink,
  ChevronRight,
  Sparkles
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

// Interface for User Self-built Databases
export interface CustomDatabaseItem {
  id: string;
  name: string;
  dataType: string;
  species: string;
  recordCount: number;
  sampleCount: number;
  fileSize: string;
  permission: 'public' | 'private' | 'restricted';
  uploader: string;
  uploadTime: string;
  status: 'active' | 'indexing' | 'archived';
  description: string;
  mountPath: string;
  fileList: Array<{ name: string; size: string; type: string }>;
}

const INITIAL_CUSTOM_DBS: CustomDatabaseItem[] = [
  {
    id: "SELF-DB-001",
    name: "BCR-Seq 获得性免疫缺陷(HIV)高通量序列自建库",
    dataType: "BCR 重排库",
    species: "Homo sapiens",
    recordCount: 945000,
    sampleCount: 24,
    fileSize: "3.08 GB",
    permission: "restricted",
    uploader: "陈研究员",
    uploadTime: "2026-03-01 14:20",
    status: "active",
    description: "整合并标准化全期感染者的B细胞受体序列重排数据，侧重广谱中和抗体克隆轨迹分析。",
    mountPath: "/data/self/db/bcr_hiv_depth/",
    fileList: [
      { name: "bcr_hiv_clone_v2.tsv", size: "1.8 GB", type: "TSV" },
      { name: "sample_mappings.json", size: "89 KB", type: "JSON" },
      { name: "expression_matrix_associated.h5ad", size: "1.2 GB", type: "h5ad" }
    ]
  },
  {
    id: "SELF-DB-002",
    name: "自建高敏抗原特异性 BCR 序列诊断仓库",
    dataType: "BCR 序列",
    species: "Homo sapiens",
    recordCount: 420000,
    sampleCount: 36,
    fileSize: "900 MB",
    permission: "restricted",
    uploader: "林分析师",
    uploadTime: "2026-05-25 10:15",
    status: "active",
    description: "针对特定肺癌及自身免疫疾病，捕获患者血清中的抗原特异性 BCR 序列诊断索引。",
    mountPath: "/data/self/db/bcr_lung_cancer/",
    fileList: [
      { name: "bcr_seqs_cancer_all.tsv", size: "900 MB", type: "TSV" },
      { name: "patient_stages.xlsx", size: "45 KB", type: "Excel" }
    ]
  },
  {
    id: "SELF-DB-003",
    name: "肺部免疫浸润单细胞转录组私有数据包",
    dataType: "scRNA 表达矩阵",
    species: "Homo sapiens",
    recordCount: 158000,
    sampleCount: 12,
    fileSize: "1.45 GB",
    permission: "private",
    uploader: "张教授团队",
    uploadTime: "2026-06-12 16:40",
    status: "active",
    description: "包含肺癌手术切除组织及癌旁对照单细胞 RNA-seq 计数矩阵与细胞注释。",
    mountPath: "/data/self/db/lung_scrna_private/",
    fileList: [
      { name: "matrix.mtx", size: "1.1 GB", type: "Matrix" },
      { name: "barcodes.tsv", size: "15 MB", type: "TSV" },
      { name: "features.tsv", size: "4 MB", type: "TSV" }
    ]
  },
  {
    id: "SELF-DB-004",
    name: "自身免疫性肝炎 TCR Alpha/Beta 双链配对自建库",
    dataType: "TCR 配对库",
    species: "Homo sapiens",
    recordCount: 230000,
    sampleCount: 18,
    fileSize: "680 MB",
    permission: "public",
    uploader: "王博后",
    uploadTime: "2026-07-02 09:30",
    status: "active",
    description: "高深度 10x Single Cell Immune Profiling 捕获的 TCR alpha/beta 双链配对 CDR3 序列。",
    mountPath: "/data/self/db/aih_tcr_paired/",
    fileList: [
      { name: "filtered_contig_annotations.csv", size: "650 MB", type: "CSV" },
      { name: "clonotypes.csv", size: "30 MB", type: "CSV" }
    ]
  }
];

export function CustomDatabase() {
  const [activeTab, setActiveTab] = useState<string>("custom-list");
  
  // Custom DB List State
  const [customDbs, setCustomDbs] = useState<CustomDatabaseItem[]>(INITIAL_CUSTOM_DBS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [permissionFilter, setPermissionFilter] = useState("all");
  const [selectedCustomDb, setSelectedCustomDb] = useState<CustomDatabaseItem | null>(null);

  // Import Form States
  const [importForm, setImportForm] = useState({
    name: "",
    dataType: "TCR/BCR",
    species: "Homo sapiens",
    recordCount: "",
    permission: "restricted" as 'public' | 'private' | 'restricted',
    description: "",
    uploader: "当前用户",
    version: "v1.0",
    sourceType: "local_file",
    remoteUrl: "",
    columnMapping: "auto"
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Edit Custom DB Dialog
  const [editingDb, setEditingDb] = useState<CustomDatabaseItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Filter Custom DBs
  const filteredCustomDbs = useMemo(() => {
    return customDbs.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "all" || item.dataType.includes(typeFilter);
      const matchPerm = permissionFilter === "all" || item.permission === permissionFilter;
      return matchSearch && matchType && matchPerm;
    });
  }, [customDbs, searchTerm, typeFilter, permissionFilter]);

  // Handle New Import Submission
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.name) {
      alert("请输入自建数据库名称");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    const timer = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsImporting(false);

          const newId = `SELF-DB-${String(customDbs.length + 1).padStart(3, '0')}`;
          const newRecord: CustomDatabaseItem = {
            id: newId,
            name: importForm.name,
            dataType: importForm.dataType,
            species: importForm.species,
            recordCount: importForm.recordCount ? parseInt(importForm.recordCount, 10) || 0 : Math.floor(Math.random() * 200000) + 10000,
            sampleCount: Math.floor(Math.random() * 20) + 1,
            fileSize: uploadedFiles.length > 0 ? `${(uploadedFiles[0].size / (1024 * 1024)).toFixed(1)} MB` : "120 MB",
            permission: importForm.permission,
            uploader: importForm.uploader || "当前用户",
            uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: "active",
            description: importForm.description || "用户提交导入的自建数据库数据包。",
            mountPath: `/data/self/db/${importForm.name.toLowerCase().replace(/[^a-z0-0]/g, '_')}/`,
            fileList: uploadedFiles.length > 0 
              ? uploadedFiles.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, type: f.name.split('.').pop()?.toUpperCase() || 'FILE' }))
              : [{ name: "imported_dataset.tsv", size: "120 MB", type: "TSV" }]
          };

          setCustomDbs(prev => [newRecord, ...prev]);
          alert(`自建数据库导入成功！库ID: ${newId}`);
          
          // Reset
          setImportForm({
            name: "",
            dataType: "TCR/BCR",
            species: "Homo sapiens",
            recordCount: "",
            permission: "restricted",
            description: "",
            uploader: "当前用户",
            version: "v1.0",
            sourceType: "local_file",
            remoteUrl: "",
            columnMapping: "auto"
          });
          setUploadedFiles([]);
          setActiveTab("custom-list");
          return 0;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleDeleteDb = (id: string) => {
    if (confirm(`确定要从自建数据库列表中移除 ${id} 吗？`)) {
      setCustomDbs(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSaveEdit = () => {
    if (!editingDb) return;
    setCustomDbs(prev => prev.map(d => d.id === editingDb.id ? editingDb : d));
    setIsEditOpen(false);
    setEditingDb(null);
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 selection:bg-[#02A1C8]/20">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#02A1C8] rounded-full inline-block" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">自建数据库管理中心</h2>
            <Badge variant="outline" className="text-[#02A1C8] border-[#02A1C8]/30 bg-[#02A1C8]/5 tech-mono text-[10px]">
              自建库管理
            </Badge>
          </div>
          <p className="text-muted-foreground text-[11px] tech-mono mt-1">
            统一管理用户自己导入的自建数据仓库与数据导入解析流程配置。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setActiveTab("import-wizard")}
            className="bg-[#02A1C8] hover:bg-[#017ea0] text-white text-xs font-medium h-9 gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            导入自建数据库
          </Button>
        </div>
      </div>

      {/* 2. Primary Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col gap-4">
        <TabsList className="grid w-fit grid-cols-2 tech-border p-1 bg-muted/20">
          <TabsTrigger value="custom-list" className="tech-mono text-xs px-6 gap-2">
            <Database className="w-3.5 h-3.5 text-[#02A1C8]" />
            自建数据库管理 ({customDbs.length})
          </TabsTrigger>
          <TabsTrigger value="import-wizard" className="tech-mono text-xs px-6 gap-2">
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            数据导入与解析
          </TabsTrigger>
        </TabsList>

        {/* ================================= TAB 1: CUSTOM DB LIST ================================= */}
        <TabsContent value="custom-list" className="flex-1 flex flex-col gap-4 mt-0">
          <Card className="tech-border bg-background/50">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索自建数据库名称、ID、上传者、描述..."
                    className="pl-8 tech-mono text-xs h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">所有数据类型</option>
                  <option value="BCR">BCR 序列/重排</option>
                  <option value="TCR">TCR 配对/重排</option>
                  <option value="scRNA">scRNA 表达矩阵</option>
                </select>
                <select 
                  className="h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
                  value={permissionFilter}
                  onChange={(e) => setPermissionFilter(e.target.value)}
                >
                  <option value="all">所有权限</option>
                  <option value="public">公开数据</option>
                  <option value="private">本人数据</option>
                  <option value="restricted">项目组数据</option>
                </select>
              </div>
              <div className="text-xs tech-mono text-slate-500">
                当前挂载自建数据库: <span className="font-bold text-slate-800">{filteredCustomDbs.length}</span> 个
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="tech-border bg-background/50 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="tech-bg-soft sticky top-0 z-10 border-b">
                  <TableRow>
                    <TableHead className="tech-header py-3">数据库 ID</TableHead>
                    <TableHead className="tech-header py-3">数据库名称</TableHead>
                    <TableHead className="tech-header py-3">数据类型</TableHead>
                    <TableHead className="tech-header py-3">记录/样本数</TableHead>
                    <TableHead className="tech-header py-3">容量</TableHead>
                    <TableHead className="tech-header py-3">权限</TableHead>
                    <TableHead className="tech-header py-3">创建/上传者</TableHead>
                    <TableHead className="tech-header py-3">上传时间</TableHead>
                    <TableHead className="tech-header py-3 text-right pr-4">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomDbs.map((db) => (
                    <TableRow key={db.id} className="hover:bg-muted/35 transition-colors">
                      <TableCell className="text-xs font-bold tech-mono text-[#02A1C8]">
                        {db.id}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800 max-w-[220px] truncate" title={db.name}>
                        <div>{db.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal truncate mt-0.5">{db.mountPath}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700">
                          {db.dataType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs tech-mono text-slate-600">
                        <div>{db.recordCount.toLocaleString()} 条条目</div>
                        <div className="text-[10px] text-slate-400">{db.sampleCount} 例样本</div>
                      </TableCell>
                      <TableCell className="text-xs tech-mono font-semibold text-slate-700">
                        {db.fileSize}
                      </TableCell>
                      <TableCell className="text-xs">
                        {db.permission === 'public' && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px]">公开数据</Badge>
                        )}
                        {db.permission === 'restricted' && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-[10px]">项目组数据</Badge>
                        )}
                        {db.permission === 'private' && (
                          <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-[10px]">本人数据</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">
                        {db.uploader}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 tech-mono">
                        {db.uploadTime}
                      </TableCell>
                      <TableCell className="text-xs text-right pr-4 space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-[#02A1C8] hover:bg-[#02A1C8]/10 px-2 cursor-pointer"
                          onClick={() => setSelectedCustomDb(db)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          查看文件
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-slate-600 hover:bg-slate-100 px-2 cursor-pointer"
                          onClick={() => {
                            setEditingDb(db);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          编辑
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-red-600 hover:bg-red-50 px-2 cursor-pointer"
                          onClick={() => handleDeleteDb(db.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCustomDbs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs tech-mono">
                        暂无符合条件的自建数据库。点击右上方“导入自建数据库”快速导入新数据包。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* ================================= TAB 2: DATA IMPORT WIZARD ================================= */}
        <TabsContent value="import-wizard" className="flex-1 flex flex-col gap-4 mt-0">
          <Card className="tech-border bg-background/50 max-w-4xl mx-auto w-full">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#02A1C8]" />
                数据导入与映射配置向导
              </CardTitle>
              <CardDescription className="text-xs tech-mono">
                支持导入用户自建的单细胞转录组表达矩阵、TCR/BCR 高通量测序重排文件（TSV, CSV, FASTQ, FASTA, h5ad, MTX）或远程存储同步。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleImportSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">数据库名称 <span className="text-red-500">*</span></label>
                    <Input 
                      placeholder="例：自建多发性硬化症 TCR 配对数据库" 
                      value={importForm.name}
                      onChange={(e) => setImportForm({...importForm, name: e.target.value})}
                      className="tech-mono text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">数据类型</label>
                    <select 
                      className="w-full h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
                      value={importForm.dataType}
                      onChange={(e) => setImportForm({...importForm, dataType: e.target.value})}
                    >
                      <option value="TCR/BCR">TCR/BCR 重排序列</option>
                      <option value="scRNA 表达矩阵">scRNA 单细胞表达矩阵</option>
                      <option value="多组学融合">多组学融合库</option>
                      <option value="病原体序列">病原体基因序列包</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">物种</label>
                    <select 
                      className="w-full h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
                      value={importForm.species}
                      onChange={(e) => setImportForm({...importForm, species: e.target.value})}
                    >
                      <option value="Homo sapiens">Homo sapiens (人类)</option>
                      <option value="Mus musculus">Mus musculus (小鼠)</option>
                      <option value="Macaca mulatta">Macaca mulatta (恒河猴)</option>
                      <option value="其他物种">其他物种</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">记录数（条目数）</label>
                    <Input 
                      type="number"
                      placeholder="例：150000 (条目数，选填或由系统解析)" 
                      value={importForm.recordCount}
                      onChange={(e) => setImportForm({...importForm, recordCount: e.target.value})}
                      className="tech-mono text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-700">访问权限级别</label>
                    <select 
                      className="w-full h-9 bg-background border tech-border rounded px-3 text-xs tech-mono"
                      value={importForm.permission}
                      onChange={(e) => setImportForm({...importForm, permission: e.target.value as any})}
                    >
                      <option value="public">公开数据</option>
                      <option value="private">本人数据</option>
                      <option value="restricted">项目组数据</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">数据库说明 / 描述</label>
                  <textarea 
                    rows={3}
                    placeholder="简要说明此自建数据库的实验背景、测序平台、临床样本来源等信息..."
                    className="w-full bg-background border tech-border rounded p-2.5 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#02A1C8]"
                    value={importForm.description}
                    onChange={(e) => setImportForm({...importForm, description: e.target.value})}
                  />
                </div>

                {/* Upload Zone */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">选择文件包上传</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#02A1C8] transition-colors bg-slate-50/50">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">拖拽文件至此处，或点击选择文件</p>
                    <p className="text-[10px] text-slate-400 tech-mono mt-1">支持格式: .tsv, .csv, .h5ad, .mtx, .fasta, .fastq, .zip, .tar.gz (最大单文件 10GB)</p>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      id="file-upload-input" 
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadedFiles(Array.from(e.target.files));
                        }
                      }}
                    />
                    <label htmlFor="file-upload-input">
                      <Button variant="outline" size="sm" type="button" className="mt-3 text-xs cursor-pointer">
                        选择本地文件
                      </Button>
                    </label>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 text-left border-t pt-3 space-y-1">
                        <p className="text-xs font-bold text-slate-700">已选择 {uploadedFiles.length} 个文件：</p>
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="text-[11px] tech-mono text-slate-600 flex justify-between bg-white p-1.5 rounded border">
                            <span>{f.name}</span>
                            <span>{(f.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isImporting && (
                  <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between text-xs font-bold text-blue-800">
                      <span>正在校验与挂载物理索引...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#02A1C8] h-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("custom-list")}
                    className="text-xs cursor-pointer"
                  >
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isImporting}
                    className="bg-[#02A1C8] hover:bg-[#017ea0] text-white text-xs cursor-pointer gap-2"
                  >
                    <Check className="w-4 h-4" />
                    开始导入并发布
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Custom DB Files Dialog */}
      <Dialog open={!!selectedCustomDb} onOpenChange={() => setSelectedCustomDb(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#02A1C8]" />
              文件与挂载详情: {selectedCustomDb?.name}
            </DialogTitle>
            <DialogDescription className="text-xs tech-mono">
              挂载路径: {selectedCustomDb?.mountPath}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 p-3 rounded-md text-xs space-y-1">
              <p><span className="text-slate-500">描述：</span>{selectedCustomDb?.description}</p>
              <p><span className="text-slate-500">上传者：</span>{selectedCustomDb?.uploader} ({selectedCustomDb?.uploadTime})</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">包含物理文件：</h4>
              <div className="border rounded-md divide-y text-xs tech-mono">
                {selectedCustomDb?.fileList.map((f, i) => (
                  <div key={i} className="p-2 flex items-center justify-between hover:bg-slate-50">
                    <span className="font-semibold text-slate-800">{f.name}</span>
                    <span className="text-slate-500">{f.size} ({f.type})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">编辑自建数据库信息</DialogTitle>
          </DialogHeader>
          {editingDb && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">数据库名称</label>
                <Input 
                  value={editingDb.name} 
                  onChange={(e) => setEditingDb({...editingDb, name: e.target.value})} 
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">权限级别</label>
                <select 
                  value={editingDb.permission} 
                  onChange={(e) => setEditingDb({...editingDb, permission: e.target.value as any})}
                  className="w-full h-8 border rounded px-2 text-xs"
                >
                  <option value="public">公开数据</option>
                  <option value="private">本人数据</option>
                  <option value="restricted">项目组数据</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">说明</label>
                <textarea 
                  value={editingDb.description} 
                  onChange={(e) => setEditingDb({...editingDb, description: e.target.value})}
                  rows={3} 
                  className="w-full border rounded p-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>取消</Button>
                <Button size="sm" className="bg-[#02A1C8] text-white" onClick={handleSaveEdit}>保存</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
