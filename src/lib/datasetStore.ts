import { getProjects as readProjects } from './projectStore';
import { assertProjectAccess, canAccessProject, getIdentity } from './session';
import { datasetFingerprint } from './reviewDomain';
import { useSyncExternalStore } from 'react';
import type { Project, Sample } from '../types';
import { getSeedDatasets, PROJECT_ALIASES, type DatasetRecord, type DatasetCategoryId } from './datasetSeed';
import { LEGACY_ENZYME_STEPS } from './projectSeed';
import { LEGACY_NODE_FILES } from './datasetFileSeed';

export interface DatasetFile { id: string; name: string; size: string; bytes?: number; format: string; uploadedAt: string; hasContent: boolean; }
export interface QualityRecord { id: string; result: '合格' | '异常'; criteria: string; metrics: string; comment: string; actorId: string; actorName: string; time: string; fingerprint: string; }
export interface ResearchDataset extends DatasetRecord { qualityHistory?: QualityRecord[]; sampleIds: string[]; files: DatasetFile[]; description: string; }
export const DATASET_CATEGORIES: Record<DatasetCategoryId, string> = { wet: '湿实验表征数据', omics: '组学与测序', spectra: '精密仪器原始谱图', simulation: '动力学与计算拟合' };
const KEY = 'research_datasets_v1';
let cache: ResearchDataset[] | undefined, lastRaw: string | null | undefined;
const listeners = new Set<() => void>();
export function getDatasets(): ResearchDataset[] {
  const raw = localStorage.getItem(KEY);
  if (cache && raw === lastRaw) return cache;
  const records = raw ? JSON.parse(raw) : getSeedDatasets();
  if (!Array.isArray(records)) throw new Error('数据集台账格式异常，请保留浏览器数据并联系管理员。');
  const projects: Project[] = JSON.parse(localStorage.getItem('research_projects_v1') || '[]');
  const normalized = records.map((r: DatasetRecord & Partial<ResearchDataset>) => {
    const projectId = r.projectId || PROJECT_ALIASES[r.project];
    const project = projects.find(p => p.id === projectId);
    const title = r.node.replace(/^\d+\.\s*/, '');
    const legacyId = LEGACY_ENZYME_STEPS.find(s => s.title === title)?.id;
    const nodeId = r.nodeId || project?.steps?.find(s => s.templateTitle === title || s.title === title || (projectId === 'enz-01' && s.id === legacyId))?.id;
    return { ...r, projectId, nodeId, sampleIds: [...new Set(r.sampleIds || [])], description: r.description || '',
      files: r.files || (r.id === 'DS-BIO-01-01' ? LEGACY_NODE_FILES : []),
    } as ResearchDataset;
  });
  const serialized = JSON.stringify(normalized);
  if (raw !== serialized) localStorage.setItem(KEY, serialized);
  cache = normalized; lastRaw = serialized; return cache;
}
function commit(records: ResearchDataset[]) {
  try { localStorage.setItem(KEY, JSON.stringify(records)); } catch { throw new Error('浏览器存储不可用，本次修改未保存。'); }
  cache = records; lastRaw = localStorage.getItem(KEY); listeners.forEach(l => l());
}
export const subscribeDatasets = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) listeners.forEach(l => l()); });
export const useDatasets = () => useSyncExternalStore(subscribeDatasets, getDatasets);
export function datasetsAtNode(datasets: ResearchDataset[], projectId: string, nodeId: string) { return datasets.filter(d => d.projectId === projectId && d.nodeId === nodeId); }
export const datasetLocation = (d: ResearchDataset, projects: Project[]) => {
  const p = projects.find(p => p.id === d.projectId), n = p?.steps?.find(n => n.id === d.nodeId);
  return { project: p?.name || d.project || '未关联项目', node: n ? `${n.order}. ${n.title}` : '待关联节点' };
};
export function effectiveSampleLinks(sample: Sample, datasets: ResearchDataset[]) {
  const links = [...sample.links];
  for (const d of datasets) if (d.projectId && d.nodeId && d.sampleIds.includes(sample.id) && !links.some(l => l.projectId === d.projectId && l.nodeId === d.nodeId)) links.push({ projectId: d.projectId, nodeId: d.nodeId });
  return links;
}
export const formatBytes = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
export function blankDataset(projectId = '', nodeId = ''): ResearchDataset { return { id: 'DS-' + crypto.randomUUID(), name: '', category: 'wet', projectId, nodeId, project: '', node: '', instrument: '', owner: '', size: '0 B', format: '-', quality: '待质检', rsq: '-', updatedAt: '', sampleIds: [], files: [], description: '' }; }

