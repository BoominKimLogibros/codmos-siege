# 에셋 출처

이 게임에서 사용하는 외부 무료 에셋과 라이선스를 기록합니다. 새 외부 에셋을 추가할 때에는 이 표에 함께 적어 주세요. 원본을 게임용 크기로 바꾸는 방법은 [캐릭터 제작 가이드](CHARACTER-CREATION.md)의 8절에 있습니다.

| 에셋 | 제작자 | 라이선스 | 게임 내 경로 | 원본 |
| --- | --- | --- | --- | --- |
| Painterly Spell Icons 1~4부 | J. W. Bjerk (eleazzaar), www.jwbjerk.com/art | CC-BY 3.0 | `public/survival/icons/skills/` | [1부](https://opengameart.org/content/painterly-spell-icons-part-1), [2부](https://opengameart.org/content/painterly-spell-icons-part-2), [3부](https://opengameart.org/content/painterly-spell-icons-part-3), [4부](https://opengameart.org/content/painterly-spell-icons-part-4) |
| 496 Pixel Art Icons for Medieval/Fantasy RPG | Henrique Lazarini (7Soul1) | CC0 | `public/survival/icons/items/` | [OpenGameArt](https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg) |
| Brackeys VFX Bundle | Brackeys 재구성. 입자 텍스처는 Kenney, Picster, 플립북은 Thomas Iché, 스프라이트 시트는 CodeManu | CC0 | `public/survival/vfx/` | [itch.io](https://brackeysgames.itch.io/brackeys-vfx-bundle) |

## 출처 표기 문구

Painterly Spell Icons는 CC-BY 3.0 조건에 따라 아래 문구를 남겨야 합니다. 원본 페이지는 CC-BY 3.0, CC-BY-SA 3.0·4.0, GPL 2.0·3.0 중 하나를 골라 쓰도록 허락하며, 이 프로젝트는 CC-BY 3.0을 선택했습니다.

> Skill icons: "Painterly Spell Icons" by J. W. Bjerk (eleazzaar) -- www.jwbjerk.com/art -- find this and other open art at: http://opengameart.org. Licensed under CC-BY 3.0.

나머지 두 에셋은 CC0이라 출처 표기가 의무는 아니지만, 제작자를 기록하기 위해 위 표에 남겨 둡니다.

## 게임용으로 바꾼 내용

- 스킬 아이콘은 256px 원본을 128px로 줄였습니다. 그림은 바꾸지 않았습니다.
- 아이템 아이콘은 원본 크기를 그대로 복사했습니다.
- 이펙트 입자 텍스처는 512px 원본을 256px로 줄였습니다. 스프라이트 시트 3장(`impact`, `bighit`, `explosion`)은 빈 칸을 빼고 프레임 크기를 줄여 다시 배열했습니다.

변환은 `scripts/import-free-assets.mjs`가 수행하고, 사용하는 파일 목록은 `src/survival/asset-manifest.js`에 있습니다.
