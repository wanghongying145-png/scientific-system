import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Layers,
} from "lucide-react";
import { UpdateBatchRecord } from "./types";
import { cn } from "@/lib/utils";

interface UpdateTaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchRecord: UpdateBatchRecord | null;
}

export function UpdateTaskDetailModal({
  open,
  onOpenChange,
  batchRecord,
}: UpdateTaskDetailModalProps) {
  if (!batchRecord) return null;

  const isSuccess = batchRecord.status === "更新成功";
  const isFailed = batchRecord.status === "更新失败";

  const handleDownloadReport = () => {
    const reportText = `【生信分析系统 - 公共数据库离线更新报告】
批次编号: ${batchRecord.batchId}
数据库名称: ${batchRecord.dbName}
更新版本: ${batchRecord.previousVersion} -> ${batchRecord.targetVersion}
更新类型: ${batchRecord.updateType}
执行状态: ${batchRecord.status}
执行时间: ${batchRecord.startTime} 至 ${batchRecord.finishTime}
操作管理员: ${batchRecord.operator}

数据量变动统计:
- 原有效总条数: ${batchRecord.originalRecords.toLocaleString()}
- 新增有效条数: +${batchRecord.newRecords.toLocaleString()}
- 修改更新条数: ${batchRecord.modifiedRecords.toLocaleString()}
- 失效清理条数: ${batchRecord.invalidRecords.toLocaleString()}
- 失败处理条数: ${batchRecord.failedRecords.toLocaleString()}
- 更新后总条数: ${batchRecord.finalTotalRecords.toLocaleString()}

上传离线文件及SHA-256校验值:
${batchRecord.files.map((f) => `- ${f.name} (${f.size}) SHA256: ${f.sha256}`).join("\n")}

各处理阶段流水线:
${batchRecord.executionStages.map((s) => `[${s.status.toUpperCase()}] ${s.name} (${s.duration}) - ${s.details || "无"}`).join("\n")}

审计日志:
${batchRecord.logs.join("\n")}
`;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Update_Report_${batchRecord.batchId}.txt`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[92vw] lg:w-[960px] max-h-[88vh] h-[750px] p-0 flex flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs shrink-0",
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isFailed
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-sky-50 text-sky-700 border-sky-200"
              )}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                更新任务详情 (批次: {batchRecord.batchId})
                <Badge
                  className={cn(
                    "text-[10px] font-bold h-5",
                    isSuccess
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      : isFailed
                      ? "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100"
                      : "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100"
                  )}
                >
                  {batchRecord.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-mono">
                {batchRecord.dbName} | {batchRecord.previousVersion} <ArrowRight className="w-3 h-3 inline mx-1" /> {batchRecord.targetVersion}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-left min-h-0">
          {/* Section 1: Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">更新模式</span>
              <p className="text-xs font-bold text-slate-800">{batchRecord.updateType}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">操作管理员</span>
              <p className="text-xs font-bold text-slate-800">{batchRecord.operator}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">开始时间</span>
              <p className="text-xs font-mono text-slate-700">{batchRecord.startTime}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">完成时间</span>
              <p className="text-xs font-mono text-slate-700">{batchRecord.finishTime}</p>
            </div>
          </div>

          {/* Section 2: Data Metrics Comparison */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800">更新前后数据量对比与变动明细</span>
            <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400">原数据条数</span>
                <p className="text-sm font-bold font-mono text-slate-700">{batchRecord.originalRecords.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-emerald-600">新增条数</span>
                <p className="text-sm font-bold font-mono text-emerald-700">+{batchRecord.newRecords.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-600">修改条数</span>
                <p className="text-sm font-bold font-mono text-amber-700">{batchRecord.modifiedRecords.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500">失效条数</span>
                <p className="text-sm font-bold font-mono text-slate-600">-{batchRecord.invalidRecords.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-rose-600">失败条数</span>
                <p className="text-sm font-bold font-mono text-rose-700">{batchRecord.failedRecords.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5 bg-white p-1 rounded-lg border border-slate-200">
                <span className="text-[10px] text-sky-600 font-bold">最终生效条数</span>
                <p className="text-sm font-extrabold font-mono text-sky-900">{batchRecord.finalTotalRecords.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Failure Alert if applicable */}
          {isFailed && batchRecord.failureReasons && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>任务执行中止原因与安全保护机制</span>
              </div>
              <ul className="space-y-1 text-xs text-rose-700 list-disc pl-5">
                {batchRecord.failureReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <p className="text-[11px] text-rose-600 pt-1 border-t border-rose-100 font-medium">
                ★ 安全保护生效：生产环境继续锁定并使用原正式版本 <code className="font-mono">{batchRecord.previousVersion}</code>，不影响任何科研用户与分析工作流。
              </p>
            </div>
          )}

          {/* Section 4: Execution Pipeline Stages */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800">流水线各阶段执行记录</span>
            <div className="space-y-1.5">
              {batchRecord.executionStages.map((st, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {st.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : st.status === "error" ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="font-bold text-slate-800">{st.name}</span>
                    {st.details && <span className="text-slate-500 font-normal text-[11px]">({st.details})</span>}
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">{st.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Files and Checksums */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800">上传离线文件与SHA-256校验指纹</span>
            <div className="space-y-1.5">
              {batchRecord.files.map((f, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{f.name}</span>
                    <span className="text-[10px] text-slate-400">({f.size})</span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[320px]">{f.sha256}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Console Logs */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              执行控制台日志
            </span>
            <div className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto max-h-36">
              {batchRecord.logs.map((log, i) => (
                <p key={i} className="leading-relaxed">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={handleDownloadReport} className="gap-1.5 text-slate-700">
            <Download className="w-4 h-4 text-sky-600" />
            下载更新报告 (PDF/TXT)
          </Button>

          <Button type="button" size="sm" onClick={() => onOpenChange(false)} className="bg-slate-800 hover:bg-slate-900 text-white">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