let database: Promise<IDBDatabase> | undefined;
function openFiles() { return database ||= new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('research-dataset-files', 1); request.onupgradeneeded = () => request.result.createObjectStore('files'); request.onsuccess = () => resolve(request.result); request.onerror = () => { database = undefined; reject(new Error('文件保存空间不可用，请重试。')); }; }); }
async function putFiles(files: { id: string; file: File }[]) {
  if (!files.length) return;
  const db = await openFiles(); await new Promise<void>((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); for (const f of files) tx.objectStore('files').put(f.file, f.id); tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(new Error('文件未保存，可能超出浏览器存储空间。')); });
}
async function removeFiles(ids: string[]) {
  if (!ids.length) return;
  const db = await openFiles(); await new Promise<void>((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); ids.forEach(id => tx.objectStore('files').delete(id)); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}
export async function readDatasetFile(id: string): Promise<Blob> {
  const db = await openFiles(); return new Promise((resolve, reject) => { const req = db.transaction('files').objectStore('files').get(id); req.onsuccess = () => req.result ? resolve(req.result) : reject(new Error('当前浏览器未保存该文件内容，请重新添加文件。')); req.onerror = () => reject(req.error); });
}
function validate(dataset: ResearchDataset, projects: Project[], samples: Sample[]) {
  if (!dataset.name.trim()) throw new Error('请填写数据集名称。');
  const p = projects.find(p => p.id === dataset.projectId);
  assertProjectAccess(p);
  if (!p?.steps?.some(s => s.id === dataset.nodeId)) throw new Error('请选择有效的所属项目和实验节点。');
  if (dataset.sampleIds.some(id => !samples.some(s => s.id === id))) throw new Error('部分样本已不存在，请重新选择。');
  if (new Set(dataset.sampleIds).size !== dataset.sampleIds.length) throw new Error('不能重复关联同一样本。');
}
export async function saveDataset(dataset: ResearchDataset, picked: File[], getProjects: () => Project[], getSamples: () => Sample[], isNew: boolean) {
  validate(dataset, getProjects(), getSamples());
  const added = picked.map(file => ({ id: 'file-' + crypto.randomUUID(), file }));
  await putFiles(added);
  try {
    validate(dataset, getProjects(), getSamples());
    const all = getDatasets(), original = all.find(d => d.id === dataset.id);
    if (!isNew && !original) throw new Error('该数据集已被删除，请关闭后重新操作。');
    if (original && original.updatedAt !== dataset.updatedAt) throw new Error('数据集已在其他页面更新，请重新打开后编辑。');
    if (isNew && original) throw new Error('数据集已存在，请勿重复提交。');
    if (original) assertProjectAccess(getProjects().find(p => p.id === original.projectId));
    const now = nextTimestamp(original?.updatedAt);
    const files: DatasetFile[] = [...dataset.files, ...added.map(({id,file}) => ({ id, name: file.name, bytes: file.size, size: formatBytes(file.size), format: file.name.includes('.') ? file.name.split('.').pop()!.toUpperCase() : 'FILE', uploadedAt: now, hasContent: true }))];
    const location = datasetLocation(dataset, getProjects());
    const filesChanged = added.length > 0 || !!original && datasetFingerprint(original) !== datasetFingerprint({...dataset, files});
    const next = { ...dataset, ...location, qualityHistory: original?.qualityHistory || [], quality: original?.quality || '待质检' as const, ...(filesChanged ? { quality: '待质检' as const, rsq: '-' } : {}), name: dataset.name.trim(), files, sampleIds: [...new Set(dataset.sampleIds)], updatedAt: now,
      size: files.length && files.every(f => f.bytes !== undefined) ? formatBytes(files.reduce((sum, f) => sum + (f.bytes || 0), 0)) : files.length ? `${files.length} 个文件` : filesChanged ? "0 B" : dataset.size,
      format: files.length ? [...new Set(files.map(f => f.format))].join(' / ') : filesChanged ? '-' : dataset.format,
    };
    commit(original ? all.map(d => d.id === dataset.id ? next : d) : [next, ...all]);
    void removeFiles((original?.files || []).filter(f => !files.some(n => n.id === f.id)).map(f => f.id)).catch(() => {});
  } catch(e) { await removeFiles(added.map(f => f.id)).catch(() => {}); throw e; }
}
export async function deleteDataset(id: string) { const all = getDatasets(), target = all.find(d => d.id === id); if (!target) return; assertProjectAccess(readProjects().find(p=>p.id===target.projectId)); commit(all.filter(d => d.id !== id)); void removeFiles((target?.files || []).map(f => f.id)).catch(() => {}); }
export function setSampleDatasets(sampleId: string, datasetIds: string[], samples: Sample[]) {
  if (!samples.some(s => s.id === sampleId)) throw new Error('样本已不存在。');
  const all = getDatasets();
  if (datasetIds.some(id => !all.some(d => d.id === id))) throw new Error('部分数据集已不存在，请重新选择。');
  for (const id of datasetIds) assertProjectAccess(readProjects().find(p=>p.id===all.find(d=>d.id===id)?.projectId));
  commit(all.map(d => {
    const project = readProjects().find(p=>p.id===d.projectId);
    if (!project || !canAccessProject(project)) return d;
    const wanted = datasetIds.includes(d.id), linked = d.sampleIds.includes(sampleId);
    if (wanted === linked) return d;
    return { ...d, sampleIds: wanted ? [...d.sampleIds, sampleId] : d.sampleIds.filter(id => id !== sampleId), quality: '待质检' as const, rsq: '-', updatedAt: nextTimestamp(d.updatedAt) };
  }));
}

function nextTimestamp(previous?: string) { return new Date(Math.max(Date.now(), (Date.parse(previous || '') || 0) + 1)).toISOString(); }
export function saveDatasetQuality(id: string, input: Pick<QualityRecord,'result'|'criteria'|'metrics'|'comment'>, expectedVersion: string) {
  const all=getDatasets(), d=all.find(d=>d.id===id); if(!d)throw new Error('数据集已不存在。');
  assertProjectAccess(readProjects().find(p=>p.id===d.projectId));
  if(d.updatedAt!==expectedVersion)throw new Error('数据集已更新，请重新打开质检表单。');
  if(!['合格','异常'].includes(input.result))throw new Error('请选择有效的质检结论。');
  if(!input.criteria.trim()||!input.comment.trim())throw new Error('请填写检查依据和复核意见。');
  if(input.result==='合格'&&(!d.files.length||d.files.some(f=>!f.hasContent)))throw new Error('文件内容不完整，请先补齐实际文件后再登记合格。');
  const actor=getIdentity(),time=nextTimestamp(d.updatedAt);
  const record:QualityRecord={...input,criteria:input.criteria.trim(),comment:input.comment.trim(),metrics:input.metrics.trim(),id:crypto.randomUUID(),actorId:actor.personId,actorName:actor.name,time,fingerprint:datasetFingerprint(d)};
  commit(all.map(item=>item.id===id?{...item,quality:input.result,rsq:input.metrics.trim()||'-',updatedAt:time,qualityHistory:[record,...(item.qualityHistory||[])]}:item));
}
