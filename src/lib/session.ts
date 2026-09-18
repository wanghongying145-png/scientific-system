import { useSyncExternalStore } from 'react';
import type { Project } from '../types';

export interface ResearchIdentity { username: string; personId: string; name: string; admin: boolean; }
const key = 'research_session_user_v1';
const listeners = new Set<() => void>();
export function currentUsername() { return sessionStorage.getItem(key) ?? 'zsz'; }
export function identityFor(username: string): ResearchIdentity {
  if (username === 'zsz') return { username, personId: 'pi-zhang', name: '张立华', admin: false };
  if (username === 'admin') return { username, personId: 'admin', name: '系统管理员', admin: true };
  return { username, personId: username, name: username || '未登录', admin: false };
}
export const getIdentity = () => identityFor(currentUsername());
export function setSessionUser(username: string | null) { sessionStorage.setItem(key, username || ''); listeners.forEach(l => l()); }
export function useIdentity() { return identityFor(useSyncExternalStore(l => { listeners.add(l); return () => { listeners.delete(l); }; }, currentUsername)); }
export function canAccessProject(project: Project, user = getIdentity()) {
  return !!user.username && (user.admin || project.piId === user.personId || !!project.members?.some(m => m.id === user.personId) || !!project.steps?.some(n => n.leadId === user.personId));
}
export function canSignProject(project: Project, user = getIdentity()) { return !!user.username && project.piId === user.personId; }
export function assertProjectAccess(project: Project | undefined) { if (!project || !canAccessProject(project)) throw new Error('当前账号无权访问该项目。'); }
