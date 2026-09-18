import type { Project } from '../types';
import { researchTypeName } from '../lib/projectDomain';


export function ProjectRecordPanels({ project, view }: { project: Project; view: 'info' | 'team' }) {
  const members = [{ id: project.piId, name: project.piName || '待确定', role: '项目负责人（PI）' }, ...(project.members || [])];
  return <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
    <h2 className="font-bold">{view === 'info' ? '项目档案与研究计划' : `项目团队 · ${members.length} 人`}</h2>
    {view === 'team' ? <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{members.map(m => <div key={m.id} className="border rounded-xl p-4 bg-slate-50"><p className="font-semibold">{m.name}</p><p className="text-xs text-slate-500 mt-2">{m.role}</p></div>)}</div> : <>
      <div className="grid grid-cols-2 gap-4 text-sm">{[
        ['项目编号', project.number], ['研究类型', researchTypeName(project.researchType)], ['项目 PI', project.piName], ['单位 / 部门', `${project.institution} / ${project.department}`],
        ['计划开始日期', project.startDate], ['计划结束日期', project.endDate],
      ].map(([label, value]) => <div key={label}><p className="text-xs text-slate-400 mb-1">{label}</p><p>{value || '待补充'}</p></div>)}</div>
      <div className="border-t pt-4"><h3 className="font-medium text-sm">研究目标及验收指标</h3><p className="whitespace-pre-wrap text-sm text-slate-600 mt-2">{project.objective || '待补充研究目标'}</p></div>
      <div className="border-t pt-4"><h3 className="font-medium text-sm">研究计划</h3><p className="whitespace-pre-wrap text-sm text-slate-600 mt-2">{project.plan || '待补充研究计划'}</p></div>
    </>}
  </div>;
}

