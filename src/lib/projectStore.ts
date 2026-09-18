import { useSyncExternalStore, type SetStateAction } from 'react';
import type { Project, PI } from '../types';
import { DEFAULT_PIS, makeSteps, PROJECT_PEOPLE } from './projectDomain';
import { LEGACY_ENZYME_STEPS } from './projectSeed';

import { getSeedDatasets, PROJECT_ALIASES } from './datasetSeed';

import { getDatasets, subscribeDatasets, type ResearchDataset } from './datasetStore';
import { materializeReview, reviewSignature } from './reviewDomain';
import { getSamples } from './sampleStore';

const PROJECT_KEY = 'research_projects_v1';
const PI_KEY = 'research_project_pis_v1';
function seedProjects(): Project[] {
  const definitions = [
    ['enz-01', 'BIO-2026-ENZ-01', '工业耐高温植酸酶（Phytase）理性重塑与定向进化', 'enzyme', 'pi-zhang'],
    ['pet-02', 'BIO-2026-PET-02', '高效耐热型 PET 塑料水解酶（IsPETase）结构改造与降解优化', 'enzyme', 'pi-zhang'],
    ['ata-03', 'BIO-2026-ATA-03', '高选择性手性ω-转氨酶（ATA）立体定向催化与耐有机相改造', 'enzyme', 'pi-zhang'],
    ['calb-04', 'BIO-2026-CALB-04', '极端环境假丝酵母脂肪酶B（CALB）固定化与发酵中试放大', 'enzyme', 'pi-zhang'],
    ['1', 'PROJ-2024-001', '呼吸道病毒高通量筛查研究', 'sequencing', 'pi-1'],
    ['2', 'PROJ-2024-002', '肿瘤免疫微环境单细胞测序', 'single-cell', 'pi-2'],
  ] as const;
  return definitions.map(([id, number, name, researchType, piId]) => {
    const pi = DEFAULT_PIS.find(p => p.id === piId)!;
    const steps = id === 'enz-01' ? structuredClone(LEGACY_ENZYME_STEPS) : makeSteps(researchType, pi.name);
    for (const step of steps) {
      step.templateTitle = step.title;
      step.linkedDatasetIds = getSeedDatasets().filter(d => PROJECT_ALIASES[d.project] === id && d.node.replace(/^\d+\.\s*/, '') === step.title).map(d => d.id);
    }
    return { id, number, name, piId, piName: pi.name, institution: pi.institution, department: pi.department, status: id === '2' ? 'completed' : 'active',
      createdAt: id === 'enz-01' ? '2026-01-10' : id === '1' ? '2024-01-15' : id === '2' ? '2024-02-10' : '2026-02-18', researchType, members: structuredClone(PROJECT_PEOPLE.slice(0, 3)),
      objective: id === 'enz-01' ? '提高植酸酶热稳定性，目标 Tm ≥ 85℃，比活力不低于野生型的 80%。' : '',
      plan: id === 'enz-01' ? '开展计算设计与突变体构建，完成表达、纯化和酶学验证，形成研究报告并归档。' : '',
      startDate: id === 'enz-01' ? '2026-01-10' : '', endDate: id === 'enz-01' ? '2026-12-31' : '', steps,
    } satisfies Project;
  });
}

