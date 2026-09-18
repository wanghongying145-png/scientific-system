export type DatabaseCategory =
  | "pathogen"
  | "immunogenomics"
  | "protein_struct";

/** 公共数据库的课题组查看范围: all = 全部课题组可见, groups = 仅授权课题组可见 */
export type DatabaseViewScope = "all" | "groups";

export type UpdateStatus = "正常" | "正在更新" | "更新中" | "更新失败" | "待初始化" | "未更新" | "更新成功";
export type RunStatus = "正常" | "异常" | "未启用" | "停用" | "待初始化";

export interface DatabaseFileManifest {
  name: string;
  size: string;
  format: string;
  path: string;
  sha256: string;
  recordCount?: number;
}

export interface PathogenClassificationStats {
  bacteria: number;
  fungi: number;
  virus: number;
  parasite: number;
  mycoplasma_chlamydia: number;
  mycobacterium: number;
}

export interface ImmunogenomicsClassificationStats {
  expressionMatrices: number;
  tcrChains: number;
  bcrChains: number;
  sampleCount: number;
  diseaseTypes: number;
  literatureDatasets: number;
}

export interface ProteinClassificationStats {
  proteinSeqCount: number;
  proteinStructCount: number;
  speciesCount: number;
  functionalAnnotations: number;
}

export interface MicrobialGenomeClassificationStats {
  genomesCount: number;
  metagenomeContigs: number;
  nrProteinClusters: number;
  taxonomicLineages: number;
}

export interface DatabaseVersion {
  versionNumber: string;
  sourceInfo: string;
  sourceReleaseDate: string;
  packageAcquireDate: string;
  systemUpdateTime: string;
  enableTime: string;
  disableTime?: string;
  totalRecords: number;
  fileManifest: DatabaseFileManifest[];
  status: "当前正式版本" | "历史版本" | "已停用";
  generationMethod: "离线全量导入" | "离线增量导入" | "系统初始化导入" | "版本回滚恢复";
  operator: string;
  versionNote: string;
  sha256Summary: string;
  classificationStats?: {
    pathogen?: PathogenClassificationStats;
    immunogenomics?: ImmunogenomicsClassificationStats;
    protein?: ProteinClassificationStats;
    microbial?: MicrobialGenomeClassificationStats;
  };
  lastUpdateSummary?: {
    newRecords: number;
    modifiedRecords: number;
    invalidRecords: number;
    failedRecords: number;
  };
}

export interface UpdateBatchRecord {
  batchId: string;
  dbId: string;
  dbName: string;
  previousVersion: string;
  targetVersion: string;
  updateType: "全量更新" | "增量更新" | "版本回滚" | "初始化导入";
  sourceOrg: string;
  sourceReleaseDate: string;
  packageAcquireDate: string;
  uploadTime: string;
  startTime: string;
  finishTime: string;
  status: "更新成功" | "更新失败" | "更新中" | "校验中";
  originalRecords: number;
  newRecords: number;
  modifiedRecords: number;
  invalidRecords: number;
  failedRecords: number;
  finalTotalRecords: number;
  operator: string;
  updateNote: string;
  files: DatabaseFileManifest[];
  executionStages: {
    stage: string;
    name: string;
    status: "done" | "running" | "error" | "pending";
    duration: string;
    details?: string;
  }[];
  failureReasons?: string[];
  logs: string[];
}

export interface PublicDatabaseItem {
  id: string;
  code: string;
  name: string;
  englishName: string;
  category: DatabaseCategory;
  categoryLabel: string;
  sourceOrg: string;
  officialUrl: string;
  sourceDescription: string;
  licenseTerms: string;
  description: string;
  dataContent: string;
  dataFormat: string;
  recommendedUpdateCycle: string;
  responsibleAdmin: string;
  isEnabled: boolean;
  /** 课题组查看范围, 缺省视为全部课题组可见 */
  viewScope?: DatabaseViewScope;
  /** 当 viewScope 为 groups 时, 可查看该数据库的课题组 ID 列表 */
  allowedGroupIds?: string[];
  createTime: string;
  currentVersion: string;
  updateMethod: "离线数据包手动更新";
  sourceReleaseDate: string;
  lastUpdateTime?: string;
  systemUpdateTime: string;
  totalRecords: number;
  updateStatus: UpdateStatus;
  runStatus: RunStatus;
  recentUpdateSummary?: {
    newCount: number;
    modCount: number;
    invalidCount: number;
    failCount: number;
  };
  updateConfig?: {
    updateType: "全量/增量" | "仅全量" | "仅增量";
    supportedFormats: string[];
    maxUploadSizeGB: number;
    uniqueKeyField: string;
    validationRules: string[];
    historyVersionRetention: number;
  };
  versions: DatabaseVersion[];
  updateRecords: UpdateBatchRecord[];
}
