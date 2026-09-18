import { MOCK_GROUPS } from "../ProjectGroupManagement";
import { PublicDatabaseItem } from "./types";

export interface ResearchGroupOption {
  id: string;
  name: string;
  description: string;
}

/**
 * 课题组只读选项列表（与「系统管理 - 课题组管理」共用同一份数据源）
 */
export const RESEARCH_GROUPS: ResearchGroupOption[] = MOCK_GROUPS.map((g) => ({
  id: g.id,
  name: g.name,
  description: g.description,
}));

export function getGroupName(groupId: string): string {
  return RESEARCH_GROUPS.find((g) => g.id === groupId)?.name || groupId;
}

/**
 * 判断某个公共数据库对指定课题组是否可见
 */
export function isDbVisibleToGroup(db: PublicDatabaseItem, groupId: string): boolean {
  const scope = db.viewScope || "all";
  if (scope === "all") return true;
  if (!groupId) return false;
  return (db.allowedGroupIds || []).includes(groupId);
}

export interface ViewScopeDescriptor {
  text: string;
  tone: "public" | "restricted" | "none";
  detail: string;
}

/**
 * 描述公共数据库的课题组查看权限
 */
export function describeViewScope(db: PublicDatabaseItem): ViewScopeDescriptor {
  const scope = db.viewScope || "all";
  const groups = db.allowedGroupIds || [];

  if (scope === "all" || groups.length === 0) {
    return {
      text: "全部课题组",
      tone: "public",
      detail: "课题组限制: 全部课题组可见",
    };
  }

  return {
    text: `${groups.length} 个课题组`,
    tone: "restricted",
    detail: `课题组限制: ${groups.map((id) => getGroupName(id)).join("、")}`,
  };
}