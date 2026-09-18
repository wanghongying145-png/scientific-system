import React, { useState, useMemo } from "react";
import {
  Folder,
  FolderOpen,
  FileArchive,
  FileText,
  FileCode,
  FileSpreadsheet,
  HardDrive,
  Copy,
  Check,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  CheckCircle2,
  FolderArchive,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Filter,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PublicDatabaseItem, DatabaseVersion, DatabaseFileManifest } from "./types";

export interface FileTreeNode {
  id: string;
  name: string;
  type: "directory" | "archive" | "file";
  format: string;
  size: string;
  path: string;
  sha256: string;
  recordCount?: number;
  isArchive?: boolean;
  extractedStatus?: "not_extracted" | "extracting" | "extracted" | "none";
  extractProgress?: number;
  children?: FileTreeNode[];
  itemCount?: number;
  parentArchiveId?: string;
}

interface HierarchicalFileManifestTreeProps {
  database: PublicDatabaseItem;
  currentVersion: DatabaseVersion;
}

export function HierarchicalFileManifestTree({
  database,
  currentVersion,
}: HierarchicalFileManifestTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "archive" | "extracted" | "files">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Initialize standard hierarchical directory tree based on database and version
  const initialTreeData = useMemo(() => {
    const dbCode = database.code.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const verSlug = currentVersion.versionNumber.toLowerCase().replace(/\s+/g, "_");
    const basePath = `/data/databases/${dbCode}/${verSlug}`;

    // Generate realistic multi-level directory tree structure
    const rootNodes: FileTreeNode[] = [
      {
        id: "dir-packages",
        name: "offline_packages",
        type: "directory",
        format: "DIRECTORY",
        size: "42.8 GB",
        path: `${basePath}/offline_packages`,
        sha256: "--",
        itemCount: 2,
        children: [
          {
            id: "arch-core-pkg",
            name: `${dbCode}_${verSlug}_full_release.tar.gz`,
            type: "archive",
            format: "TAR.GZ",
            size: "38.2 GB",
            path: `${basePath}/offline_packages/${dbCode}_${verSlug}_full_release.tar.gz`,
            sha256: currentVersion.sha256Summary || "b890f12c8192a74e50d6f34e819ac4092b3a817462810a9cb9174029471ab381",
            isArchive: true,
            extractedStatus: "extracted",
            extractProgress: 100,
            itemCount: 4,
            children: [
              {
                id: "dir-unpacked-genomes",
                name: "genomes",
                type: "directory",
                format: "DIRECTORY",
                size: "32.4 GB",
                path: `${basePath}/offline_packages/extracted/genomes`,
                sha256: "--",
                itemCount: 2,
                parentArchiveId: "arch-core-pkg",
                children: [
                  {
                    id: "file-genomic-fna",
                    name: `${dbCode}_genomic_reference.fna`,
                    type: "file",
                    format: "FASTA",
                    size: "26.8 GB",
                    path: `${basePath}/offline_packages/extracted/genomes/${dbCode}_genomic_reference.fna`,
                    sha256: "9182abcf381920ac371849a0293847581920bc47281903482710293847182930",
                    recordCount: currentVersion.totalRecords || 1425890,
                    parentArchiveId: "arch-core-pkg",
                  },
                  {
                    id: "file-cds-fna",
                    name: `${dbCode}_cds_transcripts.fna`,
                    type: "file",
                    format: "FASTA",
                    size: "5.6 GB",
                    path: `${basePath}/offline_packages/extracted/genomes/${dbCode}_cds_transcripts.fna`,
                    sha256: "472819034827102938471829309182abcf381920ac371849a0293847581920bc",
                    recordCount: 389200,
                    parentArchiveId: "arch-core-pkg",
                  },
                ],
              },
              {
                id: "dir-unpacked-annot",
                name: "annotations",
                type: "directory",
                format: "DIRECTORY",
                size: "5.8 GB",
                path: `${basePath}/offline_packages/extracted/annotations`,
                sha256: "--",
                itemCount: 2,
                parentArchiveId: "arch-core-pkg",
                children: [
                  {
                    id: "file-genes-gff",
                    name: `${dbCode}_features.gff3`,
                    type: "file",
                    format: "GFF3",
                    size: "4.4 GB",
                    path: `${basePath}/offline_packages/extracted/annotations/${dbCode}_features.gff3`,
                    sha256: "3819028471920abce84729102837482910384728190238472819023847192038",
                    recordCount: 4892010,
                    parentArchiveId: "arch-core-pkg",
                  },
                  {
                    id: "file-tax-tsv",
                    name: "taxonomy_lineage_mapping.tsv",
                    type: "file",
                    format: "TSV",
                    size: "1.4 GB",
                    path: `${basePath}/offline_packages/extracted/annotations/taxonomy_lineage_mapping.tsv`,
                    sha256: "738192ab384729103847281902384728190238471920383819028471920abce8",
                    recordCount: currentVersion.totalRecords || 1425890,
                    parentArchiveId: "arch-core-pkg",
                  },
                ],
              },
            ],
          },
          {
            id: "arch-patch-zip",
            name: `${dbCode}_patch_delta_2025q1.zip`,
            type: "archive",
            format: "ZIP",
            size: "4.6 GB",
            path: `${basePath}/offline_packages/${dbCode}_patch_delta_2025q1.zip`,
            sha256: "8472910ab38472619e0fba834a7c8e9f1823901bcae841726a938cde491b2384",
            isArchive: true,
            extractedStatus: "not_extracted",
            extractProgress: 0,
            itemCount: 2,
            children: [
              {
                id: "file-patch-fasta",
                name: "patch_novel_isolates.fasta",
                type: "file",
                format: "FASTA",
                size: "3.8 GB",
                path: `${basePath}/offline_packages/extracted_patch/patch_novel_isolates.fasta`,
                sha256: "1920abce84729102837482910384728190238472819023847192038381902847",
                recordCount: 34200,
                parentArchiveId: "arch-patch-zip",
              },
              {
                id: "file-patch-meta",
                name: "delta_metadata.json",
                type: "file",
                format: "JSON",
                size: "800 MB",
                path: `${basePath}/offline_packages/extracted_patch/delta_metadata.json`,
                sha256: "9182abcf381920ac371849a0293847581920bc47281903482710293847182930",
                recordCount: 34200,
                parentArchiveId: "arch-patch-zip",
              },
            ],
          },
        ],
      },
      {
        id: "dir-indexes",
        name: "alignment_indexes",
        type: "directory",
        format: "DIRECTORY",
        size: "1.8 GB",
        path: `${basePath}/alignment_indexes`,
        sha256: "--",
        itemCount: 3,
        children: [
          {
            id: "file-blast-nhr",
            name: `${dbCode}_blastdb.nhr`,
            type: "file",
            format: "BLASTDB",
            size: "1.2 GB",
            path: `${basePath}/alignment_indexes/${dbCode}_blastdb.nhr`,
            sha256: "50d6f34e819ac4092b3a817462810a9cb9174029471ab381b890f12c8192a74e",
          },
          {
            id: "file-blast-nin",
            name: `${dbCode}_blastdb.nin`,
            type: "file",
            format: "BLASTDB",
            size: "340 MB",
            path: `${basePath}/alignment_indexes/${dbCode}_blastdb.nin`,
            sha256: "472819034827102938471829309182abcf381920ac371849a0293847581920bc",
          },
          {
            id: "file-blast-nsq",
            name: `${dbCode}_blastdb.nsq`,
            type: "file",
            format: "BLASTDB",
            size: "260 MB",
            path: `${basePath}/alignment_indexes/${dbCode}_blastdb.nsq`,
            sha256: "371849a0293847581920bc472819034827102938471829309182abcf381920ac",
          },
        ],
      },
      {
        id: "dir-metadata",
        name: "metadata",
        type: "directory",
        format: "DIRECTORY",
        size: "2.4 MB",
        path: `${basePath}/metadata`,
        sha256: "--",
        itemCount: 2,
        children: [
          {
            id: "file-manifest-json",
            name: "release_manifest.json",
            type: "file",
            format: "JSON",
            size: "18 KB",
            path: `${basePath}/metadata/release_manifest.json`,
            sha256: "9182abcf381920ac371849a0293847581920bc47281903482710293847182930",
          },
          {
            id: "file-checksums",
            name: "checksums.sha256",
            type: "file",
            format: "SHA256",
            size: "4 KB",
            path: `${basePath}/metadata/checksums.sha256`,
            sha256: currentVersion.sha256Summary || "a7c8e9f1823901bcae841726a938cde491b23847582910ab38472619e0fba834",
          },
        ],
      },
    ];

    return rootNodes;
  }, [database, currentVersion]);

  const [treeData, setTreeData] = useState<FileTreeNode[]>(initialTreeData);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["dir-packages", "arch-core-pkg", "dir-unpacked-genomes", "dir-indexes", "dir-metadata"])
  );

  // Toggle node expansion
  const toggleExpand = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Expand all nodes
  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: FileTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          allIds.add(n.id);
          collectIds(n.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedIds(allIds);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Handle Decompress / Extract Single Archive Node
  const handleExtractArchive = (targetId: string) => {
    // Recursively find and update node status to extracting
    const updateExtracting = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === targetId) {
          return {
            ...node,
            extractedStatus: "extracting",
            extractProgress: 20,
          };
        }
        if (node.children) {
          return { ...node, children: updateExtracting(node.children) };
        }
        return node;
      });
    };

    setTreeData((prev) => updateExtracting(prev));

    // Progress step 1
    setTimeout(() => {
      setTreeData((prev) => {
        const updateProg = (nodes: FileTreeNode[]): FileTreeNode[] => {
          return nodes.map((n) => {
            if (n.id === targetId) return { ...n, extractProgress: 65 };
            if (n.children) return { ...n, children: updateProg(n.children) };
            return n;
          });
        };
        return updateProg(prev);
      });
    }, 450);

    // Progress step 2 (Completed)
    setTimeout(() => {
      let targetNodeName = "";
      let childCount = 0;

      const finishExtract = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map((n) => {
          if (n.id === targetId) {
            targetNodeName = n.name;
            childCount = n.children?.length || 2;
            return {
              ...n,
              extractedStatus: "extracted",
              extractProgress: 100,
            };
          }
          if (n.children) return { ...n, children: finishExtract(n.children) };
          return n;
        });
      };

      setTreeData((prev) => finishExtract(prev));
      // Automatically expand this node to show extracted hierarchy
      setExpandedIds((prev) => new Set([...prev, targetId]));

      setToastNotice(
        `数据包「${targetNodeName || "离线压缩包"}」已解压完成，已自动展开内部包含的 ${childCount} 个文件与子目录！`
      );
      setTimeout(() => setToastNotice(null), 5000);
    }, 1000);
  };

  // Handle Decompress All Archives
  const handleExtractAll = () => {
    const markAllExtracting = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes.map((n) => {
        const isArch = n.isArchive || n.type === "archive";
        return {
          ...n,
          extractedStatus: isArch ? "extracting" : n.extractedStatus,
          extractProgress: isArch ? 35 : n.extractProgress,
          children: n.children ? markAllExtracting(n.children) : undefined,
        };
      });
    };

    setTreeData((prev) => markAllExtracting(prev));

    setTimeout(() => {
      const markAllExtracted = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map((n) => {
          const isArch = n.isArchive || n.type === "archive";
          return {
            ...n,
            extractedStatus: isArch ? "extracted" : n.extractedStatus,
            extractProgress: isArch ? 100 : n.extractProgress,
            children: n.children ? markAllExtracted(n.children) : undefined,
          };
        });
      };

      setTreeData((prev) => markAllExtracted(prev));
      expandAll();
      setToastNotice("所有离线数据包均已解压完毕，完整目录层级已全部就绪！");
      setTimeout(() => setToastNotice(null), 5000);
    }, 1200);
  };

  // Handle Copy Path
  const handleCopyPath = (node: FileTreeNode) => {
    navigator.clipboard.writeText(node.path);
    setCopiedId(node.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Verify SHA-256
  const handleVerifySha = (node: FileTreeNode) => {
    setVerifiedId(node.id);
    setTimeout(() => setVerifiedId(null), 2500);
  };

  // Flatten and filter visible nodes based on expansion, search, and type filter
  interface FlattenedRow {
    node: FileTreeNode;
    level: number;
    hasChildren: boolean;
    isExpanded: boolean;
  }

  const flattenedRows = useMemo(() => {
    const rows: FlattenedRow[] = [];

    const traverse = (nodes: FileTreeNode[], level = 0) => {
      nodes.forEach((node) => {
        // Check search match
        const matchesSearch =
          !searchQuery.trim() ||
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.format.toLowerCase().includes(searchQuery.toLowerCase());

        // Check filter type
        let matchesFilter = true;
        if (filterType === "archive") {
          matchesFilter = node.isArchive || node.type === "archive";
        } else if (filterType === "extracted") {
          matchesFilter = node.extractedStatus === "extracted";
        } else if (filterType === "files") {
          matchesFilter = node.type === "file";
        }

        const hasChildren = Boolean(node.children && node.children.length > 0);
        const isExpanded = expandedIds.has(node.id);

        if (matchesSearch && matchesFilter) {
          rows.push({
            node,
            level,
            hasChildren,
            isExpanded,
          });
        }

        // If expanded and has children, continue traversal
        if (hasChildren && (isExpanded || searchQuery.trim() !== "")) {
          traverse(node.children!, level + 1);
        }
      });
    };

    traverse(treeData, 0);
    return rows;
  }, [treeData, expandedIds, searchQuery, filterType]);

  // Statistics
  const stats = useMemo(() => {
    let totalArchives = 0;
    let extractedArchives = 0;
    let totalFiles = 0;
    let totalDirs = 0;

    const countNodes = (nodes: FileTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.type === "directory") totalDirs++;
        if (n.type === "archive" || n.isArchive) {
          totalArchives++;
          if (n.extractedStatus === "extracted") extractedArchives++;
        }
        if (n.type === "file") totalFiles++;
        if (n.children) countNodes(n.children);
      });
    };
    countNodes(treeData);

    return { totalArchives, extractedArchives, totalFiles, totalDirs };
  }, [treeData]);

  // Get File Type Icon
  const getNodeIcon = (node: FileTreeNode, isExpanded: boolean) => {
    if (node.type === "directory") {
      return isExpanded ? (
        <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
      );
    }
    if (node.isArchive || node.type === "archive") {
      return node.extractedStatus === "extracted" ? (
        <PackageOpen className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <FileArchive className="w-4 h-4 text-sky-600 shrink-0" />
      );
    }
    if (node.format === "FASTA" || node.format === "FASTQ") {
      return <FileText className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (node.format === "TSV" || node.format === "CSV") {
      return <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0" />;
    }
    if (node.format === "JSON" || node.format === "GFF3") {
      return <FileCode className="w-4 h-4 text-purple-600 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-500 shrink-0" />;
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold text-slate-800">当前版本数据文件清单与挂载层级树</h4>
            <Badge variant="outline" className="text-[10px] font-mono bg-white text-slate-600 border-slate-200">
              根挂载点: /data/databases/{database.code.toLowerCase()}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500">
            支持查看多层级目录文件、解压离线归档包，并可直接复制挂载路径与校验 SHA-256 哈希。
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium text-slate-700">
            <span className="text-slate-400 text-[10px]">目录/文件:</span>
            <span className="font-mono font-bold text-sky-800">{stats.totalDirs} 目录 / {stats.totalFiles} 文件</span>
          </div>

          <div className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium text-slate-700">
            <span className="text-slate-400 text-[10px]">压缩包解压:</span>
            <Badge
              className={cn(
                "h-4.5 px-1.5 text-[10px] font-mono",
                stats.extractedArchives === stats.totalArchives
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              )}
            >
              {stats.extractedArchives} / {stats.totalArchives} 已解压
            </Badge>
          </div>
        </div>
      </div>

      {/* Toast Notice Banner */}
      {toastNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastNotice}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setToastNotice(null)}
            className="h-6 text-[10px] text-emerald-700 hover:bg-emerald-100"
          >
            知道了
          </Button>
        </div>
      )}

      {/* Search & Tool Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件名、格式或挂载路径..."
              className="h-8.5 pl-8 text-xs bg-white rounded-xl border-slate-200"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                filterType === "all" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType("archive")}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                filterType === "archive" ? "bg-white text-sky-800 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              压缩包 ({stats.totalArchives})
            </button>
            <button
              onClick={() => setFilterType("files")}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                filterType === "files" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              数据文件
            </button>
          </div>
        </div>

        {/* Tree Actions: Expand All, Collapse All, Decompress All */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-8 text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            全部展开
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-8 text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            全部折叠
          </Button>
          {stats.extractedArchives < stats.totalArchives && (
            <Button
              variant="default"
              size="sm"
              onClick={handleExtractAll}
              className="h-8 text-xs rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white gap-1 shadow-2xs"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              一键解压全部
            </Button>
          )}
        </div>
      </div>

      {/* Hierarchical Tree Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[900px]">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3.5 min-w-[280px]">文件名与层级结构</th>
                <th className="p-3.5 w-[100px]">格式 / 类型</th>
                <th className="p-3.5 w-[110px]">大小</th>
                <th className="p-3.5 min-w-[240px]">存储与挂载路径</th>
                <th className="p-3.5 w-[200px]">SHA-256 哈希校验</th>
                <th className="p-3.5 w-[130px] text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flattenedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    未找到匹配的文件或目录节点
                  </td>
                </tr>
              ) : (
                flattenedRows.map(({ node, level, hasChildren, isExpanded }) => {
                  const isArchive = node.isArchive || node.type === "archive";
                  const isExtracting = node.extractedStatus === "extracting";
                  const isExtracted = node.extractedStatus === "extracted";

                  return (
                    <tr
                      key={node.id}
                      className={cn(
                        "hover:bg-slate-50/80 transition-colors group",
                        node.type === "directory" ? "bg-slate-50/30 font-medium" : "bg-white",
                        isExtracted && isArchive && "bg-emerald-50/20"
                      )}
                    >
                      {/* Name & Tree Structure Column */}
                      <td className="p-3.5">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: `${level * 20}px` }}
                        >
                          {/* Tree expand / collapse chevron */}
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(node.id)}
                              className="w-5 h-5 rounded hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="w-5 shrink-0 inline-block text-slate-300 text-center font-mono">
                              {level > 0 ? "├" : "•"}
                            </span>
                          )}

                          {/* Node Icon */}
                          {getNodeIcon(node, isExpanded)}

                          {/* Node Name */}
                          <div className="min-w-0 flex items-center gap-2">
                            <span
                              className={cn(
                                "truncate font-mono",
                                node.type === "directory"
                                  ? "font-bold text-slate-900"
                                  : isArchive
                                  ? "font-bold text-sky-900"
                                  : "text-slate-700"
                              )}
                              title={node.name}
                            >
                              {node.name}
                            </span>

                            {/* Archive Status Badges */}
                            {isArchive && (
                              <>
                                {isExtracting ? (
                                  <Badge className="bg-sky-100 text-[#0284c7] border-sky-300 text-[9px] h-4 px-1 font-normal flex items-center gap-1">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    解压中 {node.extractProgress || 0}%
                                  </Badge>
                                ) : isExtracted ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[9px] h-4 px-1 font-normal flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                    已解压
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] h-4 px-1 font-normal"
                                  >
                                    未解压
                                  </Badge>
                                )}
                              </>
                            )}

                            {node.recordCount && (
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                ({node.recordCount.toLocaleString()} 条)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* If extracting, show mini progress bar under name */}
                        {isExtracting && (
                          <div className="mt-1.5 ml-6 max-w-xs">
                            <Progress value={node.extractProgress || 0} className="h-1 bg-slate-100 [&>div]:bg-[#0284c7]" />
                          </div>
                        )}
                      </td>

                      {/* Format Column */}
                      <td className="p-3.5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "font-mono text-[10px] uppercase",
                            node.type === "directory"
                              ? "bg-slate-100 text-slate-600"
                              : isArchive
                              ? "bg-sky-100 text-sky-800 border border-sky-200"
                              : node.format === "FASTA"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : node.format === "TSV"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {node.format}
                        </Badge>
                      </td>

                      {/* Size Column */}
                      <td className="p-3.5 font-mono text-slate-600 font-medium">
                        {node.size}
                      </td>

                      {/* Storage Mount Path Column */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-mono text-sky-800 bg-sky-50/70 px-1.5 py-0.5 rounded truncate max-w-[260px] block" title={node.path}>
                            {node.path}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyPath(node)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"
                            title="复制存储路径"
                          >
                            {copiedId === node.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* SHA-256 Hash Column */}
                      <td className="p-3.5">
                        {node.sha256 === "--" ? (
                          <span className="text-slate-400 font-mono text-[11px]">--</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono text-[10px] text-slate-500 truncate max-w-[150px] block"
                              title={node.sha256}
                            >
                              {node.sha256}
                            </span>
                            {verifiedId === node.id ? (
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                                匹配
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleVerifySha(node)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 underline font-mono"
                                title="点击执行即时SHA-256一致性校验"
                              >
                                校验
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions Column (操作列) */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {isArchive ? (
                          isExtracting ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="h-7 px-2 text-xs text-[#0284c7] font-medium gap-1 bg-sky-50"
                            >
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              解压中
                            </Button>
                          ) : isExtracted ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExtractArchive(node.id)}
                                className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-medium gap-1"
                                title="重新解压并刷新展开内部文件"
                              >
                                <FolderArchive className="w-3.5 h-3.5 text-emerald-600" />
                                重新解压
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExtractArchive(node.id)}
                              className="h-7 px-2.5 text-xs text-sky-700 border-sky-300 bg-sky-50/60 hover:bg-sky-100 hover:text-sky-800 font-semibold gap-1 shadow-2xs"
                              title="解压该离线数据包到目标挂载目录"
                            >
                              <FolderArchive className="w-3.5 h-3.5 text-[#0284c7]" />
                              解压
                            </Button>
                          )
                        ) : node.type === "directory" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(node.id)}
                            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          >
                            {isExpanded ? "折叠目录" : "展开目录"}
                          </Button>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyPath(node)}
                              className="h-7 px-2 text-xs text-slate-500 hover:text-sky-700 hover:bg-sky-50"
                              title="复制完整路径"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              复制路径
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
