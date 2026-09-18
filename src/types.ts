export type SystemType = 'pathogen-ngs' | 'immuno-analysis' | 'specialized-db' | 'ai-drug-discovery' | 'system-mgmt';

export interface NavItem {
  title: string;
  id: string;
  icon: string;
  system: SystemType;
}

export interface SampleLink { projectId: string; nodeId: string; }
export interface Sample {
  id: string;
  number: string;
  name: string;
  sampleType: string;
  batch: string;
  quantity: string;
  unit: string;
  storageLocation: string;
  owner: string;
  receivedAt: string;
  status: 'pending' | 'available' | 'in-use' | 'consumed' | 'archived';
  notes: string;
  createdAt: string;
  updatedAt: string;
  links: SampleLink[];
  pendingProjectIds?: string[];
}

export type ProcessingStage = 'extraction' | 'fragmentation' | 'library-prep' | 'sequencing-sheet';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExtractionRecord {
  id: string;                // 提取ID
  sampleId: string;          // 关联样本ID
  sampleType: string;        // 样本类型
  batchNumber: string;       // 提取批次
  kit: string;               // 提取试剂盒
  equipment: string;         // 提取设备
  extractionType: string;    // 提取类型
  method: string;            // 提取方法
  initialAmount: string;     // 起始样本量
  elutionVolume: string;     // 洗脱体积
  concentration: number;     // 浓度 (ng/μL)
  totalAmount: number;       // 总量
  od260_280: number;         // A260/280
  od260_230: number;         // A260/230
  rinValue: number;          // RIN值
  qcStatus: '未检测' | '已检测'; // 质控状态
  qcResult: string;          // 质控结果
  qcDescription: string;     // 质控说明
  timestamp: string;         // 提取日期
  businessStatus: string;    // 业务状态
  operator: string;          // 操作人
  nextStep: '否' | '是（碎片化）' | '是（建库）'; // 是否进入下一步
  remarks: string;           // 备注
}

export interface FragmentationRecord {
  id: string;                // 片段化ID
  extractionId: string;      // 关联提取ID
  sampleId: string;          // 关联样本ID
  batchNumber: string;       // 片段化批次
  method: string;            // 片段化方法
  equipment: string;         // 片段化设备
  targetLength: string;      // 目标片段长度
  equipmentParams: string;   // 设备参数
  actualPeak: string;        // 实际峰值
  distributionRange: string; // 分布范围
  qcStatus: '未检测' | '已检测'; // 质控状态
  qcResult: string;          // 质控结果
  qcDescription: string;     // 质控说明
  attachment: string;        // 附件
  timestamp: string;         // 片段化日期
  operator: string;          // 操作人
  allowLibraryPrep: '是' | '否'; // 是否允许进入建库
  remarks: string;           // 备注
}

export interface LibraryPrepRecord {
  id: string;                // 文库ID
  fragmentationId: string;   // 关联片段化ID
  extractionId: string;      // 关联提取ID
  sampleId: string;          // 关联样本ID
  batchNumber: string;       // 建库批次
  strategy: '无PCR' | '基于PCR'; // 建库策略
  pcrCycles: number;         // PCR循环数
  qpcrConcentration: number; // qPCR浓度
  libraryType: 'DNA文库' | 'RNA文库' | '宏基因组文库' | '扩增子文库'; // 文库类型
  concentration: number;     // 文库浓度 (ng/μL)
  fragmentSize: string;      // 文库片段大小 (平均bp)
  i7Index: string;           // i7 index
  i5Index: string;           // i5 index
  barcode: string;           // barcode
  totalAmount: number;       // 文库总量
  qcStatus: '未检测' | '已检测'; // 质控状态
  attachment: string;        // 附件
  qcResult: string;          // 质控结果
  qcDescription: string;     // 质控说明
  timestamp: string;         // 建库时间
  operator: string;          // 操作人
  readyForSequencing: '是' | '否'; // 是否可上机
  remarks: string;           // 备注
}

export interface SequencingSheetRecord {
  batchNumber: string;       // 上机批次号
  sampleNumber: string;      // 样本编号
  libraryNumber: string;     // 文库编号
  libraryType: string;       // 文库类型
  platform: string;          // 平台
  sequencerName: string;     // 测序仪名称
  flowcellId: string;        // Flowcell ID
  laneNumber: string;        // Lane号
  poolNumber: string;        // Pool号
  i7Index: string;           // i7index
  i5Index: string;           // i5index
  sequencingType: string;    // 测序类型
  readLength: string;        // Read长度
  loadingConcentration: string; // 上机浓度
  loadingVolume: string;     // 上样体积
  attachment: string;        // 附件
  plannedDataAmount: string; // 计划数据量
  actualDataAmount: string;  // 实际数据量
  startTime: string;         // 开始时间
  endTime: string;           // 结束时间
  runStatus: string;         // 运行状态
  operator: string;          // 操作人
  remarks: string;           // 备注
}

