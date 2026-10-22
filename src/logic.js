export const total=(matches,uid)=>matches.filter(m=>m.ownerUid===uid).reduce((a,m)=>({goals:a.goals+m.goals,assists:a.assists+m.assists,scorers:a.scorers+m.goals+m.assists}),{goals:0,assists:0,scorers:0});
export const compare=(a,ta,b,tb)=>Math.sign(a*tb-b*ta);
export function validateMatch(m){return /^\d{4}-\d{2}-\d{2}$/.test(m.playedOn)&&!Number.isNaN(Date.parse(m.playedOn))&&new Date(m.playedOn).toISOString().slice(0,10)===m.playedOn&&m.opponent.trim().length>0&&[m.goals,m.assists].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000)}
