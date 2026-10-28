# Goblin team artwork

Blue and white team color directions were created with the built-in image_gen tool using `idle-0.png` as the visual reference, on transparent backgrounds. The generated full-body references are saved as `blue/team-reference.png` and `white/team-reference.png` and are used in the team selector.

Prompt set: preserve the original goblin's left-facing neutral pose, angular cartoon style, silhouette, proportions, facial identity and brown/orange club. Blue team uses bright azure/cyan skin, cobalt shadows and navy cloth. White team uses pearl/ivory skin, silver-grey shadows and silver cloth. Preserve transparency; no background, new armor, text or extra objects.

Animated production sheets use the same team palettes applied deterministically to the original authored pixels via `scripts/recolor-goblin-teams.mjs`, keeping every frame rectangle, original dimensions, anchor and alpha pixel unchanged. This avoids any animation drift from redrawing frame poses. Both teams have independent idle, attack, stun, die and spawn PNGs and playback manifests. Movement reuses the authored goblin idle/stepping cycle.

`TEAM-PALETTES.json` records dimensions, changed pixel counts and alpha-preservation checks for all 10 animated team sheets. Original files remain preserved in the parent directory. Team identification is baked into the PNGs, while the existing separate red hit-feedback shader still applies temporarily when damaged.

Exact generation prompt set and built-in tool parameters: [PROMPTS.json](PROMPTS.json).
