import { useState } from 'react';
import { Plus, Search, FlaskConical, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Sample } from '../types';
import { useProjects } from '../lib/projectStore';
import { useSamples, deleteSample, SAMPLE_STATUSES } from '../lib/sampleStore';
import { SampleEditor, sampleControl } from './SampleEditor';

import { useDatasets, effectiveSampleLinks } from '../lib/datasetStore';
import { SampleDatasets } from './DatasetViews';

export function SampleManagement() {
  const samples = useSamples();
  const [projects] = useProjects();
  const datasets = useDatasets();
  const linksFor = (sample: Sample) => effectiveSampleLinks(sample, datasets);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [nodeFilter, setNodeFilter] = useState('');
  const [editor, setEditor] = useState<Sample | null | undefined>();
  const [detailId, setDetailId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [error, setError] = useState('');
  const detail = samples.find(s => s.id === detailId);
  const projectName = (id: string) => projects.find(p => p.id === id)?.name || '项目待核对';
  const nodeName = (pid: string, nid: string) => { const n = projects.find(p => p.id === pid)?.steps?.find(n => n.id === nid); return n ? `${n.order}. ${n.title}` : '节点待核对'; };
  const visible = samples.filter(s => {
    if (projectFilter === 'unlinked' && (linksFor(s).length || s.pendingProjectIds?.length)) return false;
    if (projectFilter !== 'all' && projectFilter !== 'unlinked' && !linksFor(s).some(l => l.projectId === projectFilter && (!nodeFilter || l.nodeId === nodeFilter)) && !(s.pendingProjectIds?.includes(projectFilter) && !nodeFilter)) return false;
    return `${s.number} ${s.name} ${s.sampleType} ${s.batch} ${linksFor(s).map(l => `${projectName(l.projectId)} ${nodeName(l.projectId, l.nodeId)}`).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const exportCsv = () => {
    const cell = (value: string) => '"' + (/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replace(/"/g, '""') + '"';
    const rows = [['样本编号', '样本名称', '样本类型', '批次编号', '数量', '单位', '存放位置', '保管人', '状态', '入库日期', '项目及实验节点'], ...visible.map(s => [s.number, s.name, s.sampleType, s.batch, s.quantity, s.unit, s.storageLocation, s.owner, SAMPLE_STATUSES[s.status], s.receivedAt, [...linksFor(s).map(l => `${projectName(l.projectId)} / ${nodeName(l.projectId, l.nodeId)}`), ...(s.pendingProjectIds || []).map(id => `${projectName(id)} / 待补充节点`)].join('；')])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = '科研样本台账.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="p-6 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-bold text-xl flex items-center gap-2"><FlaskConical className="size-5 text-sky-600" />样本管理</h1><p className="text-sm text-slate-500 mt-2">统一登记科研样本，按项目与实验节点追踪使用关系。</p></div><div className="flex gap-2"><Button variant="outline" onClick={exportCsv}><Download className="size-4 mr-1" />导出台账</Button><Button onClick={() => setEditor(null)}><Plus className="size-4 mr-1" />新增样本</Button></div></div>
    <div className="grid grid-cols-3 gap-3">{[['台账样本', samples.length], ['已关联项目', samples.filter(s => linksFor(s).length).length], ['待关联 / 待补充节点', samples.filter(s => !linksFor(s).length || s.pendingProjectIds?.length).length]].map(([label, count]) => <div key={label} className="rounded-xl bg-white border p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-semibold mt-2">{count}</p></div>)}</div>
    <div className="flex flex-wrap gap-3"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input aria-label="搜索科研样本" className={sampleControl + ' pl-9'} placeholder="搜索样本编号、名称、类型、批次或项目节点" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <select aria-label="样本所属项目筛选" className={sampleControl + ' sm:w-64'} value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setNodeFilter(''); }}><option value="all">全部项目</option><option value="unlinked">未关联项目</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      {projects.some(p => p.id === projectFilter) && <select aria-label="样本实验节点筛选" className={sampleControl + ' sm:w-64'} value={nodeFilter} onChange={e => setNodeFilter(e.target.value)}><option value="">全部节点</option>{projects.find(p => p.id === projectFilter)?.steps?.map(n => <option key={n.id} value={n.id}>{n.order}. {n.title}</option>)}</select>}
    </div>
    <div className="border rounded-xl bg-white overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['样本编号 / 名称', '样本类型', '所属项目', '项目节点', '关联数据集', '状态', '创建时间', '操作'].map(h => <th key={h} className="p-3 text-left whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y">
      {visible.map(s => <tr key={s.id} className="hover:bg-slate-50/50"><td className="p-3"><button onClick={() => setDetailId(s.id)} className="text-sky-700 font-mono text-xs">{s.number}</button><p className="text-xs text-slate-600 mt-1">{s.name}</p></td><td className="p-3 text-xs">{s.sampleType}</td>
        <td className="p-3 text-xs min-w-48">{linksFor(s).map(l => <div key={`${l.projectId}:${l.nodeId}`} className="py-1 min-h-7">{projectName(l.projectId)}</div>)}{s.pendingProjectIds?.map(id => <div key={id} className="py-1 min-h-7">{projectName(id)}</div>)}{!linksFor(s).length && !s.pendingProjectIds?.length && <span className="text-slate-400">未关联项目</span>}</td>
        <td className="p-3 text-xs min-w-40">{linksFor(s).map(l => <div key={`${l.projectId}:${l.nodeId}`} className="py-1 min-h-7">{nodeName(l.projectId, l.nodeId)}</div>)}{s.pendingProjectIds?.map(id => <div key={id} className="py-1 min-h-7 text-amber-700">待补充节点</div>)}{!linksFor(s).length && !s.pendingProjectIds?.length && <span className="text-slate-400">未关联节点</span>}</td>
        <td className="p-3 text-xs whitespace-nowrap"><button className="text-sky-700" aria-label={`查看样本 ${s.number} 的数据集`} onClick={() => setDetailId(s.id)}>{datasets.filter(d => d.sampleIds.includes(s.id)).length} 个数据集</button></td>
        <td className="p-3 text-xs whitespace-nowrap"><span className="rounded-full bg-sky-50 text-sky-700 px-2 py-1">{SAMPLE_STATUSES[s.status]}</span></td><td className="p-3 text-xs whitespace-nowrap">{s.createdAt.slice(0, 10)}</td>
        <td className="p-3 whitespace-nowrap"><Button variant="ghost" size="sm" onClick={() => setDetailId(s.id)}>详情</Button><Button variant="ghost" size="sm" onClick={() => setEditor(s)}>编辑</Button><Button variant="ghost" size="sm" onClick={() => setEditor(s)}>关联项目</Button><Button variant="ghost" size="sm" disabled={!!linksFor(s).length || !!s.pendingProjectIds?.length || datasets.some(d => d.sampleIds.includes(s.id))} title={linksFor(s).length || s.pendingProjectIds?.length || datasets.some(d => d.sampleIds.includes(s.id)) ? '先解除项目和数据集关联，或将样本归档' : '删除未关联样本'} onClick={() => { setDeleteId(s.id); setError(''); }}>删除</Button></td>
      </tr>)}{!visible.length && <tr><td colSpan={8} className="p-12 text-center text-slate-400">暂无匹配样本</td></tr>}
    </tbody></table><p className="border-t p-3 text-xs text-slate-500">共 {visible.length} 个样本 · 同一样本的多次关联只计一次</p></div>
    {editor !== undefined && <SampleEditor sample={editor || undefined} onClose={() => setEditor(undefined)} />}
    {detail && <Dialog open onOpenChange={open => !open && setDetailId('')}><DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>科研样本详情</DialogTitle><DialogDescription>{detail.number} · {detail.name}</DialogDescription></DialogHeader>
      <div className="grid grid-cols-2 gap-4">{[['样本类型', detail.sampleType], ['批次编号', detail.batch], ['数量', `${detail.quantity} ${detail.unit}`.trim()], ['存放位置', detail.storageLocation], ['保管人', detail.owner], ['样本状态', SAMPLE_STATUSES[detail.status]], ['入库日期', detail.receivedAt], ['创建时间', detail.createdAt.slice(0, 10)]].map(([title, value]) => <div key={title}><p className="text-xs text-slate-400">{title}</p><p className="text-sm mt-1">{value || '未填写'}</p></div>)}</div>
      <div className="border-t pt-4 space-y-2"><h3 className="font-semibold text-sm">所属项目与实验节点</h3>{linksFor(detail).map(l => <p key={`${l.projectId}:${l.nodeId}`} className="text-sm">{projectName(l.projectId)} / {nodeName(l.projectId, l.nodeId)}</p>)}{detail.pendingProjectIds?.map(id => <p key={id} className="text-sm text-amber-700">{projectName(id)} / 待补充节点</p>)}{!linksFor(detail).length && !detail.pendingProjectIds?.length && <p className="text-sm text-slate-400">未关联项目节点</p>}</div>
      <SampleDatasets sample={detail} />
      <div className="border-t pt-4"><p className="text-xs text-slate-400">备注</p><p className="text-sm whitespace-pre-wrap mt-1">{detail.notes || '无'}</p></div><DialogFooter><Button onClick={() => { setEditor(detail); setDetailId(''); }}>编辑样本</Button></DialogFooter>
    </DialogContent></Dialog>}
    {!!deleteId && <Dialog open onOpenChange={open => !open && setDeleteId('')}><DialogContent><DialogHeader><DialogTitle>删除未关联样本</DialogTitle><DialogDescription>将从统一台账中删除 {samples.find(s => s.id === deleteId)?.number}。此操作无法撤销。</DialogDescription></DialogHeader>{error && <p role="alert" className="text-rose-700 text-sm">{error}</p>}<DialogFooter><Button variant="outline" onClick={() => setDeleteId('')}>取消</Button><Button variant="destructive" onClick={() => { try { deleteSample(deleteId); setDeleteId(''); } catch(e) { setError((e as Error).message); } }}>确认删除</Button></DialogFooter></DialogContent></Dialog>}
  </div>;
}
