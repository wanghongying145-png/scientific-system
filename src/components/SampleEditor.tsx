import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Sample } from '../types';
import { getProjects, useProjects } from '../lib/projectStore';
import { blankSample, saveSample, SAMPLE_STATUSES, SAMPLE_TYPES } from '../lib/sampleStore';

export const sampleControl = 'w-full border border-slate-200 rounded-lg bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200';
export function SampleEditor({ sample, projectId, nodeId, onClose }: { sample?: Sample; projectId?: string; nodeId?: string; onClose: () => void }) {
  const [projects] = useProjects();
  const [draft, setDraft] = useState<Sample>(() => sample ? structuredClone(sample) : blankSample(projectId, nodeId));
  const [error, setError] = useState('');
  const patch = (value: Partial<Sample>) => setDraft(s => ({ ...s, ...value }));
  const submit = () => { try { saveSample(draft, getProjects()); onClose(); } catch(e) { setError((e as Error).message); } };
  const textField = (key: keyof Sample, title: string, type = 'text', placeholder = '') => <label className="space-y-1 text-xs text-slate-600">{title}<input aria-label={title.replace(' *', '')} type={type} className={sampleControl} value={draft[key] as string} placeholder={placeholder} onChange={e => patch({ [key]: e.target.value })} /></label>;
  return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
    <DialogHeader className="p-5 border-b"><DialogTitle>{sample ? '编辑科研样本' : '新增科研样本'}</DialogTitle><DialogDescription>登记科研材料并按需关联项目节点。带 * 的字段为必填。</DialogDescription></DialogHeader>
    <div className="p-5 space-y-5 overflow-y-auto min-h-0">
      <section className="space-y-3"><h3 className="font-semibold text-sm">样本基本信息</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {textField('number', '样本编号 *', 'text', '输入唯一编号')}{textField('name', '样本名称 *')}
        <label className="space-y-1 text-xs text-slate-600">样本类型 *<input aria-label="样本类型" list="research-sample-types" className={sampleControl} value={draft.sampleType} onChange={e => patch({ sampleType: e.target.value })} placeholder="选择或填写科研材料类型" /><datalist id="research-sample-types">{SAMPLE_TYPES.map(t => <option key={t} value={t} />)}</datalist></label>
        {textField('batch', '批次编号')}
        {textField('quantity', '样本数量', 'number')}{textField('unit', '计量单位', 'text', '如 支、株、mg、mL')}
        {textField('storageLocation', '存放位置', 'text', '如 冰箱 / 层架 / 盒位')}{textField('owner', '保管人')}
        {textField('receivedAt', '入库日期', 'date')}
        <label className="space-y-1 text-xs text-slate-600">样本状态<select aria-label="样本状态" className={sampleControl} value={draft.status} onChange={e => patch({ status: e.target.value as Sample['status'] })}>{Object.entries(SAMPLE_STATUSES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      </div><label className="block text-xs text-slate-600 space-y-1">备注<textarea aria-label="样本备注" rows={3} className={sampleControl} value={draft.notes} onChange={e => patch({ notes: e.target.value })} placeholder="材料特征、保存要求或实验用途" /></label></section>
      <section className="space-y-3 border-t pt-4"><div className="flex justify-between items-center"><h3 className="font-semibold text-sm">项目与实验节点关联</h3><Button size="sm" variant="outline" onClick={() => patch({ links: [...draft.links, { projectId: projectId || '', nodeId: '' }] })}><Plus className="size-3 mr-1" />添加关联</Button></div>
        <p className="text-xs text-slate-500">可先保存到台账，之后再关联。每条关联需同时确定项目与实验节点；同一样本可用于多个节点。</p>
        {!!draft.pendingProjectIds?.length && <div className="text-xs rounded-lg bg-amber-50 p-3 text-amber-800">历史关联待补充节点：{draft.pendingProjectIds.map(id => projects.find(p => p.id === id)?.name || '历史项目').join('、')}。添加对应项目及节点后完成关联。</div>}
        {!draft.links.length && <p className="p-4 rounded-lg border border-dashed text-center text-sm text-slate-400">暂未关联项目节点</p>}
        {draft.links.map((link, i) => <div key={i} className="flex gap-2 items-end rounded-lg border bg-slate-50 p-3"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          <label className="text-xs space-y-1 text-slate-600">所属项目<select aria-label={`关联${i + 1}项目`} className={sampleControl} value={link.projectId} onChange={e => patch({ links: draft.links.map((l, j) => j === i ? { projectId: e.target.value, nodeId: '' } : l) })}><option value="">选择项目</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="text-xs space-y-1 text-slate-600">实验节点<select aria-label={`关联${i + 1}节点`} className={sampleControl} value={link.nodeId} onChange={e => patch({ links: draft.links.map((l, j) => j === i ? { ...l, nodeId: e.target.value } : l) })}><option value="">选择实验节点</option>{projects.find(p => p.id === link.projectId)?.steps?.map(n => <option key={n.id} value={n.id}>{n.order}. {n.title}</option>)}</select></label>
        </div><Button variant="ghost" size="icon" aria-label={`移除关联${i + 1}`} onClick={() => patch({ links: draft.links.filter((_, j) => j !== i) })}><Trash2 className="size-4" /></Button></div>)}
      </section>
    </div><div className="p-4 border-t shrink-0">{error && <p role="alert" className="mb-3 rounded-lg p-3 text-xs text-rose-700 bg-rose-50">{error}</p>}<DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button onClick={submit}>{sample ? '保存修改' : '保存到样本台账'}</Button></DialogFooter></div>
  </DialogContent></Dialog>;
}
