/* ═══════════════ 화면 ═══════════════
   데이터: data/prototype_901100.json (learning/ 원본의 복사본. 원본은 고치지 않는다)
   한 번에 episode 하나. 긴 episode 는 앞 조각을 끝내야 다음 조각이 열린다. */

let tt;
function toast(m){   /* 영어앱 toast 복사 */
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('on');
  clearTimeout(tt); tt = setTimeout(()=>t.classList.remove('on'), 2400);
}

const GRADE = {
  '◎': '그대로 써도 자연스러워요',
  '○': '자연스럽지만 상황에 따라 써요',
  '△': '캐릭터 말투가 강해요',
  '×': '알아듣기 위주로 익혀요',
};

let DATA = null;
let idx = 0;   /* 지금 보는 episode 번호. 저장하지 않음 (저장은 완료 상태만) */

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* 아직 안 끝낸 첫 조각. 다 끝냈으면 null */
const currentSeg = ep => ep.segments.find(s => !isDone(s.id)) || null;

function voiceBtn(id, label, cls = ''){
  return `<button class="voice ${cls}" id="${id}" data-label="${esc(label)}">▶ ${esc(label)}</button>`;
}

function wireVoice(id, parts){
  const b = document.getElementById(id);
  if(!b) return;
  b.onclick = () => {
    if(b.classList.contains('playing')){ stopParts(); setIdle(); return; }
    document.querySelectorAll('.voice.playing').forEach(x => { x.classList.remove('playing'); x.textContent = '▶ ' + x.dataset.label; });
    b.classList.add('playing'); b.textContent = '■ 멈추기';
    playParts(parts, st => { if(st !== 'playing') setIdle(); });
  };
  function setIdle(){ b.classList.remove('playing'); b.textContent = '▶ ' + b.dataset.label; }
}

/* 조각 하나를 어떻게 재생할지. 가짜 시간은 만들지 않는다 */
function segPlayback(ep, seg){
  const part = ep.audioParts.find(p => p.id === seg.timing.audioPart);
  const t = seg.timing;
  let hint = '';
  if(t.status === 'needs_alignment') hint = '현재는 원본 조각 단위로 재생 — 이 파일에는 다른 문장도 함께 들어 있어요';
  else if(t.basis === 'duration_estimate') hint = '현재는 원본 조각 단위로 재생 — 이 문장이 든 파일을 길이로 짐작했어요';
  return { parts: [{ url: part.url, delay: 0 }], hint };
}

function panelsHTML(seg){
  const chunks = seg.chunks.items.map(c => `
    <div class="chunk"><span class="s">${esc(c.surface)}</span><span class="r">${esc(c.reading)}</span><span class="k">${esc(c.ko)}</span></div>`).join('');
  const g = seg.usage.grade;
  const legend = Object.entries(GRADE).map(([k,v]) => `<span>${k} ${v}</span>`).join('');
  const ev = seg.everyday.items.map((x,i) => `
    <div class="ev">
      <span class="reg">${x.register === 'casual' ? 'casual · 편하게' : 'polite · 정중하게'}</span>
      <span class="s">${esc(x.jp)}</span><span class="r">${esc(x.reading)}</span><span>${esc(x.ko)}</span>
      <button class="tts" data-say="${i}">🔊 듣기</button>
    </div>`).join('') + (seg.everyday.note ? `<p class="hint">${esc(seg.everyday.note)}</p>` : '');
  const kws = seg.keywords.map(k => `
    <div class="kw">
      <div class="s">${esc(k.surface)}</div><div class="r">${esc(k.surfaceReading)}</div><div>${esc(k.ko)}</div>
      ${k.lemma !== k.surface ? `<div class="base">기본형: ${esc(k.lemma)}（${esc(k.lemmaReading)}）</div>` : ''}
    </div>`).join('');
  return `
  <div class="panels">
    <details id="p-chunks"><summary>의미 덩어리 보기</summary><div class="pbody">${chunks}</div></details>
    <details id="p-usage"><summary>말투 보기</summary><div class="pbody">
      <div class="grade"><b>${esc(g)}</b><span>${esc(GRADE[g] || '')}</span></div>
      <p style="margin:0">${esc(seg.usage.note)}</p>
      <div class="legend">${legend}</div></div></details>
    <details id="p-everyday"><summary>현실에서는?</summary><div class="pbody">${ev}</div></details>
    <details id="p-keywords"><summary>핵심 단어</summary><div class="pbody">${kws}</div></details>
  </div>`;
}

