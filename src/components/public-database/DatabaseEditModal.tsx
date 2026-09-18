import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, ShieldCheck, HardDrive, Info, Layers, CheckCircle2 } from "lucide-react";
import { PublicDatabaseItem, DatabaseCategory } from "./types";

interface DatabaseEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  databaseToEdit: PublicDatabaseItem | null;
  onSave: (db: Partial<PublicDatabaseItem>) => void;
}

export function DatabaseEditModal({
  open,
  onOpenChange,
  databaseToEdit,
  onSave,
}: DatabaseEditModalProps) {
  const isEdit = Boolean(databaseToEdit);

  const [name, setName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [code, setCode] = useState("");
  const [currentVersion, setCurrentVersion] = useState("v1.0");
  const [category, setCategory] = useState<DatabaseCategory>("pathogen");
  const [description, setDescription] = useState("");
  const [dataContent, setDataContent] = useState("");
  const [sourceOrg, setSourceOrg] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [sourceReleaseDate, setSourceReleaseDate] = useState("2026-01-01");
  const [licenseTerms, setLicenseTerms] = useState("");
  const [dataFormat, setDataFormat] = useState("FASTA, GFF3, TSV");
  const [recommendedUpdateCycle, setRecommendedUpdateCycle] = useState("每季度 (90天)");
  const [responsibleAdmin, setResponsibleAdmin] = useState("系统管理员 (admin)");
  const [isEnabled, setIsEnabled] = useState(true);

  // Update Config
  const [updateType, setUpdateType] = useState<"全量/增量" | "仅全量" | "仅增量">("全量/增量");
  const [supportedFormats, setSupportedFormats] = useState(".fa, .fasta, .tsv, .tar.gz");
  const [maxUploadSizeGB, setMaxUploadSizeGB] = useState(50);
  const [historyRetention, setHistoryRetention] = useState(2);

  useEffect(() => {
    if (databaseToEdit) {
      setName(databaseToEdit.name);
      setEnglishName(databaseToEdit.englishName);
      setCode(databaseToEdit.code);
      setCurrentVersion(databaseToEdit.currentVersion || "v1.0");
      setCategory(databaseToEdit.category);
      setDescription(databaseToEdit.description);
      setDataContent(databaseToEdit.dataContent);
      setSourceOrg(databaseToEdit.sourceOrg);
      setOfficialUrl(databaseToEdit.officialUrl);
      setSourceReleaseDate(databaseToEdit.sourceReleaseDate || "2026-01-01");
      setLicenseTerms(databaseToEdit.licenseTerms);
      setDataFormat(databaseToEdit.dataFormat);
      setRecommendedUpdateCycle(databaseToEdit.recommendedUpdateCycle);
      setResponsibleAdmin(databaseToEdit.responsibleAdmin);
      setIsEnabled(databaseToEdit.isEnabled);
      setUpdateType(databaseToEdit.updateConfig?.updateType || "全量/增量");
      setSupportedFormats(databaseToEdit.updateConfig?.supportedFormats?.join(", ") || ".fa, .fasta, .tsv, .tar.gz");
      setMaxUploadSizeGB(databaseToEdit.updateConfig?.maxUploadSizeGB || 50);
      setHistoryRetention(databaseToEdit.updateConfig?.historyVersionRetention || 2);
    } else {
      setName("");
      setEnglishName("");
      setCode(`DB_${Date.now().toString().slice(-6)}`);
      setCurrentVersion("v1.0");
      setCategory("pathogen");
      setDescription("");
      setDataContent("");
      setSourceOrg("");
      setOfficialUrl("");
      setSourceReleaseDate(new Date().toISOString().slice(0, 10));
      setLicenseTerms("Open Source / Academic License");
      setDataFormat("FASTA, GFF3, TSV");
      setRecommendedUpdateCycle("每季度 (90天)");
      setResponsibleAdmin("系统管理员 (admin)");
      setIsEnabled(true);
      setUpdateType("全量/增量");
      setSupportedFormats(".fa, .fasta, .tsv, .tar.gz");
      setMaxUploadSizeGB(50);
      setHistoryRetention(2);
    }
  }, [databaseToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const categoryMap: Record<DatabaseCategory, string> = {
      pathogen: "病原微生物数据库",
      immunogenomics: "免疫基因组学综合数据库",
      protein_struct: "蛋白质结构预测专用数据库",
    };

    onSave({
      id: databaseToEdit ? databaseToEdit.id : `db-${Date.now()}`,
      code: code || `DB_${Date.now().toString().slice(-6)}`,
      name,
      englishName,
      category,
      categoryLabel: categoryMap[category],
      sourceOrg,
      officialUrl,
      sourceReleaseDate: sourceReleaseDate.trim() || new Date().toISOString().slice(0, 10),
      currentVersion: currentVersion.trim() || "v1.0",
      licenseTerms,
      description,
      dataContent,
      dataFormat,
      recommendedUpdateCycle,
      responsibleAdmin,
      isEnabled,
      updateMethod: "离线数据包手动更新",
      updateConfig: {
        updateType,
        supportedFormats: supportedFormats.split(",").map((s) => s.trim()).filter(Boolean),
        maxUploadSizeGB: Number(maxUploadSizeGB) || 50,
        uniqueKeyField: databaseToEdit?.updateConfig?.uniqueKeyField || "Accession_ID",
        validationRules: databaseToEdit?.updateConfig?.validationRules || ["SHA256校验", "数据完整性核验"],
        historyVersionRetention: Number(historyRetention) || 2,
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[92vw] max-h-[88vh] h-[780px] p-0 flex flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200 flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                {isEdit ? "编辑公共数据库" : "新增公共数据库"}
                <Badge variant="outline" className="text-[11px] font-normal border-sky-200 bg-sky-50 text-sky-700">
                  {isEdit ? "更新台账元数据" : "登记新建并设为待初始化"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                登记公共生信数据库基本档案与离线更新配置（管理员登记后状态为「待初始化」，首次导入离线包后生效为「正常」）
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">一、基本信息</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    数据库名称 <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如 NCBI RefSeq (病原微生物专用库)"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">数据库英文名称</Label>
                  <Input
                    value={englishName}
                    onChange={(e) => setEnglishName(e.target.value)}
                    placeholder="如 NCBI Reference Sequence Database"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">数据库编码</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="如 DB_PATH_001"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    当前版本 <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                    placeholder="如 Release 2026.01, v1.0"
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    数据库类别 <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as DatabaseCategory)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="选择类别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pathogen">病原微生物数据库</SelectItem>
                      <SelectItem value="immunogenomics">免疫基因组学综合数据库</SelectItem>
                      <SelectItem value="protein_struct">蛋白质结构预测专用数据库</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">数据来源</Label>
                  <Input
                    value={sourceOrg}
                    onChange={(e) => setSourceOrg(e.target.value)}
                    placeholder="如 NCBI, EMBL-EBI, RCSB PDB"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">官方来源地址 (URL)</Label>
                  <Input
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">来源发布日期</Label>
                  <Input
                    type="date"
                    value={sourceReleaseDate}
                    onChange={(e) => setSourceReleaseDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">数据库简介</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="详细描述该公共数据库的学科背景与在生信分析工作流中的作用..."
                    rows={2}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">收录数据内容</Label>
                  <Input
                    value={dataContent}
                    onChange={(e) => setDataContent(e.target.value)}
                    placeholder="如 涵盖细菌、病毒、真菌标准参考基因组与Taxonomy映射"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">许可及使用条件</Label>
                  <Input
                    value={licenseTerms}
                    onChange={(e) => setLicenseTerms(e.target.value)}
                    placeholder="如 CC0, CC BY 4.0, 学术免费使用"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">数据格式</Label>
                  <Input
                    value={dataFormat}
                    onChange={(e) => setDataFormat(e.target.value)}
                    placeholder="FASTA, GFF3, TSV, BAM"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">建议更新周期</Label>
                  <Select value={recommendedUpdateCycle} onValueChange={setRecommendedUpdateCycle}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="每月 (30天)">每月 (30天)</SelectItem>
                      <SelectItem value="双月 (60天)">双月 (60天)</SelectItem>
                      <SelectItem value="每季度 (90天)">每季度 (90天)</SelectItem>
                      <SelectItem value="半年度 (180天)">半年度 (180天)</SelectItem>
                      <SelectItem value="年度 (365天)">年度 (365天)</SelectItem>
                      <SelectItem value="不定期手工更新">不定期手工更新</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">责任管理员</Label>
                  <Input
                    value={responsibleAdmin}
                    onChange={(e) => setResponsibleAdmin(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">是否启用</Label>
                  <Select value={isEnabled ? "true" : "false"} onValueChange={(val) => setIsEnabled(val === "true")}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">启用</SelectItem>
                      <SelectItem value="false">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Update Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">二、更新配置</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">更新方式</Label>
                  <div className="h-9 px-3 rounded-md bg-slate-100 border border-slate-200 flex items-center text-xs font-medium text-slate-700">
                    离线数据包手动更新 (内网固定模式)
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">支持更新类型</Label>
                  <Select value={updateType} onValueChange={(v: any) => setUpdateType(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全量/增量">全量 / 增量</SelectItem>
                      <SelectItem value="仅全量">仅全量</SelectItem>
                      <SelectItem value="仅增量">仅增量</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">支持文件格式 (逗号分隔)</Label>
                  <Input
                    value={supportedFormats}
                    onChange={(e) => setSupportedFormats(e.target.value)}
                    placeholder=".fasta, .fna, .tsv, .tar.gz"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-semibold text-slate-700">单次上传文件大小限制 (GB)</Label>
                  <Input
                    type="number"
                    value={maxUploadSizeGB}
                    onChange={(e) => setMaxUploadSizeGB(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">历史版本保留数量 (默认2个)</Label>
                  <Input
                    type="number"
                    value={historyRetention}
                    onChange={(e) => setHistoryRetention(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>内网环境保障：不提供外部网络自动抓取或在线同步</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" size="sm" className="bg-[#0284c7] hover:bg-[#0369a1] text-white">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {isEdit ? "保存修改" : "确认登记数据库"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
