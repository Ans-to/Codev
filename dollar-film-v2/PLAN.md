# Plan — Why the dollar is the world's leading currency

**Status: awaiting approval.** This replaces neither the previous film nor its source; it is a new, higher-quality version using the 3d-animator starter.

## Idea and format

A 30-second cinematic miniature illustrates how the dollar's historical role, financial markets, trade, and network effects reinforce one another. The conclusion makes clear that this dominance is not guaranteed forever.

- Delivery: widescreen 1920 × 1080, 30 fps, 900 frames; H.264 MP4 with AAC audio.
- Narration: natural-speed English AI voice, selected by the user; an original music bed and individually timed sound effects. The script below is a timing draft and can be adjusted after recording, without speeding up the voice.
- Visual language: a physically scaled, dark walnut tabletop; navy shadows, warm gold, and ivory. Warm light from a visible desk lamp is the key, a cool sky fills the shadows, and the lamp and a small screen act as practical lights. Brushed metal, paper, and glass give the objects tactile texture. A restrained, readable cinematic infographic emerges from real 3D props rather than a flat slide deck.
- Hook: a single gold dollar coin pops into frame immediately, squashes subtly as it lands, then settles. A globe begins turning behind it.
- Camera: one 38° lens throughout. Each shot follows a single eased Bezier move; subtle depth of field, motion blur, jittered soft shadows and a single final grade follow the kit.

## Shot table

| Time | Picture and action | Camera | Light | Narration draft | Sound |
|---|---|---|---|---|---|
| 0–5 s | Dollar coin lands; a tabletop globe comes into view. | Slow dolly toward the coin. | Warm key, cool fill; lamp glows. | “Why does the world rely so heavily on the U.S. dollar?” | Coin landing, soft globe movement; music begins. |
| 5–10 s | A dated 1944 agreement and a gold bar appear beside the globe; a dollar marker settles onto the page. | Gentle curved move along the desk. | Lamp lights the paper and gold. | “In 1944, Bretton Woods made it the anchor of a new monetary system.” | Paper movement and a soft metallic placement. |
| 10–15 s | Routes light up on the globe; miniature trade objects and a dollar marker connect across the map. | Short orbit around the globe. | Cool edge light catches the routes. | “Even after its link to gold ended, the dollar remained central to global trade.” | Individual route activations, light mechanical movement. |
| 15–20 s | A stack of Treasury documents and a rising graph appear on a desk screen. | Push toward the stack and screen. | Screen glow and warm lamp. | “Deep Treasury markets offer central banks a vast, liquid place to hold reserves.” | Paper placement, screen activation, graph accents. |
| 20–25 s | Staggered banking and business markers connect to a central dollar symbol. | Smooth move across the network. | Warm points against the darker desk. | “The more banks and businesses use dollars, the more useful dollars become.” | One distinct connection sound per marker. |
| 25–30 s | Camera returns to the globe and dollar; a final in-scene message says “DOMINANT, NOT GUARANTEED.” | Slow push into the closing message. | Warm practical light; restrained falloff. | “The dollar leads today, but its role is not guaranteed forever.” | Gentle resolving accent and music tail. |

## Production and quality gates

1. Select and record the voice first. Measure line and word timings, then align motion and captions to the actual recording. Keep the narration natural; adjust the edit rather than time-stretching it.
2. Adapt the original `3d-animator/kit` scene, renderer, sub-frame accumulation, HDR grade and sound mixer. Use deterministic animation, physically sensible scale, believable contact, beveled props, practical lighting, and clearly legible screen text. Use original assets unless a properly licensed model is necessary and credited.
3. Render 3–5 representative 16-sample stills; show them and get feedback before proceeding. Then render and show a 4–8-sample timing preview with audio.
4. Run a 30-frame benchmark on the GitHub Actions runner and report the measured estimate before starting the full render. Target 48 samples per frame for the final. GitHub-hosted runners may use software rendering, have job time limits and consume Actions minutes; parallel rendering will be considered after benchmarking rather than assuming an unmeasured completion time.
5. Mix the voice, music and action effects; target −14 LUFS and approximately −1.5 dBTP. Keep effects audible on phone speakers. Check word timing and soundtrack against the picture.
6. Verify the encoded MP4, its 900 frames, 30-second duration, audio, key frames, shader logs, and a same-time seek comparison against an independently rendered still. Ask the user to audition on an actual phone speaker because this environment cannot physically do that.
7. Publish the final artifact and give a download link and re-render instructions. Keep the GitHub Actions workflow, film source and version notes in the current branch.

## Historical framing

Bretton Woods established a dollar-centered fixed-exchange-rate system, with the U.S. dollar linked to gold; the gold link ended in 1971. Today's leading role reflects several reinforcing factors, not a single rule requiring every international transaction to use dollars. Verify wording against Federal Reserve and IMF sources during production.
