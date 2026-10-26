# 나의 기록 (press-me/record)

한 줄 요약: 한 일 · 달라진 점 · 다음에 해볼 것을 날짜별로 적는 개인 기록 사이트. 점수·연속기록 없이 "방법과 결과를 관찰"하는 용도.

## 파일
- index.html — 화면·기능 전부 (HTML 한 장, 빌드 없음)
- manifest.json · icon-192.png · icon-512.png — 휴대폰 홈 화면 추가용
- sw.js — 인터넷 없이도 화면이 열리게 하는 장치 (기록 내용은 담지 않음)

## 배포 주소
https://qozoa1313-lgtm.github.io/press-me/record/

## 이미 정한 것 (바꾸지 말 것)
- 영어 사이트(press-me/english)와 같은 방식: press-me 저장소 하위 폴더, HTML 한 장
- 기록은 브라우저 localStorage 에만 저장. 이름은 myrecord.v1.data / .prefs / .before
- 같은 github.io 주소의 다른 사이트(oneline.v1, maestro.v3)와 저장공간을 같이 씀 → localStorage.clear() 금지, 내 이름만 지울 것
- 저장값을 못 읽으면 덮어쓰지 않고 저장을 막음
- 카테고리: 영어·면접·도면·프로젝트·기타
- 백업 파일 이름 my-record-backup-*.json — .gitignore 로 저장소 업로드 차단

## 다음에 할 것
- 2차: 검증 기록, 주간 돌아보기, 사용성 개선 (유진님이 1차 써본 뒤)
- 3차: PC·휴대폰 자동 동기화 검토

## 아직 확인 못 한 것
- 실제 갤럭시 휴대폰(삼성 인터넷·크롬)에서의 동작 — 2026-10-26 기준 PC 크롬 휴대폰 크기 흉내로만 시험