function render(){
  stopParts();
  if('speechSynthesis' in window) speechSynthesis.cancel();
  const eps = DATA.episodes, ep = eps[idx];
  document.getElementById('progress').textContent = `오늘의 보이스 · 진행: ${idx + 1} / ${eps.length}`;
  document.getElementById('prev').disabled = idx === 0;
  document.getElementById('next').disabled = idx === eps.length - 1;

  const long = ep.segments.length > 1;
  const seg = currentSeg(ep);
  const n = ep.segments.length;
  const allParts = ep.audioParts.map(p => ({ url: p.url, delay: p.delay }));
  let h = `<div class="meta"><span class="chip">${esc(ep.label)}</span>${long ? `<span class="chip gray">긴 보이스 · ${n}조각</span>` : ''}</div>`;

  if(long){
    const dots = ep.segments.map(s => `<span class="dot ${isDone(s.id) ? 'on' : ''}"></span>`).join('');
    h += `<div class="dots">${dots}<span>${seg ? `오늘은 ${seg.order} / ${n} 조각` : `${n}조각 모두 끝냈어요`}</span></div>`;
    if(seg){
      const pb = segPlayback(ep, seg);
      h += `<div class="voice-row">${voiceBtn('play-seg', '이 조각 듣기')}</div>`;
      if(pb.hint) h += `<p class="hint">${esc(pb.hint)}</p>`;
      h += `<div class="voice-row">${voiceBtn('play-all', '전체 듣기', 'small')}</div>`;
    }else{
      h += voiceBtn('play-all', '전체 다시 듣기');
    }
  }else{
    h += voiceBtn('play-all', '원본 보이스 듣기');
  }

  /* 본문: 지금 조각. 다 끝낸 긴 보이스는 전체 문장 */
  const show = seg || (long ? null : ep.segments[0]);
  if(show){
    h += `<p class="jp" lang="ja">${esc(show.jp)}</p>
          <p class="reading" lang="ja">${esc(show.reading)}</p>
          <p class="natural">${esc(show.translation.naturalKo)}</p>
          <div class="study"><small>일본어 그대로 보면</small>${esc(show.translation.studyKo)}</div>
          ${panelsHTML(show)}`;
  }else{
    h += `<p class="jp" lang="ja">${esc(ep.jpFull)}</p>
          <p class="reading" lang="ja">${esc(ep.segments.map(s => s.reading).join(' '))}</p>
          <p class="natural">${esc(ep.translation.naturalKo)}</p>
          <div class="study"><small>일본어 그대로 보면</small>${esc(ep.translation.studyKo)}</div>`;
  }

  if(seg){
    h += `<button class="done-btn" id="done">${long ? '오늘 조각 완료' : '학습 완료'}</button>`;
  }else{
    h += `<p class="done-msg">✓ ${long ? '모든 조각을 끝냈어요' : '완료한 보이스예요'}</p>`;
  }

  const card = document.getElementById('card');
  card.innerHTML = h;

  wireVoice('play-all', allParts);
  if(seg && long) wireVoice('play-seg', segPlayback(ep, seg).parts);
  card.querySelectorAll('.tts').forEach(b => b.onclick = () => speak(show.everyday.items[+b.dataset.say].jp));
  const d = document.getElementById('done');
  if(d) d.onclick = () => {
    markDone(seg.id);
    toast(long && seg.order < n ? `${seg.order} / ${n} 완료 — 다음 조각이 열렸어요` : '완료했어요');
    render();
  };
}

document.getElementById('prev').onclick = () => { if(idx > 0){ idx--; render(); window.scrollTo(0,0); } };
document.getElementById('next').onclick = () => { if(idx < DATA.episodes.length - 1){ idx++; render(); window.scrollTo(0,0); } };

fetch('data/prototype_901100.json')
  .then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(d => {
    DATA = d;
    document.getElementById('face').src = d.meta.servantImage;
    document.getElementById('name').textContent = d.meta.servantName;
    render();
  })
  .catch(e => {
    document.getElementById('card').innerHTML = `<p>데이터를 불러오지 못했어요 (${esc(e.message)})</p>`;
  });
