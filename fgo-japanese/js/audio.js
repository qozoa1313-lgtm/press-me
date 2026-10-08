/* ═══════════════ 소리 ═══════════════
   게임 원본 보이스 = Atlas 의 mp3 주소를 그대로 재생 (내려받아 저장하지 않음)
   현실 일본어 = 브라우저 읽어주기(SpeechSynthesis, ja-JP) — 영어앱 speak() 를 복사해 언어만 바꿈 */

let player = null;   /* 지금 재생 중인 원본 보이스 묶음 */

/* parts: [{url, delay}] 를 순서대로 이어 재생. delay(초)는 그 파일 앞에서 쉬는 시간 */
function playParts(parts, onState){
  stopParts();
  const me = { stopped: false, audio: null, timer: null };
  player = me;
  onState('playing');
  let i = 0;
  const next = () => {
    if(me.stopped) return;
    if(i >= parts.length){ player = null; onState('ended'); return; }
    const p = parts[i++];
    me.timer = setTimeout(() => {
      if(me.stopped) return;
      const a = new Audio(p.url);
      me.audio = a;
      a.onended = next;
      a.onerror = () => {
        const code = a.error ? a.error.code : '?';
        toast(`원본 보이스를 불러오지 못했어요 (media error ${code})`);
        player = null; onState('error');
      };
      a.play().catch(e => {
        toast(`재생이 막혔어요 (${e.name})`);
        player = null; onState('error');
      });
    }, (p.delay || 0) * 1000);
  };
  next();
  return me;
}
function stopParts(){
  if(!player) return;
  player.stopped = true;
  clearTimeout(player.timer);
  if(player.audio){ player.audio.pause(); }
  player = null;
}

function speak(text){
  if(!('speechSynthesis' in window)) return toast('이 브라우저는 읽어주기를 지원하지 않습니다 (no-api)');
  stopParts();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP'; u.rate = 0.9;
  const ja = speechSynthesis.getVoices().find(v => v.lang && v.lang.replace('_','-').startsWith('ja'));
  if(ja) u.voice = ja;
  /* 다른 소리를 틀거나 화면을 넘겨서 멈춘 것(interrupted·canceled)은 실패가 아님 */
  u.onerror = e => { if(!['interrupted','canceled'].includes(e.error)) toast(`읽어주기 실패 (${e.error || '?'})`); };
  speechSynthesis.speak(u);
  return u;
}
