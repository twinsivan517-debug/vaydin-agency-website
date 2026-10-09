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

## Clip M — flight over Dubai

- Job `81e72497` · start = DXB B · end = DXB-close
- Prompt:
  > One continuous slow aerial flight straight forward and gently descending over the glowing night city, from the first frame to the last, at constant speed with no easing, no cut, no shake and no rotation. The tall spire tower keeps its exact shape and stays upright. The glowing road lines and points stay steady and do not flicker or pulse; no vehicles, no moving lights. The sky stays dark. Silent.
- Gates (contact sheet): tower keeps shape PASS · no cut PASS · ends on the end frame PASS
- Verdict: owner's call pending
- Learned: the end still had far more building detail than the start still, and the model grew the detail smoothly across the flight instead of jumping. A start and end frame need the same landmarks, not the same level of detail.

---

Credits to date: 10 stills x 2.75 = 27.5 and 4 clips x 10 = 40. Total 67.5 (from the quotes; two stills were rejected).

## What the page taught, for the playbook

- The first scene's frames load with the page. Left alone they put 3.3 MB on first load and broke the motion budget. Loading three frames first and the rest on the first scroll brought first load to 469 KB.
- A 16:9 clip cropped on a tall phone lost the subject and was soft. Phones need their own 3:4 cut centred on the subject, and that cut's first frame doubles as the scene's still.
- Anything drawn by code on top of a clip (points, tags) only stays put on a held frame. The sweep runs after the flight ends, not during it.

# Second round: the door and the busy desk

Owner's brief, 2026-10-08: the camera goes from the map through the clinic's door; inside, the team is confused and pulled in every direction (not untidy); one shot only of the light dying.

## S7 — reception, team overwhelmed

- GPT Image 2.5 · high · 2K · 16:9 · reference REF-RECEPTION · job `2366c42d-54e4-4e42-9ac4-04bcfda321ea` · 2.75 credits
- Prompt core: the reference room seen from just inside the entrance, 28mm; "overwhelmed, not untidy"; receptionist on a landline reaching for the keyboard, a patient waiting with her back to the camera, a second staff member walking out of frame motion-blurred; an unattended smartphone on the marble; monitor a plain pale-red glow; nobody looks at the camera; left third dark.
- Gates: room matches the brand photo yes · faces and hands clean yes · no text or logo yes · text zone on the left yes.
- Learned: people held at mid distance, in side view or from behind, and "nobody looks at the camera" came back clean on the first try. Naming the mood as a contrast ("overwhelmed, not untidy") kept the room expensive.

## S8 — the door at night (superseded by S9)