function persistedStore<T>(key: string, initial: () => T[]) {
  let cache: T[] | undefined;
  let lastRaw: string | null | undefined;
  const listeners = new Set<() => void>();
  function get() {
    const raw = localStorage.getItem(key);
    if (cache && raw === lastRaw) return cache;
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('已保存的数据格式异常，请保留浏览器数据并联系管理员。');
      cache = parsed;
    } else {
      cache = initial();
      // Persist generated node IDs on first read so they survive refreshes.
      localStorage.setItem(key, JSON.stringify(cache));
    }
    lastRaw = localStorage.getItem(key);
    return cache!;
  }
  function set(action: SetStateAction<T[]>) {
    const next = typeof action === 'function' ? action(get()) : action;
    if (key === PROJECT_KEY) {
      const before = get() as unknown as Project[];
      const after = next as unknown as Project[];
      for (const dataset of getDatasets()) {
        const oldProject = before.find(p => p.id === dataset.projectId), newProject = after.find(p => p.id === dataset.projectId);
        if (oldProject && !newProject) throw new Error('项目仍有关联数据集，请先调整数据集归属后再删除。');
        if (oldProject?.steps?.some(s => s.id === dataset.nodeId) && !newProject?.steps?.some(s => s.id === dataset.nodeId)) throw new Error('实验节点仍有关联数据集，无法删除。');
      }
      for (const sample of getSamples()) {
        for (const id of sample.pendingProjectIds || []) {
          if (before.some(p => p.id === id) && !after.some(p => p.id === id)) throw new Error('项目仍有待补充节点的样本关联，请先处理项目样本。');
        }
        for (const link of sample.links) {
          const oldProject = before.find(p => p.id === link.projectId), newProject = after.find(p => p.id === link.projectId);
          if (oldProject && !newProject) throw new Error('项目仍有关联样本，请先解除关联后再删除项目。');
          if (oldProject?.steps?.some(s => s.id === link.nodeId) && !newProject?.steps?.some(s => s.id === link.nodeId)) throw new Error('实验节点仍有关联样本，无法删除。');
        }
      }
    }
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { throw new Error('浏览器存储空间不足或不可用，未保存本次修改。'); }
    cache = next;
    lastRaw = localStorage.getItem(key);
    listeners.forEach(l => l());
  }
  const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
  window.addEventListener('storage', e => { if (e.key === key || e.key === null) { listeners.forEach(l => l()); } });
  return { get, set, subscribe };
}
const projects = persistedStore<Project>(PROJECT_KEY, seedProjects);
const pis = persistedStore<PI>(PI_KEY, () => structuredClone(DEFAULT_PIS));
let normalized = false;
function getStoredProjects() {
  const current = projects.get();
  if (normalized) return current;
  normalized = true;
  const seedData = getSeedDatasets();
  const datasets = getDatasets();
  const next = current.map(p => ({ ...p, steps: p.steps?.map(s => {
    const originalTitle = s.templateTitle || (p.id === 'enz-01' ? LEGACY_ENZYME_STEPS.find(old => old.id === s.id)?.title : '') || s.title;
    return { ...s, legacyReviewBasis: s.legacyReviewBasis || (!s.review && (s.status === 'completed' || s.piStatus.includes('审核通过')) ? reviewSignature(p,s,datasets) : undefined), templateTitle: originalTitle, linkedDatasetIds: s.linkedDatasetIds || seedData.filter(d => PROJECT_ALIASES[d.project] === p.id && d.node.replace(/^\d+\.\s*/, '') === originalTitle).map(d => d.id) };
  }) }));
  if (JSON.stringify(next) !== JSON.stringify(current)) { projects.set(next); return next; }
  return current;
}
let derivedSource: Project[] | undefined, derivedDatasets: ResearchDataset[] | undefined, derived: Project[];
export function getProjects(): Project[] {
  const source=getStoredProjects(),datasets=getDatasets();
  if(source===derivedSource&&datasets===derivedDatasets)return derived;
  derivedSource=source;derivedDatasets=datasets;
  derived=source.map(p=>{const steps=p.steps?.map(n=>materializeReview(p,n,datasets));return {...p,steps,status:p.status==='completed'&&steps?.some(n=>n.review&&n.status!=='completed')?'active':p.status};});
  return derived;
}
export function updateProjects(action: SetStateAction<Project[]>) { projects.set(typeof action==='function'?action(getProjects()):action); }
const subscribeProjects=(l:()=>void)=>{const a=projects.subscribe(l),b=subscribeDatasets(l);return()=>{a();b();};};
export function useProjects() { return [useSyncExternalStore(subscribeProjects, getProjects), updateProjects] as const; }
export function useProjectPIs() { return [useSyncExternalStore(pis.subscribe, pis.get), pis.set] as const; }
