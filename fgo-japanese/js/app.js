/* ═══════════════ 화면 ═══════════════
   탭 4개: 오늘 / 캐릭터 / 보이스함 / 기록
   오늘 = 선택한 캐릭터의 「새 학습 단위」 하나 + 「오늘의 복습」
   새 학습 = 학습 대상(studyEligible) 중 아직 안 배운 것, beginnerOrder(쉬운 순서) 가 가장 빠른 것
   하루 규칙 = 캐릭터마다 새 학습은 하루 한 단위. 며칠을 비워도 한 단위씩만 나아간다
   복습 = 영어앱 규칙 그대로 (store.js markReview). 복습이 밀려도 새 학습은 막지 않는다 */

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
  '×': '게임·고풍·특수 표현이에요. 알아듣기 위주로',
};
const STEPS = ['듣기', '일본어', '뜻', '뜯어보기', '게임 말투', '현실 표현', '기억하기'];
const NEXT_LABEL = ['일본어 보기', '뜻 보기', '뜯어보기', '게임 말투 알아보기', '현실에서는?', '오늘 이것만 기억해요'];
const RESULT_MARK = { ok: '✓', so: '△', no: '✕' };

let CHARS = null;
const LDATA = {};              /* 캐릭터 id → 학습 데이터 */
let step = 0, stepUnit = null; /* 오늘 학습 단계 (저장하지 않음) */
let revOpen = false;           /* 복습 카드에서 뜻을 펼쳤는지 */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fetchJSON = u => fetch(u).then(r => { if(!r.ok) throw new Error(`HTTP ${r.status} ${u}`); return r.json(); });

async function learning(charId){
  const c = CHARS.characters[charId];
  if(!c || !c.enabled || !c.learningData) return null;
  return LDATA[charId] ||= await fetchJSON(c.learningData);
}

/* 모든 학습 단위 (보이스함·기록용, 데이터 순서) */
function units(data){
  if(data._units) return data._units;
  const out = [];
  data.episodes.forEach(ep => ep.segments.forEach(seg =>
    out.push({ id: seg.id, ep, seg, long: ep.segments.length > 1 })));
  return (data._units = out);
}
/* 오늘의 학습 대상 — 쉬운 순서 */
function studyUnits(data){
  return data._study ||= units(data).filter(u => u.seg.studyEligible)
    .sort((a, b) => a.seg.beginnerOrder - b.seg.beginnerOrder);
}
const unitLabel = u => u.long ? `${u.ep.label} ${u.seg.order}/${u.seg.of}` : u.ep.label;

function todayPlan(charId, data){
  const us = studyUnits(data), done = charState(charId).done;
  const next = us.find(u => !done[u.id]) || null;
  const today = us.filter(u => done[u.id] && done[u.id].learnedAt === todayStr())
                  .sort((a, b) => done[a.id].at < done[b.id].at ? -1 : 1);
  if(today.length) return { mode: 'doneToday', unit: today[today.length - 1], next };
  if(next) return { mode: 'study', unit: next };
  return { mode: 'allDone' };
}
function dueReviews(charId, data){
  const t = todayStr(), done = charState(charId).done;
  return units(data).filter(u => {
    const p = done[u.id];
    return p && p.reviewStep < LADDER.length && p.nextDue <= t && p.learnedAt !== t;
  }).sort((a, b) => done[a.id].nextDue < done[b.id].nextDue ? -1 : done[a.id].nextDue > done[b.id].nextDue ? 1
                                                            : a.seg.beginnerOrder - b.seg.beginnerOrder);
}

function charSummary(charId, data){
  const us = studyUnits(data), done = charState(charId).done;
  const learned = us.filter(u => done[u.id]).length;
  const going = data.episodes.filter(ep => {
    if(ep.segments.length < 2) return false;
    const n = ep.segments.filter(s => done[s.id]).length;
    return n > 0 && n < ep.segments.filter(s => s.studyEligible).length;
  }).map(ep => `${ep.label} ${ep.segments.filter(s => done[s.id]).length}/${ep.segments.length}`);
  return { learned, total: us.length, going };
}

