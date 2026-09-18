import type { Project, WorkflowStep } from '../types';
import type { ResearchDataset } from './datasetStore';

export type ReviewAction = 'submit' | 'approve' | 'revision' | 'reject';
export interface ReviewLog { id: string; action: ReviewAction; comment: string; actorId: string; actorName: string; time: string; signature: string; datasetIds: string[]; }
export interface NodeReview { state: 'pending' | 'approved' | 'revision' | 'rejected'; signature: string; noDataReason: string; logs: ReviewLog[]; }
export const REVIEW_LABELS = { none: '未提交', pending: '待 PI 审签', approved: '审核通过', revision: '要求补充实验', rejected: '已驳回', stale: '待重新提交' };
export const ACTION_LABELS = { submit: '提交审签', approve: '准予通过', revision: '要求补充实验', reject: '驳回重构方案' };
export function datasetFingerprint(d: ResearchDataset) { return JSON.stringify([d.projectId, d.nodeId, [...d.sampleIds].sort(), d.files.map(f => [f.id, f.bytes, f.hasContent]).sort((a,b) => String(a[0]).localeCompare(String(b[0])))]); }
export function currentQuality(d: ResearchDataset) {
  const record = d.qualityHistory?.[0];
  return record && record.fingerprint !== datasetFingerprint(d) ? '待质检' : d.quality;
}
export function verifiedQuality(d: ResearchDataset) { return currentQuality(d) === '合格' && !!d.qualityHistory?.length && d.qualityHistory[0].fingerprint === datasetFingerprint(d); }
export function reviewSignature(p: Project, n: WorkflowStep, datasets: ResearchDataset[]) {
  return JSON.stringify([p.piId,p.objective,p.plan,n.title,n.description,n.leadId,n.startDate,n.endDate,datasets.filter(d=>d.projectId===p.id&&d.nodeId===n.id).map(d=>[d.id,d.updatedAt,datasetFingerprint(d),d.quality,d.qualityHistory?.[0]?.id]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])))]);
}
export function reviewState(p: Project, n: WorkflowStep, datasets: ResearchDataset[]) {
  if (!n.review) return n.legacyReviewBasis && n.legacyReviewBasis !== reviewSignature(p,n,datasets) ? 'stale' : 'none';
  if (['pending','approved'].includes(n.review.state) && n.review.signature !== reviewSignature(p,n,datasets)) return 'stale';
  return n.review.state;
}
export function materializeReview(p: Project, n: WorkflowStep, datasets: ResearchDataset[]): WorkflowStep {
  if (!n.review) return reviewState(p,n,datasets) === 'stale' ? {...n,status:'in_progress',progressPercent:Math.min(n.progressPercent,90),progressText:'待重新提交 · '+Math.min(n.progressPercent,90)+'%',piStatus:REVIEW_LABELS.stale,piNote:'历史审签后的数据已变化，请复核并重新提交。'} : n;
  const state = reviewState(p,n,datasets), last = n.review.logs[0];
  return {...n, piStatus: REVIEW_LABELS[state], piReviewer: p.piName || '', piRecordsCount: n.review.logs.filter(l=>l.action!=='submit').length,
    piNote: state==='stale' ? '审签依据已变化，请完成质检后重新提交。' : last?.comment || '',
    status: state==='approved'?'completed':'in_progress',progressPercent:state==='approved'?100:Math.min(n.progressPercent,90),
    progressText: state==='approved'?'审签通过 · 100%':`${REVIEW_LABELS[state]} · ${Math.min(n.progressPercent,90)}%`};
}
