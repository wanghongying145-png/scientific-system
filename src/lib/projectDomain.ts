import { getDatasets } from './datasetStore';
import { getSamples } from './sampleStore';
import type { Project, WorkflowStep, ResearchType, PI, ProjectMember } from '../types';

export const RESEARCH_TYPES: { id: ResearchType; name: string; description: string; nodes: string[] }[] = [
  { id: 'enzyme', name: '合成生物学与酶工程', description: '从目标定义、计算设计到实验验证及成果归档', nodes: ['课题立项与目标定义', '基础数据与知识库整理', '计算分析与位点预测', '突变/文库设计', '基因合成与载体构建', '表达与培养/发酵', '高通量筛选与候选确认', '蛋白纯化与质量检测', '酶学性质与稳定性表征', '迭代优化与下一轮目标设计', '成果归档'] },
  { id: 'sequencing', name: '病原与基因组测序', description: '样本采集、核酸提取、测序及生信分析', nodes: ['研究设计与方案确认', '样本采集与入库', '核酸提取与质控', '文库构建与质控', '上机测序与数据交付', '生物信息分析', '结果验证与报告', '成果归档'] },
  { id: 'single-cell', name: '单细胞与多组学研究', description: '样本制备、组学数据采集和整合分析', nodes: ['研究设计与分组', '样本采集与制备', '单细胞悬液制备与质控', '文库构建与测序', '数据质控与预处理', '细胞注释与多组学整合', '机制验证与结果分析', '成果归档'] },
  { id: 'drug', name: '药物发现与验证', description: '靶点研究、候选筛选、实验验证与优化', nodes: ['研究目标与靶点确定', '靶点证据收集与验证', '候选分子设计与筛选', '体外活性验证', '成药性评价与优化', '结果复核与研究报告', '成果归档'] },
  { id: 'custom', name: '自定义研究', description: '按实际研究方案自行增减节点', nodes: ['研究设计与方案确认', '实验执行与数据采集', '数据分析与结果验证', '成果归档'] },
];

export const DEFAULT_PIS: PI[] = [
  { id: 'pi-zhang', name: '张立华', institution: '中国科学院天津工业生物技术研究所', department: '分子酶学实验室' },
  { id: 'pi-1', name: '张教授', institution: '北京协和医院', department: '免疫科' },
  { id: 'pi-2', name: '李博士', institution: '上海复旦大学', department: '生物信息中心' },
];
export const PROJECT_PEOPLE: ProjectMember[] = [
  { id: 'researcher-li', name: '李默然', role: '实验负责人' },
  { id: 'researcher-wang', name: '王雪', role: '实验研究员' },
  { id: 'researcher-zhao', name: '赵一凡', role: '生信分析研究员' },
  { id: 'researcher-chen', name: '陈宇', role: '科研助理' },
  { id: 'researcher-liu', name: '刘敏', role: '质量与归档' },
];
export const researchTypeName = (id?: ResearchType) => RESEARCH_TYPES.find(t => t.id === id)?.name || '待确定';
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function makeStep(title: string, order: number, piName = '', category = '研究节点'): WorkflowStep {
  return {
    id: newId('node'), order, title, templateTitle: title, category, description: '', status: 'pending', progressText: '未开始 · 0%', progressPercent: 0,
    riskLevel: 'low', updatedAt: new Date().toISOString().slice(0, 10), leadPerson: '', leadId: '', startDate: '', endDate: '',
    schemeTitle: `${title} 执行方案`, schemeCount: 0, refCount: 0, schemeNote: '待补充方案', reportSummary: '暂无实验报告', reportCount: 0,
    indicatorCount: 0, attachmentName: '暂无附件', datasetSummary: '0 个数据集', sampleCountText: '样本: 0', fileCountText: '文件: 0',
    datasetName: `${title} 数据集`, piStatus: '未提交', piReviewer: piName, piRecordsCount: 0, piNote: '待提交审核', issuePendingCount: 0,
    issueTotalCount: 0, issueReplyCount: 0, chatNote: '暂无讨论',
  };
}
export function makeSteps(type: ResearchType, piName = '') {
  const template = RESEARCH_TYPES.find(t => t.id === type)!;
  return template.nodes.map((name, i) => makeStep(name, i + 1, piName, template.name));
}
export function stepHasRecords(s: WorkflowStep) {
  return getSamples().some(sample => sample.links.some(link => link.nodeId === s.id)) || s.status !== 'pending' || s.progressPercent > 0 || s.schemeCount > 0 || s.reportCount > 0 || s.piRecordsCount > 0 || getDatasets().some(d => d.nodeId === s.id);
}
export function projectProgress(project: Project) {
  const steps = project.steps || [];
  return steps.length ? Math.round(steps.reduce((sum, s) => sum + s.progressPercent, 0) / steps.length) : 0;
}
export function validateProject(p: Project, projects: Project[]): string[] {
  const errors: string[] = [];
  if (!p.number.trim() || !p.name.trim()) errors.push('请填写项目编号和名称。');
  if (projects.some(other => other.id !== p.id && other.number.trim().toLowerCase() === p.number.trim().toLowerCase())) errors.push('项目编号已存在，请使用其他编号。');
  if (!p.piId || !p.piName?.trim()) errors.push('请选择项目 PI。');
  if (!p.members?.length) errors.push('请至少选择一名项目成员。');
  if (!p.objective?.trim()) errors.push('请填写研究目标及验收指标。');
  if (!p.plan?.trim()) errors.push('请填写研究计划。');
  if (!p.startDate || !p.endDate) errors.push('请填写计划开始日期和结束日期。');
  else if (p.endDate < p.startDate) errors.push('计划结束日期不能早于开始日期。');
  if (!p.researchType) errors.push('请选择研究类型。');
  if (!p.steps?.length) errors.push('请至少建立一个实验节点。');
  const titles = new Set<string>();
  for (const s of p.steps || []) {
    if (!s.title.trim()) errors.push(`第 ${s.order} 个节点缺少名称。`);
    else if (titles.has(s.title.trim())) errors.push(`节点名称“${s.title.trim()}”重复。`);
    titles.add(s.title.trim());
    if (s.leadId && s.leadId !== p.piId && !p.members?.some(m => m.id === s.leadId)) errors.push(`“${s.title}”负责人已不在项目团队中，请重新选择。`);
    if (!!s.startDate !== !!s.endDate) errors.push(`“${s.title}”请同时填写节点开始和结束日期。`);
    if (s.startDate && s.endDate && (s.endDate < s.startDate || s.startDate < p.startDate! || s.endDate > p.endDate!)) errors.push(`“${s.title}”的日期必须按先后顺序且在项目计划周期内。`);
  }
  return errors;
}
