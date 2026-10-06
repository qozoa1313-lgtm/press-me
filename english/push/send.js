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

const LINES = [
  '오늘 카드 한 장 열어볼까요?',
  '3분이면 끝나요.',
  '어제 카드가 돌아왔어요.',
  '오늘도 한 장.',
  '한 문장만 보고 가요.',
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