/* ─── 소리 버튼 ─── */
function voiceBtn(id, label, cls = ''){
  return `<button class="voice ${cls}" id="${id}" data-label="${esc(label)}">▶ ${esc(label)}</button>`;
}
function wireVoice(id, parts){
  const b = $(id);
  if(!b) return;
  const idle = () => { b.classList.remove('playing'); b.textContent = '▶ ' + b.dataset.label; };
  b.onclick = () => {
    if(b.classList.contains('playing')){ stopParts(); idle(); return; }
    document.querySelectorAll('.voice.playing').forEach(x => { x.classList.remove('playing'); x.textContent = '▶ ' + x.dataset.label; });
    b.classList.add('playing'); b.textContent = '■ 멈추기';
    playParts(parts, st => { if(st !== 'playing') idle(); });
  };
}
const allParts = ep => ep.audioParts.map(p => ({ url: p.url, delay: p.delay }));
/* 조각 하나 재생. 가짜 시간은 만들지 않는다 — 조각이 든 원본 파일(들)을 그대로 튼다 */
function segPlayback(ep, seg){
  if(ep.segments.length < 2) return { parts: allParts(ep), hint: '' };
  const t = seg.timing;
  const ids = t.audioParts || [t.audioPart];
  const parts = ids.map((id, i) => {
    const p = ep.audioParts.find(a => a.id === id);
    return { url: p.url, delay: i ? p.delay : 0 };
  });
  let hint = '';
  if(t.status === 'needs_alignment') hint = '현재는 원본 조각 단위로 재생 — 이 파일에는 다른 문장도 함께 들어 있어요';
  else if(t.basis === 'duration_estimate') hint = '현재는 원본 조각 단위로 재생 — 이 문장이 든 파일을 길이로 짐작했어요';
  return { parts, hint };
}

/* ─── 학습 단계별 내용 ─── */
const secJp = s => `<section class="sec"><p class="jp" lang="ja">${esc(s.jp)}</p><p class="reading" lang="ja">${esc(s.reading)}</p></section>`;
const secMeaning = s => `<section class="sec">
  <p class="natural">${esc(s.translation.naturalKo)}</p>
  <details class="study"><summary>일본어 그대로 보면</summary><p>${esc(s.translation.studyKo)}</p></details></section>`;
const secChunks = s => `<section class="sec"><h3>뜯어보기</h3><div class="chunks">${s.chunks.items.map(c => `
  <div class="chunk"><span class="s" lang="ja">${esc(c.surface)}</span><span class="r" lang="ja">${esc(c.reading)}</span><span class="k">${esc(c.ko)}</span></div>`).join('')}</div></section>`;
const secUsage = s => `<section class="sec"><h3>게임에서는 이렇게 말해요</h3>
  <div class="grade"><b>${esc(s.usage.grade)}</b><span>${esc(GRADE[s.usage.grade] || '')}</span></div>
  <p class="note">${esc(s.usage.note)}</p></section>`;
const secEveryday = s => `<section class="sec"><h3>현실에서는 이렇게 말해요</h3>${s.everyday.items.map((x, i) => `
  <div class="ev">
    <span class="reg">${x.register === 'casual' ? '친한 사이' : '정중하게'}</span>
    <span class="s" lang="ja">${esc(x.jp)}</span><span class="r" lang="ja">${esc(x.reading)}</span><span>${esc(x.ko)}</span>
    <button class="tts" data-say="${i}">🔊 들어보기</button>
  </div>`).join('')}
  ${s.everyday.note ? `<p class="note">${esc(s.everyday.note)}</p>` : ''}
  ${s.everyday.items.length ? '<p class="tts-cap">🔊 은 게임 목소리가 아니라 기기 읽어주기 음성이에요</p>' : ''}</section>`;
const kwHTML = k => `<div class="kw"><div class="s" lang="ja">${esc(k.surface)}</div><div class="r" lang="ja">${esc(k.surfaceReading)}</div>
  ${k.lemma !== k.surface
    ? `<div class="base">기본형 <b lang="ja">${esc(k.lemma)}（${esc(k.lemmaReading)}）</b> ${esc(k.ko)}</div>`
    : `<div>${esc(k.ko)}</div>`}</div>`;
const secKeywords = s => `<section class="sec"><h3>오늘 이것만 기억해요</h3>${s.keywords.map(kwHTML).join('')}</section>`;
const SECTIONS = [null, secJp, secMeaning, secChunks, secUsage, secEveryday, secKeywords];

function headHTML(c, sub){
  return `<div class="who"><img class="face" src="${esc(c.image)}" alt="${esc(c.nameKo)}">
    <div><b lang="ja">${esc(c.nameJa)}</b><span>${esc(c.nameKo)} · ${esc(sub)}</span></div></div>`;
}
function dotsHTML(ep, charId){
  return `<div class="dots">${ep.segments.map(s => `<span class="dot ${isDone(charId, s.id) ? 'on' : ''}"></span>`).join('')}</div>`;
}

