# Prompt log

One entry per generation. Source files live in `media/stills/` and `media/clips/` (not in git;
the job id fetches them again). Gates are pass/fail. Scores are 0-5 with a reason.

Reference ids: `REF-RECEPTION` = Vaydin's own reception image (`layer-fix.webp`),
`REF-MAP` = Vaydin's own night map (`hero-map.webp`).

---

## S2 — room at sunset, wide

- Date 2026-10-08 · GPT Image 2.5 (flare) · high · 2K · 16:9 · reference REF-RECEPTION
- Jobs `22f616b8` (option 1), `e22b0586` (option 2) · 2.75 credits each
- Prompt:
  > A single smartphone lying flat on a dark red-brown marble reception desk with white veining, its screen lit with a plain soft warm white glow and no interface. The same luxury aesthetic clinic reception as the reference image, at the end of the day and completely empty: the receptionist's cream office chair is pushed back and vacant, the computer monitor is off and black. The phone sits in the right third of the frame, sharp and in focus, shot from a low three-quarter angle slightly above desk height with a 50mm lens and shallow depth of field. The left half of the frame is the dark, softly blurred room with deep shadow and very little detail, left open as calm negative space. Last minutes of sunset: low amber light (#c9a44a) rakes across the marble from floor-to-ceiling windows on the right, long shadows, the brass dome lamp (#e8d48b) glowing dimly in the background, the rest of the room falling into warm near-black (#0d0807). Photorealistic cinematic still, natural film grain, quiet and slightly lonely mood. The image contains no people, no text, no logos and no on-screen writing.
- Gates: no people PASS · no text PASS · text zone clear PASS · matches brand room PASS
- Scores: realism 5 (reads as a photograph) · story 4 (phone small in frame) · brand colour 4 (judged by eye, hex not measured)
- Verdict: **option 2 chosen by owner.** Option 1 rejected: monitor sits oddly beside the chair.
- Learned: a real brand photo as reference carried the room across with no description of it.

## S3a — phone close-up, sunset

- Date 2026-10-08 · same model and settings · reference = S2 option 2 (`e22b0586`)
- Job `7ef37d21` · 2.75 credits · one variant (the second was refused by a rate limit, not resent)
- Changed from S2: camera position only
- Prompt:
  > The same scene as the reference image with the camera moved straight forward toward the smartphone, as if a slow dolly-in has finished. The phone on the dark red-brown marble desk now fills about one third of the frame width, sitting right of centre, sharp, its screen a plain soft warm white glow with no interface. Keep exactly the same marble veining, the same phone, the same sunset light direction and colour, the same room. The empty cream chair, the black monitor, the brass dome lamp and the window skyline remain visible but larger and softly out of focus behind the phone. The left third of the frame stays dark and uncluttered. Photorealistic cinematic still, shallow depth of field, natural film grain. No people, no text, no logos.
- Gates: same room PASS · no text PASS · text zone clear PARTIAL (left third brighter than asked)
- Scores: consistency 4 (room matches; phone has a thicker gold edge than in S2) · realism 5
- Verdict: owner's call pending

## S3b — phone close-up, night

- Date 2026-10-08 · same model and settings · reference = S3a (`7ef37d21`)
- Job `3e59c5d7` · 2.75 credits · one variant
- Changed from S3a: lighting only
- Prompt:
  > Change only the lighting of the reference image; keep the camera position, framing, the phone, every object and the marble veining exactly the same. It is now night, three hours later. The sun is gone: the sky through the windows is deep blue-black with small distant city lights. The room is dark. The only light sources are the smartphone screen, a plain soft cool-white glow that spills onto the marble around it, and the brass dome lamp glowing dim warm gold in the background. The chair is still empty and the monitor still black. Deep shadows, warm near-black tones, quiet and lonely. Photorealistic cinematic still, shallow depth of field, natural film grain. No people, no text, no logos.
- Gates: framing identical to S3a PASS · no text PASS
- Scores: consistency 5 (phone, veins and objects line up) · realism 5
- Verdict: owner's call pending
- Learned: "Change only the lighting ... keep the camera position, framing, every object exactly the same" held the frame almost pixel for pixel. This is the pattern for matched first and last frames.

## S4 — room at night, wide

- Date 2026-10-08 · same model and settings · reference = S2 option 2 (`e22b0586`)
- Job `f074031f` · 2.75 credits · one variant (the first was refused by a rate limit, not resent)
- Changed from S2: lighting only. Prompt: the S3b prompt without "the phone," and without "shallow depth of field,".
- Gates: framing identical to S2 PASS · no text PASS
- Scores: consistency 5 · realism 5
- Verdict: owner's call pending

## SM — generic map, closer and lower (REJECTED)

