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

## SM — map, closer and lower

- Date 2026-10-08 · same model and settings · reference REF-MAP
- Jobs `6f8704d1` (A), `4e6fae9f` (B) · 2.75 credits each
- Prompt:
  > The same glowing night map of a city as the reference image, seen after the camera has flown forward and lower toward the bright central junction. The same network of thin amber-gold light lines and glowing points on a near-black ground, same colours and same style, now larger in frame: the bright central intersection sits just below the centre of the image, roads radiate outward past the edges, and nearer lines are thicker and slightly soft while distant ones stay fine. Aerial three-quarter view tilted toward the horizon, which stays dark. Photorealistic cinematic still, subtle haze around the lights. No text, no labels, no logos.
- Gates: same style and colour PASS · no text PASS
- Scores: A consistency 4 (keeps the highway band) · B consistency 3, story 5 (one clear bright point to dive into)
- Verdict: owner's call pending; B recommended

---

Credits to date: 7 stills × 2.75 = 19.25.
