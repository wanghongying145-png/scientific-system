import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  Calendar,
  HardDrive,
  FileText,
  ShieldCheck,
  RotateCcw,
  Upload,
  Download,
  Terminal,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PublicDatabaseItem,
  DatabaseVersion,
  UpdateBatchRecord,
} from "./types";
import { UpdateTaskDetailModal } from "./UpdateTaskDetailModal";
import { VersionRollbackModal } from "./VersionRollbackModal";
import { ManualUpdateWizard } from "./ManualUpdateWizard";
import { HierarchicalFileManifestTree } from "./HierarchicalFileManifestTree";

interface DatabaseDetailViewProps {
  database: PublicDatabaseItem;
  isAdmin: boolean;
  onBack: () => void;
  onEditDatabase?: () => void;
  onRollbackVersion?: (dbId: string, targetVersion: string, reason: string) => void;
  onUpdateCompleted?: (record: UpdateBatchRecord) => void;
}

export function DatabaseDetailView({
  database,
  isAdmin,
  onBack,
  onEditDatabase,
  onRollbackVersion,
  onUpdateCompleted,
}: DatabaseDetailViewProps) {
  const [activeTab, setActiveTab] = useState("current-version");
  const [selectedBatch, setSelectedBatch] = useState<UpdateBatchRecord | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [rollbackTargetVer, setRollbackTargetVer] = useState<DatabaseVersion | null>(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showManualUpdate, setShowManualUpdate] = useState(false);

  const currentVer = database.versions.find((v) => v.status === "当前正式版本") || database.versions[0] || {
    versionNumber: database.currentVersion,
    sourceInfo: database.sourceOrg,
    sourceReleaseDate: database.sourceReleaseDate,
    packageAcquireDate: database.sourceReleaseDate,
    systemUpdateTime: database.systemUpdateTime,
    enableTime: database.systemUpdateTime,
    totalRecords: database.totalRecords,
    status: "当前正式版本",
    generationMethod: "离线全量导入",
    operator: database.responsibleAdmin,
    versionNote: "当前使用的正式生信参考库版本。",
    sha256Summary: "a7c8e9f1823901bcae841726a938cde491b23847582910ab38472619e0fba834",
    fileManifest: [
      {
        name: `${database.code.toLowerCase()}_data.tar.gz`,
        size: "24.5 GB",
        format: database.dataFormat.split(",")[0] || "FASTA",
        path: `/data/databases/${database.code.toLowerCase()}/${database.currentVersion}/data.tar.gz`,
        sha256: "a7c8e9f1823901bcae841726a938cde491b23847582910ab38472619e0fba834",
      },
    ],
  };

  const handleDownloadFailedData = (batch: UpdateBatchRecord) => {
    const content = `【失败条目明细清单 - ${batch.batchId}】\n数据库: ${batch.dbName}\n失败条数: ${batch.failedRecords}\n\n错误摘要:\n` +
      (batch.failureReasons?.join("\n") || "未捕获致命异常");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Failed_Data_${batch.batchId}.txt`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-left">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9 rounded-xl border-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{database.name}</h2>
              <Badge variant="outline" className="text-[11px] font-mono border-sky-300 bg-sky-50 text-sky-800">
                {database.code}
              </Badge>
              <Badge
                className={cn(
                  "text-[10px] font-medium h-5",
                  database.runStatus === "正常"
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                    : database.runStatus === "异常"
                    ? "bg-rose-100 text-rose-800 hover:bg-rose-100"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-200"
                )}
              >
                {database.runStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{database.englishName}</p>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          <TabsTrigger value="current-version" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs">
            1. 当前版本
          </TabsTrigger>
          <TabsTrigger value="basic-info" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs">
            2. 基本信息
          </TabsTrigger>
          <TabsTrigger value="update-records" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs">
            3. 更新记录 ({database.updateRecords?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="version-mgmt" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs">
            4. 版本管理
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: 当前版本 (Current Version) */}
        <TabsContent value="current-version" className="space-y-6 m-0">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">当前版本号</span>
              <p className="text-base font-extrabold font-mono text-sky-800">{currentVer.versionNumber}</p>
              <span className="text-[10px] text-emerald-600 font-medium">● 当前正式运行</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">来源发布日期</span>
              <p className="text-xs font-bold font-mono text-slate-800">{currentVer.sourceReleaseDate}</p>
              <span className="text-[10px] text-slate-400">取得日期: {currentVer.packageAcquireDate}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">本系统更新时间</span>
              <p className="text-xs font-bold font-mono text-slate-800">{currentVer.systemUpdateTime}</p>
              <span className="text-[10px] text-slate-400">操作人: {currentVer.operator}</span>
            </div>
          </div>

          {/* Hierarchical File Manifest Tree with Decompression Actions */}
          <HierarchicalFileManifestTree database={database} currentVersion={currentVer} />
        </TabsContent>

        {/* TAB 2: 基本信息 (Basic Info) */}
        <TabsContent value="basic-info" className="space-y-6 m-0">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">一、基本信息</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据库名称</span>
                  <p className="text-sm font-bold text-slate-900">{database.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据库英文名称</span>
                  <p className="text-sm font-medium text-slate-700">{database.englishName || "--"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据库编码</span>
                  <p className="text-xs font-mono font-bold text-sky-800">{database.code}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">当前版本</span>
                  <p className="text-xs font-mono font-bold text-slate-900 bg-sky-50 text-sky-800 px-2 py-0.5 rounded inline-block w-fit">
                    {database.currentVersion}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据库类别</span>
                  <p className="text-xs font-semibold text-slate-800">{database.categoryLabel}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据来源</span>
                  <p className="text-xs font-medium text-slate-700">{database.sourceOrg}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">官方来源地址 (URL)</span>
                  {database.officialUrl ? (
                    <a
                      href={database.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-sky-600 hover:underline flex items-center gap-1"
                    >
                      {database.officialUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 font-mono">--</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">来源发布日期</span>
                  <p className="text-xs font-mono text-slate-700">{database.sourceReleaseDate || "--"}</p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据库简介</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{database.description || "--"}</p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">收录数据内容</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{database.dataContent || "--"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">许可及使用条件</span>
                  <p className="text-xs text-slate-700 font-medium">{database.licenseTerms || "--"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">数据格式</span>
                  <p className="text-xs font-mono text-slate-700">{database.dataFormat || "--"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">建议更新周期</span>
                  <p className="text-xs text-slate-700">{database.recommendedUpdateCycle || "--"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">责任管理员</span>
                  <p className="text-xs font-semibold text-slate-800">{database.responsibleAdmin || "--"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">是否启用</span>
                  <div>
                    <Badge
                      className={cn(
                        "text-[10px] font-medium h-5",
                        database.isEnabled
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {database.isEnabled ? "已启用" : "已停用"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">创建时间</span>
                  <p className="text-xs font-mono text-slate-600">{database.createTime || "--"}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Update Configuration */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">二、更新配置</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">更新方式</span>
                  <div>
                    <Badge variant="outline" className="text-xs font-medium bg-slate-50 border-slate-300">
                      {database.updateMethod || "离线数据包手动更新"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">支持更新类型</span>
                  <p className="text-xs text-slate-800 font-medium">
                    {database.updateConfig?.updateType || "全量/增量"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">支持文件格式</span>
                  <p className="text-xs font-mono text-slate-700">
                    {database.updateConfig?.supportedFormats?.join(", ") || ".fa, .fasta, .tsv, .tar.gz"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">单次上传文件大小限制</span>
                  <p className="text-xs font-mono font-semibold text-slate-800">
                    {database.updateConfig?.maxUploadSizeGB ? `${database.updateConfig.maxUploadSizeGB} GB` : "50 GB"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">历史版本保留数量</span>
                  <p className="text-xs font-medium text-slate-800">
                    {database.updateConfig?.historyVersionRetention ? `${database.updateConfig.historyVersionRetention} 个版本` : "2 个版本"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: 更新记录 (Update Records) */}
        <TabsContent value="update-records" className="space-y-4 m-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">该数据库历次离线更新台账批次</span>
            <span className="text-[11px] text-slate-400 font-mono">共 {database.updateRecords?.length || 0} 次更新</span>
          </div>

          {database.updateRecords && database.updateRecords.length > 0 ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5">更新批次号</th>
                    <th className="p-3.5">版本变迁</th>
                    <th className="p-3.5">数据来源</th>
                    <th className="p-3.5">来源发布日期</th>
                    <th className="p-3.5">更新内容</th>
                    <th className="p-3.5">上传时间</th>
                    <th className="p-3.5">更新状态</th>
                    <th className="p-3.5">失败原因</th>
                    <th className="p-3.5">操作管理员</th>
                    <th className="p-3.5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {database.updateRecords.map((batch) => (
                    <tr key={batch.batchId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-sky-800">{batch.batchId}</td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {batch.previousVersion} <ArrowRight className="w-3 h-3 inline text-slate-400 mx-1" />{" "}
                        <span className="font-bold text-slate-900">{batch.targetVersion}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">{batch.sourceOrg}</td>
                      <td className="p-3.5 font-mono text-slate-500">{batch.sourceReleaseDate}</td>
                      <td className="p-3.5 text-slate-600 max-w-[200px] truncate" title={batch.updateNote}>
                        {batch.updateNote || "--"}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">{batch.uploadTime}</td>
                      <td className="p-3.5">
                        <Badge
                          className={cn(
                            "text-[10px] font-medium h-5",
                            batch.status === "更新成功"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : batch.status === "更新失败"
                              ? "bg-rose-100 text-rose-800 hover:bg-rose-100"
                              : "bg-sky-100 text-sky-800 hover:bg-sky-100"
                          )}
                        >
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 max-w-[240px]">
                        {batch.status === "更新失败" ? (
                          <span
                            className="text-rose-600 text-xs font-medium line-clamp-2 leading-tight block"
                            title={
                              batch.failureReasons && batch.failureReasons.length > 0
                                ? batch.failureReasons.join("\n")
                                : "数据格式不符合系统校验规则或文件完整性异常"
                            }
                          >
                            {batch.failureReasons && batch.failureReasons.length > 0
                              ? batch.failureReasons.join("；")
                              : "数据格式不符合系统校验规则或文件完整性异常"}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">--</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">{batch.operator}</td>
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        {batch.failedRecords > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadFailedData(batch)}
                            className="h-7 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          >
                            下载失败数据
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs pr-2">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2 text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs">暂无历史更新记录，当前版本为系统初始化正式版本。</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: 版本管理 (Version Management) */}
        <TabsContent value="version-mgmt" className="space-y-4 m-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">当前正式版本及最近 2 个历史归档版本</span>
            <span className="text-[11px] text-slate-400">支持一键安全版本回滚</span>
          </div>

          <div className="space-y-3">
            {database.versions.map((ver, idx) => {
              const isCurrent = ver.status === "当前正式版本";
              return (
                <div
                  key={idx}
                  className={cn(
                    "p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs",
                    isCurrent
                      ? "bg-white border-sky-300 ring-1 ring-sky-100"
                      : "bg-slate-50/80 border-slate-200"
                  )}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold font-mono text-slate-900">{ver.versionNumber}</span>
                      <Badge
                        className={cn(
                          "text-[10px] font-bold h-5",
                          isCurrent
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {ver.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-normal border-slate-200 text-slate-500">
                        {ver.generationMethod}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500">{ver.versionNote}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap font-mono">
                      <span>数据量: {ver.totalRecords.toLocaleString()} 条</span>
                      <span>启用时间: {ver.enableTime}</span>
                      {ver.disableTime && <span>停用时间: {ver.disableTime}</span>}
                      <span>操作人: {ver.operator}</span>
                    </div>
                  </div>

                  {/* Action Buttons for Versions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isCurrent ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        当前正在使用
                      </span>
                    ) : (
                      isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRollbackTargetVer(ver);
                            setShowRollbackModal(true);
                          }}
                          className="h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-50 gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          回滚至此版本
                        </Button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <UpdateTaskDetailModal
        open={showTaskDetail}
        onOpenChange={setShowTaskDetail}
        batchRecord={selectedBatch}
      />

      {/* Version Rollback Modal */}
      <VersionRollbackModal
        open={showRollbackModal}
        onOpenChange={setShowRollbackModal}
        database={database}
        targetVersion={rollbackTargetVer}
        onRollbackConfirmed={(dbId, targetVer, reason) => {
          if (onRollbackVersion) {
            onRollbackVersion(dbId, targetVer, reason);
          }
        }}
      />

      {/* Manual Update Wizard */}
      <ManualUpdateWizard
        open={showManualUpdate}
        onOpenChange={setShowManualUpdate}
        database={database}
        onUpdateCompleted={(batch) => {
          if (onUpdateCompleted) {
            onUpdateCompleted(batch);
          }
        }}
      />
    </div>
  );
}