/* ─── 오늘의 복습 ─── */
function reviewHTML(charId, data){
  const due = dueReviews(charId, data);
  if(!due.length) return '<p class="rev-none">오늘 복습할 보이스는 없어요</p>';
  const u = due[0], s = u.seg;
  let h = `<section class="rev"><h3 class="grp">오늘의 복습 <b>${due.length}</b>개</h3>
    <div class="card revcard">
      <div class="meta"><span class="chip">${esc(unitLabel(u))}</span><span class="chip gray">오늘 다시 만난 보이스</span></div>
      ${voiceBtn('rev-play', '게임 보이스 듣기', 'small')}
      <p class="jp" lang="ja">${esc(s.jp)}</p>`;
  if(!revOpen){
    h += `<p class="ask">무슨 뜻이었지?</p><button class="next-btn" id="rev-show">뜻 보기</button>`;
  }else{
    h += `<p class="reading" lang="ja">${esc(s.reading)}</p>
      <p class="natural">${esc(s.translation.naturalKo)}</p>
      ${s.keywords.map(kwHTML).join('')}
      <div class="rev-btns">
        <button data-rev="ok">✓ 기억나요</button><button data-rev="so">△ 헷갈려요</button><button data-rev="no">✕ 어려워요</button>
      </div>`;
  }
  return h + '</div></section>';
}
function wireReview(charId, data){
  const due = dueReviews(charId, data);
  if(!due.length) return;
  const u = due[0];
  wireVoice('rev-play', segPlayback(u.ep, u.seg).parts);
  const sh = $('rev-show');
  if(sh) sh.onclick = () => { revOpen = true; renderToday(); };
  document.querySelectorAll('[data-rev]').forEach(b => b.onclick = () => {
    markReview(charId, u.id, b.dataset.rev);
    revOpen = false;
    toast(b.dataset.rev === 'ok' ? '좋아요! 다음엔 조금 더 뒤에 만나요' : '내일 다시 만나요');
    renderToday();
  });
}

