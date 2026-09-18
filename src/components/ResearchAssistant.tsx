import { useMemo, useRef, useState } from 'react';
import { BarChart3, Beaker, Bot, ChevronRight, FileSearch, FlaskConical, History, Paperclip, Plus, Send, Sparkles, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibleDatasets, useAccessibleProjects } from '../lib/researchAccess';
import { useSamples } from '../lib/sampleStore';
import { currentQuality, reviewState } from '../lib/reviewDomain';
import type { Project } from '../types';

type Reference = { type: 'project' | 'dataset' | 'node'; label: string; project?: Project; datasetId?: string; nodeId?: string };
type Message = { id: string; role: 'assistant' | 'user'; time: string; text: string; agent?: string; refs?: Reference[]; attachment?: string };
type Session = { id: string; createdAt: string; messages: Message[] };
type Agent = { id: string; label: string; description: string; icon: typeof Sparkles };
const AGENTS: Agent[] = [
  { id: 'auto', label: 'Auto', description: '自动选择合适智能体', icon: Sparkles },
  { id: 'project', label: '项目统筹助手', description: '项目进度、节点和风险', icon: BarChart3 },
  { id: 'literature', label: '文献研读助手', description: '文献检索、阅读与证据整理', icon: FileSearch },
  { id: 'scheme', label: '方案设计助手', description: '研究方案、实验计划和审签准备', icon: FlaskConical },
  { id: 'prediction', label: '科学预测助手', description: '趋势判断、指标预测和风险提示', icon: Beaker },
  { id: 'analysis', label: '数据分析助手', description: '数据集、样本和质检分析', icon: BarChart3 },
];
const SESSION_KEY = 'research_assistant_sessions_v1';
const EXAMPLES = [
  '统计所有可访问项目当前进度、节点完成率和风险',
  '哪些科研项目的进度落后于计划，需要优先处理？',
  '找出待质检或质检异常的数据集，并说明影响的节点',
  '哪些节点已经完成质检但还没有 PI 审签？',
  '解释为什么有些节点需要重新审签',
  '汇总当前项目的样本、数据集和文件关联情况',
  '找出文件数量最多、样本关联最多的数据集',
  '根据当前质检和审签状态，给出下一步工作建议',
];
const nowText = () => new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const initialMessage: Message = { id: 'welcome', role: 'assistant', agent: 'Auto', time: nowText(), text: '请描述你想解决的科研问题。未指定具体智能体时，我会先反问确认目标，再自动调度合适的智能体。' };
function loadSessions(): Session[] { try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }

function answerFor(query: string, agent: Agent, projects: Project[], datasets: ReturnType<typeof useAccessibleDatasets>, samples: ReturnType<typeof useSamples>): Omit<Message, 'id' | 'time' | 'role'> {
  const q = query.toLowerCase();
  const refs: Reference[] = [];
  const nodes = projects.flatMap(p => (p.steps || []).map(n => ({ p, n, state: reviewState(p, n, datasets) })));
  const completed = nodes.filter(x => x.n.status === 'completed').length;
  const pending = nodes.filter(x => ['pending', 'stale'].includes(x.state));
  const abnormal = datasets.filter(d => currentQuality(d) === '异常');
  const needQc = datasets.filter(d => currentQuality(d) === '待质检');
  const agentName = agent.id === 'auto' ? '项目统筹助手' : agent.label;

  if (agent.id === 'literature') return { agent: agent.label, text: `文献研读分析准备结果

一、当前研究范围
当前账号可访问 ${projects.length} 个科研项目。你可以上传文献、方案或报告，我会围绕研究问题提取研究结论、关键方法、证据等级和待验证假设。

二、建议提问方式
1. 请比较这几篇文献对同一指标的实验方法和结论差异。
2. 请提取与当前项目节点相关的关键证据，并标注原文出处。
3. 请根据文献结果整理下一轮实验的验证假设。

三、输出内容
将按“研究问题—证据—结论—局限—对当前项目的启示”组织，避免只返回文献标题或摘要。` };
  if (agent.id === 'scheme') return { agent: agent.label, text: `研究方案设计分析结果

一、设计范围
当前可访问项目共有 ${projects.length} 个，关联 ${datasets.length} 个数据集、${nodes.length} 个实验节点。方案设计会同时参考项目目标、节点负责人、已有样本、数据集质检状态和 PI 审签要求。

二、建议方案结构
1. 研究目标与验收指标：明确本阶段要解决的问题和可量化的完成标准。
2. 实验与数据安排：列出样本、实验节点、输入文件、预期产出和质检门槛。
3. 风险与补救：为异常数据、样本不足、排期冲突预留复测或替代路径。
4. 审签材料：准备实验报告、原始数据、质检结论及负责人说明。

三、当前提醒
${pending.length ? `当前有 ${pending.length} 个节点待审签或需要重新提交，建议先补齐对应数据和节点说明。` : '当前没有检测到待重新提交的节点。'}` };
  if (agent.id === 'prediction') return { agent: agent.label, text: `科学预测分析结果

一、预测依据
本次结合 ${projects.length} 个项目、${nodes.length} 个节点、${datasets.length} 个数据集的当前状态进行判断。预测结果属于科研辅助判断，不能替代实验验证或 PI 审签。

二、当前趋势
1. 已完成节点：${completed} 个。
2. 待审签或需重提节点：${pending.length} 个。
3. 质检异常数据集：${abnormal.length} 个；待质检数据集：${needQc.length} 个。

三、优先验证建议
1. 先处理质检异常和当前版本未复核的数据，避免把历史结论带入下一节点。
2. 对审签依据发生变化的节点重新核对样本、文件和实验报告。
3. 对关键指标补充平行实验或时间序列数据，再形成稳定趋势判断。` };
  if (q.includes('数据集') || q.includes('文件') || q.includes('样本') || agent.id === 'analysis') {
    datasets.slice(0, 8).forEach(d => refs.push({ type: 'dataset', label: d.name, datasetId: d.id }));
    const totalFiles = datasets.reduce((n, d) => n + d.files.length, 0);
    const totalSamples = new Set(datasets.flatMap(d => d.sampleIds)).size;
    return { agent: agent.id === 'auto' ? '数据分析助手' : agent.label, text: `数据集与样本分析结果

一、统计范围
本次覆盖当前账号可访问的 ${projects.length} 个项目、${datasets.length} 个数据集、${totalFiles} 个文件和 ${totalSamples} 个数据集来源样本；统一台账支持一个样本关联多个数据集，以下数量按台账关系去重。

二、质量概况
1. 当前版本待质检：${needQc.length} 个数据集。
2. 质检异常：${abnormal.length} 个数据集。
3. 已登记文件：${totalFiles} 个，其中实际内容已保存的文件为 ${datasets.reduce((n, d) => n + d.files.filter(f => f.hasContent).length, 0)} 个。

三、处理建议
1. 优先补齐历史文件登记对应的实际文件，再登记当前版本质检结论。
2. 对异常数据集补充复核依据、实测指标和整改意见。
3. 数据集、样本或文件发生变化后，需要重新完成质检并重新提交节点审签。

四、可查看明细
点击下方数据集名称可打开详情、质检历史和样本关联。`, refs };
  }
  if (q.includes('项目') || q.includes('进度') || q.includes('风险') || q.includes('审签') || agent.id === 'project') {
    projects.forEach(p => refs.push({ type: 'project', label: `${p.number} · ${p.name}`, project: p }));
    pending.slice(0, 8).forEach(x => refs.push({ type: 'node', label: `${x.p.name} / ${x.n.title}`, project: x.p, nodeId: x.n.id }));
    const projectLines = projects.map((p, i) => { const ps = p.steps || []; const done = ps.filter(n => n.status === 'completed').length; const current = ps.find(n => n.status === 'in_progress') || ps.find(n => n.status === 'pending'); return `${i + 1}. ${p.name}
   负责人：${p.piName || '待确定'}
   当前阶段：${current ? `${current.order}. ${current.title}` : '节点已完成'}
   节点进度：${done}/${ps.length || 0} 个完成
   关键问题：${ps.some(n => n.riskLevel === 'high') ? '存在高风险节点，需重点跟进' : '暂无高风险节点'}`; }).join('\n');
    return { agent: agentName, text: `项目进展分析结果

一、统计范围
本次按当前账号可访问的项目进行统计，覆盖 ${projects.length} 个项目，重点查看研究阶段、负责人、节点完成度、质检结果和 PI 审签状态。

二、总体结论
1. 当前共有 ${completed} 个实验节点完成，${pending.length} 个节点处于待审签、待处理或需要重新提交状态。
2. 当前发现 ${abnormal.length} 个质检异常数据集、${needQc.length} 个待质检数据集，数据完整性会直接影响后续节点放行。
3. 建议 PI 优先关注高风险阶段的负责人任务分配，并要求阶段负责人补齐实验报告、原始数据和审批记录。

三、项目明细
${projectLines || '当前账号暂无可访问项目。'}

四、任务建议
1. 对进度落后或审签依据变化的节点，先核对最新数据版本，再重新提交。
2. 对异常数据集补充复测、质检意见和整改计划，避免直接用于阶段结论。
3. 对已完成实验但未归档的项目，补齐样本、数据集、文件和 PI 批复之间的对应关系。

点击下方项目或节点记录可继续查看具体明细。`, refs };
  }
  return { agent: agent.label, text: `科研问题分析结果

一、已读取范围
当前账号可访问 ${projects.length} 个项目、${datasets.length} 个数据集和 ${samples.length} 个样本。

二、我可以继续帮助你
1. 统计项目进度、节点完成率和风险。
2. 查找待质检、质检异常或需要重新审签的数据集。
3. 汇总样本、文件和数据集的关联关系。
4. 根据研究目标整理实验方案、文献证据或下一步工作建议。

请补充项目名称、节点名称或希望关注的指标，我会按报告结构给出分析。` };
}

