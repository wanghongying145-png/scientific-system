import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Plus,
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
  RotateCcw,
  Upload,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Eye,
  Edit,
  ShieldCheck,
  History,
  Lock,
  Sparkles,
  ArrowUpDown,
  Filter,
  Calendar,
  X,
  Users,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PublicDatabaseItem,
  DatabaseCategory,
  UpdateStatus,
  RunStatus,
  UpdateBatchRecord,
} from "./types";
import { initialPublicDatabases } from "./mockData";
import { DatabaseDetailView } from "./DatabaseDetailView";
import { DatabaseEditModal } from "./DatabaseEditModal";
import { ManualUpdateWizard } from "./ManualUpdateWizard";
import { UpdateTaskDetailModal } from "./UpdateTaskDetailModal";
import { VersionRollbackModal } from "./VersionRollbackModal";
import { DatabaseAccessDialog, DatabaseAccessDraft } from "./DatabaseAccessDialog";
import { RESEARCH_GROUPS, isDbVisibleToGroup, describeViewScope, getGroupName } from "./groupAccess";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PublicDatabaseManagementProps {
  currentUserRole?: "admin" | "user";
}

export function PublicDatabaseManagement({
  currentUserRole = "admin",
}: PublicDatabaseManagementProps) {
  // Mock role toggle for demonstration purposes if needed
  const [role, setRole] = useState<"admin" | "user">(currentUserRole);
  const isAdmin = role === "admin";

  // 当前登录用户所属课题组（演示数据，实际由账号-课题组关系决定）
  const currentGroupId = RESEARCH_GROUPS[0]?.id ?? "";

  // 初始化公共数据库台账，并为部分数据库预置课题组查看限制，用于演示权限控制
  const [databases, setDatabases] = useState<PublicDatabaseItem[]>(() =>
    initialPublicDatabases.map((db, index) => {
      if (index % 7 === 2) {
        return { ...db, viewScope: "groups" as const, allowedGroupIds: ["PG-001"] };
      }
      if (index % 7 === 4) {
        return { ...db, viewScope: "groups" as const, allowedGroupIds: ["PG-002"] };
      }
      if (index % 7 === 6) {
        return { ...db, viewScope: "groups" as const, allowedGroupIds: ["PG-001", "PG-003"] };
      }
      return { ...db, viewScope: "all" as const, allowedGroupIds: [] };
    })
  );
  const [selectedDb, setSelectedDb] = useState<PublicDatabaseItem | null>(null);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterVersion, setFilterVersion] = useState("");
  const [filterUpdateStatus, setFilterUpdateStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [dbToEdit, setDbToEdit] = useState<PublicDatabaseItem | null>(null);
  const [showUpdateWizard, setShowUpdateWizard] = useState(false);
  const [dbToUpdate, setDbToUpdate] = useState<PublicDatabaseItem | null>(null);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState<UpdateBatchRecord | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // 课题组查看权限
  const [filterAccessGroup, setFilterAccessGroup] = useState<string>("all");
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [accessFocusDbId, setAccessFocusDbId] = useState<string | null>(null);
  const [accessSavedToast, setAccessSavedToast] = useState<string | null>(null);

  const openAccessDialog = (dbId?: string) => {
    setAccessFocusDbId(dbId ?? null);
    setShowAccessDialog(true);
  };

  const handleSaveAccess = (drafts: DatabaseAccessDraft[]) => {
    const draftMap = new Map(drafts.map((d) => [d.id, d]));
    setDatabases((prev) =>
      prev.map((db) => {
        const entry = draftMap.get(db.id);
        if (!entry) return db;
        return {
          ...db,
          viewScope: entry.viewScope,
          allowedGroupIds: entry.viewScope === "groups" ? entry.allowedGroupIds : [],
        };
      })
    );
    const restricted = drafts.filter((d) => d.viewScope === "groups").length;
    setAccessSavedToast(
      `课题组查看权限已保存：${drafts.length - restricted} 个数据库对全部课题组可见，${restricted} 个数据库仅授权指定课题组查看。`
    );
    setTimeout(() => setAccessSavedToast(null), 3600);
  };

  // Filtered List
  const filteredDatabases = useMemo(() => {
    return databases.filter((db) => {
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase().trim();
        const match =
          db.name.toLowerCase().includes(query) ||
          db.englishName.toLowerCase().includes(query) ||
          db.code.toLowerCase().includes(query) ||
          db.sourceOrg.toLowerCase().includes(query);
        if (!match) return false;
      }
      if (filterCategory !== "all" && db.category !== filterCategory) {
        return false;
      }
      if (filterVersion && !db.currentVersion.toLowerCase().includes(filterVersion.toLowerCase())) {
        return false;
      }
      if (filterUpdateStatus !== "all" && db.updateStatus !== filterUpdateStatus) {
        return false;
      }
      // 课题组查看权限：非管理员仅能看到已授权本课题组的数据库
      if (!isAdmin && !isDbVisibleToGroup(db, currentGroupId)) {
        return false;
      }
      if (filterAccessGroup !== "all" && !isDbVisibleToGroup(db, filterAccessGroup)) {
        return false;
      }
      const itemDate = (db.lastUpdateTime || db.systemUpdateTime || db.createTime || "").slice(0, 10);
      if (startDate && itemDate && itemDate < startDate) {
        return false;
      }
      if (endDate && itemDate && itemDate > endDate) {
        return false;
      }
      return true;
    });
  }, [databases, searchKeyword, filterCategory, filterVersion, filterUpdateStatus, startDate, endDate, filterAccessGroup, isAdmin, currentGroupId]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchKeyword("");
    setFilterCategory("all");
    setFilterVersion("");
    setFilterUpdateStatus("all");
    setFilterAccessGroup("all");
    setStartDate("");
    setEndDate("");
  };

  // Export Table Data to CSV
  const handleExportList = () => {
    const headers = [
      "数据库名称",
      "数据库类别",
      "数据来源",
      "当前版本",
      "更新方式",
      "来源发布日期",
      "最近更新时间",
      "更新状态",
      "运行状态",
      "课题组查看权限",
    ];

    const rows = filteredDatabases.map((db) => [
      `"${db.name}"`,
      `"${db.categoryLabel}"`,
      `"${db.sourceOrg}"`,
      `"${db.currentVersion}"`,
      `"${db.updateMethod}"`,
      `"${db.sourceReleaseDate}"`,
      `"${db.lastUpdateTime}"`,
      `"${db.updateStatus}"`,
      `"${db.runStatus}"`,
      `"${describeViewScope(db).text}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Public_Databases_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Save Add/Edit Database
  const handleSaveDatabase = (dbData: Partial<PublicDatabaseItem>) => {
    if (dbToEdit) {
      setDatabases((prev) =>
        prev.map((d) => (d.id === dbToEdit.id ? ({ ...d, ...dbData } as PublicDatabaseItem) : d))
      );
      if (selectedDb && selectedDb.id === dbToEdit.id) {
        setSelectedDb((prev) => (prev ? ({ ...prev, ...dbData } as PublicDatabaseItem) : null));
      }
    } else {
      const newDb: PublicDatabaseItem = {
        id: dbData.id || `db-${Date.now()}`,
        code: dbData.code || `DB_${Date.now().toString().slice(-4)}`,
        name: dbData.name || "未命名数据库",
        englishName: dbData.englishName || "",
        category: dbData.category || "pathogen",
        categoryLabel: dbData.categoryLabel || "病原微生物数据库",
        sourceOrg: dbData.sourceOrg || "NCBI / Official",
        officialUrl: dbData.officialUrl || "https://example.com",
        sourceDescription: dbData.sourceDescription || "官方离线数据包",
        licenseTerms: dbData.licenseTerms || "Academic License",
        currentVersion: "待初始化 (v0.0)",
        updateMethod: "离线数据包手动更新",
        sourceReleaseDate: "--",
        lastUpdateTime: "--",
        systemUpdateTime: "--",
        totalRecords: 0,
        updateStatus: "待初始化",
        runStatus: "未启用",
        description: dbData.description || "新建登记待初始化的公共生信参考数据库。",
        dataContent: dbData.dataContent || "参考基因组及注释数据",
        dataFormat: dbData.dataFormat || "FASTA, TSV",
        recommendedUpdateCycle: dbData.recommendedUpdateCycle || "每季度 (90天)",
        responsibleAdmin: dbData.responsibleAdmin || "系统管理员 (admin)",
        createTime: new Date().toISOString().substring(0, 10),
        isEnabled: dbData.isEnabled ?? true,
        updateConfig: dbData.updateConfig,
        versions: [],
        updateRecords: [],
      };
      setDatabases((prev) => [newDb, ...prev]);
    }
  };

  // Rollback Handler
  const handleRollbackVersion = (dbId: string, targetVersion: string, reason: string) => {
    setDatabases((prev) =>
      prev.map((db) => {
        if (db.id !== dbId) return db;

        const targetVerObj = db.versions.find((v) => v.versionNumber === targetVersion);
        const oldVer = db.currentVersion;
        const targetRecords = targetVerObj ? targetVerObj.totalRecords : db.totalRecords;

        // update versions list
        const updatedVersions = db.versions.map((v) => {
          if (v.versionNumber === targetVersion) {
            return {
              ...v,
              status: "当前正式版本" as const,
              enableTime: new Date().toISOString().substring(0, 10),
              disableTime: undefined,
            };
          }
          if (v.versionNumber === oldVer) {
            return {
              ...v,
              status: "历史版本" as const,
              disableTime: new Date().toISOString().substring(0, 10),
            };
          }
          return v;
        });

        // add update record for rollback
        const rollbackBatch: UpdateBatchRecord = {
          batchId: `RB-${db.code}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
          dbId: db.id,
          dbName: db.name,
          previousVersion: oldVer,
          targetVersion: targetVersion,
          updateType: "版本回滚",
          sourceOrg: db.sourceOrg,
          sourceReleaseDate: targetVerObj?.sourceReleaseDate || "--",
          packageAcquireDate: targetVerObj?.packageAcquireDate || "--",
          uploadTime: new Date().toISOString().replace("T", " ").substring(0, 19),
          startTime: new Date().toISOString().replace("T", " ").substring(0, 19),
          finishTime: new Date().toISOString().replace("T", " ").substring(0, 19),
          status: "更新成功",
          originalRecords: db.totalRecords,
          newRecords: 0,
          modifiedRecords: 0,
          invalidRecords: 0,
          failedRecords: 0,
          finalTotalRecords: targetRecords,
          operator: "系统管理员 (admin)",
          updateNote: `【系统版本回滚】原因: ${reason}`,
          files: targetVerObj?.fileManifest || [],
          executionStages: [
            { stage: "check", name: "历史快照校验", status: "done", duration: "10s" },
            { stage: "switch", name: "软链原子重定向", status: "done", duration: "5s" },
          ],
          logs: [
            `[${new Date().toLocaleTimeString()}] [WARN] 管理员发起版本紧急回滚: ${oldVer} -> ${targetVersion}`,
            `[${new Date().toLocaleTimeString()}] [INFO] 回滚原因: ${reason}`,
            `[${new Date().toLocaleTimeString()}] [SUCCESS] 生产环境软链接重定向完毕，正式版本已恢复为 ${targetVersion}`,
          ],
        };

        const updatedDb = {
          ...db,
          currentVersion: targetVersion,
          totalRecords: targetRecords,
          lastUpdateTime: new Date().toISOString().substring(0, 10),
          systemUpdateTime: new Date().toISOString().substring(0, 10),
          updateStatus: "正常" as UpdateStatus,
          runStatus: "正常" as RunStatus,
          versions: updatedVersions,
          updateRecords: [rollbackBatch, ...(db.updateRecords || [])],
        };

        if (selectedDb && selectedDb.id === dbId) {
          setSelectedDb(updatedDb);
        }

        return updatedDb;
      })
    );
  };

  // Update Completed Handler
  const handleUpdateCompleted = (batch: UpdateBatchRecord) => {
    setDatabases((prev) =>
      prev.map((db) => {
        if (db.id !== batch.dbId) return db;

        const newVersionObj = {
          versionNumber: batch.targetVersion,
          sourceInfo: batch.sourceOrg,
          sourceReleaseDate: batch.sourceReleaseDate,
          packageAcquireDate: batch.packageAcquireDate,
          systemUpdateTime: new Date().toISOString().substring(0, 10),
          enableTime: new Date().toISOString().substring(0, 10),
          totalRecords: batch.finalTotalRecords,
          status: "当前正式版本" as const,
          generationMethod: batch.updateType === "全量更新" ? "离线全量导入" : "离线增量合并",
          operator: batch.operator,
          versionNote: batch.updateNote,
          sha256Summary: batch.files[0]?.sha256 || "a89bc...",
          fileManifest: batch.files,
        };

        const updatedVersions = [
          newVersionObj,
          ...db.versions.map((v) => ({
            ...v,
            status: "历史版本" as const,
            disableTime: new Date().toISOString().substring(0, 10),
          })),
        ].slice(0, 3); // retain current + 2 historical versions

        const updatedDb = {
          ...db,
          currentVersion: batch.targetVersion,
          totalRecords: batch.finalTotalRecords,
          sourceReleaseDate: batch.sourceReleaseDate,
          lastUpdateTime: new Date().toISOString().substring(0, 10),
          systemUpdateTime: new Date().toISOString().substring(0, 10),
          updateStatus: "正常" as UpdateStatus,
          runStatus: "正常" as RunStatus,
          versions: updatedVersions,
          updateRecords: [batch, ...(db.updateRecords || [])],
        };

        if (selectedDb && selectedDb.id === db.id) {
          setSelectedDb(updatedDb);
        }

        return updatedDb;
      })
    );
  };

  // If a database is selected, render full detail view
  if (selectedDb) {
    const freshDb = databases.find((d) => d.id === selectedDb.id) || selectedDb;
    return (
      <DatabaseDetailView
        database={freshDb}
        isAdmin={isAdmin}
        onBack={() => setSelectedDb(null)}
        onEditDatabase={() => {
          setDbToEdit(freshDb);
          setShowEditModal(true);
        }}
        onRollbackVersion={handleRollbackVersion}
        onUpdateCompleted={handleUpdateCompleted}
      />
    );
  }

  // Anomaly tasks for modal
  const abnormalDatabases = databases.filter(
    (d) => d.updateStatus === "更新失败" || d.runStatus === "异常"
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-left">
      {/* Top Header */}
      <div className="pb-2">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Database className="w-6 h-6 text-[#0284c7]" />
          公共数据库管理
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          生信分析系统公共参考数据库台账、离线数据包安全导入、全量/增量解析校验与多版本追溯
        </p>
      </div>

      {/* 课题组查看权限提示 */}
      {accessSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{accessSavedToast}</span>
        </div>
      )}

      {!isAdmin && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-900 text-xs rounded-xl flex items-start gap-2">
          <Lock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            当前为只读访问：列表仅展示已授权给「<strong>{getGroupName(currentGroupId) || "未指定课题组"}</strong>」的公共数据库，
            共 <strong>{filteredDatabases.length}</strong> 个。未授权的数据库对本课题组不可见。
          </span>
        </div>
      )}

      {/* 1. FILTER SEARCH SECTION */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            综合筛选检索
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              课题组查看
            </span>
            <Select value={filterAccessGroup} onValueChange={setFilterAccessGroup}>
              <SelectTrigger className="h-7 w-[190px] text-[11px] bg-slate-50">
                <SelectValue placeholder="全部课题组" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部课题组</SelectItem>
                {RESEARCH_GROUPS.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs text-slate-500 hover:text-slate-800"
            >
              重置筛选
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Combined Name / Source Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-medium text-slate-500">数据库名称 / 数据来源</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索名称 / 编码 / 来源"
                className="h-8 pl-8 text-xs bg-slate-50"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-medium text-slate-500">数据库类别</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-8 text-xs bg-slate-50">
                <SelectValue placeholder="全部类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类别</SelectItem>
                <SelectItem value="pathogen">病原微生物数据库</SelectItem>
                <SelectItem value="immunogenomics">免疫基因组学综合数据库</SelectItem>
                <SelectItem value="protein_struct">蛋白质结构预测专用数据库</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Version Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-medium text-slate-500">当前版本</label>
            <Input
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              placeholder="如 Release / v"
              className="h-8 text-xs bg-slate-50"
            />
          </div>

          {/* Update Status Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-medium text-slate-500">更新状态</label>
            <Select value={filterUpdateStatus} onValueChange={setFilterUpdateStatus}>
              <SelectTrigger className="h-8 text-xs bg-slate-50">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="正常">正常</SelectItem>
                <SelectItem value="正在更新">正在更新</SelectItem>
                <SelectItem value="更新失败">更新失败</SelectItem>
                <SelectItem value="待初始化">待初始化</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter (Free custom interval) */}
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-500">最近更新时间</label>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-[10px] text-sky-600 hover:text-sky-800 flex items-center gap-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                  清空
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[11px] text-slate-700 outline-none w-full min-w-0 font-mono cursor-pointer"
                title="起始日期"
              />
              <span className="text-slate-400 text-xs shrink-0 font-medium">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[11px] text-slate-700 outline-none w-full min-w-0 font-mono cursor-pointer"
                title="截止日期"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTION BAR & OPERATIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            公共数据库列表 ({filteredDatabases.length})
          </span>
          <span className="text-[11px] text-slate-400">
            内网离线模式 • 固定为「离线数据包手动更新」
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <>
              <Button
                size="sm"
                onClick={() => {
                  setDbToEdit(null);
                  setShowEditModal(true);
                }}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                新增数据库
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportList}
                className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                导出数据库列表
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => openAccessDialog()}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" />
            课题组查看权限
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnomalyModal(true)}
            className="text-xs border-slate-300 text-rose-700 hover:bg-rose-50 gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            查看异常任务 ({abnormalDatabases.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDatabases([...databases]);
            }}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            刷新
          </Button>
        </div>
      </div>

      {/* 4. PUBLIC DATABASE DATA TABLE (EXACT COLUMN SPECIFICATION) */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5">数据库名称</th>
                <th className="p-3.5">数据库类别</th>
                <th className="p-3.5">数据来源</th>
                <th className="p-3.5">当前版本</th>
                <th className="p-3.5">更新方式</th>
                <th className="p-3.5">来源发布日期</th>
                <th className="p-3.5">最近更新时间</th>
                <th className="p-3.5">更新状态</th>
                <th className="p-3.5">运行状态</th>
                <th className="p-3.5">查看权限</th>
                <th className="p-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDatabases.map((db) => (
                <tr key={db.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Database Name */}
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="space-y-0.5">
                      <span className="text-slate-900 hover:text-sky-700 cursor-pointer font-bold" onClick={() => setSelectedDb(db)}>
                        {db.name}
                      </span>
                      <p className="text-[10px] font-mono text-slate-400">{db.code}</p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3.5">
                    <Badge variant="outline" className="text-[10px] font-normal border-slate-200 bg-slate-50 text-slate-700">
                      {db.categoryLabel}
                    </Badge>
                  </td>

                  {/* Source */}
                  <td className="p-3.5 text-slate-700 font-medium">{db.sourceOrg}</td>

                  {/* Current Version */}
                  <td className="p-3.5 font-mono font-bold text-sky-800">{db.currentVersion}</td>

                  {/* Update Method (Fixed) */}
                  <td className="p-3.5">
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {db.updateMethod}
                    </span>
                  </td>

                  {/* Source Release Date */}
                  <td className="p-3.5 font-mono text-slate-500">{db.sourceReleaseDate}</td>

                  {/* Last Update Time */}
                  <td className="p-3.5 font-mono text-slate-500">{db.lastUpdateTime}</td>

                  {/* Update Status */}
                  <td className="p-3.5">
                    <Badge
                      className={cn(
                        "text-[10px] font-medium h-5",
                        db.updateStatus === "正常"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : db.updateStatus === "正在更新"
                          ? "bg-sky-100 text-sky-800 hover:bg-sky-100"
                          : db.updateStatus === "更新失败"
                          ? "bg-rose-100 text-rose-800 hover:bg-rose-100"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      {db.updateStatus}
                    </Badge>
                  </td>

                  {/* Run Status */}
                  <td className="p-3.5">
                    <Badge
                      className={cn(
                        "text-[10px] font-medium h-5",
                        db.runStatus === "正常"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : db.runStatus === "异常"
                          ? "bg-rose-100 text-rose-800 hover:bg-rose-100"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {db.runStatus}
                    </Badge>
                  </td>

                  {/* View Scope (课题组查看权限) */}
                  <td className="p-3.5">
                    {(() => {
                      const scope = describeViewScope(db);
                      return (
                        <div className="space-y-0.5">
                          <Badge
                            className={cn(
                              "text-[10px] font-medium h-5 gap-1",
                              scope.tone === "public"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                : "bg-amber-100 text-amber-900 hover:bg-amber-100"
                            )}
                          >
                            {scope.tone === "public" ? (
                              <Globe className="w-3 h-3" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                            {scope.text}
                          </Badge>
                          <p className="text-[10px] text-slate-400 max-w-[12rem] truncate" title={scope.detail}>
                            {scope.detail}
                          </p>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Operations (Role sensitive) */}
                  <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDb(db)}
                      className="h-7 text-xs text-sky-600 hover:text-sky-800"
                    >
                      查看详情
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAccessDialog(db.id)}
                      className="h-7 text-xs text-amber-700 hover:text-amber-900"
                      title="配置该数据库的课题组查看权限"
                    >
                      权限
                    </Button>

                    {isAdmin ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDbToUpdate(db);
                            setShowUpdateWizard(true);
                          }}
                          className="h-7 text-xs text-emerald-700 hover:text-emerald-900"
                        >
                          手动更新
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDbToEdit(db);
                            setShowEditModal(true);
                          }}
                          className="h-7 text-xs text-slate-600 hover:text-slate-900"
                        >
                          编辑
                        </Button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">只读模式</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add & Edit Database Modal */}
      <DatabaseEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        databaseToEdit={dbToEdit}
        onSave={handleSaveDatabase}
      />

      {/* MODAL 2: Manual Update Wizard Modal */}
      <ManualUpdateWizard
        open={showUpdateWizard}
        onOpenChange={setShowUpdateWizard}
        database={dbToUpdate}
        onUpdateCompleted={handleUpdateCompleted}
      />

      {/* MODAL 3: 课题组查看权限配置 */}
      <DatabaseAccessDialog
        open={showAccessDialog}
        onOpenChange={setShowAccessDialog}
        databases={databases}
        currentGroupId={currentGroupId}
        focusDbId={accessFocusDbId}
        onSave={handleSaveAccess}
      />

      {/* MODAL 4: Anomaly Tasks Modal */}
      <Dialog open={showAnomalyModal} onOpenChange={setShowAnomalyModal}>
        <DialogContent className="!max-w-3xl w-[90vw] max-h-[80vh] p-0 flex flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-rose-200 bg-rose-50/80 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 flex items-center justify-center shadow-xs shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-left space-y-0.5">
                <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
                  异常与更新失败任务监控
                </DialogTitle>
                <DialogDescription className="text-xs text-rose-700">
                  集中展示当前发生校验错误、数据解析中断或处于异常状态的离线更新作业
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4 overflow-y-auto text-left min-h-0">
            {abnormalDatabases.length > 0 ? (
              <div className="space-y-3">
                {abnormalDatabases.map((db) => (
                  <div
                    key={db.id}
                    className="p-4 bg-white border border-rose-200 rounded-2xl space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{db.name}</span>
                        <Badge className="bg-rose-100 text-rose-800 text-[10px] h-4">
                          {db.updateStatus}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        最新失败时间: {db.lastUpdateTime}
                      </span>
                    </div>

                    {/* Show last failed batch info if available */}
                    {db.updateRecords && db.updateRecords[0] && (
                      <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 space-y-1 text-xs text-rose-900">
                        <p className="font-semibold">批次号: {db.updateRecords[0].batchId}</p>
                        <p className="text-[11px] text-rose-700">
                          {db.updateRecords[0].failureReasons?.join("; ") || "数据包校验未通过"}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {db.updateRecords && db.updateRecords[0] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBatchForDetail(db.updateRecords![0]);
                            setShowBatchModal(true);
                          }}
                          className="h-7 text-xs border-slate-300 text-slate-700"
                        >
                          查看错误日志与报告
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setShowAnomalyModal(false);
                            setDbToUpdate(db);
                            setShowUpdateWizard(true);
                          }}
                          className="h-7 text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white"
                        >
                          重新手动更新
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs">暂无任何更新失败或异常的公共数据库作业</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Single Batch Detail Modal */}
      <UpdateTaskDetailModal
        open={showBatchModal}
        onOpenChange={setShowBatchModal}
        batchRecord={selectedBatchForDetail}
      />
    </div>
  );
}
