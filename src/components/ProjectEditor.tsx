import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Users, Target, ListTree, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Project, PI, WorkflowStep, ResearchType } from '../types';
import { makeStep, makeSteps, newId, PROJECT_PEOPLE, RESEARCH_TYPES, stepHasRecords, validateProject } from '../lib/projectDomain';

import { useSamples } from '../lib/sampleStore';
import { useDatasets } from '../lib/datasetStore';

const control = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200';
const field = 'space-y-1.5 text-xs font-medium text-slate-600';
export function ProjectEditor({ project, projects, pis, onSave, onClose }: {
  project?: Project; projects: Project[]; pis: PI[]; onSave: (project: Project) => void; onClose: () => void;
}) {
  useSamples();
  useDatasets();
  const [draft, setDraft] = useState<Project>(() => project ? structuredClone(project) : {
    id: newId('project'), number: '', name: '', piId: '', piName: '', institution: '', department: '', status: 'active',
    createdAt: new Date().toISOString().slice(0, 10), members: [], objective: '', plan: '', startDate: '', endDate: '', steps: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [memberQuery, setMemberQuery] = useState('');
  const [newMember, setNewMember] = useState('');
  const [notice, setNotice] = useState('');
  const [templateSignature, setTemplateSignature] = useState('');
  const signature = (nodes: WorkflowStep[]) => JSON.stringify(nodes.map(s => [s.title, s.description, s.leadId, s.startDate, s.endDate]));
  const patch = (value: Partial<Project>) => setDraft(d => ({ ...d, ...value }));
  const steps = draft.steps || [];
  const members = draft.members || [];
  const candidates = [...PROJECT_PEOPLE, ...members.filter(m => !PROJECT_PEOPLE.some(p => p.id === m.id))];
  const people = [{ id: draft.piId, name: draft.piName || '未选 PI', role: 'PI' }, ...members];
  const updateStep = (id: string, change: Partial<WorkflowStep>) => patch({ steps: steps.map(s => s.id === id ? { ...s, ...change } : s) });
  const reorder = (index: number, delta: number) => {
    const copy = [...steps]; [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
    patch({ steps: copy.map((s, i) => ({ ...s, order: i + 1 })) });
  };
  const changeType = (researchType: ResearchType) => {
    const replace = !steps.length || (!project && signature(steps) === templateSignature);
    const generated = replace ? makeSteps(researchType, draft.piName) : steps;
    patch({ researchType, steps: generated });
    if (replace) setTemplateSignature(signature(generated));
    setNotice(replace ? '已生成该研究类型的实验节点，可修改名称、顺序、负责人和节点计划。' : '已保留当前节点。如需使用新类型的模板，点击“补充模板节点”，再调整未开始的节点。');
  };
  const applyTemplate = () => {
    if (!draft.researchType) return;
    const additions = makeSteps(draft.researchType, draft.piName).filter(s => !steps.some(old => old.title.trim() === s.title));
    patch({ steps: [...steps, ...additions].map((s, i) => ({ ...s, order: i + 1 })) });
    setNotice(additions.length ? `已补充 ${additions.length} 个节点，已有节点及进度已保留。` : '当前已包含全部模板节点，无需重复生成。');
  };
  const submit = () => {
    const next = { ...draft, number: draft.number.trim(), name: draft.name.trim(), objective: draft.objective?.trim(), plan: draft.plan?.trim(),
      steps: steps.map((s, i) => ({ ...s, title: s.title.trim(), order: i + 1, piReviewer: draft.piName || '' })) };
    const issues = validateProject(next, projects);
    setErrors(issues);
    if (issues.length) return;
    try { onSave(next); onClose(); } catch (e) { setErrors([(e as Error).message]); }
  };
  return <Dialog open onOpenChange={open => !open && onClose()}>
    <DialogContent className="sm:max-w-[1000px] w-[calc(100%-2rem)] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
      <DialogHeader className="p-5 border-b shrink-0 bg-slate-50">
        <DialogTitle>{project ? '编辑科研项目' : '新建科研项目'}</DialogTitle>
        <DialogDescription>确定研究团队、目标与计划，并建立本项目的实验节点。带 * 的项目为必填。</DialogDescription>
      </DialogHeader>
      <div className="overflow-y-auto flex-1 min-h-0 p-5 space-y-6">
        <section className="space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FolderKanban className="size-4 text-sky-600" />01 基本信息</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={field}>项目编号 *<input aria-label="项目编号" className={control} value={draft.number} onChange={e => patch({ number: e.target.value })} placeholder="例如 PROJ-2026-001" /></label>
            <label className={field}>项目名称 *<input aria-label="项目名称" className={control} value={draft.name} onChange={e => patch({ name: e.target.value })} placeholder="输入项目全称" /></label>
            <label className={field}>单位<input aria-label="单位" className={control} value={draft.institution} onChange={e => patch({ institution: e.target.value })} /></label>
            <label className={field}>科室 / 部门<input aria-label="科室 / 部门" className={control} value={draft.department} onChange={e => patch({ department: e.target.value })} /></label>
            <label className={field}>项目状态<select aria-label="项目状态" className={control} value={draft.status} onChange={e => patch({ status: e.target.value as Project['status'] })}>
              <option value="active">进行中</option><option value="on-hold">暂停</option><option value="completed">已结题</option><option value="archived">已归档</option>
            </select></label>
          </div>
        </section>
        <section className="space-y-4 border-t pt-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Users className="size-4 text-sky-600" />02 PI 与项目成员</h3>
          <label className={field}>项目 PI *<select aria-label="项目 PI" className={control} value={draft.piId} onChange={e => {
            const pi = pis.find(p => p.id === e.target.value);
            patch({ piId: pi?.id || '', piName: pi?.name || '', institution: pi?.institution || draft.institution, department: pi?.department || draft.department,
              steps: steps.map(s => ({ ...s, piReviewer: pi?.name || '', ...(s.leadId === draft.piId ? { leadId: pi?.id || '', leadPerson: pi?.name || '' } : {}) })) });
          }}><option value="">请选择负责人</option>{pis.map(pi => <option key={pi.id} value={pi.id}>{pi.name} · {pi.institution}</option>)}</select></label>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600">项目成员 * <span className="text-sky-600">已选 {members.length} 人</span></div>
            <input aria-label="搜索项目成员" className={control} placeholder="搜索成员姓名" value={memberQuery} onChange={e => setMemberQuery(e.target.value)} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {candidates.filter(m => m.name.includes(memberQuery.trim())).map(m => <label key={m.id} className="border rounded-lg p-3 flex gap-2 items-center cursor-pointer text-sm bg-slate-50">
                <input type="checkbox" checked={members.some(item => item.id === m.id)} onChange={e => patch({ members: e.target.checked ? [...members, { ...m }] : members.filter(item => item.id !== m.id) })} />
                <span>{m.name}<span className="block text-[11px] text-slate-400">{m.role}</span></span>
              </label>)}
            </div>
            <div className="flex gap-2"><input aria-label="补充成员姓名" className={control} placeholder="也可补充其他参与成员的姓名" value={newMember} onChange={e => setNewMember(e.target.value)} />
              <Button variant="outline" onClick={() => { const name = newMember.trim(); if (!name) return; const found = candidates.find(m => m.name === name); if (!members.some(m => m.name === name)) patch({ members: [...members, found || { id: newId('member'), name, role: '项目成员' }] }); setNewMember(''); }}>添加成员</Button></div>
          </div>
        </section>
        <section className="space-y-4 border-t pt-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Target className="size-4 text-sky-600" />03 研究目标与计划</h3>
          <label className={field}>研究目标及验收指标 *<textarea aria-label="研究目标及验收指标" rows={3} className={control} value={draft.objective || ''} onChange={e => patch({ objective: e.target.value })} placeholder="研究问题、预期成果，以及可验收的指标" /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className={field}>计划开始日期 *<input aria-label="计划开始日期" type="date" className={control} value={draft.startDate || ''} onChange={e => patch({ startDate: e.target.value })} /></label>
            <label className={field}>计划结束日期 *<input aria-label="计划结束日期" type="date" className={control} value={draft.endDate || ''} onChange={e => patch({ endDate: e.target.value })} /></label>
          </div>
          <label className={field}>研究计划 *<textarea aria-label="研究计划" rows={3} className={control} value={draft.plan || ''} onChange={e => patch({ plan: e.target.value })} placeholder="主要研究任务、里程碑、资源安排与交付内容" /></label>
        </section>
        <section className="space-y-4 border-t pt-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><ListTree className="size-4 text-sky-600" />04 研究类型与实验节点</h3>
          <label className={field}>研究类型 *<select aria-label="研究类型" className={control} value={draft.researchType || ''} onChange={e => changeType(e.target.value as ResearchType)}>
            <option value="" disabled>请选择研究类型</option>{RESEARCH_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></label>
          <p className="text-xs text-slate-500">{RESEARCH_TYPES.find(t => t.id === draft.researchType)?.description || '选择后自动生成节点，按实际研究方案调整。'}</p>
          <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">节点预览 · 共 {steps.length} 个</span><div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!draft.researchType} onClick={applyTemplate}>补充模板节点</Button>
            <Button variant="outline" size="sm" onClick={() => patch({ steps: [...steps, makeStep('', steps.length + 1, draft.piName)] })}><Plus className="size-3" />自定义节点</Button>
          </div></div>
          {notice && <p role="status" className="bg-sky-50 text-sky-700 p-3 rounded-lg text-xs">{notice}</p>}
          {!steps.length && <div className="border border-dashed rounded-xl p-8 text-center text-slate-400">选择研究类型后在此预览实验节点。</div>}
          <div className="space-y-3">
            {steps.map((s, i) => <div key={s.id} data-node-id={s.id} className="border border-slate-200 rounded-xl p-3 space-y-3 bg-slate-50/60">
              <div className="flex gap-2 items-center"><span className="size-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
                <input aria-label={`节点${i + 1}名称`} className={control} value={s.title} onChange={e => updateStep(s.id, { title: e.target.value })} placeholder="实验节点名称" />
                <Button variant="ghost" size="icon" aria-label={`上移节点${i + 1}`} disabled={i === 0} onClick={() => reorder(i, -1)}><ArrowUp className="size-4" /></Button>
                <Button variant="ghost" size="icon" aria-label={`下移节点${i + 1}`} disabled={i === steps.length - 1} onClick={() => reorder(i, 1)}><ArrowDown className="size-4" /></Button>
                <Button variant="ghost" size="icon" aria-label={`删除节点${i + 1}`} disabled={stepHasRecords(s)} title={stepHasRecords(s) ? '已有执行记录或关联数据的节点不可删除' : '删除未开始的节点'} onClick={() => patch({ steps: steps.filter(n => n.id !== s.id).map((n, j) => ({ ...n, order: j + 1 })) })}><Trash2 className="size-4" /></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={field}>节点负责人<select aria-label={`节点${i + 1}负责人`} className={control} value={s.leadId || ''} onChange={e => updateStep(s.id, { leadId: e.target.value, leadPerson: people.find(p => p.id === e.target.value)?.name || '' })}>
                  <option value="">{s.leadPerson ? `原负责人：${s.leadPerson}` : '待分配'}</option>{people.filter(p => p.id).map(p => <option key={p.id} value={p.id}>{p.name} · {p.role}</option>)}
                </select></label>
                <label className={field}>节点开始日期<input type="date" aria-label={`节点${i + 1}开始日期`} className={control} value={s.startDate || ''} onChange={e => updateStep(s.id, { startDate: e.target.value })} /></label>
                <label className={field}>节点结束日期<input type="date" aria-label={`节点${i + 1}结束日期`} className={control} value={s.endDate || ''} onChange={e => updateStep(s.id, { endDate: e.target.value })} /></label>
              </div>
              <input aria-label={`节点${i + 1}说明`} className={control} value={s.description} onChange={e => updateStep(s.id, { description: e.target.value })} placeholder="任务说明与交付要求（选填）" />
              {stepHasRecords(s) && <p className="text-[11px] text-slate-500">{s.progressText} · 已有执行记录或关联数据，保留原节点编号</p>}
            </div>)}
          </div>
        </section>
      </div>
      <div className="border-t p-4 shrink-0 bg-white">
        {!!errors.length && <div role="alert" className="mb-3 max-h-28 overflow-auto rounded-lg bg-rose-50 text-rose-700 p-3 text-xs space-y-1">{errors.map((error, i) => <p key={i}>{error}</p>)}</div>}
        <DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button className="bg-[#02A1C8] text-white" onClick={submit}>{project ? '保存修改' : '创建项目'}</Button></DialogFooter>
      </div>
    </DialogContent>
  </Dialog>;
}