export function ResearchAssistant() {
  const [projects] = useAccessibleProjects(); const datasets = useAccessibleDatasets(); const samples = useSamples();
  const [messages, setMessages] = useState<Message[]>([initialMessage]); const [input, setInput] = useState(''); const [attachment, setAttachment] = useState<File | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false); const [agentOpen, setAgentOpen] = useState(false); const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]); const [sessions, setSessions] = useState<Session[]>(loadSessions); const inputRef = useRef<HTMLTextAreaElement>(null);
  const stats = useMemo(() => ({ projects: projects.length, datasets: datasets.length, samples: samples.length }), [projects, datasets, samples]);
  const saveSession = (items = messages) => { if (items.length <= 1) return; const next = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), messages: items }, ...sessions].slice(0, 12); setSessions(next); localStorage.setItem(SESSION_KEY, JSON.stringify(next)); };
  const send = (preset?: string) => { const text = (preset ?? input).trim(); if (!text) return; const userMessage: Message = { id: crypto.randomUUID(), role: 'user', time: nowText(), text, attachment: attachment?.name }; const answer = answerFor(text, selectedAgent, projects, datasets, samples); setMessages(prev => [...prev, userMessage, { id: crypto.randomUUID(), role: 'assistant', time: nowText(), ...answer }]); setInput(''); setAttachment(null); };
  const newSession = () => { saveSession(); setMessages([{ ...initialMessage, id: crypto.randomUUID(), time: nowText() }]); setInput(''); setAttachment(null); setHistoryOpen(false); };
  const openReference = (ref: Reference) => { if (ref.type === 'dataset' && ref.datasetId) window.dispatchEvent(new CustomEvent('research-assistant-open-dataset', { detail: ref.datasetId })); if (ref.type === 'project' && ref.project) window.dispatchEvent(new CustomEvent('research-assistant-open-project', { detail: ref.project })); if (ref.type === 'node' && ref.project) window.dispatchEvent(new CustomEvent('research-assistant-open-node', { detail: { project: ref.project, nodeId: ref.nodeId } })); };
  return <div className="p-6 min-w-0" data-research-assistant><div className="max-w-5xl mx-auto space-y-3">
    <div className="flex gap-2"><Button variant="outline" className="bg-white" onClick={() => setHistoryOpen(v => !v)}><History className="size-4 mr-1" />查看历史</Button><Button onClick={newSession}><Plus className="size-4 mr-1" />新建对话</Button></div>
    {historyOpen && <div className="rounded-xl border bg-white p-3 space-y-1">{sessions.length ? sessions.map(session => <button key={session.id} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs" onClick={() => { setMessages(session.messages); setHistoryOpen(false); }}>{new Date(session.createdAt).toLocaleString('zh-CN')} · {session.messages.find(m => m.role === 'user')?.text || '科研助手对话'}</button>) : <p className="text-xs text-slate-400 p-2">暂无历史对话</p>}</div>}
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"><header className="p-5 border-b bg-slate-50/80 flex items-center gap-3"><div className="size-10 rounded-xl bg-blue-800 text-white flex items-center justify-center"><Sparkles className="size-5" /></div><div><h1 className="font-bold text-base">智能科研助手</h1><p className="text-xs text-slate-500 mt-1">在对话框中选择智能体、上传文件后提问。当前范围：{stats.projects} 个项目 · {stats.datasets} 个数据集 · {stats.samples} 个样本</p></div></header>
      <div className="min-h-[390px] max-h-[520px] overflow-y-auto p-5 space-y-5 bg-white">{messages.map(message => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}><div className={`size-8 rounded-xl shrink-0 flex items-center justify-center ${message.role === 'assistant' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 order-2'}`}>{message.role === 'assistant' ? <Bot className="size-4" /> : <UserRound className="size-4" />}</div><div className="max-w-[82%]"><p className="text-[10px] text-slate-400 mb-1">{message.role === 'assistant' ? message.agent || 'Auto' : '我'} · {message.time}</p><div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm'} whitespace-pre-wrap`}>{message.text}{message.attachment && <p className="mt-2 text-xs opacity-80">附件：{message.attachment}</p>}</div>{message.refs?.length ? <div className="mt-2 flex flex-wrap gap-2">{message.refs.map(ref => <button key={`${ref.type}-${ref.datasetId || ref.nodeId || ref.label}`} onClick={() => openReference(ref)} className="inline-flex items-center gap-1 text-xs text-blue-700 border border-blue-200 bg-blue-50 rounded-full px-3 py-1 hover:bg-blue-100">{ref.label}<ChevronRight className="size-3" /></button>)}</div> : null}</div></div>)}</div>
      <div className="border-t p-4"><div className="flex items-center gap-2 text-xs text-blue-700 mb-3"><Sparkles className="size-4" />Auto 演示示例</div><div className="grid sm:grid-cols-2 gap-2">{EXAMPLES.map((example, index) => <button key={example} onClick={() => send(example)} className="text-left px-3 py-2 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 text-xs text-slate-600"><span className="text-blue-700 mr-2">示例{index + 1}</span>{example}</button>)}</div></div>
      <div className="border-t p-4"><textarea ref={inputRef} aria-label="科研助手问题" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="输入问题，例如：基于当前项目进度，哪些节点需要优先处理？" rows={3} className="w-full resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400" />{attachment && <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-blue-50 text-blue-700 px-3 py-1 text-xs">{attachment.name}<button aria-label="移除附件" onClick={() => setAttachment(null)}><X className="size-3" /></button></div>}<div className="pt-3 border-t flex justify-between items-center"><div className="flex gap-2 relative"><Button variant="outline" size="sm" aria-haspopup="menu" aria-expanded={agentOpen} onClick={() => setAgentOpen(v => !v)}><selectedAgent.icon className="size-3 mr-1" />{selectedAgent.label}<ChevronRight className="size-3 ml-1" /></Button>{agentOpen && <div role="menu" className="absolute bottom-11 left-0 z-20 w-56 rounded-xl border bg-white p-2 shadow-xl">{AGENTS.map(agent => <button key={agent.id} role="menuitem" onClick={() => { setSelectedAgent(agent); setAgentOpen(false); inputRef.current?.focus(); }} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left ${selectedAgent.id === agent.id ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50'}`}><agent.icon className="size-4 shrink-0" /><span><span className="block text-xs font-semibold">{agent.label}</span><span className="block text-[10px] text-slate-400 mt-0.5">{agent.description}</span></span></button>)}</div>}<label className="cursor-pointer"><span className="inline-flex items-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50"><Paperclip className="size-3 mr-1" />上传文件</span><input aria-label="助手上传文件" type="file" className="sr-only" onChange={e => setAttachment(e.target.files?.[0] || null)} /></label></div><Button size="sm" onClick={() => send()} disabled={!input.trim()}><Send className="size-3 mr-1" />发送</Button></div></div>
    </section></div></div>;
}
