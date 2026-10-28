# 개발 참여

1. 저장소를 Fork하고 본인 Fork를 clone합니다. 비공개 저장소는 관리자의 접근 권한이 필요합니다.
2. 작업 브랜치를 만듭니다: git switch -c feature/변경내용
3. npm ci, npm run dev로 실행합니다.
4. 변경 후 npm test와 npm run build를 확인합니다. 화면 변경은 스크린샷, 조작 변경은 재현 절차도 준비합니다.
5. 본인 Fork에 push한 다음 원본 저장소의 main 브랜치를 대상으로 Pull Request를 엽니다.

PR에는 해결한 문제, 변경 후 동작, 검증 결과를 적어 주세요. 에셋 추가 시 출처와 사용 범위를 함께 적어 주세요. .env, 토큰, node_modules, dist 및 테스트 산출물은 커밋하지 않습니다.

관리자가 검토 후 병합합니다. 원본 저장소에 직접 push하려면 별도 Collaborator 권한이 필요합니다.
