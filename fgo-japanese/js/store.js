/* ═══════════════ 저장 ═══════════════
   영어앱(매일 한 문장) load/save 를 복사해 키와 모양만 바꿈. 키는 v1 때 그대로 fgojp.v1.
   v2 모양:
   { v:2,
     selected: "901100",                                   선택한 캐릭터
     chars: { "901100": { done: { "<unitId>": { at, day } } } },   캐릭터별로 따로
     log:   [ { day, charId, unitId } ] }                   기록 탭용
   unitId = segment id (짧은 보이스는 "…#1").
   날짜는 진도를 올리지 않는다. 「오늘 이미 하나 끝냈나」만 본다. */
const KEY = 'fgojp.v1';

const todayStr = (d) => {   /* 영어앱 todayStr 복사 — 기기 시계 기준 날짜 */
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
};

let DB = load();
function load(){
  let r = null;
  try{ r = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  if(r && r.v === 2) return r;
  const db = { v: 2, selected: null, chars: {}, log: [] };
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
  return db;
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){ toast('저장하지 못했습니다'); } }

const charState = id => (DB.chars[id] ||= { done: {} });
const isDone = (charId, unitId) => !!charState(charId).done[unitId];
function markDone(charId, unitId){
  const day = todayStr();
  charState(charId).done[unitId] = { at: new Date().toISOString(), day };
  DB.log.push({ day, charId, unitId });
  save();
}
function selectChar(id){ DB.selected = id; save(); }
