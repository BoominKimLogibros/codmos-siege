Codmos 공격 / 방어 추가 스프라이트

원본 47개 스킨 + 제작 캐릭터 6개 = 53종.
각 캐릭터마다 정면, 왼쪽 측면, 오른쪽 측면, 뒷모습의 attack / defend 시트를 제공합니다.
캐릭터당 8쌍, 전체 PNG 424개 + JSON 424개.

예: basic/front/attack.png + attack.json
    naruto/side_left/defend.png + defend.json
    kim/back/attack.png + attack.json
인트의 폴더 이름은 basic입니다.

기존 sprite ZIP과 동일한 캐릭터 / 방향 / 동작 파일명 구조입니다.
기존 캐릭터 폴더에 이번 캐릭터 폴더들을 합치면 공격·방어가 추가됩니다.
이번 압축의 manifest.json과 미리보기는 공격·방어 전용이므로 기존 전체 manifest를 덮어쓰지 않고 별도로 보관하세요.

투명 RGBA PNG, 24fps, 원본 Spine scale 0.4.
attack 850ms / 21프레임, defend 1200ms / 29프레임.
PNG는 프레임들을 모은 동작별 시트이며 JSON.frames의 좌표와 duration(ms)로 재생합니다.
JSON.meta.anchor는 각 프레임의 왼쪽 위를 기준으로 한 Spine 루트 위치입니다.
동작 전환 시 destinationX=rootX-anchor.x, destinationY=rootY-anchor.y로 그려 위치를 유지하세요.
각 동작 안의 프레임 크기는 고정이며, 시트 칸 사이에는 2px 투명 간격이 있습니다.
마지막 프레임 시간은 원래 동작 길이에 맞춰 조정됩니다.
좌우 반전은 이미지에 이미 적용되어 있습니다. loop:false는 한 번 재생을 권장합니다.

미리보기.html을 더블클릭하면 설치나 서버 없이 공격·방어를 확인할 수 있습니다.
manifest.json은 전체 목록, VALIDATION.json은 파일·프레임 검사 결과입니다.
