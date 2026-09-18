import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HardDrive,
  ShieldAlert,
  Info,
  RefreshCw,
} from "lucide-react";
import { PublicDatabaseItem, DatabaseVersion } from "./types";

interface VersionRollbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  database: PublicDatabaseItem | null;
  targetVersion: DatabaseVersion | null;
  onRollbackConfirmed: (dbId: string, targetVersionNumber: string, reason: string) => void;
}

export function VersionRollbackModal({
  open,
  onOpenChange,
  database,
  targetVersion,
  onRollbackConfirmed,
}: VersionRollbackModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rollbackDone, setRollbackDone] = useState(false);

  if (!database || !targetVersion) return null;

  const currentVerStr = database.currentVersion;
  const targetVerStr = targetVersion.versionNumber;

  const handleExecuteRollback = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setRollbackDone(true);
      onRollbackConfirmed(database.id, targetVersion.versionNumber, "管理员手动回滚版本");
    }, 1200);
  };

  const handleClose = () => {
    setRollbackDone(false);
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-2xl w-[92vw] max-h-[88vh] p-0 flex flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-amber-200 bg-amber-50/80 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                数据库版本回滚向导
                <Badge variant="outline" className="text-[11px] font-mono border-amber-300 bg-amber-100/50 text-amber-800">
                  高敏感操作
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                将当前正式版本恢复至指定的历史版本，系统将自动调整生产软链接并记录独立审计日志
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-left overflow-y-auto min-h-0">
          {!rollbackDone ? (
            <>
              {/* Version Comparison Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>版本切换方案</span>
                  <span className="text-[11px] text-slate-400 font-normal">数据库: {database.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">当前正式版本 (即将转为历史)</span>
                    <p className="text-sm font-bold font-mono text-slate-800">{currentVerStr}</p>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700">目标恢复版本 (即将生效为正式)</span>
                    <p className="text-sm font-bold font-mono text-amber-900">{targetVerStr}</p>
                  </div>
                </div>
              </div>

              {/* Safety Impact Warning */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs text-rose-900">
                  <p className="font-bold">可能受影响的任务提示</p>
                  <p className="text-rose-700 leading-relaxed text-[11px]">
                    版本回滚后，所有新建的生信分析工作流（如病原比对、物种注释、抗体库检索）将基于目标历史版本数据运行。正在执行中的旧批次任务若绑定了绝对快照路径则不受干扰。
                  </p>
                </div>
              </div>

              {/* Confirmation Phrase Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  二次确认验证 <span className="text-slate-400 font-normal">请输入目标版本号「{targetVerStr}」以确认</span>
                </Label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={targetVerStr}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">版本恢复执行成功</h3>
                <p className="text-xs text-slate-500 font-mono">
                  已切换正式版本至 <span className="font-bold text-emerald-700">{targetVerStr}</span>
                </p>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                数据库台账已同步更新，原正式版本已归档为历史版本。操作已生成独立回滚记录与安全审计日志。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose}>
            {rollbackDone ? "完成并退出" : "取消"}
          </Button>

          {!rollbackDone && (
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              disabled={confirmText !== targetVerStr || isProcessing}
              onClick={handleExecuteRollback}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  正在执行版本回退...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  确认回滚至此版本
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
