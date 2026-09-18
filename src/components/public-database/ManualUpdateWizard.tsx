import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileCode,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  FileCheck,
  FileArchive,
  Info,
  Trash2,
  FolderArchive,
  Check,
  FileText,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicDatabaseItem, UpdateBatchRecord } from "./types";

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  sha256: string;
  status: "done" | "uploading" | "extracting" | "extracted" | "error";
  isArchive: boolean;
  extractProgress?: number;
  extractedFiles?: { name: string; size: string; type?: string }[];
}

interface ManualUpdateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  database: PublicDatabaseItem | null;
  onUpdateCompleted: (batchRecord: UpdateBatchRecord) => void;
}

export function ManualUpdateWizard({
  open,
  onOpenChange,
  database,
  onUpdateCompleted,
}: ManualUpdateWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 1 Form States
  const [newVersion, setNewVersion] = useState("");
  const [sourceOrg, setSourceOrg] = useState("");
  const [sourceAddress, setSourceAddress] = useState("");
  const [sourceReleaseDate, setSourceReleaseDate] = useState("");
  const [packageAcquireDate, setPackageAcquireDate] = useState("");
  const [updateType, setUpdateType] = useState<"全量更新" | "增量更新">("增量更新");
  const [updateNote, setUpdateNote] = useState("");
  const operator = "系统管理员 (admin)";

  // Step 2 Form States (Upload & Extraction)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([
    {
      id: "f-1",
      name: "8.17文档提交.zip",
      size: "3.2 MB",
      type: "离线更新压缩包",
      progress: 100,
      sha256: "b890f12c8192a74e50d6f34e819ac4092b3a817462810a9cb9174029471ab381",
      status: "done",
      isArchive: true,
      extractedFiles: [
        { name: "pathogens_catalog_2024.fasta", size: "2.4 MB", type: "FASTA序列文件" },
        { name: "taxonomy_annotation.tsv", size: "640 KB", type: "分类注释表" },
        { name: "version_manifest.json", size: "16 KB", type: "版本清单" },
      ],
    },
  ]);
  const [checksumMatch, setChecksumMatch] = useState(true);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);

  const [estimatedStats] = useState({
    newRecords: 34200,
    modifiedRecords: 8920,
    invalidRecords: 450,
    failedRecords: 0,
  });

  // Step 3 Execution Pipeline States
  const [executionProgress, setExecutionProgress] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionFinished, setExecutionFinished] = useState(false);

  const STAGES = [
    { key: "check", name: "待校验 / 校验中", desc: "SHA256哈希值比对与文件包签名验证" },
    { key: "staging", name: "导入临时区", desc: "解压写入离线临时作业表与内存队列" },
    { key: "cleaning", name: "数据清洗", desc: "字段规范化、Taxonomy映射与去重" },
    { key: "verify", name: "数据核验", desc: "增量主键冲突比对与完整性约束核验" },
    { key: "switch", name: "版本切换", desc: "原子级目录软链接切换与台账生效" },
    { key: "done", name: "更新成功", desc: "生产环境已生效，历史版本归档完成" },
  ];

  useEffect(() => {
    if (database && open) {
      setCurrentStep(1);
      setNewVersion(
        database.currentVersion.includes("v")
          ? `v${(parseFloat(database.currentVersion.replace("v", "")) + 0.1).toFixed(1)}`
          : `${database.currentVersion}_new`
      );
      setSourceOrg(database.sourceOrg || "");
      setSourceAddress(database.officialUrl || "官方离线介质提供渠道");
      const today = new Date().toISOString().substring(0, 10);
      setSourceReleaseDate(today);
      setPackageAcquireDate(today);
      setUpdateType("增量更新");
      setUpdateNote(`例行离线数据包增量更新，包含最新收录序列与注释。`);
      setChecksumMatch(true);
      setExecutionProgress(0);
      setActiveStageIndex(0);
      setIsExecuting(false);
      setExecutionFinished(false);
      setExtractNotice(null);
    }
  }, [database, open]);

  // Handle Extraction of a compressed archive file
  const handleExtractFile = (fileId: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return { ...f, status: "extracting", extractProgress: 15 };
        }
        return f;
      })
    );

    // Simulate progressive extraction animation
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, extractProgress: 60 } : f))
      );
    }, 400);

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, extractProgress: 90 } : f))
      );
    }, 800);

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => {
          if (f.id === fileId) {
            const defaultExtracted = [
              { name: `${f.name.replace(/\.[^/.]+$/, "")}_data.fasta`, size: "2.4 MB", type: "FASTA序列文件" },
              { name: "taxonomy_annotation.tsv", size: "640 KB", type: "分类注释表" },
              { name: "version_manifest.json", size: "16 KB", type: "版本清单" },
            ];
            return {
              ...f,
              status: "extracted",
              extractProgress: 100,
              extractedFiles: f.extractedFiles || defaultExtracted,
            };
          }
          return f;
        })
      );
      setExtractNotice(`压缩包文件已成功解压至临时作业区，已提取数据包清单与序列文件。`);
      setTimeout(() => setExtractNotice(null), 4000);
    }, 1200);
  };

  // Handle File Deletion
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Handle Uploading new files
  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files: File[] = Array.from(e.target.files);
    
    const newItems: UploadedFileItem[] = files.map((file: File, i: number) => {
      const isZip =
        file.name.endsWith(".zip") ||
        file.name.endsWith(".tar.gz") ||
        file.name.endsWith(".tar") ||
        file.name.endsWith(".tgz") ||
        file.name.endsWith(".gz") ||
        file.name.endsWith(".rar") ||
        file.name.endsWith(".7z");

      const sizeFormatted =
        file.size > 1024 * 1024 * 1024
          ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
          : file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      const mockHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      return {
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        size: sizeFormatted,
        type: isZip ? "离线更新压缩包" : "数据辅助文件",
        progress: 100,
        sha256: mockHash,
        status: "done" as const,
        isArchive: isZip,
        extractedFiles: isZip
          ? [
              { name: `${file.name.replace(/\.[^/.]+$/, "")}_seq.fasta`, size: "1.8 MB", type: "FASTA序列文件" },
              { name: "annotation_meta.tsv", size: "420 KB", type: "注释表" },
              { name: "manifest.json", size: "12 KB", type: "配置清单" },
            ]
          : undefined,
      };
    });

    setUploadedFiles((prev) => [...prev, ...newItems]);
    // Reset file input value
    e.target.value = "";
  };

  const handleStartExecution = () => {
    setIsExecuting(true);
    setCurrentStep(3);
    setActiveStageIndex(0);
    setExecutionProgress(5);

    let progress = 5;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        progress = 100;
        setExecutionProgress(100);
        setActiveStageIndex(5);
        setIsExecuting(false);
        setExecutionFinished(true);
        clearInterval(interval);

        // Generate batch record
        if (database) {
          const newBatch: UpdateBatchRecord = {
            batchId: `UP-${database.code}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 899 + 100)}`,
            dbId: database.id,
            dbName: database.name,
            previousVersion: database.currentVersion,
            targetVersion: newVersion,
            updateType,
            sourceOrg,
            sourceReleaseDate,
            packageAcquireDate,
            uploadTime: new Date().toISOString().replace("T", " ").substring(0, 19),
            startTime: new Date().toISOString().replace("T", " ").substring(0, 19),
            finishTime: new Date().toISOString().replace("T", " ").substring(0, 19),
            status: "更新成功",
            originalRecords: database.totalRecords,
            newRecords: estimatedStats.newRecords,
            modifiedRecords: estimatedStats.modifiedRecords,
            invalidRecords: estimatedStats.invalidRecords,
            failedRecords: 0,
            finalTotalRecords: database.totalRecords + estimatedStats.newRecords,
            operator,
            updateNote,
            files: uploadedFiles.map((f) => ({
              name: f.name,
              size: f.size,
              format: f.name.split(".").pop()?.toUpperCase() || "TAR.GZ",
              path: `/data/staging/${f.name}`,
              sha256: f.sha256,
            })),
            executionStages: STAGES.map((s, idx) => ({
              stage: s.key,
              name: s.name,
              status: "done",
              duration: `${idx * 2 + 1}m ${Math.floor(Math.random() * 50 + 5)}s`,
              details: `已顺利完成 ${s.name}，审计日志校验通过`,
            })),
            logs: [
              `[${new Date().toISOString().replace("T", " ").substring(0, 19)}] [INFO] 管理员 ${operator} 发起离线数据包更新任务`,
              `[${new Date().toISOString().replace("T", " ").substring(0, 19)}] [INFO] 文件 SHA-256 比对 100% 一致`,
              `[${new Date().toISOString().replace("T", " ").substring(0, 19)}] [INFO] 数据清洗与 Taxonomy 规范化映射完成`,
              `[${new Date().toISOString().replace("T", " ").substring(0, 19)}] [SUCCESS] 热切换目录软链接至新版本，更新任务完成！`,
            ],
          };
          onUpdateCompleted(newBatch);
        }
      } else {
        setExecutionProgress(progress);
        const nextStage = Math.min(Math.floor((progress / 100) * STAGES.length), STAGES.length - 1);
        setActiveStageIndex(nextStage);
      }
    }, 500);
  };

  if (!database) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl w-[94vw] lg:w-[1040px] max-h-[88vh] h-[750px] p-0 flex flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200 flex items-center justify-center shadow-xs shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                离线数据包手动更新向导
                <Badge variant="outline" className="text-[11px] font-mono border-slate-300 text-slate-600">
                  {database.name}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                严格遵循内网离线安全规范，三步完成更新信息登记、数据包上传与后台原子级版本切换
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="px-8 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between shrink-0">
          {[
            { step: 1, title: "1. 填写更新信息" },
            { step: 2, title: "2. 上传离线数据包" },
            { step: 3, title: "3. 确认并执行" },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isPassed = currentStep > s.step;
            return (
              <div key={s.step} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    isPassed
                      ? "bg-emerald-600 text-white"
                      : isActive
                      ? "bg-[#0284c7] text-white shadow-xs"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-[#0284c7] font-bold" : isPassed ? "text-emerald-700" : "text-slate-500"
                  )}
                >
                  {s.title}
                </span>
                {s.step < 3 && <div className="w-16 h-[1px] bg-slate-300 mx-2 hidden sm:block" />}
              </div>
            );
          })}
        </div>

        {/* Wizard Content Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {/* STEP 1: Basic Update Info */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-left flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <p className="text-xs text-sky-800 leading-relaxed">
                  系统采用内网离线包导入机制。请准确登记外部数据源版本信息与取得日期，系统将自动绑定审计日志。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">数据库名称 (自动带出)</Label>
                  <Input value={database.name} disabled className="h-9 text-xs bg-slate-50 font-medium" />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">当前正式版本 (自动带出)</Label>
                  <Input value={database.currentVersion} disabled className="h-9 text-xs bg-slate-50 font-mono" />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    新版本号 <span className="text-rose-500">* (必填且不可与已有版本重复)</span>
                  </Label>
                  <Input
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="如 Release 224 / v3.0.0"
                    required
                    className="h-9 text-xs font-mono font-bold text-sky-800"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">更新类型</Label>
                  <Select value={updateType} onValueChange={(v: any) => setUpdateType(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="增量更新">增量更新 (合并新增与修改，保留历史)</SelectItem>
                      <SelectItem value="全量更新">全量更新 (完全覆盖重构)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">数据来源</Label>
                  <Input
                    value={sourceOrg}
                    onChange={(e) => setSourceOrg(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    来源发布日期 <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={sourceReleaseDate}
                    onChange={(e) => setSourceReleaseDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    数据包取得日期 <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={packageAcquireDate}
                    onChange={(e) => setPackageAcquireDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">操作管理员 (系统记录)</Label>
                  <Input value={operator} disabled className="h-9 text-xs bg-slate-50 font-medium" />
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    来源地址或来源说明 <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={sourceAddress}
                    onChange={(e) => setSourceAddress(e.target.value)}
                    placeholder="如 NCBI FTP /genomes/refseq 或官方光盘介质交接编号"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    更新内容说明 <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="详细记录该批次新增的序列类型、扩充特征及版本更新重点..."
                    rows={3}
                    className="text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Upload Files & SHA-256 Check & Extraction */}
          {currentStep === 2 && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".zip,.tar.gz,.tar,.tgz,.gz,.rar,.7z,.fasta,.tsv,.json,.sha256,.png,.bmp"
                onChange={handleFileUploadChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-200 bg-sky-50/40 hover:bg-sky-50 transition-all rounded-2xl p-6 text-center cursor-pointer space-y-2 group hover:border-[#0284c7]/50"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-sky-200 text-[#0284c7] flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">拖入多个文件或点击选择</p>
                  <p className="text-[11px] text-slate-400">
                    支持格式：.png, .bmp, .zip, .tar.gz, .fasta, .tsv; 单文件最大：20 GB
                  </p>
                </div>
              </div>

              {/* Extraction Success Notice */}
              {extractNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left flex items-center justify-between text-xs text-emerald-900 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{extractNotice}</span>
                  </div>
                  <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-300 text-[10px]">
                    作业区就绪
                  </Badge>
                </div>
              )}

              {/* Uploaded File List */}
              <div className="space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">已上传文件清单</span>
                  <span className="text-xs text-slate-500 font-mono">共 {uploadedFiles.length} 个文件</span>
                </div>

                {uploadedFiles.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    暂无已上传的数据包文件，请点击上方区域选择文件上传
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {uploadedFiles.map((file) => {
                      const isExtracting = file.status === "extracting";
                      const isExtracted = file.status === "extracted";

                      return (
                        <div
                          key={file.id}
                          className={cn(
                            "p-3.5 bg-white border rounded-xl shadow-2xs transition-all space-y-2.5",
                            isExtracted
                              ? "border-emerald-200 bg-emerald-50/20"
                              : isExtracting
                              ? "border-sky-300 bg-sky-50/30"
                              : "border-slate-200"
                          )}
                        >
                          {/* File Top Header Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                  isExtracted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : file.isArchive
                                    ? "bg-sky-100 text-[#0284c7]"
                                    : file.name.endsWith(".json")
                                    ? "bg-amber-100 text-amber-700"
                                    : file.name.endsWith(".sha256")
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-slate-100 text-slate-600"
                                )}
                              >
                                {file.isArchive ? (
                                  <FileArchive className="w-5 h-5" />
                                ) : file.name.endsWith(".json") ? (
                                  <FileCode className="w-5 h-5" />
                                ) : file.name.endsWith(".sha256") ? (
                                  <FileCheck className="w-5 h-5" />
                                ) : (
                                  <FileText className="w-5 h-5" />
                                )}
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                  {file.status === "uploading" ? (
                                    <Badge
                                      variant="secondary"
                                      className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-4.5 px-1.5 font-normal"
                                    >
                                      正在上传
                                    </Badge>
                                  ) : isExtracting ? (
                                    <Badge className="bg-sky-100 text-[#0284c7] border-sky-300 text-[10px] h-4.5 px-1.5 font-normal flex items-center gap-1">
                                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> 解压中 {file.extractProgress || 0}%
                                    </Badge>
                                  ) : isExtracted ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] h-4.5 px-1.5 font-normal flex items-center gap-1">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> 已解压
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] h-4.5 px-1.5 font-normal"
                                    >
                                      已上传
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions on the Right: 解压 and 删除 */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {file.isArchive && (
                                <>
                                  {isExtracting ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      disabled
                                      className="h-7 px-2.5 text-xs text-[#0284c7] font-medium gap-1 bg-sky-50"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      解压中
                                    </Button>
                                  ) : isExtracted ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleExtractFile(file.id)}
                                      className="h-7 px-2.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/60 font-medium gap-1"
                                      title="重新解压数据包到作业区"
                                    >
                                      <FolderArchive className="w-3.5 h-3.5 text-emerald-600" />
                                      重新解压
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleExtractFile(file.id)}
                                      className="h-7 px-2.5 text-xs text-sky-700 border-sky-300 bg-sky-50/50 hover:bg-sky-100 hover:text-sky-800 font-semibold gap-1 shadow-2xs transition-colors"
                                      title="解压离线数据包"
                                    >
                                      <FolderArchive className="w-3.5 h-3.5 text-[#0284c7]" />
                                      解压
                                    </Button>
                                  )}
                                </>
                              )}

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFile(file.id)}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="删除文件"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress & Size Row */}
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="font-mono text-slate-500 font-medium shrink-0">{file.size}</span>
                            <div className="flex-1">
                              <Progress
                                value={
                                  isExtracting
                                    ? file.extractProgress || 0
                                    : file.progress
                                }
                                className={cn(
                                  "h-1.5 bg-slate-100",
                                  isExtracted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-[#0284c7]"
                                )}
                              />
                            </div>
                            <span className="font-mono text-slate-500 font-semibold shrink-0">
                              {isExtracting
                                ? `${file.extractProgress || 0}%`
                                : `${file.progress}%`}
                            </span>
                          </div>

                          {/* Checksum Row */}
                          <div className="pt-0.5 text-[10px] font-mono text-slate-400 truncate flex items-center justify-between">
                            <span>SHA-256: {file.sha256 || "-"}</span>
                            {isExtracted && (
                              <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                已解压至离线临时作业区
                              </span>
                            )}
                          </div>

                          {/* Extracted Files List Preview */}
                          {isExtracted && file.extractedFiles && file.extractedFiles.length > 0 && (
                            <div className="mt-2 p-2.5 bg-white/90 rounded-lg border border-emerald-200/80 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                                <span className="flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                  已解压内部文件清单 ({file.extractedFiles.length} 项)
                                </span>
                                <span className="text-[10px] text-emerald-700 font-normal">解压格式校验通过</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                                {file.extractedFiles.map((ef, efIdx) => (
                                  <div
                                    key={efIdx}
                                    className="p-1.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[11px]"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                                      <span className="font-mono text-slate-700 truncate" title={ef.name}>
                                        {ef.name}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-1">
                                      {ef.size}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Automatic Checksum Safety Lock */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-left flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs text-emerald-900">
                  <p className="font-bold">哈希值完整性校验 100% 匹配</p>
                  <p className="text-emerald-700 text-[11px] leading-relaxed">
                    系统已自动根据 <code className="font-mono bg-emerald-100/70 px-1 rounded">checksums.sha256</code> 完成逐块校验。文件无篡改、无传输损坏，可直接确认执行导入更新。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm & Execute Pipeline */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto text-left">
              {/* Overall Progress Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      {isExecuting && <RefreshCw className="w-3.5 h-3.5 text-[#0284c7] animate-spin" />}
                      {executionFinished ? "离线数据包更新执行完成" : "后台流水线正在执行离线更新"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      目标版本: <span className="font-mono font-bold text-sky-700">{newVersion}</span> | 模式: {updateType}
                    </p>
                  </div>
                  <span className="text-base font-mono font-extrabold text-[#0284c7]">{executionProgress}%</span>
                </div>
                <Progress value={executionProgress} className="h-2.5 bg-slate-200" />
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">各处理阶段执行状态</span>
                <div className="space-y-2">
                  {STAGES.map((st, idx) => {
                    const isStageDone = activeStageIndex > idx || executionFinished;
                    const isStageRunning = activeStageIndex === idx && !executionFinished;
                    const isStagePending = activeStageIndex < idx && !executionFinished;

                    return (
                      <div
                        key={st.key}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-between transition-all",
                          isStageDone
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                            : isStageRunning
                            ? "bg-sky-50/80 border-sky-300 text-sky-950 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              isStageDone
                                ? "bg-emerald-600 text-white"
                                : isStageRunning
                                ? "bg-[#0284c7] text-white"
                                : "bg-slate-200 text-slate-400"
                            )}
                          >
                            {isStageDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : isStageRunning ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold">{st.name}</span>
                            <p className="text-[11px] text-slate-500">{st.desc}</p>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium",
                            isStageDone
                              ? "bg-emerald-100/70 border-emerald-300 text-emerald-800"
                              : isStageRunning
                              ? "bg-sky-100 border-sky-300 text-sky-800 animate-pulse"
                              : "border-slate-200 text-slate-400"
                          )}
                        >
                          {isStageDone ? "已完成" : isStageRunning ? "处理中" : "等待中"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Background Process Safety Notice */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-left flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  管理员确认执行后，后台任务持续运行。离开当前向导页面不影响任务执行，可在「更新记录」或「查看异常任务」中实时跟踪进度。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            {currentStep === 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="gap-1 text-slate-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                上一步
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {executionFinished ? "关闭" : "取消"}
            </Button>

            {currentStep === 1 && (
              <Button
                size="sm"
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white gap-1"
                disabled={!newVersion.trim() || !sourceAddress.trim() || !updateNote.trim()}
                onClick={() => setCurrentStep(2)}
              >
                下一步: 上传离线数据包
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                size="sm"
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white gap-1.5 shadow-sm"
                disabled={!checksumMatch}
                onClick={handleStartExecution}
              >
                <CheckCircle2 className="w-4 h-4" />
                确认并开始执行更新 (无需审批)
              </Button>
            )}

            {currentStep === 3 && executionFinished && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                onClick={() => onOpenChange(false)}
              >
                <CheckCircle2 className="w-4 h-4" />
                更新完毕，返回台账
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