- Date 2026-10-08 · GPT Image 2.5 · reference REF-MAP · jobs `6f8704d1`, `4e6fae9f` · 2.75 credits each
- Verdict: **rejected by owner.** It reads as "a city", not Dubai.
- Learned: a place the viewer must recognise needs its landmarks named in the prompt. A style reference alone gives an anonymous city.

## DXB — Dubai map, wide

- Date 2026-10-08 · GPT Image 2.5 (flare) · high · 2K · 16:9 · reference REF-MAP (for style)
- Jobs `04ec4b6d` (A), `881d2f86` (B) · 2.75 credits each
- Prompt:
  > High aerial view of Dubai at night, unmistakably Dubai, rendered in the same visual style as the reference image: the city as a network of thin glowing amber-gold light lines and bright points on a near-black ground. The Burj Khalifa rises in the right-centre of the frame as a tall slender tapering spire, far taller than everything around it, its edges traced in warm gold light, with the lower towers of Downtown Dubai clustered at its base. Sheikh Zayed Road runs as the brightest straight band of light diagonally through the city, lined with towers. On the left the dark sea meets a softly glowing coastline, and the palm-tree shape of Palm Jumeirah lies in the water in the upper left, outlined in small gold lights. Glowing points mark junctions across the districts. The upper quarter of the frame is dark night sky and dark horizon, left empty. Aerial three-quarter view, cinematic, photorealistic with subtle haze around the lights, colours amber and gold (#c9a44a, #f5d978) on warm near-black (#0d0807). No text, no labels, no logos.
- Gates: recognisable as Dubai PASS · no text PASS · text zone clear PASS (dark sea and sky on the left)
- Scores: brand style 5 · geography 2 (the Palm sits too close to Downtown; stylised, not a map)
- Verdict: **B chosen by owner.** A is richer but busier under the clinic points.

## DXB-close — Dubai map, closer and lower

- Date 2026-10-08 · same model and settings · reference = DXB B (`881d2f86`)
- Job `874476cd` · 2.75 credits
- Prompt:
  > The same glowing night view of Dubai as the reference image, seen after the camera has flown straight forward and descended. Keep exactly the same style, colours, road layout and landmarks. The camera is now lower and closer to the city blocks in the lower-centre of the reference image: those street grids and glowing junction points fill the lower two thirds of the frame, larger and more detailed, with one bright junction point just below the centre of the image. The Burj Khalifa is still visible, now larger and higher in the upper right, and Sheikh Zayed Road still runs as the brightest band of light. The sea and the Palm have slid mostly out of frame to the upper left. The top of the frame remains dark sky. Aerial three-quarter view, cinematic, photorealistic with subtle haze around the lights. No text, no labels, no logos.
- Gates: same landmarks PASS · no text PASS
- Scores: consistency 3 (far more building detail than the wide view; the tower's tip touches the top edge)
- Verdict: used as Clip M's end frame without a separate owner check

---

# Clips

All: MiniMax H3 · 2K (2560x1440) · 5 s · 24 fps · 124 frames · 16:9 · 10 credits each.
The model returns an audio track although none was asked for; the frame script drops it.
Higgsfield first answered each submission with a style preset suggestion instead of a job; the
preset was declined (`declined_preset_id`) and the same request resubmitted.

## Clip A — push-in at sunset

- Job `1a2297e8` · start = S2 option 2 · end = S3a
- Prompt:
  > One continuous slow dolly-in from the first frame to the last, the camera gliding straight forward and slightly down toward the smartphone on the marble desk, at constant speed with no easing, no cut and no shake. The phone keeps its exact shape and its plain glowing screen. Nothing in the room moves: the chair, the monitor, the lamp and the plants stay perfectly still. Sunset lighting stays constant. Silent.
- Gates (contact sheet, 7 frames): subject locked PASS · no cut PASS · nothing else moves PASS
- Verdict: owner's call pending

## Clip B — the light dies, camera locked

- Job `417108ff` · start = S3a · end = S3b
- Prompt:
  > Time-lapse with the camera completely locked on a tripod: no camera movement at all. Over the whole clip the daylight fades smoothly and evenly from golden sunset to deep blue night, the sun sinking out of view, the sky darkening, and small city lights appearing in the distance. The phone screen glows steadily the entire time and never changes, the brass lamp glows steadily. No object moves, nothing appears or disappears, no people. Smooth continuous change at constant speed, no flicker, no cut. Silent.
- Gates (contact sheet): camera locked PASS · objects fixed PASS · smooth change PASS
- Verdict: owner's call pending

## Clip C — pull-back at night

- Job `c76fd452` · start = S3b · end = S4
- Prompt: the Clip A prompt with "dolly-in ... forward and slightly down toward" changed to "pull-back ... backward and slightly up away from", "room" to "dark room", "Sunset" to "Night".
- Gates (contact sheet): subject locked PASS · no cut PASS
- Verdict: owner's call pending

---

Credits to date: 10 stills x 2.75 = 27.5, plus clips at 10 each.
