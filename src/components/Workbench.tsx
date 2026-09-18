import { useState } from 'react';
import { ArrowRight, Database, ShieldCheck, Layers, FlaskConical, FileText, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '../types';
import { useAccessibleProjects, useAccessibleDatasets } from '../lib/researchAccess';
import { useIdentity } from '../lib/session';
import { useSamples } from '../lib/sampleStore';
import { effectiveSampleLinks, datasetLocation } from '../lib/datasetStore';
import { reviewState, REVIEW_LABELS, currentQuality, verifiedQuality, ACTION_LABELS } from '../lib/reviewDomain';
import { projectProgress } from '../lib/projectDomain';
import { DatasetDetail } from './DatasetViews';
import { ProjectNodeDetailDrawer, type DetailNodeType } from './ProjectNodeDetailDrawer';

interface WorkbenchProps { onNavigateToProjects:()=>void; onSelectProjectDetail?:(project:Project)=>void; }
type Metric='projects'|'active'|'samples'|'datasets'|'files'|'qc'|'abnormal'|'review'|'revision'|'completed';
export function Workbench({onNavigateToProjects,onSelectProjectDetail}:WorkbenchProps) {
 const [projects]=useAccessibleProjects(),datasets=useAccessibleDatasets(),samples=useSamples(),user=useIdentity();
 const [projectFilter,setProjectFilter]=useState('all'),[metric,setMetric]=useState<Metric>('projects'),[detail,setDetail]=useState('');
 const [nodeTarget,setNodeTarget]=useState<{projectId:string;nodeId:string}|null>(null),[nodeTab,setNodeTab]=useState<DetailNodeType>('pi');
 const scopedProjects=projects.filter(p=>projectFilter==='all'||p.id===projectFilter),ids=new Set(scopedProjects.map(p=>p.id));
 const scopedDatasets=datasets.filter(d=>d.projectId&&ids.has(d.projectId));
 const scopedSamples=samples.filter(s=>effectiveSampleLinks(s,scopedDatasets).some(l=>ids.has(l.projectId))||s.pendingProjectIds?.some(id=>ids.has(id)));
 const nodes=scopedProjects.flatMap(p=>(p.steps||[]).map(n=>({p,n,state:reviewState(p,n,datasets)})));
 const active=scopedProjects.filter(p=>p.status==='active'),qc=scopedDatasets.filter(d=>currentQuality(d)==='待质检'||currentQuality(d)==='合格'&&!verifiedQuality(d)),abnormal=scopedDatasets.filter(d=>currentQuality(d)==='异常');
 const pending=nodes.filter(x=>x.state==='pending'),revisions=nodes.filter(x=>['revision','rejected','stale'].includes(x.state)),completed=nodes.filter(x=>x.n.status==='completed');
 const files=scopedDatasets.flatMap(d=>d.files.map(f=>({d,f})));
 const metrics:{id:Metric;title:string;value:number;note:string;icon:typeof Layers}[]=[
  {id:'projects',title:'可访问项目',value:scopedProjects.length,note:'当前范围全部项目',icon:Layers},
  {id:'active',title:'在研项目',value:active.length,note:'项目状态为进行中',icon:Layers},
  {id:'samples',title:'项目样本',value:scopedSamples.length,note:'直接关联与数据集来源去重',icon:FlaskConical},
  {id:'datasets',title:'数据集',value:scopedDatasets.length,note:'当前项目范围的数据集',icon:Database},
  {id:'files',title:'文件登记',value:files.length,note:`已保存内容 ${files.filter(x=>x.f.hasContent).length} 个`,icon:FileText},
  {id:'qc',title:'待质检 / 复核',value:qc.length,note:'含未复核的历史结论',icon:Clock},
  {id:'abnormal',title:'质检异常',value:abnormal.length,note:'按数据集计数',icon:AlertTriangle},
  {id:'review',title:'待 PI 审签',value:pending.length,note:'已提交且依据未变化',icon:ShieldCheck},
  {id:'revision',title:'待整改 / 重提',value:revisions.length,note:'退回或审签依据已变化',icon:AlertTriangle},
  {id:'completed',title:'已完成节点',value:completed.length,note:'含原台账完成记录',icon:ShieldCheck},
 ];
 const chosen=metrics.find(m=>m.id===metric)!;
 const datasetRows=metric==='qc'?qc:metric==='abnormal'?abnormal:scopedDatasets;
 const nodeRows=metric==='review'?pending:metric==='revision'?revisions:completed;
 const openNode=(p:Project,nodeId:string)=>{setNodeTarget({projectId:p.id,nodeId});setNodeTab('pi');};
 const targetProject=projects.find(p=>p.id===nodeTarget?.projectId),targetNode=targetProject?.steps?.find(n=>n.id===nodeTarget?.nodeId);
 const events=[...scopedDatasets.flatMap(d=>(d.qualityHistory||[]).map(r=>({id:r.id,time:r.time,text:`${r.actorName} · 质检${r.result}`,subject:d.name,open:()=>setDetail(d.id)}))),...nodes.flatMap(({p,n})=>(n.review?.logs||[]).map(r=>({id:r.id,time:r.time,text:`${r.actorName} · ${ACTION_LABELS[r.action]}`,subject:`${p.name} / ${n.title}`,open:()=>openNode(p,n.id)})))].sort((a,b)=>b.time.localeCompare(a.time)).slice(0,8);
 return <div className="p-6 space-y-5" data-workbench><div className="rounded-2xl bg-gradient-to-r from-slate-900 to-sky-800 text-white p-6 flex flex-wrap justify-between gap-4 items-center"><div><h1 className="text-xl font-bold">科研项目工作台</h1><p className="text-sm text-sky-100 mt-2">{user.name} · {user.admin?'管理员':'项目团队'} · 按当前用户可访问的项目实时汇总</p></div><Button onClick={onNavigateToProjects} variant="outline" className="text-slate-900">项目管理中心 <ArrowRight className="size-4 ml-1"/></Button></div>
 <div className="flex justify-between items-center flex-wrap gap-3"><p className="text-xs text-slate-500">点击统计卡查看同口径明细。数据变更后自动更新。</p><label className="text-xs">项目范围 <select aria-label="工作台项目范围" className="border rounded-lg p-2 ml-2 bg-white max-w-96" value={projectFilter} onChange={e=>setProjectFilter(e.target.value)}><option value="all">全部可访问项目（{projects.length}）</option>{projectFilter!=="all"&&!projects.some(p=>p.id===projectFilter)&&<option value={projectFilter}>项目已移除或无访问权限</option>}{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
 {!projects.length&&<p className="border rounded-xl p-6 text-sm text-slate-500">当前账号没有可访问的项目，请由管理员将账号绑定到项目 PI、成员或节点负责人。</p>}
 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">{metrics.map(m=><button key={m.id} data-metric={m.id} aria-label={`${m.title} ${m.value}`} onClick={()=>setMetric(m.id)} className={`text-left p-4 rounded-xl border bg-white transition-colors ${metric===m.id?'border-sky-500 ring-1 ring-sky-200':'border-slate-200 hover:border-sky-300'}`}><div className="flex justify-between text-xs text-slate-600"><span>{m.title}</span><m.icon className="size-4 text-sky-600"/></div><p className="text-3xl font-bold mt-3 text-slate-900">{m.value}</p><p className="text-[11px] text-slate-400 mt-2">{m.note}</p></button>)}</div>
 <section className="bg-white rounded-xl border overflow-hidden" data-workbench-detail><div className="p-4 border-b flex justify-between items-center"><h2 className="font-semibold text-sm">{chosen.title}明细 · {chosen.value} 条</h2><span className="text-xs text-slate-400">{projectFilter==='all'?'全部可访问项目':scopedProjects[0]?.name||'项目权限已变化'}</span></div><div className="overflow-x-auto">
 {['projects','active'].includes(metric)&&<table className="w-full text-xs"><thead className="bg-slate-50"><tr>{['项目','PI','节点进度','数据集','操作'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{(metric==='active'?active:scopedProjects).map(p=><tr key={p.id} className="border-t"><td className="p-3"><p>{p.name}</p><p className="text-slate-400 mt-1">{p.number}</p></td><td className="p-3">{p.piName}</td><td className="p-3">{projectProgress(p)}% · {p.steps?.filter(n=>n.status==='completed').length||0}/{p.steps?.length||0} 已完成</td><td className="p-3">{scopedDatasets.filter(d=>d.projectId===p.id).length}</td><td className="p-3"><Button size="sm" variant="ghost" onClick={()=>onSelectProjectDetail?.(p)}>查看项目</Button></td></tr>)}</tbody></table>}
 {['datasets','qc','abnormal'].includes(metric)&&<table className="w-full text-xs"><thead className="bg-slate-50"><tr>{['数据集','项目 / 节点','样本 / 文件','质检状态','操作'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{datasetRows.map(d=>{const loc=datasetLocation(d,projects);return <tr key={d.id} className="border-t" data-dataset-id={d.id}><td className="p-3">{d.name}</td><td className="p-3">{loc.project}<p className="text-slate-400 mt-1">{loc.node}</p></td><td className="p-3">{d.sampleIds.length} / {d.files.length}</td><td className="p-3">{currentQuality(d)}{!d.qualityHistory?.length&&d.quality!=='待质检'&&'（历史登记）'}</td><td className="p-3"><Button size="sm" variant="ghost" onClick={()=>setDetail(d.id)}>查看 / 质检</Button></td></tr>;})}</tbody></table>}
 {metric==='files'&&<table className="w-full text-xs"><thead className="bg-slate-50"><tr>{['文件','所属数据集','文件内容','操作'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{files.map(({d,f})=><tr key={f.id} className="border-t"><td className="p-3">{f.name}</td><td className="p-3">{d.name}</td><td className="p-3">{f.hasContent?'已保存':'历史登记，待补充'}</td><td className="p-3"><Button size="sm" variant="ghost" onClick={()=>setDetail(d.id)}>查看文件</Button></td></tr>)}</tbody></table>}
 {metric==='samples'&&<table className="w-full text-xs"><thead className="bg-slate-50"><tr>{['样本编号 / 名称','类型','所属项目 / 节点','来源数据集'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{scopedSamples.map(s=><tr key={s.id} className="border-t"><td className="p-3">{s.number}<p className="text-slate-400 mt-1">{s.name}</p></td><td className="p-3">{s.sampleType}</td><td className="p-3">{effectiveSampleLinks(s,scopedDatasets).filter(l=>ids.has(l.projectId)).map(l=>{const p=scopedProjects.find(p=>p.id===l.projectId)!;return <button key={`${l.projectId}/${l.nodeId}`} className="block text-left py-1 text-sky-700" onClick={()=>openNode(p,l.nodeId)}>{p.name} / {p.steps?.find(n=>n.id===l.nodeId)?.title||'节点待核对'}</button>;})}{s.pendingProjectIds?.filter(id=>ids.has(id)).map(id=><p key={id}>{scopedProjects.find(p=>p.id===id)?.name} / 待补充节点</p>)}</td><td className="p-3">{scopedDatasets.filter(d=>d.sampleIds.includes(s.id)).map(d=><button key={d.id} className="block text-left text-sky-700 py-1" onClick={()=>setDetail(d.id)}>{d.name}</button>)}</td></tr>)}</tbody></table>}
 {['review','revision','completed'].includes(metric)&&<table className="w-full text-xs"><thead className="bg-slate-50"><tr>{['项目','实验节点','审签状态','进度','操作'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{nodeRows.map(({p,n,state})=><tr key={`${p.id}/${n.id}`} className="border-t"><td className="p-3">{p.name}</td><td className="p-3">{n.order}. {n.title}</td><td className="p-3">{state==='none'?`${n.piStatus}（原台账）`:REVIEW_LABELS[state]}</td><td className="p-3">{n.progressPercent}%</td><td className="p-3"><Button size="sm" variant="ghost" onClick={()=>openNode(p,n.id)}>查看节点审签</Button></td></tr>)}</tbody></table>}
 {!chosen.value&&<p className="p-10 text-center text-sm text-slate-400">当前范围暂无记录</p>}</div></section>
 <section className="bg-white border rounded-xl p-4 space-y-3"><h2 className="text-sm font-semibold">最近质检与审签记录</h2>{events.length?events.map(e=><button key={e.id} onClick={e.open} className="block w-full text-left border-t pt-3 text-xs"><span className="font-medium">{e.text}</span><span className="float-right text-slate-400">{new Date(e.time).toLocaleString('zh-CN')}</span><p className="text-slate-500 mt-1">{e.subject}</p></button>):<p className="text-xs text-slate-400">当前项目范围暂无质检与审签记录</p>}</section>
 {detail&&datasets.some(d=>d.id===detail)&&<DatasetDetail id={detail} onClose={()=>setDetail('')}/>}
 {targetProject&&targetNode&&<div key={`${targetProject.id}/${targetNode.id}`}><ProjectNodeDetailDrawer isOpen onClose={()=>setNodeTarget(null)} project={targetProject} step={targetNode} activeNode={nodeTab} onChangeActiveNode={setNodeTab}/></div>}
 </div>;
}
