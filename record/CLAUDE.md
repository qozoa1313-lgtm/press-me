# 나의 기록 (press-me/record)

한 줄 요약: 한 일 · 달라진 점 · 다음에 해볼 것을 날짜별로 적는 개인 기록 사이트. 점수·연속기록 없이 "방법과 결과를 관찰"하는 용도.

## 파일
- index.html — 화면·기능 전부 (HTML 한 장, 빌드 없음)
- quotes.js — 단계별 하루 한 문장 169개 (시작 43 · 진행 42 · 마무리 42 · 돌아보기 42). 직접 쓴 문장, 명언 없음
- manifest.json · icon-192.png · icon-512.png — 휴대폰 홈 화면 추가용
- sw.js — 인터넷 없이도 화면이 열리게 하는 장치 (기록 내용은 담지 않음)

## 배포 주소
https://qozoa1313-lgtm.github.io/press-me/record/

## 이미 정한 것 (바꾸지 말 것)
- 영어 사이트(press-me/english)와 같은 방식: press-me 저장소 하위 폴더, HTML 한 장
- 기록은 브라우저 localStorage 에만 저장. 이름은 myrecord.v1.data / .prefs / .before / .timer
- data 안(version 5): records(수동 일기, groupId·actId 선택, 옛 category 보관) · sessions(타이머 기록, activityId 연결 · name=기록 당시 이름(덮어쓰지 않음) · group=기록 당시 그룹, mood, notes)
- 공통 분류: groups[{id,name,color,archived}] · acts[{id,name,groupId,removed}]. 모든 화면이 이것만 씀(옛 CATS·GROUPS 고정 목록 없음)
- 화면 표시 = 연결된 활동의 「지금」 이름·그룹(sName·sGroupId·rGroupId). 이름 같아도 id 다르면 따로
- 활동 「빼기」=removed:true(지우지 않음). 기록 있는 그룹은 바로 삭제 못 함 → 보관 또는 옮기고 삭제
- 옛 영어·면접 등 일기는 아무 활동에도 자동으로 안 붙임(「분류 없음」+옛 분류 표시). 2차 버전 버그로 id 어긋난 타이머 기록은 설정에서 확인 후에만 이음 · activities · reviews(7일 돌아보기 답) · checks(14일 점검 답) · savedQuotes · checkStart
- 예전 자료는 열 때 빈 칸만 덧붙임(migrate). records 내용은 손대지 않음. 예전 백업 복원 시 백업에 없는 칸은 지금 것 유지
- 기본 그룹 id daily·levelup, 기본 활동 id d1~d4·l1~l4 고정 — 예전 기록이 그대로 이어지게
- prefs(기기별, 백업 안 됨): hideTime · hideStats · showQuotes · askNote · quotes(문장 뽑기 기록 14일) · checkLater · checkHidden
- 14일 점검: 1일 차 = checkStart 또는 가장 이른 타이머 날짜. 날짜(현지) 기준 15일 차부터 시작 화면에 작은 카드. 점검 1번 하면 다시 안 띄움. 점수 없음, 답에 맞는 참고 안내 3종
- 화면 켜짐 유지는 「진행 중」에만. 쉬는 중·끝나면 풂. 실패해도 타이머 계산과 무관
- 활동 고르기 ≠ 시작: 고르면 준비 화면(00:00:00, 저장 없음), 「시작하기」 누른 시각이 start
- 쉼 = end − start − activeMs (밀리초). 화면은 분 버림이라 「시작~종료 분 차이」와 「활동+쉼 분」이 최대 2분대 어긋나 보일 수 있음 → 기록 수정 화면 「저장된 원본(초 단위)」 줄로 확인
- v3 한 줄 기록(note)은 열 때 notes.learned 로 옮김(글자 그대로, 다음 저장 때 반영)
- 진행 중 타이머는 myrecord.v1.timer 에만. 시작·쉬기·이어하기 시각으로 계산(초 세기 아님). 「여기까지」 때 타이머 id 로 중복 저장 막음
- 타이머 기록은 시작한 날짜에 들어감. 활동 목록에서 지워도 과거 기록은 남음(이름을 기록에 복사해 둠)
- 타이머가 켜져 있는 동안 화면 켜짐 유지(Wake Lock) — 지원 안 하는 브라우저는 안내만
- 같은 github.io 주소의 다른 사이트(oneline.v1, maestro.v3)와 저장공간을 같이 씀 → localStorage.clear() 금지, 내 이름만 지울 것
- 저장값을 못 읽으면 덮어쓰지 않고 저장을 막음
- 카테고리: 영어·면접·도면·프로젝트·기타
- 백업 파일 이름 my-record-backup-*.json — .gitignore 로 저장소 업로드 차단

## 다음에 할 것
- 2026-10-26 최종 개선 반영(문장 · 시간 숨김 · 최근 활동 · 한 줄 기록 · 7일 돌아보기 · 14일 점검 · 모아보기 통합). 이제 실사용 후 불편한 점만 고침
- 검증 기록(방법·기간·기준 템플릿)은 아직 안 만듦 — 7일 돌아보기의 「결정」으로 일부 대신
- 3차: PC·휴대폰 자동 동기화 검토
- 3차: PC·휴대폰 자동 동기화 검토

## 아직 확인 못 한 것
- 실제 갤럭시 휴대폰(삼성 인터넷·크롬)에서의 동작 · 화면 켜짐 유지 — 2026-10-26 기준 PC 크롬 휴대폰 크기 흉내 + 가짜 시계 + 가짜 화면 켜짐 장치로만 시험
- 시험 파일은 저장소 밖(임시 폴더)에 있음: test_record.py(39) · test_timer.py(52) · test_final.py(85) · test_v4.py(50) · test_v5.py(61)