export interface SampleProcessingInfo {
  id: string;
  sampleId: string;
  sampleNumber: string;
  sampleType: string;
  currentStage: ProcessingStage;
  status: ProcessingStatus;
  extraction?: ExtractionRecord;
  fragmentation?: FragmentationRecord;
  libraryPrep?: LibraryPrepRecord;
  sequencingSheet?: SequencingSheetRecord;
}

export interface PI {
  id: string;
  name: string;
  institution: string;
  department: string;
}

export type ResearchType = 'enzyme' | 'sequencing' | 'single-cell' | 'drug' | 'custom';
export interface ProjectMember { id: string; name: string; role: string; }
export interface WorkflowStep {
  review?: import('./lib/reviewDomain').NodeReview;
  progressNotes?: string;
  legacyReviewBasis?: string;
  templateTitle?: string;
  id: string;
  leadId?: string;
  startDate?: string;
  endDate?: string;
  linkedDatasetIds?: string[];
  order: number;
  title: string;
  category: string;
  description: string;
  status: "completed" | "in_progress" | "pending";
  progressText: string;
  progressPercent: number;
  riskLevel: "low" | "medium" | "high";
  updatedAt: string;
  leadPerson: string;
  schemeTitle: string;
  schemeCount: number;
  refCount: number;
  schemeNote: string;
  reportSummary: string;
  reportCount: number;
  indicatorCount: number;
  attachmentName: string;
  datasetSummary: string;
  sampleCountText: string;
  fileCountText: string;
  datasetName: string;
  piStatus: string;
  piReviewer: string;
  piRecordsCount: number;
  piNote: string;
  issuePendingCount: number;
  issueTotalCount: number;
  issueReplyCount: number;
  chatNote: string;
}

export interface Project {
  id: string;
  number: string;
  name: string;
  piId: string;
  piName?: string; // Derived for UI
  institution: string; // 单位
  department: string;  // 科室
  status: 'active' | 'completed' | 'on-hold' | 'archived';
  createdAt: string;
  associatedSampleIds?: string[];
  researchType?: ResearchType;
  members?: ProjectMember[];
  objective?: string;
  plan?: string;
  startDate?: string;
  endDate?: string;
  steps?: WorkflowStep[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  params: WorkflowParam[];
}

export interface WorkflowParam {
  name: string;
  label: string;
  type: 'string' | 'number' | 'select';
  defaultValue: any;
  options?: string[];
}

export interface AnalysisTask {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'success' | 'error' | 'pending';
  progress: number;
  startTime: string;
  duration: string;
}

export interface ProteinTask {
  id: string;
  name: string;
  sequence: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
}

export interface RawDataRecord {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: string;
  sampleId: string;
  batchNumber: string;
  sequencingMode: '单端' | '双端';
  uploadTime: string;
  source: 'auto-scan' | 'manual-upload';
  uploadStatus: '待上传' | '上传中' | '上传失败' | '上传成功';
  uploadProgress: number;
}

export interface UserAccount {
  id: string;
  username: string;
  realName: string;
  phone: string;
  email: string;
  roleId: string; // Reference to Role id
  roleName?: string; // For UI
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissionIds: string[];
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface PermissionNode {
  id: string;
  label: string;
  type: 'module' | 'menu' | 'function';
  children?: PermissionNode[];
}

export interface DictionaryType {
  id: string;
  code: string;
  name: string;
  remark?: string;
  status: 'active' | 'disabled';
  updatedAt: string;
}

export interface DictionaryValue {
  id: string;
  typeId: string;
  value: string;
  name: string;
  status: 'active' | 'disabled';
  sort: number;
  remark?: string;
  updatedAt: string;
}

export interface ProjectGroup {
  id: string;
  name: string;
  description: string;
  creator: string;
  createdAt: string;
  memberIds: string[];
}

export interface ImmunoDatabaseRecord {
  id: string;
  sequencingType: 'BCR' | 'TCR' | 'scRNA';
  disease: '结核' | 'HIV' | 'HBV' | '健康人群';
  sampleCount: number;
  chainsCount: number;
  matrixCount: number;
  source: 'GEO' | 'PubMed' | 'NCBI' | '本地';
  releaseTime: string;
  permission: 'public' | 'restricted';
  accessibleRoles: string[];
  pubmedUrl?: string;
  geoUrl?: string;
  ncbiUrl?: string;
  databaseName?: string;
  databaseDescription?: string;
  dataType?: string;
  sampleCountDisplay?: string;
  tcrBcrMatrix?: string;
  sourceDatabase?: string;
  currentVersion?: string;
  viewPermissionType?: 'public' | 'restricted';
  viewRoles?: string[];
  downloadPermissionType?: 'public' | 'restricted' | 'private';
  downloadRoles?: string[];
  creator?: string;
}

export interface ImmunoSampleInfo {
  id: string;
  individualId: string;
  diseaseStatus: '患者' | '健康';
  age: number;
  gender: '男' | '女';
  experimentType: string;
}

export interface UserQCData {
  id: string;
  sampleId: string;
  datasetId: string;
  experimentType: 'BCR' | 'TCR' | 'scRNA';
  readsCount: number;
  q30Ratio: number;
  gcContent: number;
  mappingRate: number;
  duplicationRate: number;
  timestamp: string;
}
