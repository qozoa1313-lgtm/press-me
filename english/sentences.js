/* 오늘 딱 한 문장 — 1개월차 30문장
   「나를 설명하는 영어」 · Day 1부터 순서대로 이어집니다.

   1~7   영어 공부 이야기
   8~15  요즘 만드는 것
   16~20 일상과 취향
   21~27 성격 · 감정 · 습관
   28~30 원하는 삶

   S(day, 영어, 뜻, 한글발음, 쪼개기, 이런순간에, 예시대화, 비슷한표현) */

const S = (day, en, ko, rd, bd, when, ex, sim) =>
  ({ id: 'd' + day, day, en, ko, rd, bd, when, ex, sim });

const SENTENCES = [

/* ── 1~7 영어 공부 이야기 ── */
S(1, "I'm learning English.", "영어 배우고 있어요.", "아임 러닝 잉글리시",
  [["I'm","나는 ~하는 중이에요"],["learning","배우는"],["English","영어를"]],
  '첫 문장이에요. "잘한다"가 아니라 "배우는 중"이라고 말하면 상대가 천천히 말해줘요.',
  ["A: Do you speak English?","B: A little. I'm learning English."],
  ["I'm studying English.","I'm trying to learn English."]),

S(2, "I'm a complete beginner.", "저 완전 초보예요.", "아임 어 컴플릿 비기너",
  [["a complete","완전한"],["beginner","초보자"]],
  'complete 가 "완전한"이에요. 이 말을 먼저 하면 상대가 쉬운 말로 바꿔줘요. 부끄러운 말이 아니라 편해지는 말이에요.',
  ["A: How's your English?","B: I'm a complete beginner."],
  ["I'm just starting out.","I'm very new to this."]),

S(3, "I'm taking it slow.", "천천히 하고 있어요.", "아임 테이킹 잇 슬로우",
  [["taking it","그것을 받아들이다"],["slow","천천히"]],
  '"서두르지 않는다"는 뜻이에요. 공부뿐 아니라 일·운동·회복 어디에나 그대로 써요.',
  ["A: Are you in a rush to improve?","B: No, I'm taking it slow."],
  ["I'm in no rush.","One step at a time."]),

S(4, "I like learning new things.", "새로운 거 배우는 걸 좋아해요.", "아이 라익 러닝 뉴 띵스",
  [["I like","좋아해요"],["learning","배우는 것을"],["new things","새로운 것들"]],
  'I like 뒤에는 -ing 를 붙여요. like to learn 도 맞지만 말할 땐 learning 이 더 흔해요.',
  ["A: Why did you start?","B: I like learning new things."],
  ["I enjoy learning.","I'm curious about a lot of things."]),

S(5, "I try to do a little every day.", "매일 조금씩 하려고 해요.", "아이 트라이 투 두 어 리틀 에브리데이",
  [["I try to","~하려고 해요"],["do a little","조금 하다"],["every day","매일"]],
  'I try to 가 "하려고 노력한다"예요. 완벽하지 않아도 된다는 뉘앙스라 말하기 편해요.',
  ["A: How often do you study?","B: I try to do a little every day."],
  ["I do a bit each day.","Just a few minutes a day."]),

S(6, "I don't always feel like it.", "항상 하고 싶은 건 아니에요.", "아이 돈 올웨이즈 필 라이킷",
  [["don't always","항상 ~하는 건 아니다"],["feel like it","그걸 하고 싶다"]],
  'feel like it 이 "그게 내키다"예요. 아주 많이 쓰는 덩어리라 통째로 외워두세요.',
  ["A: Do you enjoy it every day?","B: Honestly, I don't always feel like it."],
  ["Some days I don't want to.","It's not always fun."]),

S(7, "But I still try.", "그래도 해보려고 해요.", "벗 아이 스틸 트라이",
  [["But","그래도"],["still","여전히"],["try","해보다"]],
  '6번 바로 뒤에 붙이는 문장이에요. 두 개를 이어 말하면 그대로 한 이야기가 돼요.',
  ["A: Even on bad days?","B: But I still try."],
  ["I show up anyway.","I keep at it."]),

/* ── 8~15 요즘 만드는 것 ── */
S(8, "I'm learning to code.", "코딩을 배우고 있어요.", "아임 러닝 투 코드",
  [["learning to","~하는 법을 배우는 중"],["code","코딩하다"]],
  'learn 뒤에 "~하는 법"을 넣을 땐 to 를 써요. learning English 와 모양이 다른 이유예요.',
  ["A: What else are you up to?","B: I'm learning to code."],
  ["I'm teaching myself to code.","I'm picking up programming."]),

S(9, "I'm working on a small project.", "작은 프로젝트 하나 만들고 있어요.", "아임 워킹 온 어 스몰 프로젝트",
  [["working on","~를 작업 중인"],["a small project","작은 프로젝트 하나"]],
  'work on 이 "~를 만들고 있다"예요. 일·그림·글 전부 이 표현을 써요.',
  ["A: Anything fun lately?","B: I'm working on a small project."],
  ["I've got a side project.","I'm building something small."]),

S(10, "I use Claude Code almost every day.", "Claude Code를 거의 매일 써요.", "아이 유즈 클로드 코드 올모스트 에브리데이",
  [["I use","써요"],["almost","거의"],["every day","매일"]],
  'almost 를 넣으면 "매일은 아니지만 거의"가 돼요. 과장 없이 말할 수 있어서 편해요.',
  ["A: What tools do you use?","B: I use Claude Code almost every day."],
  ["I'm on it most days.","I use it a lot."]),

S(11, "I worked on it again today.", "오늘도 그거 작업했어요.", "아이 웍트 온 잇 어겐 투데이",
  [["worked on it","그걸 작업했다"],["again today","오늘도 또"]],
  '9번의 과거형이에요. worked 의 ed 는 "트"로 짧게 소리 나요. "웍트".',
  ["A: Did you take a break?","B: No, I worked on it again today."],
  ["I put some time in today.","I kept going today."]),

S(12, "I got a little done.", "조금 해냈어요.", "아이 갓 어 리틀 던",
  [["got ~ done","~를 끝냈다"],["a little","조금"]],
  '많이 못 했어도 "조금 해냈다"고 말할 수 있어요. 자책 대신 쓰기 좋은 문장이에요.',
  ["A: How did it go?","B: I got a little done."],
  ["I made some progress.","Not much, but something."]),

S(13, "I'm still figuring it out.", "아직 하나씩 알아가는 중이에요.", "아임 스틸 피겨링 잇 아웃",
  [["still","아직"],["figuring it out","그걸 알아내는 중"]],
  '원어민이 매일 쓰는 말이에요. "아직 모르겠다"를 당당하게 말하는 방법이에요.',
  ["A: Do you know how it works?","B: I'm still figuring it out."],
  ["I'm getting there.","I haven't got it yet."]),

S(14, "I learn from my mistakes.", "실수하면서 배워요.", "아이 런 프롬 마이 미스테익스",
  [["learn from","~로부터 배우다"],["my mistakes","내 실수들"]],
  '실수 얘기가 나왔을 때 쓰면 분위기가 가벼워져요.',
  ["A: You broke it again!","B: I learn from my mistakes."],
  ["Mistakes help me learn.","That's how I learn."]),

S(15, "I like making things.", "뭔가 만드는 걸 좋아해요.", "아이 라익 메이킹 띵스",
  [["like making","만드는 걸 좋아하다"],["things","것들을"]],
  '앱이든 뜨개질이든 다 들어가요. 나를 한마디로 설명하는 문장이에요.',
  ["A: What do you enjoy?","B: I like making things."],
  ["I'm a maker.","I like building stuff."]),

/* ── 16~20 일상과 취향 ── */
S(16, "I like having a simple routine.", "단순한 루틴을 좋아해요.", "아이 라익 해빙 어 심플 루틴",
  [["like having","가지는 걸 좋아하다"],["a simple routine","단순한 하루 틀"]],
  'routine 은 "매일 같은 흐름"이에요. 복수 routines 보다 a simple routine 이 말할 때 자연스러워요.',
  ["A: Do you plan your days?","B: I like having a simple routine."],
  ["I keep my days simple.","I like a steady rhythm."]),

S(17, "I spend a lot of time at home.", "집에서 시간을 많이 보내요.", "아이 스펜드 어 랏 오브 타임 앳 홈",
  [["spend time","시간을 보내다"],["a lot of","많은"],["at home","집에서"]],
  'spend 는 돈에도 시간에도 써요. 집에 있는 걸 좋아한다고 편하게 말할 수 있어요.',
  ["A: Do you go out much?","B: Not really. I spend a lot of time at home."],
  ["I'm a homebody.","I'm usually in."]),

S(18, "I play games in my free time.", "시간 날 때 게임해요.", "아이 플레이 게임스 인 마이 프리 타임",
  [["play games","게임을 하다"],["in my free time","여유 시간에"]],
  'in my free time 은 취미를 말할 때 붙이는 덩어리예요. 앞만 바꿔 끼우면 다 돼요.',
  ["A: What do you do to relax?","B: I play games in my free time."],
  ["I game a bit.","Gaming, mostly."]),

S(19, "I also like knitting.", "뜨개질도 좋아해요.", "아이 올소 라익 니팅",
  [["also","~도"],["knitting","뜨개질"]],
  '⚠️ knitting 의 k 는 소리가 안 나요. "니팅"이에요. also 는 앞말에 하나 더 얹을 때 써요.',
  ["A: Only games?","B: I also like knitting."],
  ["Knitting, too.","I knit as well."]),

S(20, "I like having time to myself.", "혼자만의 시간이 있는 걸 좋아해요.", "아이 라익 해빙 타임 투 마이셀프",
  [["time to myself","나만의 시간"]],
  '"외롭다"가 아니라 "혼자가 좋다"는 뜻이에요. 영어에서는 이 표현을 아주 자주 써요.',
  ["A: Want to join us?","B: Maybe next time. I like having time to myself."],
  ["I need my own space.","I recharge alone."]),

/* ── 21~27 성격 · 감정 · 습관 ── */
S(21, "I get nervous about the future sometimes.", "가끔 미래 생각하면 불안해져요.", "아이 겟 너버스 어바웃 더 퓨처 썸타임즈",
  [["get nervous","불안해지다"],["about the future","미래에 대해"],["sometimes","가끔"]],
  'get 은 "~해지다"예요. I am nervous 는 지금 상태, I get nervous 는 "그럴 때가 있다"예요.',
  ["A: You seem quiet.","B: I get nervous about the future sometimes."],
  ["The future worries me a bit.","I think about it a lot."]),

S(22, "I worry about money sometimes.", "가끔 돈 걱정을 해요.", "아이 워리 어바웃 머니 썸타임즈",
  [["worry about","~를 걱정하다"],["money","돈"]],
  'sometimes 를 끝에 붙이면 무겁지 않게 들려요. 솔직하되 처지지 않는 말이 돼요.',
  ["A: What's on your mind?","B: I worry about money sometimes."],
  ["Money's on my mind.","It's a bit tight these days."]),

S(23, "I get overwhelmed sometimes.", "가끔 벅찰 때가 있어요.", "아이 겟 오버웰름드 썸타임즈",
  [["get overwhelmed","벅차지다"]],
  'overwhelmed 는 "감당이 안 될 만큼 밀려온" 느낌이에요. 한국어 "벅차다"와 거의 같아요.',
  ["A: Too much going on?","B: Yeah, I get overwhelmed sometimes."],
  ["It piles up sometimes.","It's a lot some days."]),

S(24, "So I take things one step at a time.", "그래서 하나씩 하려고 해요.", "쏘 아이 테익 띵스 원 스텝 앳 어 타임",
  [["So","그래서"],["take things","일을 받아들이다"],["one step at a time","한 번에 한 걸음씩"]],
  '굳어진 관용구예요. 23번 바로 뒤에 붙이면 "벅차지만 하나씩 한다"는 이야기가 완성돼요.',
  ["A: How do you handle it?","B: So I take things one step at a time."],
  ["Little by little.","One thing at a time."]),

S(25, "It takes me a while to get started.", "저는 시작하는 데 시간이 좀 걸려요.", "잇 테익스 미 어 와일 투 겟 스타티드",
  [["It takes me","나에게 ~가 걸린다"],["a while","한참"],["get started","시작하다"]],
  'It takes me ~ 는 "나는 ~가 걸린다"는 틀이에요. 뒤만 바꾸면 그대로 써요.',
  ["A: You're slow to begin.","B: It takes me a while to get started."],
  ["I'm a slow starter.","Getting going is the hard part."]),

S(26, "But once I start, I can focus pretty well.", "그래도 시작하면 꽤 집중하는 편이에요.", "벗 원스 아이 스타트, 아이 캔 포커스 프리티 웰",
  [["once I start","일단 시작하면"],["focus","집중하다"],["pretty well","꽤 잘"]],
  'pretty 는 "예쁜"이 아니라 "꽤"로 쓰여요. 자랑처럼 들리지 않게 해주는 단어예요.',
  ["A: Really?","B: But once I start, I can focus pretty well."],
  ["I get into it eventually.","Once I'm in, I'm in."]),

S(27, "I'm trying to be more consistent.", "좀 더 꾸준해지려고 하고 있어요.", "아임 트라잉 투 비 모어 컨시스턴트",
  [["trying to be","~가 되려고 노력 중인"],["more consistent","더 꾸준한"]],
  'consistent 가 "꾸준한"이에요. 지금 이 앱을 쓰는 이유 그 자체인 문장이에요.',
  ["A: Any goals this year?","B: I'm trying to be more consistent."],
  ["I want to keep it steady.","Showing up is the goal."]),

/* ── 28~30 원하는 삶 ── */
S(28, "I just want a stable life.", "그냥 안정적인 삶을 원해요.", "아이 저스트 원트 어 스테이블 라이프",
  [["just","그냥"],["want","원하다"],["a stable life","안정적인 삶"]],
  'just 하나를 넣으면 담백해져요. 없으면 선언처럼, 있으면 속마음처럼 들려요.',
  ["A: What's your dream?","B: Nothing big. I just want a stable life."],
  ["I'm after something steady.","Simple and steady is enough."]),

S(29, "I want to keep learning.", "계속 배우고 싶어요.", "아이 원트 투 킵 러닝",
  [["want to","~하고 싶다"],["keep learning","계속 배우다"]],
  'keep 뒤에는 -ing 를 써요. keep going, keep trying 도 똑같은 모양이에요.',
  ["A: And after that?","B: I want to keep learning."],
  ["I'm not done learning.","There's always more."]),

S(30, "I'm glad I kept going.", "계속 해온 게 기뻐요.", "아임 글래드 아이 켑트 고잉",
  [["I'm glad","기뻐요"],["I kept going","계속 해왔다"]],
  '30일째 문장이에요. 이 말을 할 자격은 한 달을 채운 사람에게만 생겨요.',
  ["A: You stuck with it.","B: I'm glad I kept going."],
  ["It was worth it.","I'm glad I didn't quit."]),

];

/* 복습 사다리 — 처음 배운 날을 0일로 */
const LADDER = [1, 3, 7, 14, 30];
