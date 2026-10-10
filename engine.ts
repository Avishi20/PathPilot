import { Milestone, Roadmap, Status } from './data';
export const isDone=(s:Status)=>s==='completed'||s==='known';
export function recompute(ms:Milestone[]):Milestone[]{ const by=new Map(ms.map(m=>[m.id,m])); return ms.map(m=>{ if(isDone(m.status)||m.status==='in_progress') return m; const open=m.prerequisites.some(id=>!isDone(by.get(id)?.status||'locked')); return {...m,status:open?'locked':'available'}; }); }
export function progress(ms:Milestone[]){return Math.round(ms.reduce((n,m)=>n+(isDone(m.status)?1:m.status==='in_progress'?.5:0),0)/ms.length*100)}
export function remainingHours(ms:Milestone[]){return ms.filter(m=>!isDone(m.status)).reduce((n,m)=>n+m.hours,0)}
export function readiness(ms:Milestone[]){return Math.min(99,Math.round(progress(ms)*.72 + ms.filter(m=>m.category==='interview'&&isDone(m.status)).length*7))}
export function feasibility(ms:Milestone[],hours:number,deadline:string){const weeks=Math.max(1,Math.ceil((new Date(deadline).getTime()-Date.now())/604800000));const available=weeks*hours;const remaining=remainingHours(ms);return {available,remaining,status:remaining<=available?'On track':remaining<=available*1.2?'Tight':'Needs more hours or time'};}
export function next(ms:Milestone[]){return ms.find(m=>m.status==='in_progress')||ms.find(m=>m.status==='available')||ms.find(m=>!isDone(m.status));}
export function validate(r:Roadmap){const ids=new Set(r.milestones.map(m=>m.id));return r.milestones.every(m=>m.hours>0&&m.prerequisites.every(p=>ids.has(p))&&m.prerequisites.every(p=>p!==m.id));}