/* ─── 오늘 탭 ─── */
async function renderToday(){
  const body = $('todayBody');
  const id = DB.selected;
  if(!id || !CHARS.characters[id] || !CHARS.characters[id].enabled){
    body.innerHTML = `<h2 class="ask-who">오늘 누구랑 공부할까요?</h2>${await charListHTML()}`;
    wireCharList(body);
    return;
  }
  const c = CHARS.characters[id], data = await learning(id);
  const plan = todayPlan(id, data);
  let h = headHTML(c, '오늘의 학습');

  if(plan.mode === 'allDone'){
    h += `<div class="card center"><p class="big">준비된 보이스를 모두 배웠어요</p><p class="note">이제 복습으로 이어가요</p></div>`;
  }else if(plan.mode === 'doneToday'){
    const u = plan.unit, nx = plan.next;
    const finishedLong = u.long && u.ep.segments.every(s => !s.studyEligible || isDone(id, s.id));
    h += `<div class="card center done-card">
        <p class="done-big">✓ 오늘도 하나 배웠어요</p>
        <span class="chip">${esc(unitLabel(u))}</span>
        <p class="jp small" lang="ja">${esc(u.seg.jp)}</p>
        <p class="natural small">${esc(u.seg.translation.naturalKo)}</p>
        ${finishedLong ? voiceBtn('play-all', '전체 다시 듣기') : ''}
        <p class="next">${nx ? `내일은 <b>${esc(unitLabel(nx))}</b>${nx.long && nx.seg.order > 1 ? ' — 어제에 이어서' : ''}` : '준비된 보이스를 모두 배웠어요'}</p>
      </div>`;
  }else{
    const u = plan.unit, ep = u.ep, s = u.seg;
    if(stepUnit !== u.id){ step = 0; stepUnit = u.id; }
    const pb = segPlayback(ep, s);
    h += `<div class="card voicecard">
        <div class="meta"><span class="chip">${esc(ep.label)}</span>${u.long ? `<span class="chip gray">긴 보이스</span>` : ''}<span class="chip gray">난이도 ${s.difficulty}</span></div>
        ${u.long ? `${dotsHTML(ep, id)}<p class="piece">오늘은 ${s.order} / ${s.of} 조각${s.order > 1 ? ' — 어제에 이어서' : ''}</p>` : ''}
        ${voiceBtn('play-main', u.long ? '게임 보이스 듣기 · 오늘 조각' : '게임 보이스 듣기')}
        ${pb.hint ? `<p class="hint">${esc(pb.hint)}</p>` : ''}
        ${u.long ? voiceBtn('play-all', '전체 보이스 한번 듣기', 'small') : ''}
        ${step === 0 ? '<p class="ask">무슨 말일까?</p>' : ''}
      </div>
      <div class="steps">${STEPS.map((n, i) => `<span class="${i <= step ? 'on' : ''}" title="${n}"></span>`).join('')}</div>`;
    for(let i = 1; i <= step; i++) h += SECTIONS[i](s);
    h += step < STEPS.length - 1
      ? `<button class="next-btn" id="next-step">${NEXT_LABEL[step]} ▸</button>`
      : `<button class="done-btn" id="done">오늘 학습 완료</button>`;
  }
  h += reviewHTML(id, data);
  body.innerHTML = h;

  if(plan.mode === 'study'){
    const u = plan.unit, s = u.seg;
    wireVoice('play-main', segPlayback(u.ep, s).parts);
    if(u.long) wireVoice('play-all', allParts(u.ep));
    body.querySelectorAll('.tts').forEach(b => b.onclick = () => speak(s.everyday.items[+b.dataset.say].jp));
    const nb = $('next-step');
    if(nb) nb.onclick = () => {
      step++; renderToday().then(() => {
        const secs = body.querySelectorAll('.sec');
        if(secs.length) secs[secs.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    const d = $('done');
    if(d) d.onclick = () => { markDone(id, u.id); step = 0; stepUnit = null; window.scrollTo(0, 0); renderToday(); };
  }else if(plan.mode === 'doneToday'){
    wireVoice('play-all', allParts(plan.unit.ep));
  }
  wireReview(id, data);
}

/* ─── 캐릭터 탭 ─── */
async function charListHTML(){
  let h = '<div class="chars">';
  for(const id of CHARS.order){
    const c = CHARS.characters[id];
    const data = await learning(id).catch(() => null);
    if(!data){
      h += `<div class="char off"><img class="face" src="${esc(c.image)}" alt="${esc(c.nameKo)}">
        <div><b lang="ja">${esc(c.nameJa)}</b><span>${esc(c.nameKo)}</span><em>학습 데이터 준비 중</em></div></div>`;
      continue;
    }
    const sm = charSummary(id, data);
    const pct = sm.total ? Math.round(sm.learned / sm.total * 100) : 0;
    h += `<button class="char ${DB.selected === id ? 'sel' : ''}" data-char="${id}">
      <img class="face" src="${esc(c.image)}" alt="${esc(c.nameKo)}">
      <div><b lang="ja">${esc(c.nameJa)}</b><span>${esc(c.nameKo)}${DB.selected === id ? ' · 공부 중' : ''}</span>
      <em>배운 조각 ${sm.learned} / ${sm.total} (${pct}%)${sm.going.length ? ` · 진행 중 ${esc(sm.going.join(', '))}` : ''}</em>
      <span class="bar"><i style="width:${pct}%"></i></span></div></button>`;
  }
  return h + '</div>';
}
function wireCharList(root){
  root.querySelectorAll('[data-char]').forEach(b => b.onclick = () => {
    selectChar(b.dataset.char);
    toast(`${CHARS.characters[b.dataset.char].nameKo}와 공부해요`);
    switchTab('Today');
  });
}
async function renderChars(){
  const body = $('charsBody');
  body.innerHTML = await charListHTML();
  wireCharList(body);
}

/* ─── 보이스함 — 미리 보고 다시 들어도 진도는 바뀌지 않는다 ─── */
async function renderBox(){
  const body = $('boxBody'), id = DB.selected;
  const data = id ? await learning(id) : null;
  if(!data){ body.innerHTML = '<p class="empty">캐릭터를 먼저 골라 주세요</p>'; return; }
  const c = CHARS.characters[id];
  const rows = data.episodes.map((ep, i) => {
    const el = ep.segments.filter(s => s.studyEligible);
    const n = el.filter(s => isDone(id, s.id)).length;
    const kind = !el.length ? 'skip' : n === 0 ? 'new' : n < el.length ? 'going' : 'done';
    return { ep, i, n, total: el.length, kind };
  });
  const row = r => `<details class="boxitem" data-ep="${r.i}"><summary><span class="chip">${esc(r.ep.label)}</span>
      <span class="st">${r.kind === 'skip' ? '학습 제외(기합 등)' : r.total > 1 ? `${r.n}/${r.total} 조각` : r.kind === 'done' ? '배움' : '아직'}</span></summary>
      <div class="pbody"></div></details>`;
  const group = (title, list) => list.length ? `<h3 class="grp">${title} <b>${list.length}</b></h3>` + list.map(row).join('') : '';
  const miss = data.sourceMissing || [];
  body.innerHTML = headHTML(c, '보이스함')
    + group('진행 중', rows.filter(r => r.kind === 'going'))
    + group('배운 보이스', rows.filter(r => r.kind === 'done'))
    + group('아직 안 배운 보이스', rows.filter(r => r.kind === 'new' || r.kind === 'skip'))
    + (miss.length ? `<h3 class="grp">원문 준비 중 <b>${miss.length}</b></h3>` + miss.map((m, i) => `
      <details class="boxitem" data-miss="${i}"><summary><span class="chip">${esc(m.label)}</span><span class="st">일본어 원문 없음</span></summary>
      <div class="pbody"></div></details>`).join('') : '');
  /* 펼칠 때만 내용을 그린다 (보이스가 많아서) */
  body.querySelectorAll('details.boxitem').forEach(dt => dt.addEventListener('toggle', () => {
    const pb = dt.querySelector('.pbody');
    if(!dt.open || pb.dataset.filled) return;
    pb.dataset.filled = '1';
    if(dt.dataset.miss !== undefined){
      const m = miss[+dt.dataset.miss];
      pb.innerHTML = voiceBtn(`miss-play-${dt.dataset.miss}`, '게임 보이스 듣기', 'small')
        + '<p class="note">텍스트 출처에 이 보이스의 일본어 원문이 없어서 아직 학습 데이터가 없어요.</p>';
      wireVoice(`miss-play-${dt.dataset.miss}`, m.audioParts.map(p => ({ url: p.url, delay: p.delay })));
      return;
    }
    const ep = data.episodes[+dt.dataset.ep];
    pb.innerHTML = voiceBtn(`box-play-${dt.dataset.ep}`, '게임 보이스 듣기', 'small')
      + ep.segments.map(s => `<div class="boxseg">${ep.segments.length > 1 ? `<span class="st">${s.order}/${s.of}${isDone(id, s.id) ? ' ✓' : ''}</span>` : ''}
        <p class="jp small" lang="ja">${esc(s.jp)}</p><p class="reading" lang="ja">${esc(s.reading)}</p><p>${esc(s.translation.naturalKo)}</p></div>`).join('');
    wireVoice(`box-play-${dt.dataset.ep}`, allParts(ep));
  }));
}

/* ─── 기록 ─── */
async function renderLog(){
  const body = $('logBody');
  const t = todayStr(), y = addDays(t, -1);
  const dayName = d => d === t ? '오늘' : d === y ? '어제' : `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
  const byDay = {};
  for(const e of DB.log){
    const c = CHARS.characters[e.charId];
    const data = await learning(e.charId).catch(() => null);
    const u = data && units(data).find(x => x.id === e.unitId);
    const what = `${esc(c ? c.nameKo : e.charId)} · ${esc(u ? unitLabel(u) : e.unitId)}`;
    (byDay[e.day] ||= []).push(e.type === 'review' ? `${what} 복습 ${RESULT_MARK[e.result] || ''}` : `${what} 완료`);
  }
  const days = Object.keys(byDay).sort().reverse();
  const learnN = DB.log.filter(e => e.type !== 'review').length, revN = DB.log.length - learnN;
  body.innerHTML = `<p class="total">총 학습한 조각 <b>${learnN}</b>개 · 복습 <b>${revN}</b>번</p>` + (days.length
    ? days.map(d => `<div class="logday"><h3>${dayName(d)}</h3>${byDay[d].map(x => `<p>${x}</p>`).join('')}</div>`).join('')
    : '<p class="empty">아직 기록이 없어요</p>');
}

/* ─── 탭 ─── */
const TABS = { Today: renderToday, Chars: renderChars, Box: renderBox, Log: renderLog };
function switchTab(name){
  stopParts();
  if('speechSynthesis' in window) speechSynthesis.cancel();
  Object.keys(TABS).forEach(n => $('tab' + n).classList.toggle('hide', n !== name));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
  window.scrollTo(0, 0);
  return TABS[name]().catch(e => { toast(`화면을 그리지 못했어요 (${e.message})`); });
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => switchTab(b.dataset.tab));

fetchJSON('data/characters.json')
  .then(d => { CHARS = d; return switchTab('Today'); })
  .catch(e => { $('todayBody').innerHTML = `<p class="empty">데이터를 불러오지 못했어요 (${esc(e.message)})</p>`; });
