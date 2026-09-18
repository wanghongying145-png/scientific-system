import React, { useState } from "react";
import { 
  HardDrive, 
  Search, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  History, 
  FileText, 
  FolderArchive, 
  Filter, 
  Send, 
  ArrowUpRight, 
  Check, 
  X, 
  AlertCircle,
  Database,
  Users,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Tab types
export type StorageTabType = "overview" | "files" | "recycle" | "policy" | "logs";

// Mock Data Types
export interface StorageRankItem {
  id: string;
  groupUser: string;
  group: string;
  user: string;
  usedSpace: string;
  usedBytes: number; // For sorting
  suggestionStatus: "immediate" | "weekly" | "normal";
  suggestionLabel: string;
}

export interface FileManagementItem {
  id: string;
  name: string;
  taskCode?: string;
  group: string;
  user: string;
  groupUser: string;
  dataType: "任务及关联中间文件" | "结果文件" | "原始测序数据" | "中间文件" | "失败任务残留";
  usedSpace: string;
  usedBytes: number;
  suggestion: "建议联系用户删除任务" | "超过 180 天未访问" | "暂不建议清理" | "建议立即清理";
  createdAt: string;
  lastAccessed: string;
}

export interface RecycleItem {
  id: string;
  name: string;
  groupUser: string;
  group: string;
  user: string;
  size: string;
  deletedAt: string;
  purgeAt: string;
  status: "等待清理";
}

export interface OperationLogItem {
  id: string;
  type: "admin_restore" | "admin_purge" | "system_cron_purge";
  typeLabel: string;
  operator: string;
  operatorRole: string;
  dataName: string;
  groupUser: string;
  spaceImpact: string;
  impactType: "free" | "restore";
  time: string;
  status: "成功" | "已物理释放" | "已恢复至原位置";
  remark: string;
}

export function StorageManagement() {
  const [activeTab, setActiveTab] = useState<StorageTabType>("overview");

  // --- Search & Filters for Files Tab ---
  const [fileSearch, setFileSearch] = useState("");
  const [fileGroupFilter, setFileGroupFilter] = useState("all");
  const [fileUserFilter, setFileUserFilter] = useState("all");
  const [fileStatusFilter, setFileStatusFilter] = useState("all");

  // --- State for Recycle Bin ---
  const [recycleList, setRecycleList] = useState<RecycleItem[]>([
    {
      id: "REC-001",
      name: "单细胞转录组分析",
      groupUser: "分子免疫研究项目组 / 李四",
      group: "分子免疫研究项目组",
      user: "李四",
      size: "248.5 GB",
      deletedAt: "2026-08-11 09:30",
      purgeAt: "2026-08-18 02:00",
      status: "等待清理",
    },
    {
      id: "REC-002",
      name: "old_report.pdf",
      groupUser: "AI 药物发现项目组 / 王五",
      group: "AI 药物发现项目组",
      user: "王五",
      size: "45.2 MB",
      deletedAt: "2026-08-09 14:20",
      purgeAt: "2026-08-16 02:00",
      status: "等待清理",
    },
    {
      id: "REC-003",
      name: "pathogen_metagenome_blast_tmp.tar",
      groupUser: "临床病原研究项目组 / 张三",
      group: "临床病原研究项目组",
      user: "张三",
      size: "520.4 GB",
      deletedAt: "2026-08-12 11:15",
      purgeAt: "2026-08-19 02:00",
      status: "等待清理",
    },
    {
      id: "REC-004",
      name: "scaffold_hopping_top100_cache.parquet",
      groupUser: "AI 药物发现项目组 / 赵六",
      group: "AI 药物发现项目组",
      user: "赵六",
      size: "380.0 MB",
      deletedAt: "2026-08-08 17:40",
      purgeAt: "2026-08-15 02:00",
      status: "等待清理",
    },
  ]);

  // Dialog state for recycle bin actions
  const [selectedRecycleItem, setSelectedRecycleItem] = useState<RecycleItem | null>(null);
  const [actionType, setActionType] = useState<"restore" | "purge" | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: "success" | "info" } | null>(null);

  // --- Policy State ---
  const [policies, setPolicies] = useState({
    recycleRetentionDays: "7",
    recycleRetentionEnabled: true,
    scheduledPurgeTime: "02:00",
    scheduledPurgeEnabled: true,
    warningThresholdPercent: "80",
    warningThresholdEnabled: true,
    unvisitedResultDays: "180",
    unvisitedResultEnabled: true,
  });
  const [policySavedToast, setPolicySavedToast] = useState(false);

  // --- Operation Logs State ---
  const [logSearch, setLogSearch] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [operationLogs, setOperationLogs] = useState<OperationLogItem[]>([
    {
      id: "LOG-20260817-001",
      type: "system_cron_purge",
      typeLabel: "系统自动物理清理",
      operator: "系统定时任务 (Cron-Purge-0200)",
      operatorRole: "System Service",
      dataName: "rnaseq_alignment_bam_cache.tar",
      groupUser: "分子免疫研究项目组 / 李四",
      spaceImpact: "释放 1.4 TB",
      impactType: "free",
      time: "2026-08-16 02:00:05",
      status: "已物理释放",
      remark: "保留期已满 7 天，系统自动物理清理",
    },
    {
      id: "LOG-20260816-002",
      type: "admin_purge",
      typeLabel: "管理员彻底删除",
      operator: "系统管理员 (admin)",
      operatorRole: "Administrator",
      dataName: "failed_docking_tmp_scratch.log",
      groupUser: "AI 药物发现项目组 / 孙七",
      spaceImpact: "释放 45.8 GB",
      impactType: "free",
      time: "2026-08-16 15:32:10",
      status: "已物理释放",
      remark: "管理员在回收站执行立即彻底删除",
    },
    {
      id: "LOG-20260815-003",
      type: "admin_restore",
      typeLabel: "管理员恢复",
      operator: "系统管理员 (admin)",
      operatorRole: "Administrator",
      dataName: "important_cohort_result.csv",
      groupUser: "临床病原研究项目组 / 张三",
      spaceImpact: "恢复 120.4 MB",
      impactType: "restore",
      time: "2026-08-15 11:20:44",
      status: "已恢复至原位置",
      remark: "管理员在回收站执行恢复操作，数据已归还原用户",
    },
    {
      id: "LOG-20260815-004",
      type: "system_cron_purge",
      typeLabel: "系统自动物理清理",
      operator: "系统定时任务 (Cron-Purge-0200)",
      operatorRole: "System Service",
      dataName: "metagenome_unmapped_reads.fastq",
      groupUser: "临床病原研究项目组 / 赵六",
      spaceImpact: "释放 820.0 GB",
      impactType: "free",
      time: "2026-08-15 02:00:12",
      status: "已物理释放",
      remark: "保留期已满 7 天，系统自动物理清理",
    },
    {
      id: "LOG-20260814-005",
      type: "admin_restore",
      typeLabel: "管理员恢复",
      operator: "系统管理员 (admin)",
      operatorRole: "Administrator",
      dataName: "alphafold_complex_pdb_v2.zip",
      groupUser: "AI 药物发现项目组 / 王五",
      spaceImpact: "恢复 1.8 GB",
      impactType: "restore",
      time: "2026-08-14 16:45:20",
      status: "已恢复至原位置",
      remark: "管理员根据用户工单申请恢复被误删的模型结构数据",
    }
  ]);

  // Ranking data for overview
  const RANKING_DATA: StorageRankItem[] = [
    {
      id: "rk-1",
      groupUser: "临床病原研究项目组 / 张三",
      group: "临床病原研究项目组",
      user: "张三",
      usedSpace: "8.6 TB",
      usedBytes: 8.6 * 1024,
      suggestionStatus: "immediate",
      suggestionLabel: "建议立即清理",
    },
    {
      id: "rk-2",
      groupUser: "分子免疫研究项目组 / 李四",
      group: "分子免疫研究项目组",
      user: "李四",
      usedSpace: "6.2 TB",
      usedBytes: 6.2 * 1024,
      suggestionStatus: "weekly",
      suggestionLabel: "建议本周清理",
    },
    {
      id: "rk-3",
      groupUser: "AI 药物发现项目组 / 王五",
      group: "AI 药物发现项目组",
      user: "王五",
      usedSpace: "4.9 TB",
      usedBytes: 4.9 * 1024,
      suggestionStatus: "normal",
      suggestionLabel: "存储使用正常",
    },
    {
      id: "rk-4",
      groupUser: "临床病原研究项目组 / 赵六",
      group: "临床病原研究项目组",
      user: "赵六",
      usedSpace: "3.5 TB",
      usedBytes: 3.5 * 1024,
      suggestionStatus: "normal",
      suggestionLabel: "存储使用正常",
    },
    {
      id: "rk-5",
      groupUser: "分子免疫研究项目组 / 孙七",
      group: "分子免疫研究项目组",
      user: "孙七",
      usedSpace: "2.8 TB",
      usedBytes: 2.8 * 1024,
      suggestionStatus: "normal",
      suggestionLabel: "存储使用正常",
    },
  ];

  // Files data
  const FILE_DATA: FileManagementItem[] = [
    {
      id: "f-1",
      name: "宏基因组病原分析",
      taskCode: "TASK-20260718-0316",
      group: "临床病原研究项目组",
      user: "张三",
      groupUser: "临床病原研究项目组 / 张三",
      dataType: "任务及关联中间文件",
      usedSpace: "486.4 GB",
      usedBytes: 486.4,
      suggestion: "建议联系用户删除任务",
      createdAt: "2026-07-18 10:15",
      lastAccessed: "2026-07-20 18:20",
    },
    {
      id: "f-2",
      name: "docking_rank_full_results.csv",
      group: "AI 药物发现项目组",
      user: "王五",
      groupUser: "AI 药物发现项目组 / 王五",
      dataType: "结果文件",
      usedSpace: "95.4 GB",
      usedBytes: 95.4,
      suggestion: "超过 180 天未访问",
      createdAt: "2026-01-15 14:00",
      lastAccessed: "2026-01-18 09:30",
    },
    {
      id: "f-3",
      name: "analysis_report.pdf",
      group: "临床病原研究项目组",
      user: "赵六",
      groupUser: "临床病原研究项目组 / 赵六",
      dataType: "结果文件",
      usedSpace: "28.6 MB",
      usedBytes: 0.028,
      suggestion: "暂不建议清理",
      createdAt: "2026-08-10 16:30",
      lastAccessed: "2026-08-16 11:20",
    },
    {
      id: "f-4",
      name: "scRNA_seq_matrix_filtered.h5ad",
      taskCode: "TASK-20260605-0102",
      group: "分子免疫研究项目组",
      user: "李四",
      groupUser: "分子免疫研究项目组 / 李四",
      dataType: "中间文件",
      usedSpace: "184.2 GB",
      usedBytes: 184.2,
      suggestion: "建议联系用户删除任务",
      createdAt: "2026-06-05 11:00",
      lastAccessed: "2026-06-12 15:40",
    },
    {
      id: "f-5",
      name: "alphafold3_prediction_raw.tar.gz",
      group: "AI 药物发现项目组",
      user: "王五",
      groupUser: "AI 药物发现项目组 / 王五",
      dataType: "结果文件",
      usedSpace: "312.8 GB",
      usedBytes: 312.8,
      suggestion: "超过 180 天未访问",
      createdAt: "2026-02-01 09:00",
      lastAccessed: "2026-02-05 17:00",
    },
    {
      id: "f-6",
      name: "sample_fastq_gz_batch_09.tar",
      group: "临床病原研究项目组",
      user: "张三",
      groupUser: "临床病原研究项目组 / 张三",
      dataType: "原始测序数据",
      usedSpace: "620.5 GB",
      usedBytes: 620.5,
      suggestion: "暂不建议清理",
      createdAt: "2026-08-12 08:30",
      lastAccessed: "2026-08-16 20:10",
    },
    {
      id: "f-7",
      name: "failed_docking_tmp_scratch.log",
      taskCode: "TASK-20260801-0988",
      group: "AI 药物发现项目组",
      user: "孙七",
      groupUser: "AI 药物发现项目组 / 孙七",
      dataType: "失败任务残留",
      usedSpace: "45.8 GB",
      usedBytes: 45.8,
      suggestion: "建议立即清理",
      createdAt: "2026-08-01 19:22",
      lastAccessed: "2026-08-01 19:35",
    },
  ];

  // Filtered files
  const filteredFiles = FILE_DATA.filter((item) => {
    if (fileSearch.trim()) {
      const q = fileSearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.taskCode?.toLowerCase().includes(q);
      const matchUser = item.groupUser.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchUser) return false;
    }
    if (fileGroupFilter !== "all" && item.group !== fileGroupFilter) return false;
    if (fileUserFilter !== "all" && item.user !== fileUserFilter) return false;
    if (fileStatusFilter !== "all" && item.suggestion !== fileStatusFilter) return false;
    return true;
  });

  // Filtered logs
  const filteredLogs = operationLogs.filter((log) => {
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const matchObj = log.dataName.toLowerCase().includes(q);
      const matchOp = log.operator.toLowerCase().includes(q);
      const matchGroup = log.groupUser.toLowerCase().includes(q);
      const matchId = log.id.toLowerCase().includes(q);
      if (!matchObj && !matchOp && !matchGroup && !matchId) return false;
    }
    if (logTypeFilter !== "all" && log.type !== logTypeFilter) return false;
    return true;
  });

  // Confirm execute Recycle Action
  const handleConfirmRecycleAction = () => {
    if (!selectedRecycleItem || !actionType) return;

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newLogId = `LOG-${nowStr.replace(/[- :]/g, "").substring(0, 8)}-${String(operationLogs.length + 1).padStart(3, "0")}`;

    if (actionType === "restore") {
      // 1. Remove from recycle bin
      setRecycleList(prev => prev.filter(item => item.id !== selectedRecycleItem.id));
      // 2. Add to logs
      const newLog: OperationLogItem = {
        id: newLogId,
        type: "admin_restore",
        typeLabel: "管理员恢复",
        operator: "系统管理员 (admin)",
        operatorRole: "Administrator",
        dataName: selectedRecycleItem.name,
        groupUser: selectedRecycleItem.groupUser,
        spaceImpact: `恢复 ${selectedRecycleItem.size}`,
        impactType: "restore",
        time: nowStr,
        status: "已恢复至原位置",
        remark: "管理员在回收站执行恢复操作，数据已归还原用户",
      };
      setOperationLogs(prev => [newLog, ...prev]);
      showToast("数据已成功恢复", `“${selectedRecycleItem.name}” 已恢复归位至所属用户原存储目录。`, "success");
    } else if (actionType === "purge") {
      // 1. Remove from recycle bin
      setRecycleList(prev => prev.filter(item => item.id !== selectedRecycleItem.id));
      // 2. Add to logs
      const newLog: OperationLogItem = {
        id: newLogId,
        type: "admin_purge",
        typeLabel: "管理员彻底删除",
        operator: "系统管理员 (admin)",
        operatorRole: "Administrator",
        dataName: selectedRecycleItem.name,
        groupUser: selectedRecycleItem.groupUser,
        spaceImpact: `释放 ${selectedRecycleItem.size}`,
        impactType: "free",
        time: nowStr,
        status: "已物理释放",
        remark: "管理员在回收站执行立即彻底删除，已释放物理磁盘空间",
      };
      setOperationLogs(prev => [newLog, ...prev]);
      showToast("彻底删除成功", `“${selectedRecycleItem.name}” 已完成物理擦除并释放存储空间。`, "info");
    }

    setIsActionDialogOpen(false);
    setSelectedRecycleItem(null);
    setActionType(null);
  };

  const showToast = (title: string, desc: string, type: "success" | "info" = "success") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSavePolicies = () => {
    setPolicySavedToast(true);
    setTimeout(() => setPolicySavedToast(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFB] min-h-screen text-[#0F172A] pb-12">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-4 flex items-start gap-3 max-w-md animate-in slide-in-from-bottom-5">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            toastMessage.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-sky-50 text-sky-600 border border-sky-200"
          )}>
            {toastMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-slate-800">{toastMessage.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{toastMessage.desc}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {activeTab === "recycle" ? "管理员回收站" : activeTab === "policy" ? "清理策略" : "数据存储管理"}
          </h1>
          <p className="text-xs text-slate-500">
            {activeTab === "recycle" 
              ? "管理全系统待清理数据，可恢复用户标记删除的数据或立即彻底删除。"
              : activeTab === "policy"
              ? "管理员查看系统已启用的存储清理和提醒规则。"
              : activeTab === "logs"
              ? "展示管理员在回收站进行删除和恢复操作的日志，以及系统自动清理回收站内容的操作记录。"
              : activeTab === "files"
              ? "监控全平台各项目组与用户的数据存储占用，查看清理建议。"
              : "监控存储使用情况，识别可清理数据并督促用户及时释放空间。"}
          </p>
        </div>

        {/* Custom Clean Navigation Tab Bar */}
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-8 text-xs font-semibold">
            {[
              { id: "overview", label: "存储总览" },
              { id: "files", label: "文件管理" },
              { id: "recycle", label: "回收站" },
              { id: "policy", label: "清理策略" },
              { id: "logs", label: "操作记录" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as StorageTabType)}
                  className={cn(
                    "pb-3.5 pt-1 relative transition-colors cursor-pointer flex items-center gap-1.5",
                    isActive 
                      ? "text-[#0284c7] font-bold" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.id === "recycle" && recycleList.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                      {recycleList.length}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0284c7] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: 存储总览 (Overview) - Image 1 */}
        {/* ============================================================ */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: 存储总容量 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-700 block">存储总容量</span>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  42.8 <span className="text-2xl font-bold">TB</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  统计时间：今日 10:30
                </div>
              </div>

              {/* Card 2: 已使用 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-700 block">已使用</span>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  33.6 <span className="text-2xl font-bold">TB</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span>使用率 <span className="font-semibold text-amber-700 font-mono">78.6%</span>，接近阈值 80%</span>
                </div>
              </div>

              {/* Card 3: 回收站 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-700 block">回收站</span>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  1.2 <span className="text-2xl font-bold">TB</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  下次清理：明日 02:00
                </div>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-5 py-3.5 flex items-center gap-3 text-xs text-[#92400E]">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>
                容量即将达到预警阈值。建议优先督促用户删除已完成任务及超过 180 天未访问的结果文件。
              </span>
            </div>

            {/* Middle 2 Cards: 存储构成 & 系统清理建议 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Card: 存储构成 (Image 1) */}
              <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <h3 className="text-xs font-bold text-slate-800">存储构成</h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 pt-2">
                  {/* Circular Donut Representation */}
                  <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Base Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                      />
                      {/* Available Space: 9.2TB (21.5%) -> gray/slate */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                        strokeDasharray="238.76"
                        strokeDashoffset="0"
                      />
                      {/* Results: 6.5TB (15.2%) -> amber #f59e0b */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#fb923c"
                        strokeWidth="12"
                        strokeDasharray="238.76"
                        strokeDashoffset="51.3"
                      />
                      {/* Intermediate: 4.7TB (11.0%) -> sky #38bdf8 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#38bdf8"
                        strokeWidth="12"
                        strokeDasharray="238.76"
                        strokeDashoffset="87.6"
                      />
                      {/* Raw Data: 22.4TB (52.3%) -> cyan/blue #0284c7 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#0284c7"
                        strokeWidth="12"
                        strokeDasharray="238.76"
                        strokeDashoffset="113.9"
                      />
                    </svg>

                    {/* Donut Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-bold text-slate-800 font-mono leading-none">78.6%</span>
                      <span className="text-[10px] text-slate-400 mt-1">已使用</span>
                    </div>
                  </div>

                  {/* 4 Storage breakdown metrics */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 flex-1 w-full">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7]" />
                        <span className="text-[11px] text-slate-500 font-medium">原始数据</span>
                      </div>
                      <p className="text-base font-bold text-slate-800 font-mono pl-4.5">22.4 TB</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" />
                        <span className="text-[11px] text-slate-500 font-medium">中间文件</span>
                      </div>
                      <p className="text-base font-bold text-slate-800 font-mono pl-4.5">4.7 TB</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#fb923c]" />
                        <span className="text-[11px] text-slate-500 font-medium">结果文件</span>
                      </div>
                      <p className="text-base font-bold text-slate-800 font-mono pl-4.5">6.5 TB</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#e2e8f0]" />
                        <span className="text-[11px] text-slate-500 font-medium">可用空间</span>
                      </div>
                      <p className="text-base font-bold text-slate-800 font-mono pl-4.5">9.2 TB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card: 系统清理建议 (Image 1) */}
              <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <h3 className="text-xs font-bold text-slate-800">系统清理建议</h3>

                <div className="space-y-4 divide-y divide-slate-100 flex-1">
                  {/* Item 1 */}
                  <div className="pt-1 first:pt-0 flex items-center justify-between">
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-semibold text-slate-800">已完成任务及中间文件</p>
                      <p className="text-[11px] text-slate-400">12 个任务，删除任务后统一清理</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-mono">3.8 TB</span>
                  </div>

                  {/* Item 2 */}
                  <div className="pt-3 flex items-center justify-between">
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-semibold text-slate-800">超过 180 天未访问的结果</p>
                      <p className="text-[11px] text-slate-400">36 个结果文件</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-mono">1.9 TB</span>
                  </div>

                  {/* Item 3 */}
                  <div className="pt-3 flex items-center justify-between">
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-semibold text-slate-800">失败任务残留数据</p>
                      <p className="text-[11px] text-slate-400">8 个任务</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-mono">0.7 TB</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Card: 项目组/用户存储排行 (Image 1) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">项目组/用户存储排行</h3>
                <button 
                  onClick={() => setActiveTab("files")}
                  className="text-xs font-semibold text-[#0284c7] hover:underline cursor-pointer flex items-center gap-1"
                >
                  查看全部
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFB] text-[11px] font-bold text-slate-600 border-b border-slate-100">
                      <th className="px-6 py-3.5 font-bold">项目组/用户</th>
                      <th className="px-6 py-3.5 font-bold">占用空间</th>
                      <th className="px-6 py-3.5 font-bold">建议状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {RANKING_DATA.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{row.groupUser}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono">{row.usedSpace}</td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold",
                              row.suggestionStatus === "immediate" && "bg-[#FEE2E2] text-[#DC2626]",
                              row.suggestionStatus === "weekly" && "bg-[#FEF3C7] text-[#D97706]",
                              row.suggestionStatus === "normal" && "bg-[#D1FAE5] text-[#059669]"
                            )}
                          >
                            {row.suggestionLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 文件管理 (File Management) - Image 2 */}
        {/* ============================================================ */}
        {activeTab === "files" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Read-only Permission Banner (Image 2) */}
            <div className="bg-[#E0F2FE]/70 border border-[#BAE6FD] rounded-xl px-5 py-3 text-xs text-[#0369A1] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0284c7] shrink-0" />
              <span>只读权限: 管理员不能删除其他用户的任务或结果文件。</span>
            </div>

            {/* Filter Bar (Image 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type="text"
                  placeholder="搜索任务或文件"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white border-slate-200"
                />
              </div>

              {/* Project Group Filter */}
              <div className="relative">
                <select
                  value={fileGroupFilter}
                  onChange={(e) => setFileGroupFilter(e.target.value)}
                  aria-label="项目组筛选"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none cursor-pointer"
                >
                  <option value="all">全部项目组</option>
                  <option value="临床病原研究项目组">临床病原研究项目组</option>
                  <option value="分子免疫研究项目组">分子免疫研究项目组</option>
                  <option value="AI 药物发现项目组">AI 药物发现项目组</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* User Filter */}
              <div className="relative">
                <select
                  value={fileUserFilter}
                  onChange={(e) => setFileUserFilter(e.target.value)}
                  aria-label="用户筛选"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none cursor-pointer"
                >
                  <option value="all">全部用户</option>
                  <option value="张三">张三</option>
                  <option value="李四">李四</option>
                  <option value="王五">王五</option>
                  <option value="赵六">赵六</option>
                  <option value="孙七">孙七</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* Suggestion Status Filter */}
              <div className="relative">
                <select
                  value={fileStatusFilter}
                  onChange={(e) => setFileStatusFilter(e.target.value)}
                  aria-label="建议状态筛选"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none cursor-pointer"
                >
                  <option value="all">全部建议状态</option>
                  <option value="建议联系用户删除任务">建议联系用户删除任务</option>
                  <option value="超过 180 天未访问">超过 180 天未访问</option>
                  <option value="建议立即清理">建议立即清理</option>
                  <option value="暂不建议清理">暂不建议清理</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Table (Image 2) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFB] text-[11px] font-bold text-slate-600 border-b border-slate-100">
                      <th className="px-6 py-4 font-bold">数据对象</th>
                      <th className="px-6 py-4 font-bold">项目组/用户</th>
                      <th className="px-6 py-4 font-bold">数据类型</th>
                      <th className="px-6 py-4 font-bold">占用空间</th>
                      <th className="px-6 py-4 font-bold">清理建议</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400 text-xs">
                          没有找到符合条件的文件或任务数据
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{row.name}</p>
                              {row.taskCode && (
                                <p className="text-[11px] font-mono text-slate-400">{row.taskCode}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{row.groupUser}</td>
                          <td className="px-6 py-4 text-slate-600">{row.dataType}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 font-mono">{row.usedSpace}</td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold",
                                row.suggestion === "建议联系用户删除任务" && "bg-[#FEE2E2] text-[#DC2626]",
                                row.suggestion === "超过 180 天未访问" && "bg-[#FEF3C7] text-[#D97706]",
                                row.suggestion === "建议立即清理" && "bg-[#FEE2E2] text-[#B91C1C]",
                                row.suggestion === "暂不建议清理" && "bg-[#D1FAE5] text-[#059669]"
                              )}
                            >
                              {row.suggestion}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: 管理员回收站 (Recycle Bin) - Image 3 */}
        {/* ============================================================ */}
        {activeTab === "recycle" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Permission Notice (Image 3) */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-5 py-3 text-xs text-[#92400E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>
                权限提示: 管理员执行“恢复”后，数据回到所属用户原位置；执行“彻底删除”后将立即物理清理且无法恢复。
              </span>
            </div>

            {/* Recycle Bin Table (Image 3) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFB] text-[11px] font-bold text-slate-600 border-b border-slate-100">
                      <th className="px-6 py-4 font-bold">数据对象</th>
                      <th className="px-6 py-4 font-bold">项目组/用户</th>
                      <th className="px-6 py-4 font-bold">删除时间</th>
                      <th className="px-6 py-4 font-bold">物理清理时间</th>
                      <th className="px-6 py-4 font-bold">状态</th>
                      <th className="px-6 py-4 font-bold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recycleList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-14 text-slate-400 text-xs">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <FolderArchive className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                            <p>回收站暂无待清理数据</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recycleList.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{row.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">预估空间: {row.size}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{row.groupUser}</td>
                          <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">{row.deletedAt}</td>
                          <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">{row.purgeAt}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#D97706]">
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRecycleItem(row);
                                  setActionType("restore");
                                  setIsActionDialogOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] hover:bg-sky-50 transition-colors border border-sky-200 cursor-pointer"
                              >
                                恢复
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRecycleItem(row);
                                  setActionType("purge");
                                  setIsActionDialogOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] hover:bg-rose-50 transition-colors border border-rose-200 cursor-pointer"
                              >
                                彻底删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: 清理策略 (Policies) - Image 4 */}
        {/* ============================================================ */}
        {activeTab === "policy" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
              
              {/* Policy Item 1: 回收站保留期 */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">回收站保留期</h4>
                  <p className="text-xs text-slate-400">用户删除的数据在保留期内可恢复</p>
                </div>

                <div className="flex items-center gap-8 justify-between sm:justify-end">
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {policies.recycleRetentionDays} 天
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setPolicies(prev => ({ ...prev, recycleRetentionEnabled: !prev.recycleRetentionEnabled }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      policies.recycleRetentionEnabled ? "bg-[#0284c7]" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                        policies.recycleRetentionEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Policy Item 2: 定时物理清理 */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">定时物理清理</h4>
                  <p className="text-xs text-slate-400">清理已超过保留期的数据</p>
                </div>

                <div className="flex items-center gap-8 justify-between sm:justify-end">
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    每日 {policies.scheduledPurgeTime}
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setPolicies(prev => ({ ...prev, scheduledPurgeEnabled: !prev.scheduledPurgeEnabled }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      policies.scheduledPurgeEnabled ? "bg-[#0284c7]" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                        policies.scheduledPurgeEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Policy Item 3: 容量预警阈值 */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">容量预警阈值</h4>
                  <p className="text-xs text-slate-400">达到阈值后在管理员总览展示预警</p>
                </div>

                <div className="flex items-center gap-8 justify-between sm:justify-end">
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {policies.warningThresholdPercent}%
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setPolicies(prev => ({ ...prev, warningThresholdEnabled: !prev.warningThresholdEnabled }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      policies.warningThresholdEnabled ? "bg-[#0284c7]" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                        policies.warningThresholdEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Policy Item 4: 长期未访问结果建议 */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">长期未访问结果建议</h4>
                  <p className="text-xs text-slate-400">仅形成管理员清理建议，不发送站内消息</p>
                </div>

                <div className="flex items-center gap-8 justify-between sm:justify-end">
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {policies.unvisitedResultDays} 天
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setPolicies(prev => ({ ...prev, unvisitedResultEnabled: !prev.unvisitedResultEnabled }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      policies.unvisitedResultEnabled ? "bg-[#0284c7]" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                        policies.unvisitedResultEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

            </div>

            {/* Policy Control Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                所有配置更改将即时应用于系统后台定时清理与容量健康巡检服务。
              </span>
              <Button 
                onClick={handleSavePolicies}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold px-5"
              >
                保存当前策略
              </Button>
            </div>

            {policySavedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>清理策略配置已成功保存并同步到定时任务调度中心！</span>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: 操作记录 (Operation Logs) */}
        {/* ============================================================ */}
        {activeTab === "logs" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Header info banner */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">回收站与自动物理清理审计流水</h4>
                  <p className="text-[11px] text-slate-400">
                    完整记录管理员手动恢复/删除行为以及系统 Cron 定时自动删除日志，支持不可篡改的安全审计。
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-500 font-medium">
                共 <span className="font-bold text-slate-800">{filteredLogs.length}</span> 条日志记录
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type="text"
                  placeholder="搜索日志编号、数据对象、操作人或所属用户..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white border-slate-200"
                />
              </div>

              <div className="relative">
                <select
                  value={logTypeFilter}
                  onChange={(e) => setLogTypeFilter(e.target.value)}
                  aria-label="操作类型筛选"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none cursor-pointer"
                >
                  <option value="all">全部操作类型 (管理员与系统自动)</option>
                  <option value="admin_restore">管理员恢复</option>
                  <option value="admin_purge">管理员彻底删除</option>
                  <option value="system_cron_purge">系统自动物理清理</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFB] text-[11px] font-bold text-slate-600 border-b border-slate-100">
                      <th className="px-5 py-4 font-bold">日志 ID</th>
                      <th className="px-5 py-4 font-bold">操作类型</th>
                      <th className="px-5 py-4 font-bold">操作主体/来源</th>
                      <th className="px-5 py-4 font-bold">数据对象</th>
                      <th className="px-5 py-4 font-bold">原所属项目组/用户</th>
                      <th className="px-5 py-4 font-bold">释放/恢复空间</th>
                      <th className="px-5 py-4 font-bold">操作时间</th>
                      <th className="px-5 py-4 font-bold">执行状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                          暂无匹配的操作日志记录
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 font-mono text-[11px] text-slate-500 font-semibold">{log.id}</td>
                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.8 rounded-md text-[10px] font-bold",
                                log.type === "admin_restore" && "bg-sky-50 text-sky-700 border border-sky-200",
                                log.type === "admin_purge" && "bg-rose-50 text-rose-700 border border-rose-200",
                                log.type === "system_cron_purge" && "bg-slate-100 text-slate-700 border border-slate-300"
                              )}
                            >
                              {log.typeLabel}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">{log.operator}</div>
                            <div className="text-[10px] text-slate-400">{log.operatorRole}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 max-w-[200px] truncate" title={log.dataName}>
                              {log.dataName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{log.remark}</div>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-600">{log.groupUser}</td>
                          <td className="px-5 py-4">
                            <span className={cn(
                              "font-mono font-bold text-xs",
                              log.impactType === "free" ? "text-rose-600" : "text-sky-600"
                            )}>
                              {log.spaceImpact}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.time}</td>
                          <td className="px-5 py-4">
                            <span className={cn(
                              "inline-flex items-center gap-1 text-[11px] font-semibold",
                              log.status === "已恢复至原位置" && "text-sky-700",
                              log.status === "已物理释放" && "text-slate-700",
                              log.status === "成功" && "text-emerald-700"
                            )}>
                              <Check className="w-3 h-3 stroke-[3]" />
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Confirmation Modal for Recycle Actions */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              {actionType === "restore" ? (
                <>
                  <RotateCcw className="w-5 h-5 text-[#0284c7]" />
                  确认恢复数据
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                  确认彻底物理删除
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-2 text-left space-y-2">
              {actionType === "restore" ? (
                <>
                  <p>
                    确定要将 <strong className="text-slate-800">“{selectedRecycleItem?.name}”</strong> 恢复至原项目组用户位置吗？
                  </p>
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-sky-900">
                    所属用户：{selectedRecycleItem?.groupUser}<br />
                    预估数据量：{selectedRecycleItem?.size}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-rose-700 font-medium">
                    注意：此操作将立即从底层物理存储中永久擦除此数据，无法撤销或恢复！
                  </p>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-900">
                    数据对象：{selectedRecycleItem?.name}<br />
                    所属用户：{selectedRecycleItem?.groupUser}<br />
                    释放空间：{selectedRecycleItem?.size}
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              className="text-xs font-semibold"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmRecycleAction}
              className={cn(
                "text-xs font-semibold text-white",
                actionType === "restore" 
                  ? "bg-[#0284c7] hover:bg-[#0369a1]" 
                  : "bg-[#DC2626] hover:bg-[#B91C1C]"
              )}
            >
              {actionType === "restore" ? "确认恢复" : "立即彻底删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
