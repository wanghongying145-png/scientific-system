import { useMemo, type SetStateAction } from 'react';
import { useProjects, getProjects, updateProjects } from './projectStore';
import { useDatasets } from './datasetStore';
import { canAccessProject, useIdentity, getIdentity } from './session';
import type { Project } from '../types';

export function useAccessibleProjects() {
  const [all]=useProjects(),user=useIdentity();
  const visible=useMemo(()=>all.filter(p=>canAccessProject(p,user)),[all,user.username]);
  const set=(action:SetStateAction<Project[]>)=>{
    const current=getProjects(),actor=getIdentity(),accessible=current.filter(p=>canAccessProject(p,actor));
    const next=typeof action==='function'?action(accessible):action;
    if(next.some(p=>current.some(old=>old.id===p.id&&!canAccessProject(old,actor))))throw new Error('无权修改该项目。');
    if(next.some(p=>!current.some(old=>old.id===p.id)&&!canAccessProject(p,actor)))throw new Error('新项目需将当前用户加入项目团队或指定为 PI。');
    updateProjects([...current.filter(p=>!canAccessProject(p,actor)),...next]);
  };
  return [visible,set] as const;
}
export function useAccessibleDatasets() { const datasets=useDatasets(),[projects]=useAccessibleProjects();return useMemo(()=>datasets.filter(d=>projects.some(p=>p.id===d.projectId)),[datasets,projects]); }
