import { DatasetQuality } from './DatasetQuality';
import { useAccessibleDatasets } from '../lib/researchAccess';
import { useState } from 'react';
import { Database, Upload, FileText, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Project, Sample, WorkflowStep } from '../types';
import { useAccessibleProjects } from '../lib/researchAccess';
import { getSamples, useSamples } from '../lib/sampleStore';
import { datasetsAtNode, datasetLocation, DATASET_CATEGORIES, readDatasetFile, deleteDataset, setSampleDatasets, type ResearchDataset, type DatasetFile } from '../lib/datasetStore';
import { DatasetEditor } from './DatasetEditor';
import { sampleControl } from './SampleEditor';

export function DatasetFiles({ dataset }: { dataset: ResearchDataset }) {
  const [error, setError] = useState(''), [preview, setPreview] = useState<{name: string; text: string} | null>(null);
  const open = async (file: DatasetFile, download: boolean) => { try {
    setError(''); const blob = await readDatasetFile(file.id);
    if (download) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    else setPreview({ name: file.name, text: await blob.slice(0, 524288).text() + (blob.size > 524288 ? '\n…仅预览前 512 KB，完整内容请下载。' : '') });
  } catch(e) { setError((e as Error).message); } };
  return <div className="space-y-2">{error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    {dataset.files.map(f => <div key={f.id} className="flex items-center gap-3 border rounded-lg p-3 bg-white"><FileText className="size-4 text-sky-600 shrink-0" /><div className="min-w-0 flex-1"><p className="text-xs font-medium break-all">{f.name}</p><p className="text-[11px] text-slate-400 mt-1">{f.size} · {f.format} · {f.hasContent ? '已保存文件' : '历史文件登记，待补充内容'}</p></div><div className="flex gap-1 shrink-0">{f.hasContent && /\.(csv|tsv|txt|json|fasta|fa|log)$/i.test(f.name) && <Button variant="ghost" size="sm" aria-label={`预览文件 ${f.name}`} onClick={() => open(f, false)}>预览</Button>}<Button variant="outline" size="sm" disabled={!f.hasContent} aria-label={`下载文件 ${f.name}`} onClick={() => open(f, true)}>下载</Button></div></div>)}
    {!dataset.files.length && <p className="rounded-lg border border-dashed p-5 text-center text-xs text-slate-400">暂无文件明细，可在编辑数据集时添加文件。</p>}
    {preview && <Dialog open onOpenChange={v => !v && setPreview(null)}><DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>文件预览</DialogTitle><DialogDescription>{preview.name}</DialogDescription></DialogHeader><pre className="p-4 bg-slate-50 border rounded-lg text-xs overflow-auto whitespace-pre-wrap break-all">{preview.text}</pre></DialogContent></Dialog>}
  </div>;
}

export function DatasetDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const [projects] = useAccessibleProjects(), samples = useSamples(), datasets = useAccessibleDatasets();
  const dataset = datasets.find(d => d.id === id);
  const [editing, setEditing] = useState(false);
  const loc = dataset ? datasetLocation(dataset, projects) : null;
  return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>数据集详情与对应关系</DialogTitle><DialogDescription>{dataset?.name || '该数据集已删除'}</DialogDescription></DialogHeader>
    {dataset && <div className="space-y-5"><div className="rounded-xl border border-sky-200 bg-sky-50 p-4 space-y-2 text-xs"><p><span className="text-slate-400">所属项目：</span>{loc?.project}</p><p><span className="text-slate-400">实验节点：</span>{loc?.node}</p><p><span className="text-slate-400">数据集：</span>{dataset.name}</p><p className="text-slate-500">{dataset.files.length} 个文件 · {dataset.sampleIds.length} 个关联样本</p></div>
      <div className="grid grid-cols-2 gap-3 text-xs">{[['数据集编号',dataset.id],['类别',DATASET_CATEGORIES[dataset.category]],['数据大小',dataset.size],['文件格式',dataset.format],['质检指标',dataset.rsq],['负责人',dataset.owner || '未填写'],['仪器 / 数据来源',dataset.instrument || '未填写'],['质检状态',dataset.quality],['更新日期',dataset.updatedAt.slice(0,10)]].map(([k,v])=><div key={k}><p className="text-slate-400 mb-1">{k}</p><p className="break-all">{v}</p></div>)}</div>
      {dataset.description && <p className="text-sm whitespace-pre-wrap">{dataset.description}</p>}
      <section className="space-y-2"><h3 className="font-semibold text-sm">包含样本</h3>{dataset.sampleIds.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{dataset.sampleIds.map(id => {const sample=samples.find(s=>s.id===id);return <div key={id} className="border rounded-lg p-3 text-xs"><p>{sample?.number || id}</p><p className="mt-1 text-slate-500">{sample?.name || '样本待核对'} · {sample?.sampleType}</p></div>;})}</div> : <p className="text-xs text-slate-400">未关联样本，可在编辑中选择。</p>}</section>
      <section className="space-y-2"><h3 className="font-semibold text-sm">数据文件</h3><DatasetFiles dataset={dataset} /></section>
      <DatasetQuality id={dataset.id} />
      <DialogFooter><Button variant="outline" onClick={onClose}>关闭</Button><Button onClick={()=>setEditing(true)}>编辑数据集与关联</Button></DialogFooter>
    </div>}{editing && dataset && <DatasetEditor dataset={dataset} onClose={()=>setEditing(false)} />}
  </DialogContent></Dialog>;
}

