/* ═══════════════ 화면 ═══════════════
   탭 4개: 오늘 / 캐릭터 / 보이스함 / 기록
   오늘 = 선택한 캐릭터의 「다음 학습 단위」 하나. 앱이 정한다 (순서대로, 랜덤 아님)
   학습 단위 = 짧은 보이스 1개 또는 긴 보이스의 조각 1개
   하루 규칙 = 캐릭터마다 하루에 한 단위. 오늘 끝냈으면 다음 단위는 내일(기기 날짜)부터.
              며칠을 비워도 한 단위씩만 나아간다 (날짜가 진도를 올리지 않음) */

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

let CHARS = null;
const LDATA = {};             /* 캐릭터 id → 학습 데이터 */
let step = 0, stepUnit = null; /* 오늘 학습 단계 (저장하지 않음) */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fetchJSON = u => fetch(u).then(r => { if(!r.ok) throw new Error(`HTTP ${r.status} ${u}`); return r.json(); });

async function learning(charId){
  const c = CHARS.characters[charId];
  if(!c || !c.enabled || !c.learningData) return null;
  return LDATA[charId] ||= await fetchJSON(c.learningData);
}

/* 학습 단위 목록 — 데이터 순서 그대로 */
function units(data){
  const out = [];
  data.episodes.forEach(ep => ep.segments.forEach(seg =>
    out.push({ id: seg.id, ep, seg, long: ep.segments.length > 1 })));
  return out;
}
const unitLabel = u => u.long ? `${u.ep.label} ${u.seg.order}/${u.seg.of}` : u.ep.label;

function todayPlan(charId, data){
  const us = units(data), done = charState(charId).done;
  const next = us.find(u => !done[u.id]) || null;
  const today = us.filter(u => done[u.id] && done[u.id].day === todayStr())
                  .sort((a, b) => done[a.id].at < done[b.id].at ? -1 : 1);
  if(today.length) return { mode: 'doneToday', unit: today[today.length - 1], next };
  if(next) return { mode: 'study', unit: next };
  return { mode: 'allDone' };
}

