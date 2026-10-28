Codmos 캐릭터 동작 스프라이트 패키지

원본 47개 스킨 + 제작 캐릭터 6개 = 총 53종.
추가 캐릭터: naruto, kim, dokkaebi, gumiho, young-forty, danso.
인트 기본 스킨 폴더 이름은 basic입니다.

각 캐릭터 폴더 / 방향 / 동작.png + 동작.json
예: basic/front/idle.png, basic/front/idle.json
    naruto/front/dance.png, naruto/front/dance2.png
    kim/side_left/run.png, gumiho/jump_right/jump.png

지원 방향: front, back, side_left, side_right, jump_left, jump_right, slide_left, slide_right.
정면 12개 + 후면 4개 + 좌우 측면 각5개 + 좌우 점프 각1개 + 좌우 슬라이드 각1개 = 캐릭터당30개.
원본 동작명을 유지했습니다. dance1이라는 원본 동작은 없으며 dance와 dance2가 있습니다.
파일명의 HP_Up/HP_Down은 JSON animation의 HP Up/HP Down과 같습니다.

PNG는 24fps 투명 배경 애니메이션 시트입니다. 정지 이미지 한 장이 아니라 순서대로 재생할 프레임들을 담고 있습니다.
JSON.frames는 프레임별 x/y/w/h, duration(ms), pivot과 크기를 포함합니다.
JSON.meta는 image, fps, frameCount, durationMs, anchor, animation, direction을 포함합니다.
anchor는 개별 프레임의 왼쪽 위를 기준으로 한 원래 Spine 루트의 좌표입니다.
다른 동작으로 전환할 때 캐릭터 위치를 유지하려면 destinationX=rootX-anchor.x, destinationY=rootY-anchor.y로 그리세요.
프레임마다 같은 크기로 잘랐으며 시트 칸 사이에는 2px의 투명 간격이 있습니다.
scale 0.4로 원본 Spine 리그를 실제 렌더링했습니다. 방향별 좌우 반전도 미리 적용되어 있습니다.
원본 한 주기를 정확히 유지하려고 마지막 프레임의 재생 시간이 조금 짧을 수 있습니다.
loop는 권장 반복 여부이며, 원본 애니메이션은 한 주기씩 모두 포함합니다.
JSON은 일반적인 hash-frame atlas 형식이며 엔진에 맞게 duration/pivot/anchor를 적용하면 됩니다.

미리보기.html을 더블클릭하면 설치나 서버 없이 캐릭터/방향/동작을 선택해 볼 수 있습니다.
manifest.json: 전체 목록. VALIDATION.json: 파일 및 프레임 검증 결과.
