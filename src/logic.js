export const total=(matches,uid)=>matches.filter(m=>m.ownerUid===uid).reduce((a,m)=>({goals:a.goals+m.goals,assists:a.assists+m.assists,scorers:a.scorers+m.goals+m.assists}),{goals:0,assists:0,scorers:0});
export const compare=(a,ta,b,tb)=>Math.sign(a*tb-b*ta);
export function validateMatch(m){return /^\d{4}-\d{2}-\d{2}$/.test(m.playedOn)&&!Number.isNaN(Date.parse(m.playedOn))&&new Date(m.playedOn).toISOString().slice(0,10)===m.playedOn&&m.opponent.trim().length>0&&[m.goals,m.assists].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000)}

// getRandomValues also works where randomUUID requires a secure context.
export function createMatchId(){
 const bytes=globalThis.crypto.getRandomValues(new Uint8Array(16));
 bytes[6]=(bytes[6]&0x0f)|0x40;
 bytes[8]=(bytes[8]&0x3f)|0x80;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
