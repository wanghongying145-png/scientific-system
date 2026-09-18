import { getProjects, updateProjects } from './projectStore';
import { getDatasets } from './datasetStore';
import { assertProjectAccess, canSignProject, getIdentity } from './session';
import { reviewSignature, reviewState, verifiedQuality, materializeReview, type ReviewAction, type NodeReview } from './reviewDomain';

export function submitNodeReview(projectId: string, nodeId: string, action: ReviewAction, comment: string, noDataReason: string, expectedSignature: string, expectedLogId: string) {
  const p=getProjects().find(p=>p.id===projectId);assertProjectAccess(p);
  const n=p!.steps?.find(n=>n.id===nodeId);if(!n)throw new Error('实验节点已不存在。');
  const datasets=getDatasets(), signature=reviewSignature(p!,n,datasets), state=reviewState(p!,n,datasets);
  if(signature!==expectedSignature||(n.review?.logs[0]?.id||'')!==expectedLogId)throw new Error('节点或关联数据已更新，请重新打开审签页面。');
  if(!comment.trim())throw new Error('请填写提交说明或审签意见。');
  if(action!=='submit'&&!canSignProject(p!))throw new Error('只有本项目 PI 可以签署审签决定。');
  if(action!=='submit'&&state!=='pending')throw new Error('节点尚未提交，或审签依据已变化，请先重新提交。');
  if(action==='submit'&&['pending','approved'].includes(state))throw new Error('当前节点已提交或已通过，请勿重复提交。');
  const related=datasets.filter(d=>d.projectId===projectId&&d.nodeId===nodeId);
  if(action==='submit'||action==='approve') {
    if(related.some(d=>!verifiedQuality(d)))throw new Error('节点存在待质检、异常或未复核的历史数据集，请先完成当前版本质检。');
    if(!related.length&&!(action==='submit'?noDataReason:n.review?.noDataReason)?.trim())throw new Error('当前节点无数据集，请填写无数据集说明。');
  }
  const actor=getIdentity(),time=new Date().toISOString();
  const review:NodeReview={state:action==='submit'?'pending':action==='approve'?'approved':action==='revision'?'revision':'rejected', signature,
    noDataReason: action==='submit'?noDataReason.trim():n.review!.noDataReason,
    logs:[{id:crypto.randomUUID(),action,comment:comment.trim(),actorId:actor.personId,actorName:actor.name,time,signature,datasetIds:related.map(d=>d.id)},...(n.review?.logs||[])]};
  updateProjects(all=>all.map(item=>item.id===projectId?{...item,status:item.status==='completed'&&action!=='approve'?'active':item.status,steps:item.steps?.map(step=>step.id===nodeId?materializeReview(item,{...step,review,updatedAt:time},datasets):step)}:item));
}
