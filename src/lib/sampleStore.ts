import { useSyncExternalStore } from 'react';
import type { Project, Sample, SampleLink } from '../types';

import { getDatasets } from './datasetStore';

const KEY = 'research_samples_v1';
export const SAMPLE_STATUSES: Record<Sample['status'], string> = { pending: '待入库', available: '可用', 'in-use': '使用中', consumed: '已耗尽', archived: '已归档' };
export const SAMPLE_TYPES = ['菌株', '质粒', '蛋白', '化合物', '细胞', '组织', 'DNA', 'RNA', '血液', '其他'];
const listeners = new Set<() => void>();
let cache: Sample[] | undefined;
let lastRaw: string | null | undefined;

function initialSamples(): Sample[] {
  const definitions = [
    ['1', 'SAM-2024-001', 'DNA', '2024-03-20'], ['2', 'SAM-2024-002', '血液', '2024-03-21'],
    ['S001', 'S20240401-001', '其他', '2024-04-01'], ['S002', 'S20240401-002', '血液', '2024-04-01'],
    ['S003', 'S20240402-001', '组织', '2024-04-02'], ['S004', 'S20240410-001', '血液', '2024-04-10'], ['S005', 'S20240410-002', '组织', '2024-04-10'],
  ];
  // Preserve old project-only selections without guessing their experimental node.
  const projects: Project[] = JSON.parse(localStorage.getItem('research_projects_v1') || '[]');
  return definitions.filter(([id]) => id === '1' || id === '2' || projects.some(p => p.associatedSampleIds?.includes(id))).map(([id, number, sampleType, createdAt]) => ({
    id, number, name: `科研样本 ${number}`, sampleType, batch: '', quantity: '', unit: '', storageLocation: '', owner: '',
    receivedAt: '', createdAt, updatedAt: createdAt, status: 'pending', notes: '历史样本基础资料，待核对入库信息。', links: [],
    pendingProjectIds: projects.filter(p => p.associatedSampleIds?.includes(id)).map(p => p.id),
  }));
}
export function getSamples(): Sample[] {
  const raw = localStorage.getItem(KEY);
  if (cache && raw === lastRaw) return cache;
  const records = raw ? JSON.parse(raw) : initialSamples();
  if (!Array.isArray(records)) throw new Error('样本台账格式异常，请保留浏览器数据并联系管理员。');
  if (!raw) localStorage.setItem(KEY, JSON.stringify(records));
  cache = records;
  lastRaw = localStorage.getItem(KEY);
  return cache!;
}
function commit(samples: Sample[]) {
  try { localStorage.setItem(KEY, JSON.stringify(samples)); }
  catch { throw new Error('浏览器存储不可用，本次修改未保存。'); }
  cache = samples; lastRaw = localStorage.getItem(KEY); listeners.forEach(l => l());
}
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) listeners.forEach(l => l()); });
export function useSamples() { return useSyncExternalStore(subscribe, getSamples); }
export function blankSample(projectId = '', nodeId = ''): Sample {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), number: '', name: '', sampleType: '', batch: '', quantity: '', unit: '', storageLocation: '', owner: '', receivedAt: '',
    status: 'pending', notes: '', createdAt: now, updatedAt: now, links: projectId ? [{ projectId, nodeId }] : [], pendingProjectIds: [] };
}
function validateLinks(links: SampleLink[], projects: Project[]) {
  const keys = new Set<string>();
  for (const link of links) {
    const project = projects.find(p => p.id === link.projectId);
    if (!project || !project.steps?.some(s => s.id === link.nodeId)) throw new Error('每条关联都必须选择有效的项目和该项目的实验节点。');
    const key = `${link.projectId}:${link.nodeId}`;
    if (keys.has(key)) throw new Error('同一样本不能重复关联到同一项目节点。');
    keys.add(key);
  }
}
export function saveSample(sample: Sample, projects: Project[]) {
  const all = getSamples();
  if (!sample.number.trim() || !sample.name.trim() || !sample.sampleType.trim()) throw new Error('请填写样本编号、样本名称和样本类型。');
  if (all.some(s => s.id !== sample.id && s.number.trim().toLowerCase() === sample.number.trim().toLowerCase())) throw new Error('样本编号已存在，请关联已有样本或使用其他编号。');
  if (sample.quantity && (!Number.isFinite(Number(sample.quantity)) || Number(sample.quantity) < 0 || !sample.unit.trim())) throw new Error('样本数量必须为非负数，并填写计量单位。');
  validateLinks(sample.links, projects);
  const next = { ...sample, number: sample.number.trim(), name: sample.name.trim(), sampleType: sample.sampleType.trim(), updatedAt: new Date().toISOString(),
    pendingProjectIds: (sample.pendingProjectIds || []).filter(id => !sample.links.some(l => l.projectId === id)) };
  commit(all.some(s => s.id === next.id) ? all.map(s => s.id === next.id ? next : s) : [next, ...all]);
}
export function associateSamples(ids: string[], link: SampleLink, projects: Project[]) {
  validateLinks([link], projects);
  const all = getSamples();
  if (!ids.length) throw new Error('请至少选择一个台账样本。');
  if (ids.some(id => !all.some(s => s.id === id))) throw new Error('部分样本已不存在，请重新选择。');
  commit(all.map(s => ids.includes(s.id) ? { ...s,
    links: s.links.some(l => l.projectId === link.projectId && l.nodeId === link.nodeId) ? s.links : [...s.links, link],
    pendingProjectIds: s.pendingProjectIds?.filter(id => id !== link.projectId), updatedAt: new Date().toISOString(),
  } : s));
}
export function unlinkSample(id: string, projectId: string, nodeId?: string) {
  commit(getSamples().map(s => s.id === id ? { ...s, links: s.links.filter(l => !(l.projectId === projectId && (!nodeId || l.nodeId === nodeId))),
    pendingProjectIds: s.pendingProjectIds?.filter(p => p !== projectId), updatedAt: new Date().toISOString() } : s));
}
export function deleteSample(id: string) {
  if (getDatasets().some(d => d.sampleIds.includes(id))) throw new Error('样本仍有关联数据集，请先解除数据集关联，或将样本归档。');
  const all = getSamples(), sample = all.find(s => s.id === id);
  if (sample?.links.length || sample?.pendingProjectIds?.length) throw new Error('样本仍有关联项目，请先解除关联，或将样本归档。');
  commit(all.filter(s => s.id !== id));
}
export function samplesAtNode(samples: Sample[], projectId: string, nodeId: string) { return samples.filter(s => s.links.some(l => l.projectId === projectId && l.nodeId === nodeId)); }
