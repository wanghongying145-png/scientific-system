import { getProjects } from '../lib/projectStore';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project, WorkflowStep } from '../types';
import { useDatasets, datasetsAtNode } from '../lib/datasetStore';
import { ACTION_LABELS, REVIEW_LABELS, reviewSignature, reviewState, verifiedQuality, type ReviewAction } from '../lib/reviewDomain';
import { submitNodeReview } from '../lib/reviewActions';
import { useIdentity, canSignProject, canAccessProject } from '../lib/session';
import { sampleControl } from './SampleEditor';
import { DatasetDetail } from './DatasetViews';

export function NodeReviewPanel({project,step}:{project:Project;step:WorkflowStep}) {
 const datasets=useDatasets(),actor=useIdentity(),related=datasetsAtNode(datasets,project.id,step.id),state=reviewState(project,step,datasets);
 const [decision,setDecision]=useState<ReviewAction>('approve'),[comment,setComment]=useState(''),[reason,setReason]=useState(step.review?.noDataReason||''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[detail,setDetail]=useState('');
 // Capture the version at the start of editing, so cross-tab updates cannot silently replace the signed basis.
 const [basis,setBasis]=useState(()=>({signature:reviewSignature(project,step,datasets),logId:step.review?.logs[0]?.id||''}));
 const signature=reviewSignature(project,step,datasets),logId=step.review?.logs[0]?.id||'',changed=basis.signature!==signature||basis.logId!==logId;
 const sign=canSignProject(project,actor),access=canAccessProject(project,actor),canSubmit=!['pending','approved'].includes(state);
 const submit=(action:ReviewAction)=>{try{submitNodeReview(project.id,step.id,action,comment,reason,basis.signature,basis.logId);const updated=getProjects().find(p=>p.id===project.id)!;const node=updated.steps!.find(n=>n.id===step.id)!;setBasis({signature:reviewSignature(updated,node,datasets),logId:node.review?.logs[0]?.id||''});setComment('');setError('');setNotice(action==='submit'?'已提交 PI 审签，工作台待办已更新。':'审签决定已保存，节点状态与工作台已同步。');}catch(e){setError((e as Error).message);}};
 return <div className="space-y-5" data-node-review><div className="border rounded-xl p-5 bg-white flex justify-between gap-3"><div><h3 className="font-semibold flex gap-2 items-center"><ShieldCheck className="size-5 text-sky-600"/>PI 审核与批复</h3><p className="text-xs text-slate-500 mt-2">项目 PI：{project.piName} · 当前用户：{actor.name}</p></div><span className="text-sm text-sky-800">{REVIEW_LABELS[state]}</span></div>
 {!step.review&&step.piRecordsCount>0&&<p className="text-xs text-slate-500">原节点存在历史审签摘要。新流程从本次提交开始保存完整审签记录。</p>}
 {state==='stale'&&<p className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">审签依据已发生变化，原通过结论不再适用于当前数据，请复核后重新提交。</p>}
 <section className="bg-white border rounded-xl p-4 space-y-3"><h4 className="text-sm font-semibold">审签依据 · {related.length} 个数据集</h4>{related.map(d=><button key={d.id} onClick={()=>setDetail(d.id)} className="block w-full border rounded-lg p-3 text-left text-xs"><span className="text-sky-700">{d.name}</span><span className="float-right">{verifiedQuality(d)?'当前版本质检合格':d.quality==='异常'?'质检异常':'需完成当前版本质检'}</span><p className="text-slate-400 mt-1">{d.files.length} 个文件 · {d.sampleIds.length} 个样本</p></button>)}{!related.length&&<p className="text-xs text-slate-500">此节点暂无数据集。方案或管理类节点可以填写说明后提交。</p>}</section>
 <section className="bg-white border rounded-xl p-4 space-y-4"><h4 className="text-sm font-semibold">{canSubmit?'提交节点审签':'审签处理'}</h4>
 {changed&&<div className="text-xs text-amber-800 bg-amber-50 rounded-lg p-3">当前数据或审签状态已更新。<Button size="sm" variant="outline" className="ml-2" onClick={()=>{setBasis({signature,logId});setError('');setNotice('');}}>载入最新审签依据</Button></div>}
 {canSubmit&&!related.length&&<label className="block text-xs space-y-1">无数据集说明 *<textarea aria-label="无数据集说明" className={sampleControl} value={reason} onChange={e=>setReason(e.target.value)}/></label>}
 {!canSubmit&&step.review?.noDataReason&&<p className="text-xs text-slate-500">无数据集说明：{step.review.noDataReason}</p>}
 {state==='pending'&&sign&&<div className="flex flex-wrap gap-2">{(['approve','revision','reject'] as const).map(a=><Button key={a} size="sm" variant={decision===a?'default':'outline'} onClick={()=>setDecision(a)}>{ACTION_LABELS[a]}</Button>)}</div>}
 {(canSubmit||state==='pending'&&sign)&&<label className="block text-xs space-y-1">{canSubmit?'提交说明':'审签意见'} *<textarea aria-label="节点审签意见" rows={4} className={sampleControl} value={comment} onChange={e=>setComment(e.target.value)}/></label>}
 {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}{notice&&<p role="status" className="text-sm text-emerald-700">{notice}</p>}
 <div className="flex justify-end">{canSubmit?<Button disabled={!access||changed} onClick={()=>submit('submit')}>提交 PI 审签</Button>:state==='pending'?sign?<Button disabled={changed} onClick={()=>submit(decision)}>确认提交 PI 审签决定</Button>:<p className="text-xs text-slate-500">等待项目 PI 审签，当前账号可查看审签依据与历史。</p>:<p className="text-xs text-emerald-700">节点审签已通过。修改审签依据后需要重新提交。</p>}</div></section>
 <section className="border rounded-xl bg-white p-4 space-y-3"><h4 className="text-sm font-semibold">审签历史与流程追踪 · {step.review?.logs.length||0} 条</h4>{step.review?.logs.map(l=><div key={l.id} className="border-t pt-3 text-xs space-y-2"><p className="font-medium">{ACTION_LABELS[l.action]} · {l.actorName} <span className="text-slate-400">{new Date(l.time).toLocaleString('zh-CN')}</span></p><p className="whitespace-pre-wrap">{l.comment}</p><p className="text-slate-400">记录时包含 {l.datasetIds.length} 个数据集{l.signature!==signature?' · 历史审签依据':''}</p></div>)}{!step.review?.logs.length&&<p className="text-xs text-slate-400">暂无流程记录</p>}</section>
 {detail&&<DatasetDetail id={detail} onClose={()=>setDetail('')}/>}
 </div>;
}
