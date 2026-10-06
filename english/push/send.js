/* 매일 아침, 깃허브가 이 파일을 돌려서 알림을 보냅니다.
   비밀값 두 개를 환경변수로 받습니다.
     VAPID_PRIVATE  — 알림용 개인 열쇠
     SUBSCRIPTION   — 폰 등록 코드 (하나만, 또는 [ ... ] 로 여러 개) */

const webpush = require('web-push');

const PUBLIC  = 'BHLjas_POgCZAtOvZac024GydyJ-5BVmClLUrY_9S0YL5sygM5Y3iPxsn57k0D--142E7K5wsN9c70qXuxSDiCY';
const PRIVATE = process.env.VAPID_PRIVATE;
const RAW     = process.env.SUBSCRIPTION;

if (!PRIVATE || !RAW) {
  console.error('VAPID_PRIVATE 또는 SUBSCRIPTION 이 비어 있습니다. 깃허브 Secret 을 확인하세요.');
  process.exit(1);
}

webpush.setVapidDetails('https://qozoa1313-lgtm.github.io/press-me/english/', PUBLIC, PRIVATE);

let subs;
try {
  const parsed = JSON.parse(RAW);
  subs = Array.isArray(parsed) ? parsed : [parsed];
} catch (e) {
  console.error('SUBSCRIPTION 이 올바른 JSON 이 아닙니다.');
  process.exit(1);
}

/* 알림에 뜨는 말 — 끝내고 보는 말이 아니라, 시작을 가볍게 만드는 말들 */
const LINES = [
  '3분이면 끝나요. 한 장만 열어볼까요?',
  '잘하려고 안 해도 돼요. 열기만 하면 돼요.',
  '딱 한 문장이에요. 부담 갖지 마세요.',
  '하기 싫은 날이어도 괜찮아요. 일단 열어만 보세요.',
  '어제의 나보다 한 문장만 더.',
  '느려도 괜찮아요. 멈추지만 않으면 돼요.',
  '완벽하지 않아도 돼요. 시작만 해요.',
  '오늘의 나에게 3분만 줄까요?',
  '커피 한 모금 하면서 한 장.',
  '작게 하는 사람이 오래 합니다.',
  '미루고 싶은 날일수록 짧게 해도 돼요.',
  '오늘도 조금만. 그거면 충분해요.',
  '지금 열면 금방 끝나요.',
  '카드 한 장 뽑으러 갈까요?',
  '어제 카드가 돌아와 기다리고 있어요.',
  '쌓인 문장이 기다리고 있어요.',
];

const payload = JSON.stringify({
  title: '오늘 딱 한 문장',
  body:  LINES[new Date().getDate() % LINES.length],
  url:   'https://qozoa1313-lgtm.github.io/press-me/english/',
});

(async () => {
  let ok = 0, gone = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(s, payload);
      ok++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        gone++;
        console.error('등록이 만료된 폰이 있습니다. 앱 설정에서 다시 켜고 SUBSCRIPTION 을 바꿔주세요.');
      } else {
        console.error('보내기 실패:', e.statusCode, e.body || e.message);
      }
    }
  }
  console.log('보냄 ' + ok + '건 / 만료 ' + gone + '건');
  if (ok === 0) process.exit(1);
})();
