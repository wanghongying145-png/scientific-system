import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Check,
  Database,
  Globe,
  Lock,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicDatabaseItem, DatabaseViewScope } from "./types";
import { RESEARCH_GROUPS, getGroupName } from "./groupAccess";

export interface DatabaseAccessDraft {
  id: string;
  viewScope: DatabaseViewScope;
  allowedGroupIds: string[];
}

interface DatabaseAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  databases: PublicDatabaseItem[];
  currentGroupId: string;
  focusDbId?: string | null;
  onSave: (drafts: DatabaseAccessDraft[]) => void;
}

type DraftMap = Record<string, { viewScope: DatabaseViewScope; allowedGroupIds: string[] }>;

function buildDraft(databases: PublicDatabaseItem[]): DraftMap {
  const draft: DraftMap = {};
  databases.forEach((db) => {
    draft[db.id] = {
      viewScope: db.viewScope || "all",
      allowedGroupIds: [...(db.allowedGroupIds || [])],
    };
  });
  return draft;
}

export function DatabaseAccessDialog({
  open,
  onOpenChange,
  databases,
  currentGroupId,
  focusDbId,
  onSave,
}: DatabaseAccessDialogProps) {
  const [draft, setDraft] = useState<DraftMap>({});
  const [keyword, setKeyword] = useState("");
  const [onlyRestricted, setOnlyRestricted] = useState(false);

  // 每次打开时按当前数据库台账重建草稿
  useEffect(() => {
    if (open) {
      setDraft(buildDraft(databases));
      setKeyword("");
      setOnlyRestricted(false);
    }
  }, [open, databases]);

  const visibleDatabases = useMemo(() => {
    return databases.filter((db) => {
      if (keyword.trim()) {
        const query = keyword.toLowerCase().trim();
        const match =
          db.name.toLowerCase().includes(query) ||
          db.code.toLowerCase().includes(query) ||
          db.categoryLabel.toLowerCase().includes(query);
        if (!match) return false;
      }
      if (onlyRestricted) {
        const entry = draft[db.id];
        if (entry && entry.viewScope === "all") return false;
      }
      return true;
    });
  }, [databases, keyword, onlyRestricted, draft]);

  const restrictedCount = useMemo(
    () => databases.filter((db) => (draft[db.id]?.viewScope || "all") === "groups").length,
    [databases, draft]
  );

  const setScope = (dbId: string, scope: DatabaseViewScope) => {
    setDraft((prev) => {
      const current = prev[dbId] || { viewScope: "all" as DatabaseViewScope, allowedGroupIds: [] };
      if (scope === "all") {
        return { ...prev, [dbId]: { viewScope: "all", allowedGroupIds: [] } };
      }
      const groups = current.allowedGroupIds.length
        ? current.allowedGroupIds
        : currentGroupId
          ? [currentGroupId]
          : [];
      return { ...prev, [dbId]: { viewScope: "groups", allowedGroupIds: groups } };
    });
  };

  const toggleGroup = (dbId: string, groupId: string) => {
    setDraft((prev) => {
      const current = prev[dbId] || { viewScope: "groups" as DatabaseViewScope, allowedGroupIds: [] };
      const has = current.allowedGroupIds.includes(groupId);
      const next = has
        ? current.allowedGroupIds.filter((id) => id !== groupId)
        : [...current.allowedGroupIds, groupId];
      return { ...prev, [dbId]: { viewScope: "groups", allowedGroupIds: next } };
    });
  };

  const applyBulk = (scope: DatabaseViewScope) => {
    setDraft((prev) => {
      const next: DraftMap = { ...prev };
      databases.forEach((db) => {
        if (scope === "all") {
          next[db.id] = { viewScope: "all", allowedGroupIds: [] };
        } else {
          next[db.id] = {
            viewScope: "groups",
            allowedGroupIds: currentGroupId ? [currentGroupId] : [],
          };
        }
      });
      return next;
    });
  };

  const handleSave = () => {
    const drafts: DatabaseAccessDraft[] = databases.map((db) => {
      const entry = draft[db.id] || { viewScope: "all" as DatabaseViewScope, allowedGroupIds: [] };
      return {
        id: db.id,
        viewScope: entry.viewScope,
        allowedGroupIds: entry.viewScope === "groups" ? entry.allowedGroupIds : [],
      };
    });
    onSave(drafts);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[92vw] max-h-[86vh] p-0 flex flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-sky-200 bg-sky-50/70 flex flex-row items-start justify-between gap-4 shrink-0">
          <div className="space-y-1 text-left">
            <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#0284c7]" />
              课题组查看权限配置
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              控制各课题组可查看的公共数据库范围：可设为全部课题组可见，或仅授权指定课题组查看。
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* 概览与批量操作 */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200 text-[10px] font-mono">
              全部课题组可见 {databases.length - restrictedCount} 个
            </Badge>
            <Badge variant="outline" className="bg-white text-amber-700 border-amber-300 text-[10px] font-mono">
              受课题组限制 {restrictedCount} 个
            </Badge>
            <span className="text-slate-400">当前课题组: {getGroupName(currentGroupId) || "未指定"}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索数据库名称 / 编码"
                className="h-7 pl-2.5 pr-2.5 rounded-lg border border-slate-300 bg-white text-[11px] outline-none focus:border-[#0284c7] w-52"
              />
            </div>
            <button
              type="button"
              onClick={() => setOnlyRestricted((v) => !v)}
              className={cn(
                "h-7 px-2.5 rounded-lg border text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer",
                onlyRestricted
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-white border-slate-300 text-slate-600 hover:border-amber-300"
              )}
            >
              <Lock className="w-3 h-3" />
              仅看受限
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyBulk("all")}
              className="h-7 text-[11px] border-slate-300 text-slate-700 gap-1"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              全部开放
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyBulk("groups")}
              className="h-7 text-[11px] border-slate-300 text-slate-700 gap-1"
            >
              <Lock className="w-3 h-3 text-amber-600" />
              全部仅本组
            </Button>
          </div>
        </div>

        {/* 数据库权限列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
          {visibleDatabases.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
              没有符合条件的公共数据库。
            </div>
          )}

          {visibleDatabases.map((db) => {
            const entry = draft[db.id] || { viewScope: "all" as DatabaseViewScope, allowedGroupIds: [] };
            const isRestricted = entry.viewScope === "groups";
            return (
              <div
                key={db.id}
                className={cn(
                  "p-3.5 rounded-xl border transition-colors",
                  focusDbId === db.id
                    ? "border-[#0284c7] bg-sky-50/50"
                    : "border-slate-200 bg-white"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4 text-[#0284c7]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[18rem]">{db.name}</span>
                        <Badge variant="outline" className="text-[10px] font-normal border-slate-200 bg-slate-50 text-slate-600">
                          {db.categoryLabel}
                        </Badge>
                        {focusDbId === db.id && (
                          <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 text-[10px]">当前选中</Badge>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {db.code} · {db.sourceOrg}
                      </p>
                    </div>
                  </div>

                  {/* 可见范围切换 */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setScope(db.id, "all")}
                      className={cn(
                        "h-7 px-2.5 rounded-lg border text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer",
                        !isRestricted
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold"
                          : "bg-white border-slate-300 text-slate-500 hover:border-emerald-300"
                      )}
                    >
                      <Globe className="w-3 h-3" />
                      全部课题组可见
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope(db.id, "groups")}
                      className={cn(
                        "h-7 px-2.5 rounded-lg border text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer",
                        isRestricted
                          ? "bg-amber-50 border-amber-400 text-amber-800 font-semibold"
                          : "bg-white border-slate-300 text-slate-500 hover:border-amber-300"
                      )}
                    >
                      <Lock className="w-3 h-3" />
                      指定课题组可见
                    </button>
                  </div>
                </div>

                {isRestricted && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <Users className="w-3 h-3 text-slate-400" />
                      授权查看该数据库的课题组（可多选）
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {RESEARCH_GROUPS.map((group) => {
                        const checked = entry.allowedGroupIds.includes(group.id);
                        return (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => toggleGroup(db.id, group.id)}
                            title={group.description}
                            className={cn(
                              "h-7 px-2.5 rounded-full border text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer",
                              checked
                                ? "bg-[#0284c7] border-[#0284c7] text-white"
                                : "bg-white border-slate-300 text-slate-600 hover:border-sky-400"
                            )}
                          >
                            {checked && <Check className="w-3 h-3" />}
                            {group.name}
                          </button>
                        );
                      })}
                      {RESEARCH_GROUPS.length === 0 && (
                        <span className="text-[11px] text-slate-400">暂无可选课题组，请先在「课题组管理」中创建。</span>
                      )}
                    </div>
                    {entry.allowedGroupIds.length === 0 && (
                      <p className="text-[10px] text-amber-600">
                        未选择任何课题组时，该数据库将对所有课题组隐藏。
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">
            保存后立即生效：未授权的课题组在「公共数据库管理」中不会看到该数据库。
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDraft(buildDraft(databases))}
              className="h-8 text-xs border-slate-300 text-slate-700"
            >
              撤销修改
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs border-slate-300 text-slate-700"
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              保存权限配置
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}