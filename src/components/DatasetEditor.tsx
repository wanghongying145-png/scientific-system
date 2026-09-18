import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getProjects } from '../lib/projectStore';
import { useAccessibleProjects } from '../lib/researchAccess';
import { getSamples, useSamples } from '../lib/sampleStore';
import { blankDataset, saveDataset, DATASET_CATEGORIES, formatBytes, type ResearchDataset } from '../lib/datasetStore';
import { sampleControl } from './SampleEditor';

export function DatasetEditor({ dataset, projectId = '', nodeId = '', onClose }: { dataset?: ResearchDataset; projectId?: string; nodeId?: string; onClose: () => void }) {
  const [projects] = useAccessibleProjects(); const samples = useSamples();
  const [draft, setDraft] = useState(() => dataset ? structuredClone(dataset) : blankDataset(projectId, nodeId));
  const [picked, setPicked] = useState<File[]>([]), [query, setQuery] = useState(''), [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const patch = (change: Partial<ResearchDataset>) => setDraft(d => ({ ...d, ...change }));
  const selectedProject = projects.find(p => p.id === draft.projectId);
  const options = samples.filter(s => `${s.number} ${s.name} ${s.sampleType}`.toLowerCase().includes(query.trim().toLowerCase()));
  const submit = async () => { setSaving(true); setError(''); try { await saveDataset(draft, picked, getProjects, getSamples, !dataset); onClose(); } catch(e) { setError((e as Error).message); } finally { setSaving(false); } };
  return <Dialog open onOpenChange={open => !open && !saving && onClose()}><DialogContent className="sm:max-w-3xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden"><DialogHeader className="p-5 border-b"><DialogTitle>{dataset ? '编辑数据集与关联' : '新增数据集'}</DialogTitle><DialogDescription>选择数据集的产出节点，添加文件并关联来源样本。</DialogDescription></DialogHeader>
    <div className="overflow-y-auto min-h-0 p-5 space-y-5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="text-xs space-y-1 sm:col-span-2">数据集名称 *<input aria-label="数据集名称" className={sampleControl} value={draft.name} onChange={e => patch({ name: e.target.value })} placeholder="输入数据集名称" /></label>
      <label className="text-xs space-y-1">数据类别<select aria-label="数据类别" className={sampleControl} value={draft.category} onChange={e => patch({ category: e.target.value as ResearchDataset['category'] })}>{Object.entries(DATASET_CATEGORIES).map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label className="text-xs space-y-1">负责人<input aria-label="数据集负责人" className={sampleControl} value={draft.owner} onChange={e => patch({ owner: e.target.value })} /></label>
      <label className="text-xs space-y-1">所属项目 *<select aria-label="数据集所属项目" className={sampleControl} value={draft.projectId || ''} onChange={e => patch({ projectId: e.target.value, nodeId: '' })}><option value="">选择项目</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label className="text-xs space-y-1">实验节点 *<select aria-label="数据集实验节点" className={sampleControl} value={draft.nodeId || ''} onChange={e => patch({ nodeId: e.target.value })}><option value="">选择实验节点</option>{selectedProject?.steps?.map(n => <option key={n.id} value={n.id}>{n.order}. {n.title}</option>)}</select></label>
      <label className="text-xs space-y-1 sm:col-span-2">仪器 / 数据来源<input aria-label="数据来源" className={sampleControl} value={draft.instrument} onChange={e => patch({ instrument: e.target.value })} /></label>
      <label className="text-xs space-y-1 sm:col-span-2">数据说明<textarea aria-label="数据说明" rows={2} className={sampleControl} value={draft.description} onChange={e => patch({ description: e.target.value })} /></label>
    </div>
    <section className="border-t pt-4 space-y-3"><h3 className="font-semibold text-sm">数据文件 · {draft.files.length + picked.length} 个</h3>
      <label className="block border border-dashed rounded-xl bg-sky-50/40 p-4 text-sm cursor-pointer"><span className="flex gap-2 items-center text-sky-700"><Plus className="size-4" />选择文件，可一次添加多个</span><input aria-label="选择数据文件" type="file" multiple className="block mt-3 text-xs w-full" onChange={e => { const files = Array.from(e.target.files || []); setPicked(old => [...old, ...files]); e.target.value = ''; }} /></label>
      <p className="text-xs text-slate-500">也可先登记数据集，之后补充文件。文件内容保存在当前浏览器。</p>
      <div className="space-y-1">{draft.files.map(f => <div key={f.id} className="flex items-center gap-2 text-xs p-2 border rounded"><span className="flex-1 break-all">{f.name} · {f.size}{!f.hasContent && ' · 历史文件登记'}</span><Button variant="ghost" size="icon" aria-label={`移除文件 ${f.name}`} onClick={() => patch({ files: draft.files.filter(n => n.id !== f.id) })}><Trash2 className="size-3" /></Button></div>)}{picked.map((f,i) => <div key={i} className="flex items-center gap-2 text-xs p-2 border rounded bg-sky-50"><span className="flex-1 break-all">{f.name} · {formatBytes(f.size)} · 待保存</span><Button variant="ghost" size="icon" aria-label={`取消文件 ${f.name}`} onClick={() => setPicked(old => old.filter((_,j) => j !== i))}><Trash2 className="size-3" /></Button></div>)}</div>
    </section>
    <section className="border-t pt-4 space-y-3"><h3 className="text-sm font-semibold">关联样本 · 已选 {draft.sampleIds.length} 个</h3><p className="text-xs text-slate-500">可选择多个台账样本；同一样本也可关联其他数据集。</p>
      <input aria-label="搜索数据集样本" className={sampleControl} placeholder="搜索样本编号、名称或类型" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="max-h-56 overflow-y-auto border rounded-xl divide-y">{options.map(s => <label key={s.id} className="flex gap-3 items-center p-3 text-xs cursor-pointer"><input type="checkbox" aria-label={`包含样本 ${s.number}`} checked={draft.sampleIds.includes(s.id)} onChange={e => patch({ sampleIds: e.target.checked ? [...draft.sampleIds, s.id] : draft.sampleIds.filter(id => id !== s.id) })} /><span className="flex-1">{s.number} · {s.name}<span className="block text-slate-400 mt-1">{s.sampleType}</span></span>{s.links.some(l => l.projectId === draft.projectId && l.nodeId === draft.nodeId) && <span className="text-sky-600">当前节点样本</span>}</label>)}{!options.length && <p className="p-5 text-xs text-center text-slate-400">暂无匹配样本，请先在样本台账登记。</p>}</div>
    </section></div><div className="p-4 border-t">{error && <p role="alert" className="p-3 mb-3 rounded-lg bg-rose-50 text-rose-700 text-xs">{error}</p>}<DialogFooter><Button variant="outline" disabled={saving} onClick={onClose}>取消</Button><Button disabled={saving} onClick={submit}>{saving ? '正在保存…' : '保存数据集'}</Button></DialogFooter></div>
  </DialogContent></Dialog>;
}
