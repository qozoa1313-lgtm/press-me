/* ═══════════════ 저장 ═══════════════
   영어앱(매일 한 문장) load/save 를 복사해 키와 모양만 바꿈.
   저장하는 것: 끝낸 segment 와 끝낸 시각뿐.  { v:1, done: { "901100:0_H080#1": "2026-10-08T…" } }
   날짜로 다음 조각을 열지 않는다. 앞 조각을 끝내야 다음 조각이 열린다. */
const KEY = 'fgojp.v1';

let DB = load();
function load(){
  try{
    const r = JSON.parse(localStorage.getItem(KEY));
    if(r && r.done) return r;
  }catch(e){}
  return { v: 1, done: {} };
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){ toast('저장하지 못했습니다'); } }

const isDone = id => !!DB.done[id];
function markDone(id){ DB.done[id] = new Date().toISOString(); save(); }