- Same model and settings · reference REF-RECEPTION · job `1cc9f968-e3e9-4ebd-882d-5010426505fd` · 2.75 credits
- Gates: door centred yes · interior matches yes · no logo NO (a maker's logo on the monitor) · time of day NO (night, the interior scene is sunset).
- Learned: "no logos" does not stop a logo on a recognisable product. Describe the object as blank instead. Decide the time of day for every still in a sequence before the first prompt.

## S9 — the door at sunset

- Same model and settings · reference = S8 (`1cc9f968`) · job `f139229b-8937-4b76-90f6-38c00f48d68c` · 2.75 credits
- Prompt core: "Change only the time of day and one detail… keep the camera position, framing… every object exactly the same", sunset sky, "the monitor is a plain blank back panel with no logo and no marking of any kind".
- Gates: same door and framing yes · logo gone yes · matches S7's light yes.

## S10 — reception, calm (end frame of the recovery)

- Same model and settings · reference = S7 (`2366c42d`) · job `cb52ad6e-5af5-46cf-8e3e-eccfa72adb24` · 2.75 credits
- Prompt core: "Change only what the people are doing and two small details… keep the camera position, framing… every object exactly the same"; handset down, a warm smile at the patient, the hurrying colleague now standing still; monitor pale green; phone screen dark.
- Gates: same room, same people, same framing yes · faces clean yes.

## Clip N — the descent, map to door

- MiniMax H3 · 2K · 5 s · job `2dd32f32-e07c-4947-9bb1-2b221f2db2d2` · start = DXB-close · end = S9 · 10 credits
- Prompt core: "One continuous fast aerial descent… dives straight forward and down… the view levelling out… settles at street level, eye height, facing the glass entrance door, perfectly centred"; "the sky brightens from dark night into a warm amber and violet sunset, and the glowing gold line-drawing look of the city turns smoothly into a real photographic street"; "The door… appear gradually out of the bright point… nothing pops in suddenly".
- Gates (contact sheet): no cut PASS · lands on the end frame PASS · middle readable PASS (motion blur and a light flare carry the change of place).
- The move is over at about 3.4 s and the rest stands still; the page uses only the first 3.4 s.
- Learned: two stills that share nothing can still be joined if the prompt names a bridge between them (here: one bright point that grows into the door) and says the look itself changes over the move. A fast move hides the change better than a slow one.

## Clip E — through the door

- Same settings · job `e201ee77-0e05-4250-a5ba-aeb6c7fafce8` · start = S9 · end = S7 · 10 credits
- Prompt core: "One continuous slow steadicam move… the two glass panels slide open sideways by themselves just before the camera reaches them… passes through the doorway… drifting slightly to the left"; "The people are already in the room as the camera enters and are revealed naturally".
- Gates: no cut PASS · people stable PASS · ends on the end frame PASS. Stands still after about 3.9 s; trimmed.

## Clip R — the desk calms, camera locked

- Same settings · job `387f210c-41c0-4591-8e63-240bae2579fc` · start = S7 · end = S10 · 10 credits
- Prompt core: "The camera is completely locked on a tripod"; each person's action in order; "The glow of the computer monitor shifts smoothly from pale red to pale green"; "Faces stay natural and stable; nobody looks at the camera".
- Gates: camera locked PASS · faces stable PASS · monitor turns green PASS. The colleague walks out and back in before stopping; reads as natural.

Second round credits: 4 stills x 2.75 = 11 and 3 clips x 10 = 30. Running total 108.5 (from the quotes).
All three clips passed on the first take.

# Third round: the quiet busy desk

Owner's brief, 2026-10-09: the busy desk was too much; show busy with little difference from the calm picture, and a call ringing on the phone.
The first versions of clips E and R are kept as `media/clips/e-v1.mp4` and `r-v1.mp4`; S7 is no longer on the page.

## S11 — reception, busy but quiet (replaces S7)

- GPT Image 2.5 (flare) · high · 2K · 16:9 · reference = S10 (`cb52ad6e`) · job `9efd140f-d419-45b5-b7af-86490aa04b15` · 2.75 credits (balance 385.67 to 382.92)
- Prompt core: "Change only three small details of the reference image; keep the camera position, framing… every object exactly the same"; the smartphone's screen lit, "nobody is looking at it"; the monitor pale red; the receptionist "giving her full attention… no broad smile"; the colleague "mid-step, walking at a normal unhurried pace… no motion blur".
- Gates: same room, people and framing as S10 yes · faces and hands clean yes (judged at 1400 px) · no text or logo yes.
- Learned: building the "before" from the "after" still, instead of the other way round, kept the two pictures a few details apart. The lit phone is small in the frame; the page carries the call with a drawn tag.

## Clip E, second version — through the door

- MiniMax H3 · 2K · 5 s · job `ef8cde11-9a35-4fa5-83c8-8460885b43bb` · start = S9 · end = S11 · 10 credits
- Prompt core: the first version's move, then "As the camera settles, the screen of the smartphone… lights up with a plain cool-white glow; the receptionist glances down at it for a brief moment, then turns her eyes back to the patient. Nobody picks the phone up."
- Gates (contact sheet, 9 frames): no cut PASS · people stable PASS · glance present PASS · ends on the end frame PASS.
- The camera settles at about 3.9 s but the glance and the colleague's walk run to the end, so the page uses the whole clip (62 frames, was 47).

## Clip R, second version — the fix, camera locked

- Same settings · job `b613166c-77af-4585-a8fb-6287b9f7219e` · start = S11 · end = S10 · 10 credits
- Prompt core: "The camera is completely locked on a tripod… A quiet, almost still shot"; in order: the phone screen dims and goes dark, the monitor shifts from pale red to pale green, the receptionist's expression eases into a smile, the colleague stops and looks up.
- Gates (contact sheet): camera locked PASS · faces stable PASS · monitor turns green PASS · phone dark PASS.

Third round credits: 2.75 + 20 = 22.75 (balance 385.67 to 362.92). Running total 131.25. All three passed on the first take.
The preset suggestion came back again on both clips ("IN THE DARK"); declined and resubmitted.