function charSummary(charId, data){
  const us = units(data), done = charState(charId).done;
  const learned = us.filter(u => done[u.id]).length;
  const going = data.episodes.filter(ep => {
    const n = ep.segments.filter(s => done[s.id]).length;
    return ep.segments.length > 1 && n > 0 && n < ep.segments.length;
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
/* 조각 하나 재생. 가짜 시간은 만들지 않는다 */
function segPlayback(ep, seg){
  const part = ep.audioParts.find(p => p.id === seg.timing.audioPart);
  const t = seg.timing;
  let hint = '';
  if(t.status === 'needs_alignment') hint = '현재는 원본 조각 단위로 재생 — 이 파일에는 다른 문장도 함께 들어 있어요';
  else if(t.basis === 'duration_estimate') hint = '현재는 원본 조각 단위로 재생 — 이 문장이 든 파일을 길이로 짐작했어요';
  return { parts: [{ url: part.url, delay: 0 }], hint };
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
  <p class="tts-cap">🔊 은 게임 목소리가 아니라 기기 읽어주기 음성이에요</p></section>`;
const secKeywords = s => `<section class="sec"><h3>오늘 이것만 기억해요</h3>${s.keywords.map(k => `
  <div class="kw"><div class="s" lang="ja">${esc(k.surface)}</div><div class="r" lang="ja">${esc(k.surfaceReading)}</div>
  ${k.lemma !== k.surface
    ? `<div class="base">기본형 <b lang="ja">${esc(k.lemma)}（${esc(k.lemmaReading)}）</b> ${esc(k.ko)}</div>`
    : `<div>${esc(k.ko)}</div>`}</div>`).join('')}</section>`;
const SECTIONS = [null, secJp, secMeaning, secChunks, secUsage, secEveryday, secKeywords];

function headHTML(c, sub){
  return `<div class="who"><img class="face" src="${esc(c.image)}" alt="${esc(c.nameKo)}">
    <div><b lang="ja">${esc(c.nameJa)}</b><span>${esc(c.nameKo)} · ${esc(sub)}</span></div></div>`;
}
function dotsHTML(ep, charId){
  return `<div class="dots">${ep.segments.map(s => `<span class="dot ${isDone(charId, s.id) ? 'on' : ''}"></span>`).join('')}</div>`;
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

  if(plan.mode === 'allDone'){
    body.innerHTML = headHTML(c, '오늘의 보이스') +
      `<div class="card center"><p class="big">준비된 보이스를 모두 배웠어요</p><p class="note">새 보이스는 준비 중이에요</p></div>`;
    return;
  }
  if(plan.mode === 'doneToday'){
    const u = plan.unit, nx = plan.next;
    const finishedLong = u.long && u.seg.order === u.seg.of;
    body.innerHTML = headHTML(c, '오늘의 보이스') + `
      <div class="card center done-card">
        <p class="done-big">✓ 오늘도 하나 배웠어요</p>
        <span class="chip">${esc(unitLabel(u))}</span>
        <p class="jp small" lang="ja">${esc(u.seg.jp)}</p>
        <p class="natural small">${esc(u.seg.translation.naturalKo)}</p>
        ${finishedLong ? voiceBtn('play-all', '전체 다시 듣기') : ''}
        <p class="next">${nx ? `내일은 <b>${esc(unitLabel(nx))}</b>${nx.long && nx.seg.order > 1 ? ' — 어제에 이어서' : ''}` : '준비된 보이스를 모두 배웠어요'}</p>
      </div>`;
    if(finishedLong) wireVoice('play-all', allParts(u.ep));
    return;
  }

  const u = plan.unit, ep = u.ep, s = u.seg;
  if(stepUnit !== u.id){ step = 0; stepUnit = u.id; }
  const pb = u.long ? segPlayback(ep, s) : { parts: allParts(ep), hint: '' };
  let h = headHTML(c, '오늘의 보이스') + `
    <div class="card voicecard">
      <div class="meta"><span class="chip">${esc(ep.label)}</span>${u.long ? `<span class="chip gray">긴 보이스</span>` : ''}</div>
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
  body.innerHTML = h;

  wireVoice('play-main', pb.parts);
  if(u.long) wireVoice('play-all', allParts(ep));
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
    h += `<button class="char ${DB.selected === id ? 'sel' : ''}" data-char="${id}">
      <img class="face" src="${esc(c.image)}" alt="${esc(c.nameKo)}">
      <div><b lang="ja">${esc(c.nameJa)}</b><span>${esc(c.nameKo)}${DB.selected === id ? ' · 공부 중' : ''}</span>
      <em>배운 조각 ${sm.learned} / ${sm.total}${sm.going.length ? ` · 진행 중 ${esc(sm.going.join(', '))}` : ''}</em></div></button>`;
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

/* ─── 보이스함 — 다시 보고 들어도 진도는 바뀌지 않는다 ─── */
async function renderBox(){
  const body = $('boxBody'), id = DB.selected;
  const data = id ? await learning(id) : null;
  if(!data){ body.innerHTML = '<p class="empty">캐릭터를 먼저 골라 주세요</p>'; return; }
  const c = CHARS.characters[id];
  const rows = data.episodes.map((ep, i) => {
    const doneSegs = ep.segments.filter(s => isDone(id, s.id));
    if(!doneSegs.length) return null;
    const full = doneSegs.length === ep.segments.length;
    return { ep, i, doneSegs, full };
  }).filter(Boolean);
  const group = (title, list) => list.length ? `<h3 class="grp">${title}</h3>` + list.map(r => `
    <details class="boxitem"><summary><span class="chip">${esc(r.ep.label)}</span>
      <span class="st">${r.ep.segments.length > 1 ? `${r.doneSegs.length}/${r.ep.segments.length} 조각` : '배움'}</span></summary>
      <div class="pbody">${voiceBtn(`box-play-${r.i}`, r.full ? '게임 보이스 다시 듣기' : '전체 보이스 듣기', 'small')}
      ${r.doneSegs.map(s => `<div class="boxseg"><p class="jp small" lang="ja">${esc(s.jp)}</p>
        <p class="reading" lang="ja">${esc(s.reading)}</p><p>${esc(s.translation.naturalKo)}</p></div>`).join('')}</div></details>`).join('') : '';
  body.innerHTML = headHTML(c, '보이스함') + (rows.length
    ? group('진행 중', rows.filter(r => !r.full)) + group('배운 보이스', rows.filter(r => r.full))
    : '<p class="empty">아직 배운 보이스가 없어요. 오늘 탭에서 하나 배워 보세요</p>');
  rows.forEach(r => wireVoice(`box-play-${r.i}`, allParts(r.ep)));
}

/* ─── 기록 ─── */
async function renderLog(){
  const body = $('logBody');
  const t = todayStr();
  const y = todayStr(new Date(Date.now() - 86400000));
  const dayName = d => d === t ? '오늘' : d === y ? '어제' : `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
  const byDay = {};
  for(const e of DB.log){
    const c = CHARS.characters[e.charId];
    const data = await learning(e.charId).catch(() => null);
    const u = data && units(data).find(x => x.id === e.unitId);
    (byDay[e.day] ||= []).push(`${esc(c ? c.nameKo : e.charId)} · ${esc(u ? unitLabel(u) : e.unitId)} 완료`);
  }
  const days = Object.keys(byDay).sort().reverse();
  body.innerHTML = `<p class="total">총 학습한 조각 <b>${DB.log.length}</b>개</p>` + (days.length
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
