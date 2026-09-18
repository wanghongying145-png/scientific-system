import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDatasets, saveDatasetQuality } from '../lib/datasetStore';
import { useProjects } from '../lib/projectStore';
import { canAccessProject, useIdentity } from '../lib/session';
import { currentQuality, datasetFingerprint, verifiedQuality } from '../lib/reviewDomain';
import { sampleControl } from './SampleEditor';

export function DatasetQuality({id}:{id:string}) {
 const datasets=useDatasets(),[projects]=useProjects(),actor=useIdentity(),d=datasets.find(d=>d.id===id);
 const [editing,setEditing]=useState(false),[version,setVersion]=useState(''),[result,setResult]=useState<'合格'|'异常'>('合格'),[criteria,setCriteria]=useState(''),[metrics,setMetrics]=useState(''),[comment,setComment]=useState(''),[error,setError]=useState('');
 if(!d)return null;const p=projects.find(p=>p.id===d.projectId);if(!p||!canAccessProject(p,actor))return null;
 const record=d.qualityHistory?.[0],ready=d.files.length>0&&d.files.every(f=>f.hasContent);
 return <section className="space-y-3 border-t pt-4" data-quality-panel><div className="flex justify-between gap-3 items-center"><div><h3 className="text-sm font-semibold">数据集质检 · {currentQuality(d)}</h3><p className="text-xs text-slate-500 mt-1">{verifiedQuality(d)?'当前文件与样本版本已复核':record?'数据或结论发生变化时，需要复核当前版本。':d.quality==='待质检'?'当前版本尚未质检。':'暂无质检记录，历史结论需复核后才能提交审签。'}</p></div><Button size="sm" variant="outline" onClick={()=>{setEditing(true);setVersion(d.updatedAt);setError('');setCriteria('');setMetrics('');setComment('');}}>登记质检</Button></div>
 {editing&&<div className="p-4 rounded-xl bg-slate-50 border space-y-3"><p className="text-xs text-slate-500">复核人：{actor.name}。质检结论由人工复核登记。</p>{!ready&&<p className="text-xs text-amber-700">当前文件内容不完整。记录“合格”前需添加实际文件，并补齐历史文件内容。</p>}
 <label className="block text-xs space-y-1">质检结论<select aria-label="质检结论" className={sampleControl} value={result} onChange={e=>setResult(e.target.value as typeof result)}><option>合格</option><option>异常</option></select></label>
 <label className="block text-xs space-y-1">检查依据 *<textarea aria-label="质检检查依据" className={sampleControl} value={criteria} onChange={e=>setCriteria(e.target.value)} placeholder="填写采用的检查方法、标准及阈值"/></label>
 <label className="block text-xs space-y-1">实测指标<input aria-label="质检实测指标" className={sampleControl} value={metrics} onChange={e=>setMetrics(e.target.value)} placeholder="例如完整率 100%、重复测量 CV 2%"/></label>
 <label className="block text-xs space-y-1">复核意见 *<textarea aria-label="质检复核意见" className={sampleControl} value={comment} onChange={e=>setComment(e.target.value)}/></label>
 {error&&<p role="alert" className="text-xs text-rose-700">{error}</p>}<div className="flex gap-2 justify-end"><Button size="sm" variant="outline" onClick={()=>setEditing(false)}>取消质检</Button><Button size="sm" onClick={()=>{try{saveDatasetQuality(id,{result,criteria,metrics,comment},version);setEditing(false);}catch(e){setError((e as Error).message);}}}>保存质检结论</Button></div></div>}
 {!!d.qualityHistory?.length&&<details className="border rounded-lg p-3 text-xs"><summary className="cursor-pointer">质检历史 · {d.qualityHistory.length} 条</summary><div className="divide-y mt-2">{d.qualityHistory.map(r=><div key={r.id} className="py-3 space-y-1"><p className="font-medium">{r.result} · {r.actorName} · {new Date(r.time).toLocaleString('zh-CN')}{r.fingerprint!==datasetFingerprint(d)&&' · 对应历史版本'}</p><p>检查依据：{r.criteria}</p><p>实测指标：{r.metrics||'未填写'}</p><p className="whitespace-pre-wrap">复核意见：{r.comment}</p></div>)}</div></details>}
 </section>;
}