export function DatasetDelete({ dataset, onClose }: { dataset: ResearchDataset; onClose: () => void }) {
  const [error,setError]=useState('');
  return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent><DialogHeader><DialogTitle>删除数据集</DialogTitle><DialogDescription>将删除“{dataset.name}”及其文件，解除它与节点、样本的对应关系。样本台账保留；此操作无法撤销。</DialogDescription></DialogHeader>{error&&<p role="alert" className="text-xs text-rose-700">{error}</p>}<DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button variant="destructive" onClick={async()=>{try{await deleteDataset(dataset.id);onClose();}catch(e){setError((e as Error).message);}}}>确认删除数据集</Button></DialogFooter></DialogContent></Dialog>;
}

export function NodeDatasets({ project, step }: { project: Project; step: WorkflowStep }) {
  const datasets=useAccessibleDatasets(), samples=useSamples();const related=datasetsAtNode(datasets,project.id,step.id);
  const [editor,setEditor]=useState<ResearchDataset|null|undefined>(),[detail,setDetail]=useState(''),[deleting,setDeleting]=useState<ResearchDataset|null>(null);
  return <section className="space-y-4"><div className="rounded-xl bg-sky-50 border border-sky-200 p-4 text-xs space-y-2"><p className="text-slate-500">{project.number} · {project.name}</p><p className="font-semibold text-sky-800">{step.order}. {step.title}</p><p>{related.length} 个数据集 · {related.reduce((n,d)=>n+d.files.length,0)} 个文件 · {new Set(related.flatMap(d=>d.sampleIds)).size} 个来源样本</p></div>
    <div className="flex flex-wrap gap-2 items-center justify-between"><h3 className="font-semibold text-sm flex items-center gap-2"><Database className="size-4 text-sky-600" />节点文件与数据集</h3><Button size="sm" onClick={()=>setEditor(null)}><Upload className="size-3 mr-1" />新增数据集 / 上传文件</Button></div>
    <p className="text-xs text-slate-500">文件按所属数据集归集，与数据集管理同步。可编辑已有数据集来补充文件或关联样本。</p>
    {related.map(d=><article key={d.id} data-dataset-id={d.id} className="rounded-xl border bg-white p-4 space-y-3"><div className="flex flex-wrap justify-between gap-2"><div className="min-w-0 flex-1"><button className="text-sm font-semibold text-sky-700 text-left" onClick={()=>setDetail(d.id)}>{d.name}</button><p className="text-[10px] text-slate-400 break-all mt-1">{d.id} · {DATASET_CATEGORIES[d.category]} · {d.quality}</p></div><div className="flex gap-1"><Button variant="outline" size="sm" onClick={()=>setDetail(d.id)}>详情 / 质检</Button><Button variant="outline" size="sm" onClick={()=>setEditor(d)}>编辑 / 添加文件</Button><Button variant="ghost" size="sm" onClick={()=>setDeleting(d)}>删除数据集</Button></div></div>
      <div className="text-xs text-slate-500"><span>关联样本：</span>{d.sampleIds.length?d.sampleIds.map(id=>{const sample=samples.find(s=>s.id===id);return <span key={id} className="inline-block bg-sky-50 rounded px-2 py-1 mr-1 mb-1">{sample?.number || id} · {sample?.name || '待核对'}</span>;}):'未关联样本'}</div><DatasetFiles dataset={d}/>
    </article>)}{!related.length&&<div className="border border-dashed rounded-xl p-8 text-center text-sm text-slate-400">当前节点暂无数据集，可新建并添加文件。</div>}
    {editor!==undefined&&<DatasetEditor dataset={editor||undefined} projectId={project.id} nodeId={step.id} onClose={()=>setEditor(undefined)}/>}{detail&&<DatasetDetail id={detail} onClose={()=>setDetail('')}/>}{deleting&&<DatasetDelete dataset={deleting} onClose={()=>setDeleting(null)}/>}
  </section>;
}

