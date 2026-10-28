# 청백 공성전 · CODMOS Siege

캐릭터 11종, 청팀·백팀, 미니언 웨이브와 포탑·억제기·넥서스로 구성된 2D 공성 게임입니다. 현재 플레이어 대 AI 방식이며 온라인 멀티플레이는 구현되지 않았습니다.

## 로컬 실행

Node.js 22 또는 24와 npm이 필요합니다.

```sh
npm ci
npm run dev
```

http://127.0.0.1:5197/ 또는 /survival.html을 엽니다.

## 조작

- 방향키 / 우클릭: 이동, 같은 방향키 두 번: 대시, S: 정지
- Q/W/E/R: 스킬. 범위 스킬은 누른 채 방향키로 조준하고 키를 놓아 시전, Esc로 조준 취소
- Ctrl+Q/W/E/R 또는 + 버튼: 스킬 강화 (최대 레벨 18)
- B: 상점. 아군 넥서스 옆 상점 근처에서 재료 또는 완성품 구매·판매
- 1~6: 인벤토리 소비 아이템, Esc: 일시정지

## 검증

```sh
npm test
npm run build
# 개발 서버 실행 중, 로컬 Chrome이 설치되어 있을 때
npm run test:browser
```

게임 엔진·렌더러는 src/survival, 런타임 에셋은 public/survival, 테스트는 scripts에 있습니다. 세부 규칙은 [게임 문서](docs/SURVIVAL.md), 참여 절차는 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 에셋

사용자 제공 Codmos 캐릭터·미니언·타일·이펙트 에셋을 포함합니다. 각 에셋 폴더의 manifest, USED.json 및 원본 메타데이터에 출처를 보관합니다. 이 저장소는 포함된 제3자 캐릭터 및 에셋에 별도의 재배포·상업 이용 권한을 부여하지 않습니다.
