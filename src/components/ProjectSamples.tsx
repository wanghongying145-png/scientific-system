import { useState } from 'react';
import { Plus, Link2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project, Sample } from '../types';
import { getProjects } from '../lib/projectStore';
import { associateSamples, unlinkSample, useSamples, SAMPLE_STATUSES } from '../lib/sampleStore';
import { SampleEditor, sampleControl } from './SampleEditor';

import { useDatasets, effectiveSampleLinks } from '../lib/datasetStore';
import { DatasetDetail } from './DatasetViews';

export function ProjectSamples({ project, initialNodeId = '' }: { project: Project; initialNodeId?: string }) {
  const samples = useSamples();
  const datasets = useDatasets();
  const [datasetDetail, setDatasetDetail] = useState('');
  const [nodeFilter, setNodeFilter] = useState(initialNodeId);
  const [editor, setEditor] = useState<Sample | null | undefined>();
  const [associating, setAssociating] = useState(false);
  const [targetNode, setTargetNode] = useState(initialNodeId);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const linked = samples.filter(s => effectiveSampleLinks(s, datasets).some(l => l.projectId === project.id && (!nodeFilter || l.nodeId === nodeFilter)) || (!nodeFilter && s.pendingProjectIds?.includes(project.id)));
  const candidates = samples.filter(s => `${s.number} ${s.name} ${s.sampleType}`.toLowerCase().includes(search.trim().toLowerCase()));
  const associate = () => { try { associateSamples(selected, { projectId: project.id, nodeId: targetNode }, getProjects()); setAssociating(false); setSelected([]); setError(''); } catch(e) { setError((e as Error).message); } };
  const unlink = (id: string, nodeId?: string) => { try { unlinkSample(id, project.id, nodeId); setError(''); } catch(e) { setError((e as Error).message); } };
  return <section className="space-y-4">
    <div className="flex flex-wrap justify-between items-center gap-3"><div><h3 className="font-semibold flex gap-2 items-center"><FlaskConical className="size-4 text-sky-600" />项目样本 · {linked.length} 个</h3><p className="text-xs text-slate-500 mt-1">展示直接关联及数据集使用的样本。数据集来源关系需在对应数据集中调整。</p></div><div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => { setAssociating(true); setTargetNode(nodeFilter); setSelected([]); setError(''); }}><Link2 className="size-3 mr-1" />关联台账样本</Button>
      <Button size="sm" onClick={() => setEditor(null)}><Plus className="size-3 mr-1" />新增样本</Button>
    </div></div>
    <label className="block text-xs text-slate-500 space-y-1">实验节点筛选<select aria-label="项目样本节点" className={sampleControl} value={nodeFilter} onChange={e => setNodeFilter(e.target.value)}><option value="">全部实验节点</option>{project.steps?.map(s => <option key={s.id} value={s.id}>{s.order}. {s.title}</option>)}</select></label>
    {error && <p role="alert" className="text-xs text-rose-700 bg-rose-50 rounded-lg p-3">{error}</p>}
    {associating && <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
      <h4 className="font-semibold text-sm">从统一台账选择样本</h4>
      <label className="block space-y-1 text-xs">关联到实验节点 *<select aria-label="关联目标节点" className={sampleControl} value={targetNode} onChange={e => { setTargetNode(e.target.value); setSelected([]); }}><option value="">请选择节点</option>{project.steps?.map(s => <option key={s.id} value={s.id}>{s.order}. {s.title}</option>)}</select></label>
      <input aria-label="搜索台账样本" className={sampleControl} value={search} onChange={e => setSearch(e.target.value)} placeholder="按样本编号、名称或类型搜索" />
      <div className="max-h-64 overflow-auto border rounded-lg bg-white divide-y">{candidates.length ? candidates.map(s => {
        const already = s.links.some(l => l.projectId === project.id && l.nodeId === targetNode);
        return <label key={s.id} className="flex items-center gap-3 p-3 text-sm cursor-pointer"><input type="checkbox" aria-label={`选择样本 ${s.number}`} disabled={already} checked={already || selected.includes(s.id)} onChange={e => setSelected(ids => e.target.checked ? [...ids, s.id] : ids.filter(id => id !== s.id))} /><span className="flex-1"><span className="font-medium">{s.number} · {s.name}</span><span className="block text-xs text-slate-500">{s.sampleType} · {SAMPLE_STATUSES[s.status]}</span></span>{already && <span className="text-xs text-sky-600">已关联此节点</span>}</label>;
      }) : <p className="p-6 text-center text-sm text-slate-400">暂无匹配样本，可先新增到台账。</p>}</div>
      <div className="flex justify-end gap-2 items-center"><span className="text-xs text-slate-500 mr-auto">本次选择 {selected.length} 个样本</span><Button variant="outline" size="sm" onClick={() => { setAssociating(false); setSelected([]); setError(''); }}>取消关联</Button><Button size="sm" onClick={associate}>确认关联</Button></div>
    </div>}
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['样本编号 / 名称', '类型', '实验节点', '状态', '操作'].map(h => <th key={h} className="text-left px-3 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">
      {linked.map(s => <tr key={s.id}><td className="p-3"><span className="font-mono text-xs">{s.number}</span><p className="text-xs mt-1">{s.name}</p></td><td className="p-3 text-xs">{s.sampleType}</td><td className="p-3 space-y-2">{s.links.filter(l => l.projectId === project.id && (!nodeFilter || l.nodeId === nodeFilter)).map(l => <div key={l.nodeId} className="flex flex-wrap items-center gap-2 text-xs"><span>{project.steps?.find(n => n.id === l.nodeId)?.title || '节点待核对'}</span><button className="text-slate-400 hover:text-rose-600" aria-label={`解除 ${s.number} 节点 ${l.nodeId}`} onClick={() => unlink(s.id, l.nodeId)}>解除关联</button></div>)}{datasets.filter(d => d.projectId === project.id && d.sampleIds.includes(s.id) && (!nodeFilter || d.nodeId === nodeFilter)).map(d => <div key={d.id} className="text-xs text-slate-500"><span>{project.steps?.find(n => n.id === d.nodeId)?.title || '待关联节点'} · 来源数据集：</span><button className="text-sky-700" onClick={() => setDatasetDetail(d.id)}>{d.name}</button></div>)}{s.pendingProjectIds?.includes(project.id) && <div className="text-xs text-amber-700">待补充实验节点 <button className="ml-2 text-slate-400" onClick={() => unlink(s.id)}>解除历史关联</button></div>}</td><td className="p-3 text-xs whitespace-nowrap">{SAMPLE_STATUSES[s.status]}</td><td className="p-3"><Button variant="ghost" size="sm" aria-label={`编辑样本 ${s.number}`} onClick={() => setEditor(s)}>编辑</Button></td></tr>)}
      {!linked.length && <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-400">当前范围暂无样本，可关联台账样本或新增样本。</td></tr>}
    </tbody></table></div>
    {datasetDetail && <DatasetDetail id={datasetDetail} onClose={() => setDatasetDetail('')} />}
    {editor !== undefined && <SampleEditor sample={editor || undefined} projectId={project.id} nodeId={nodeFilter} onClose={() => setEditor(undefined)} />}
  </section>;
}
