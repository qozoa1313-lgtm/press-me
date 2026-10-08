/* ═══════════════ 저장 ═══════════════
   영어앱(매일 한 문장) load/save 를 복사해 키와 모양만 바꿈. 키는 처음부터 fgojp.v1.
   v2 모양:
   { v:2,
     selected: "901100",
     chars: { "901100": { done: { "<unitId>": { at, day, learnedAt, reviewStep, nextDue, lastResult } } } },
     log:   [ { day, charId, unitId, type: "learn" | "review", result? } ] }
   unitId = segment id. 캐릭터마다 진도·복습 일정이 따로 있다.
   날짜는 진도를 올리지 않는다. 「오늘 이미 하나 끝냈나」와 복습 날짜만 본다. */
const KEY = 'fgojp.v1';
const LADDER = [1, 3, 7, 14, 30];   /* 영어앱 sentences.js 의 복습 사다리 그대로. 처음 배운 날을 0일로 한 누적 일수 */

const todayStr = (d) => {   /* 영어앱 todayStr 복사 — 기기 시계 기준 날짜 */
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
};
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate()+n); return todayStr(d); };  /* 영어앱 복사 */

let DB = load();
function load(){
  let r = null;
  try{ r = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  let db;
  if(r && r.v === 2) db = r;
  else{
    db = { v: 2, selected: null, chars: {}, log: [] };
    /* v1 → v2: v1 은 카렌 하나뿐이었고 { done: { segId: ISO } } 모양 */
    if(r && r.done){
      for(const [unitId, at] of Object.entries(r.done)){
        const charId = unitId.split(':')[0];
        const day = todayStr(new Date(at));
        (db.chars[charId] ||= { done: {} }).done[unitId] = { at, day };
        db.log.push({ day, charId, unitId });
        db.selected ||= charId;
      }
      db.log.sort((a, b) => a.day < b.day ? -1 : 1);
    }
  }
  /* 복습 칸이 없던 기록(이전 버전)에 복습 시작값을 채운다: 배운 날 + 1일 */
  for(const c of Object.values(db.chars)){
    for(const p of Object.values(c.done)){
      if(p.reviewStep === undefined){
        p.learnedAt = p.learnedAt || p.day;
        p.reviewStep = 0;
        p.nextDue = addDays(p.day, LADDER[0]);
        p.lastResult = null;
      }
    }
  }
  for(const e of db.log) e.type ||= 'learn';
  return db;
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){ toast('저장하지 못했습니다'); } }

const charState = id => (DB.chars[id] ||= { done: {} });
const isDone = (charId, unitId) => !!charState(charId).done[unitId];
function markDone(charId, unitId){
  const day = todayStr();
  charState(charId).done[unitId] = { at: new Date().toISOString(), day, learnedAt: day,
                                     reviewStep: 0, nextDue: addDays(day, LADDER[0]), lastResult: null };
  DB.log.push({ day, charId, unitId, type: 'learn' });
  save();
}
/* 복습 결과 — 영어앱 mark() 규칙 그대로
   ✓ ok  : 한 단계 위로. 다음 날짜 = 오늘 + (LADDER[step] - LADDER[step-1]). 끝까지 가면 졸업(365일 뒤)
   △ so  : 내일 다시, 단계 그대로
   ✕ no  : 내일 다시, 한 단계 아래로 */
function markReview(charId, unitId, m){
  const p = charState(charId).done[unitId], t = todayStr();
  if(m === 'ok'){
    p.reviewStep++;
    p.nextDue = p.reviewStep < LADDER.length
      ? addDays(t, LADDER[p.reviewStep] - (LADDER[p.reviewStep-1] || 0)) : addDays(t, 365);
  }else{
    p.nextDue = addDays(t, 1);
    if(m === 'no' && p.reviewStep > 0) p.reviewStep--;
  }
  p.lastResult = m;
  DB.log.push({ day: t, charId, unitId, type: 'review', result: m });
  save();
}
function selectChar(id){ DB.selected = id; save(); }