export function SampleDatasets({ sample }: { sample: Sample }) {
  const [projects]=useAccessibleProjects(), datasets=useAccessibleDatasets();
  const related=datasets.filter(d=>d.sampleIds.includes(sample.id));
  const [editing,setEditing]=useState(false),[selected,setSelected]=useState<string[]>([]),[query,setQuery]=useState(''),[error,setError]=useState(''),[detail,setDetail]=useState('');
  return <section className="space-y-3 border-t pt-4"><div className="flex justify-between items-center gap-2"><h3 className="font-semibold text-sm">关联数据集 · {related.length} 个</h3><Button variant="outline" size="sm" onClick={()=>{setSelected(related.map(d=>d.id));setEditing(true);setError('');}}><Link2 className="size-3 mr-1"/>管理数据集关联</Button></div>
    {related.map(d=>{const loc=datasetLocation(d,projects);return <div key={d.id} className="border rounded-lg p-3 text-xs space-y-1"><button className="font-semibold text-sky-700" onClick={()=>setDetail(d.id)}>{d.name}</button><p className="text-slate-500">{loc.project} / {loc.node}</p><p className="text-slate-400">{d.files.length} 个文件 · 包含 {d.sampleIds.length} 个样本</p></div>;})}{!related.length&&<p className="text-xs text-slate-400">此样本尚未关联数据集。</p>}
    {editing&&<div className="border rounded-lg bg-slate-50 p-3 space-y-3"><p className="text-xs text-slate-500">选择此样本产生的数据集；取消勾选只解除当前样本的关联。</p><input aria-label="搜索关联数据集" className={sampleControl} value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索数据集名称、项目或节点"/><div className="max-h-64 overflow-auto bg-white border rounded-lg divide-y">{datasets.filter(d=>{const loc=datasetLocation(d,projects);return `${d.id} ${d.name} ${loc.project} ${loc.node}`.toLowerCase().includes(query.trim().toLowerCase());}).map(d=>{const loc=datasetLocation(d,projects);return <label key={d.id} className="p-3 flex gap-3 text-xs cursor-pointer"><input type="checkbox" aria-label={`关联数据集 ${d.name}`} checked={selected.includes(d.id)} onChange={e=>setSelected(ids=>e.target.checked?[...ids,d.id]:ids.filter(id=>id!==d.id))}/><span>{d.name}<span className="block text-slate-400 mt-1">{loc.project} / {loc.node}</span></span></label>;})}</div>{error&&<p role="alert" className="text-xs text-rose-700">{error}</p>}<div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={()=>setEditing(false)}>取消关联修改</Button><Button size="sm" onClick={()=>{try{setSampleDatasets(sample.id,selected,getSamples());setEditing(false);}catch(e){setError((e as Error).message);}}}>保存数据集关联</Button></div></div>}
    {detail&&<DatasetDetail id={detail} onClose={()=>setDetail('')}/>}
  </section>;
}
