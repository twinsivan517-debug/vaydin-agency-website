# Prompt log

One entry per generation. Source files live in `media/stills/` and `media/clips/` (not in git;
the job id fetches them again). Gates are pass/fail. Scores are 0-5 with a reason.

Reference ids: `REF-RECEPTION` = Vaydin's own reception image (`layer-fix.webp`),
`REF-MAP` = Vaydin's own night map (`hero-map.webp`).

The guide's entries (still, voice, clips) are at the end, under "The guide".

---

# The story, frozen at tag `story-home-2026-10-17`

Everything from here to "The guide" made the scroll story that was the home page
from 2026-10-13 to the guide's arrival. Its frames left this repository with it.

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

# Fourth round: the desk keeps living

Owner's brief, 2026-10-10: the reception looked frozen while the call rings; make it live (she glances at the phone, types, the patient waits). A seated extra was left out: adding a person changes S11, which clips E and R start and end on.

## Clip L — the living desk, camera locked, a loop

- MiniMax H3 · 2K · 5 s · job `45f126d9-e9b0-4604-b64d-a167ae5c0d1a` · start = S11 · end = S11 (the same still twice) · 10 credits (balance 338.92 before)
- Prompt:
  > The camera is completely locked on a tripod: no camera movement at all, no zoom, no shake. A quiet, natural moment at a clinic reception at sunset, a seamless loop that ends in exactly the same poses it began in. In order: the receptionist behind the desk glances down at the smartphone glowing on the marble counter, then looks at her monitor and types a few keys with both hands, then lifts her eyes back to the patient and gives a small nod. The patient standing at the desk with her back to the camera shifts her weight slightly and adjusts the strap of her handbag, waiting. The colleague on the right stays where she is, looks down at the folder in her hands, turns one page and looks up again. The smartphone screen keeps glowing steadily the whole time and nobody picks it up. The monitor keeps its plain pale red glow. The plants, the lamp, the desk and the windows stay perfectly still; the sunset light stays constant. Faces stay natural and stable; nobody looks at the camera. No one enters or leaves, nothing appears or disappears, no cut. Silent.
- Gates (contact sheet, 8 frames, and first against last frame): camera locked PASS · faces stable PASS (judged at 640 px a frame) · receptionist looks down and types PASS · first and last frame match PASS · colleague stays where she is NO (she walks to the desk reading her folder and back; kept, it reads as natural).
- On the page it is not scrubbed: `scripts/loops.mjs` makes two silent videos (780 KB wide, 291 KB phone) that `LoopClip` plays round and round while the call rings. The same five seconds as scrubbed pictures weigh about 7 MB.
- Learned: the same still as start and end frame, with the actions named in order and "ends in exactly the same poses it began in", came back as a clean loop on the first take.

Fourth round credits: 10. Running total 141.25.

# Fifth round: the sofa, and through the phone instead of through the dark

Owner's brief, 2026-10-10: the second woman at the desk looks like the receptionist, put a sofa with people waiting instead; the desk moves with the scroll, not by itself; no dark between the scenes, the phone carries the story to the fix and back.
Clip L of the fourth round and the looping player are off the page (`l-v1.mp4` kept). Clips E and R of the third round are kept as `e-v2.mp4` and `r-v2.mp4`; S11 and S10 are no longer on the page.
All stills: GPT Image 2.5 (flare) · high · 2K · 16:9 · 2.75 credits. All clips: MiniMax H3 · 2K · 5 s · 10 credits, each sent with the "IN THE DARK" preset declined.

## S12 — reception, busy, with the sofa (replaces S11)

- Reference = S11 (`9efd140f`) · job `e81476f7-1fc7-484c-84e7-cffc8ade3ae3` · file `13-reception-sofa-busy.png`
- Prompt core: "Change only two things in the reference image; keep the camera position, framing… exactly the same"; remove the woman walking on the right, "She is completely gone"; add "a low, elegant cream boucle sofa with a small brass side table" by the windows with two seated patients, "at mid distance, small in the frame… They look nothing like the receptionist."
- Gates: same room, receptionist and patient yes · second woman gone yes · two people seated, faces clean yes (judged on a crop) · no text or logo yes.

## S13 — reception, calm, with the sofa (replaces S10)

- Reference = S12 · job `f0e08d29-a90c-4928-ade0-d83f8d73a036` · file `14-reception-sofa-calm.png`
- Prompt core: "Change only three small details": phone screen off, monitor pale green, the receptionist's warm smile.
- Gates: same frame as S12 yes · three details changed, nothing else yes.

## Clip E, third version — through the door

- Job `aec738e6-b94b-4d9d-b0e3-b65f4592fadf` · start = S9 · end = S12
- Prompt: the second version's move, with "two patients seated on a cream sofa by the windows on the right, waiting".
- Gates: no cut PASS · people stable PASS · ends on the end frame PASS. The monitor is grey and the phone dark until the last half second, then both light at once; kept, it reads as the call arriving.

## Clip L, second version — the living desk, camera locked

- Job `360b592d-b1d8-48e4-bf1a-c87b2fea1529` · start = S12 · end = S12
- Prompt: the first version's, without the colleague, plus "On the cream sofa by the windows, the seated man turns a page of his magazine and the seated woman turns her head from the window toward the desk and back again; both stay seated."
- Gates: camera locked PASS · she looks down and types PASS · first and last frame match PASS. Scrubbed by scroll.

## Clip P — from the desk to the phone

- Job `497de06c-68c6-45df-9ed5-ce442ac3e708` · start = S12 · end = S3a (uploaded, media `dff4713b-95fd-4f5f-be3e-23bc57f9fb04`)
- Prompt core: "the camera glides forward and to the right, past the patient, toward the smartphone… descends to just above the height of the desk"; "During the move the receptionist stands up, comes out from behind the desk and walks away with the patient out of the left side of the frame… so that by the end her cream chair stands empty and pushed back and the computer monitor has gone dark."
- Gates (contact sheet, 12 frames): no cut PASS · people leave to the left PASS · phone stays put and lit PASS · ends on the end frame PASS. The move is over at about 3.4 s; the page uses the first 3.5 s.
- Learned: a start with people and an end without them joined cleanly once the prompt said who leaves, where to, and what they leave behind.

## Clip Z — into the phone

- Job `f152e193-3df1-4b3a-ab62-77a03b649523` · start = S3b (uploaded, media `bb32a9f3-d689-44a2-b944-fd654ad805ec`) · end = a plain bright frame made here, `12-screen-fills-frame.png` (media `bb5818c5-f51b-43fb-b56c-5e9906d758bc`)
- Prompt core: "the camera rises slightly and glides straight toward the smartphone… tilting down until it looks directly at the glowing screen, and keeps moving in until the plain cool-white screen grows to fill the entire frame edge to edge"; "no interface, no icons and no text at any moment".
- Gates: no cut PASS · screen stays plain PASS · ends on a plain bright frame PASS.
- Learned: an end frame need not be generated. A plain bright picture made on this machine gave the model a place to land, and the page draws the screen's content on top of it in code.

## Clip R, third version — the fix, camera locked

- Job `19d7584d-a160-4014-8c8a-b28a9866acec` · start = S12 · end = S13
- Prompt: the second version's, with the two seated patients instead of the colleague.
- Gates: camera locked PASS · faces stable PASS · phone dark PASS · monitor green PASS (it passes through a stronger green in the first second).

Fifth round credits: 2 stills x 2.75 = 5.5 and 5 clips x 10 = 50. Total 55.5, no second takes (balance 328.92 to 273.42, read after). Running total 196.75.

# Sixth round: the mark on the phone, and the owner with his app

Owner's brief, 2026-10-10: on the way into the phone the screen shows the Vaydin icon, not white; inside it something like an engine; and a closing scene where the clinic's owner opens the Vaydin app and sees his clinic doing well. The app is real: its icon and its first page were read in the `vaydin-core` house (`system/dashboard/assets/vaydin-icon-512.png`, `templates/home.html`, `cards.py`).
`15-app-splash.png` is that icon enlarged on its own black, made on this machine and uploaded (media `9792fd6f-e979-45ad-a2e3-9102216083a7`). It is the end frame of clips Z and Q and a reference for S14.
Stills: GPT Image 2.5 (flare) · high · 2K · 16:9 · 2.75 credits. Clips: MiniMax H3 · 2K · 5 s · 10 credits, "IN THE DARK" preset declined.

## Clip Z, second version — into the phone, the mark on its screen

- Job `c68f32e2-bff1-4adc-8386-c7894c8d0677` · start = S3b · end = the splash · first version kept as `z-v1.mp4`
- Prompt core: "At the very start the smartphone's plain white screen switches to deep black with a single flat gold geometric emblem in its centre, exactly the emblem of the last frame, like an app opening"; the first version's move; "The emblem keeps its exact shape the whole time: sharp straight edges, symmetric, never bending, melting or changing".
- Gates (contact sheet, 12 frames): no cut PASS · the emblem keeps its shape in every frame PASS · ends on the splash PASS.
- Learned: a real logo survived a camera move when it was the whole of the end frame and the prompt said the screen changes to it at the very start. The model had the true shape to aim at from the first second.

## S14 — the owner by the window

- References = S13 and the splash · job `ae1972b0-3e26-4ea9-a413-f2d62d75d7b7` · file `16-owner.png`
- Prompt core: the same reception "seen from a new camera position… looks toward the tall windows, in a medium shot"; "a man in his mid forties with short dark hair and a neat short beard, wearing a tailored charcoal suit"; "holding a smartphone… looking down at its screen with a quiet, satisfied, genuine smile"; "the screen is deep black with one flat gold geometric emblem in its centre, exactly the emblem from the second reference image, copied faithfully".
- Gates: same room (desk, lamp, sofa, light) yes · face and hand clean yes · emblem on the phone matches the icon yes · text zone on the left yes.
- The owner is drawn as a man; the brief did not say.

## Clip O — from the desk to the owner

- Job `f86b998c-cd9d-468b-9eda-b09ae6adbd34` · start = S13 · end = S14
- Prompt core: "the camera glides to the right and forward through the clinic reception, leaving the receptionist and her patient at the marble desk behind on the left… and settles in a medium shot on the clinic's owner… who has been standing by the windows the whole time"; "He is revealed naturally as the camera comes round; he does not walk in".
- Gates: no cut PASS · faces stable PASS · ends on the end frame PASS. The camera passes a dark pillar on the way, which hides the change of angle; the two people on the sofa are gone after it. Over at about 4.1 s; the page uses 4.3 s.

## Clip Q — into the owner's phone

- Job `36459f98-5635-4811-9939-aefb82683e8a` · start = S14 · end = the splash
- Prompt core: "the camera glides forward and slightly down, past the man's shoulder, straight toward the smartphone he holds… until its black screen with the single centred gold emblem fills the entire frame"; "Early in the move his thumb taps the gold emblem once and lifts away again."
- Gates: no cut PASS · he taps the screen PASS (with a finger of his other hand) · the emblem keeps its shape PASS · ends on the splash PASS. Played backwards after the app screen to return to his face.

Sixth round credits: 1 still x 2.75 and 3 clips x 10 = 32.75, no second takes (balance 273.42 to 240.67, read after). Running total 229.5.

---

# The guide

Source files live in `media/stills/guide-*` and `media/clips/guide-*` and `media/voice/`
(not in git). The look is the Promed demo's illustrated 3D style, the owner's pick
2026-10-17 from two references; the voice is Helena (ElevenLabs v4 through Higgsfield).

## G1 — her still, three variants

- Date 2026-10-17 · GPT Image 2.5 · high · 2K · 2:3 · no reference
- Jobs `2cab41d5` (option 1), `0b25996f` (option 2), `5209b8a9` (option 3) · 2.75 credits each, 8.25 in all
- Prompt:
  > A polished stylised 3D-rendered character, in the look of a modern animated film or high-end game cinematic: smooth soft skin shading, slightly enlarged friendly eyes, realistic proportions. A warm, confident woman in her early thirties with Middle Eastern features, long dark glossy hair with soft waves falling past her shoulders, a gentle welcoming smile, small gold stud earrings. She wears an elegant tailored charcoal-black blazer over a simple cream top, tailored black trousers, a thin gold necklace and dark low-heeled shoes: the look of a premium concierge in Dubai, not a doctor, no uniform, no badge. Full body visible from head to feet, standing upright facing the camera, relaxed and welcoming, one hand slightly open at her side as if about to explain something, both arms clearly away from the body. Soft studio lighting from the front with a faint warm gold rim light. The background is one perfectly flat, uniform pure chroma-key green (#00FF00) with no floor, no shadow, no gradient and no objects. No text, no logos, no name tag.
- Gates: flat green PASS/FAIL per option · full body, feet visible · arms off the body · no text
- Verdict: OWED, the owner's pick.

- Verdict: **option 2 (`0b25996f`) chosen by the owner, 2026-10-17.** Options 1 and 3 kept in `media/stills/` as alternates.

## G2 — her sleeping picture

- Date 2026-10-17 · GPT Image 2.5 · high · 2K · 2:3 · reference = G1 option 2 (`0b25996f`)
- Job `2413a14f` · 2.75 credits
- Prompt:
  > The exact same character as the reference image: the same face, the same long dark wavy hair, the same charcoal-black blazer, cream top, black trousers, thin gold necklace, gold stud earrings and dark heeled shoes, in the same polished stylised 3D animated-film render style. She is now fast asleep, lying on her side on the floor, curled up comfortably, knees drawn up a little, her head resting on her folded arm, eyes closed, a peaceful soft smile, hair spread loosely. She lies along the bottom third of the frame, seen from slightly above and in front, her whole body visible from head to shoes, nothing cropped. There is no pillow, no blanket, no floor drawn, no shadow and no object: the entire background, including under and around her, is one perfectly flat, uniform pure chroma-key green (#00FF00). No text, no logos.
- Gates: same person PASS · flat green PASS · nothing cropped PASS · eyes closed PASS
- Verdict: **approved by the owner, 2026-10-17.** Her name on the page: "Vaydin's voice"; prices are spoken aloud, his word the same day.

## V1 — the voice sample

- Date 2026-10-17 · Eleven v4 (ElevenLabs through Higgsfield) · voice Helena, preset `3c2b83c0`
- Job `1518f92d` · 0.46 credits · line 01: "Thank you for waking me. I'm Vaydin's voice."
- File `media/voice/sample-01-helena.mp3`
- Verdict: OWED, the owner's ear. The two greeting lines as one take were quoted at 0.92.

- Verdict: **Helena approved by the owner's ear, 2026-10-17.**

## V2 — every line, draft 3

- Date 2026-10-17 · Eleven v4 · Helena, preset `3c2b83c0` · 34 recordings: the two greeting
  lines as one take (`opener.mp3`, 11.4 s, the lip-sync reference), lines 03 to 11, six
  pokes, fifteen answers, three fixed replies
- Jobs: 04 `71cda473` · 05 `d967e6c4` · 06 `27c8b74b` · 07 `bbc847dc` · 11 `9197d7e3` ·
  opener `ab4751fb` · 03 `ac0e3696` · 08 `709ccdc2` · 09 `4ebb6200` · 10 `a32d61e1` ·
  poke-1 `18664ae8` · poke-2 `391be1d2` · poke-3 `7d36f1d1` · poke-4 `c7403514` ·
  poke-5 `f34b77b2` · poke-6 `8b997797` · a-price `c4bb7b65` · a-diagnostic `9ebef9e0` ·
  a-engine `f7734847` · a-bot `3e02423f` · a-time `7fffa538` · a-where `bf412fcf` ·
  a-who `80bf295f` · a-ads `ee4656cb` · a-proof `815b32a1` · a-need `8378eaa7` ·
  a-branches `e3c37abf` · a-contact `aa984204` · a-cancel `d069496b` · a-clients `bc1045dd` ·
  a-chatgpt `8a0e83e6` · x-choose `def97ad9` · x-unknown `96ea64e4` · x-hello `dedba9db`
- ElevenLabs refused 18 of the first 34 with a rate limit (429); they were resent in
  groups of six, four and two until every one was made. Nothing was charged twice: a
  refused submission makes no job.
- Web files: `public/voice/*.mp3`, mono, 32 kHz, 40 kbps, silence trimmed, 150 ms tail,
  loudness -16 LUFS. The opener stays a source file: it goes into the waking clip.
- Verdict: OWED, the owner's ear on the page.

## C1 — her four clips

- Date 2026-10-17 · Seedance 2.0 mini · 9:16 · 720p · 24 fps · 27 credits in all
- Jobs: waking greeting `b9e926ff` (12 s, 12 credits; start = G2, end = G1 option 2, audio
  reference = the greeting recording `d51b7144`, no generated audio) · sleep `05d70356` ·
  idle `641019b3` · talk `950dc87a` (5 s, 5 credits each; start = end = their still)
- Submission was first refused in favour of a preset ("IN THE DARK"); resent with it declined.
- Sources `media/clips/guide-*-src.mp4` (720x1280, 121 or 289 frames); sheets beside them.
- Web files `public/guide/*.mp4`: scaled to 540x960, H.264 main, crf 29 (greeting 27),
  loops silent, the greeting carrying `media/voice/opener.mp3` as AAC 48 kbps mono.
  `still.webp` is G1 option 2 keyed, for reduced motion and canvases that cannot key.
- Gates: flat green · first frame = last frame on each loop · lips on the words · she ends
  standing in option 2's pose
- Verdict: **kept, all four, the owner's word 2026-10-17** ("keep all for now"); he asked for a slower waking (yawn, "it's so dark", a clap, the logo lights) as a new clip, and for her to look sharper: the web files were re-encoded at the clips' full 720x1280.

## V3 — the slow waking greeting, and the two new question lines

- Date 2026-10-17 · Eleven v4 · Helena · jobs: greeting `f4882355` (three turns, 1.15),
  w1 `1c4396b5` (0.92), g1 `de71d4d9` (0.92)
- The greeting as the clip hears it (`media/voice/opener2.mp3`, 14.45 s): 2.5 s of silence
  for her stretch, "Mmm... hi. It's so dark in here.", a 1.4 s pause for the throw with a
  soft chime synthesised in ffmpeg at its landing (7.9 s), then "There. Thank you for waking
  me. I'm Vaydin's voice." The third turn, "Pick a question or ask me anything...", is cut
  out as its own line (`public/voice/02.mp3`) and spoken on the talk loop after the clip.
- Measured: the throw at 7.0 s, "There." at 8.2 s. These are `THROW_AT` and line 01's `at`.
- Web files: `public/voice/opener.mp3` (the fallback when the clip cannot play), `02.mp3`,
  `w1.mp3`, `g1.mp3`.

## C2 — the slow waking clip

- Date 2026-10-17 · Seedance 2.0 mini · 9:16 · 720p · 15 s · 15 credits · job `6c7e1942`
- Start = G2 (asleep), end = G1 option 2 (standing), audio reference = the assembled greeting
  (`b03a8c88`), preset "IN THE DARK" declined
- What came back (sheet `media/clips/guide-opener2-sheet.jpg`): asleep; stirs; a long yawn with
  both arms up; sits, rubs her eyes; rises; a glowing bulb in her right hand at 9 s, thrown up
  at about 9.4 s; speaks; settles into the standing pose.
- The throw landed later than the recording's pause (7.0 s), so the page's bulb and the chime
  moved to her hand: `THROW_AT` 9.4, chime at 10.3 s mixed softly under her words.
- Web file `public/guide/opener.mp4`: 720x1280, crf 25, with the greeting as AAC mono.
- Verdict: OWED, the owner's eye on the page.

## C3 — the Kling gesture test

- Date 2026-10-18 · Kling v3.0 · pro · 9:16 · 5 s · sound off · 8.75 credits (quoted exactly with
  the inputs, "IN THE DARK" preset declined; balance 12.49 before) · job
  `5db1e553-adaf-4ef1-918c-97d0527faee1`
- Start = end = G1 option 2, uploaded from `media/stills/guide-2.png` (media
  `4e3d005a-f74c-44c6-83fb-08a7f538e270`)
- Why: the owner's word 2026-10-18, quality first, gestures and walking that follow the
  words. Prices read the same day per 10 s silent 9:16: Mini 720p 10 · Kling 3.0 pro 17.5 ·
  FLUX 3 1080p 80 · Seedance 2.0 std 1080p 120 · Seedance 2.5 1080p 160 · Seedance 2.0
  4k 220. Speech to cover: 37 lines, 342 s. Kling 3.0 is the candidate body model; it takes
  a start and an end picture, no audio reference, so lips stay the local model's.
- Prompt:
  > A polished stylised 3D-rendered animated woman, exactly the character in the picture: same face, long dark wavy hair, charcoal-black blazer, cream top, black trousers, thin gold necklace, dark low heels. The camera is locked on a tripod: no zoom, no pan, no shake. Full body visible from head to feet. The background is one perfectly flat, uniform pure chroma-key green (#00FF00) with no floor, no shadow, no gradient and no objects. She addresses the viewer with natural, confident presenter gestures: both hands open and rise to present something, then she takes one easy step to her left while gesturing with her open hand to the side, as if showing a thing beside her, then steps back to the centre and settles into exactly the starting pose, one hand slightly open at her side. Warm welcoming expression, lips closed in a gentle smile, no talking. Smooth natural movement, one continuous shot, no cut, no text, no logo, nothing enters or leaves the frame.
- Gates: flat green · full body, feet visible · her face and clothes unchanged · first frame = last
  frame · lips closed · a real step, not a slide
- What came back: 1172x1764, 121 frames, 5.04 s, 5.8 MB (`media/clips/guide-kling-test-src.mp4`,
  sheet beside it). By my eye every gate passes: flat green, feet in frame, her face and
  clothes held, first frame = last frame, lips closed, a real step across with the legs
  crossing and back to the mark. Her face is visibly sharper than the Mini idle at the
  same crop.
- Verdict: OWED, the owner's eye against the Mini clips on the page.

## C4 — the chapter lines' bodies (Kling v3.0 pro, 9:16, sound off, start = end = G1 option 2)

The owner's word 2026-10-18: "yes please", gestures from the words, a hand in a pocket where
it fits. Price 1.75 credits a second, quoted exactly before each. Each clip's length is the
line's recording rounded up plus one second, 15 at most; a longer line wraps the body (first
frame = last frame). Lips: the local model over each body (`scripts/body.py`, then
`scripts/lipsync.py`).

- w1 (13.0 s) · 14 s · 24.5 credits · job `8d012b7c-4da8-4e22-8463-1965ca1b23ad`
  > …she lays one hand on her chest as she introduces herself, then holds both hands up to frame a small picture in the air, as if showing how something looks, then takes two easy steps to her left and mimes opening a door with one hand and inviting the viewer through it with the other, then walks back to the centre and settles into exactly the starting pose…
  What came back: 1172x1764, 337 frames. **FAILED the flat-green gate**: the background washes to
  near-white from 1.5 s to 12 s, a real door is drawn when she mimes one (sheet
  `media/clips/guide-w1-sheet.jpg`). A mimed object becomes an object; "showing how something
  looks" becomes a light change. 24.5 credits lost. Rule from here: gestures of the body and
  hands only, nothing mimed, nothing shown, and the prompt says the green and the light never
  change.
- w1, second take · 14 s · 24.5 credits · job `fa0260ef-01b2-4090-acb8-825af4e3bd39`
  > …the background … stays exactly the same pure green for the whole clip; the lighting on her never changes; nothing is ever drawn, shown or held, and no object, prop, light or effect appears at any point. Only her body and hands move. … she lays one hand on her chest, then opens both palms toward the viewer at waist height, then takes two easy steps to her left while her near arm sweeps open in a wide inviting gesture, then walks back to the centre and settles into exactly the starting pose…
  What came back: 337 frames, the motion as asked (hand on chest, open palms, two steps and
  the sweep, back to the mark). **FAILED the flat-green gate**: no object this time, the green
  itself drifts to studio grey from 1.5 s to 12 s and snaps back for the forced end frame
  (`scripts/green_gate.py`: 80.2 % wash at frame 150). Kling holds the green for 5 s, not 14.
  49 credits on w1 so far. Rescue without credits: `scripts/rekey.py` keys each frame against
  its own flat backdrop colour; take 2 is the proving ground.
- w1, third take, 7 s · 12.25 credits · job `18e5cd1c-51e6-460d-b270-b9e55f0cc1c4` · the same
  gestures condensed (one step instead of two). The question it answers: does the green hold at
  7 s, as it did at 5 and did not at 14? If so every line gets a 7 s loop, wrapped under longer
  lines, and no rescue. What came back: 169 frames, gate PASS at 0.0 % wash, every gesture as
  asked, first frame = last. **Verdict: this is the road** (my eye; the owner sees it on the page).
  Body: `media/guide/bodies/w1.mp4`. The 14 s takes are kept as `w1-take1-failed`, `w1-take2-drift`
  under bodies/ for the re-key experiment (`scripts/rekey.py`), not for the page.

The 7 s loops, 12.25 credits each, quoted exactly before each, same frame rules as w1's third take:
- 02 (5.8 s) · job `f7c83469-4999-42d6-9cff-d03a91ee760d` · one open hand to the viewer, index then
  second finger (two things), a small shrug, back to the mark. Gate PASS at 0.0 % wash; every gesture as asked (sheet beside the source). Body made.
- 07 (20.2 s, wraps) · job `138de186-8011-43e4-988e-83efa79aeea9` · one finger (layer one), other
  hand into her pocket and stays, three fingers then the open hand (days), a slow nod palm up,
  hand out, back. Gate PASS at 0.0 % wash; every gesture as asked (sheet beside the source). Body made.
- 08 (18.2 s, wraps) · job `eeb1925d-3cd5-4f43-b1e7-3821b55e6f66` · two fingers (layer two), counts
  four on one hand, that hand into the pocket while the other draws a small circle, hand out,
  back. Gate PASS at 0.0 % wash; two fingers held on both hands, then an OK sign with the other hand in her pocket, back: not the four-count asked, but a fit for "layer two". Body made.
- g1 (12.4 s, wraps) · job `c626f826-78b6-41d9-8956-d80085333a12` · both hands gather to her chest
  (gain), one sweeps outward (in public), counts three, a nod, back. Gate PASS at 0.0 % wash; hands gather to the chest, open wide, two fingers (three asked), a nod, back. Body made.
- 10 (12.4 s, wraps) · job `972a67e5-8467-4543-aec0-a361f13853ab` · a flat hand across in a level
  line (measure), two taps of the index finger (scored, explained), hand in pocket with a knowing
  head tilt, hand out, back. Gate PASS at 0.0 % wash; the flat hand across, the finger taps, hand to her hip pocket with the head tilt, back. Body made.
- a-need (13.4 s, wraps) · job `37014af2-c7a1-4607-9ab5-013c7c9c31c7` · empty palms lift (nothing),
  counts four (profile, Instagram, website, WhatsApp), a step toward the viewer and back. Gate PASS at 0.0 % wash; palms lift, the count, the step forward and back. Body made.
- a-time (9.0 s, wraps) · job `6e9f6711-2a88-4efb-a1c7-a49cbc6ca79c` · a finger draws a line left to
  right (time), three fingers (months), rolls a sleeve a little (hands-on), back. Gate PASS at 0.0 % wash; the finger's line, the fingers, a tug at the sleeve, back. Body made.
- a-price (22.8 s, wraps) · job `b1aa85c3-c20f-4471-9242-89f854b66bbd` · one hand in the pocket and
  stays, the other marks two points (the two prices), a this-much between thumb and finger, an open
  palm, hand out, back. Gate PASS at 0.0 % wash; hand in the pocket throughout, the other marks and opens, back. Body made.
- a-cancel (5.9 s) · job `27cba94a-09db-423f-861d-a012b026347c` · an easy shrug, three fingers, a
  reassuring nod palms up, back. Gate PASS at 0.0 % wash; the shrug, the fingers, palms up, back. Body made. All ten chapter bodies passed the gate on the first 7 s take.
Ten chapter lines sent 2026-10-18: 9 × 12.25 + w1's three takes (24.5 + 24.5 + 12.25) = 171.5 credits.

## C5 — the poke quips' bodies (Kling v3.0 pro, 9:16, 5 s, sound off, 8.75 credits each, quoted exactly before each)

The owner's word 2026-10-17: when poked too much, funny body gestures, not only the CSS hop and shake.
Start = G1 option 2; end = G1 option 2, except p6, which ends on G2 asleep (uploaded from
`media/stills/guide-asleep.png`, media `f084cc70-821c-494d-a5c7-6d710ce79af1`).
- p1 "Hi there. Tap a question and I'll explain." · job `dca10c90-a9b5-4f71-954a-81b86942b280` · a small
  wave, then an open hand pointing sideways to the questions, back. Gate PASS 0.0 %; the wave and the open-hand point, back. Body made.
- p2 "Yes? I'm listening." · job `7d54d3d7-93d7-40c3-abcb-fe8093438926` · leans in, a hand cupped behind
  her ear, eyebrows up, back. Gate PASS 0.0 %; a lean in with a hand raised to listen, back; the ear cup is slight. Body made.
- p3 "Careful, I'm working." · job `22416e65-92a3-4301-8ec3-e060fb15896b` · hand on hip, a playful
  finger wag, mock-stern then a smile, back. Gate PASS 0.0 %; hand on hip, the finger wag, back. Body made.
- p4 "Okay, okay. What would you like to know?" · job `9be2d1dc-ffaf-482b-b8c1-6e07a0f7ae7a` · both
  palms up in a laughing surrender, shoulders up, back. Gate PASS 0.0 %; both hands up in surrender with a laugh, back. Body made.
- p5 "I'm a guide, not a button." · job `b52d508f-a6ac-424c-b743-e55b0f04f68c` · arms folded, one
  eyebrow, a slow unimpressed head shake, back. Gate PASS 0.0 %; arms folded, the eyebrow and the slow head shake, unfolds, back. Body made.
- p6 "Fine. I'll just lie back down, then." · job `4e3fab0c-da6c-4f39-8e6c-f95d95e9ca4e` · a sigh and a
  shrug, turns, lies down, curls up asleep. The page would then have to go to sleep after p6, a
  change to the machine, on the owner's word. Gate PASS 0.0 %; the shrug, she turns, crouches, lies on her side and curls up asleep. Body made. Her lips can only be synced while she faces front (the first 2.5 s); the model finds no face once she turns.
Six quips: 52.5 credits.

## C6 — her three loops again, on Kling (5 s, 8.75 each, quoted exactly before each)

The owner's "continue" 2026-10-18 after the price was named: one body throughout, and the
answer lines' lips synced over the sharper idle for free afterwards.
- idle · job `d6a533e6-0e4d-4fba-88d3-7ad1e9213f3c` · at ease, breathing, a slight weight shift,
  a blink, no gesture, start = end = G1 option 2. Gate PASS 0.0 %; at ease, a hand opening a little, nothing more. `scripts/loop.py`: 4.5 s seamless (first vs last frame 0.94 mean diff), `public/guide/idle.mp4` 1260 KB, `media/guide/base-loop.mp4` the new lip-sync base: every line without a body is now stale and is remade over it, free.
- talk · job `83ec0fb5-fdb7-453c-8a01-86d0b2c46513` · gentle open-palm gestures, a nod, start =
  end = G1 option 2; the body of any line without one. Gate PASS 0.0 %; gentle open palms, a nod. `public/guide/talk.mp4` 1329 KB, `media/guide/talk-loop.mp4`.
- sleep · job `acdfddce-49dc-43de-a1fe-5efbc1a24d30` · asleep, breathing, start = end = G2.
  Gate PASS 0.0 %; asleep, breathing. `public/guide/sleep.mp4` 803 KB against the old 611 KB; it loads with the page, so the ship gate's home-page budget is re-measured before anything ships. Placement matches the old loop within 0.5 %. The greeting clip stays the Mini one for now: 15 s would drift on Kling; the rescue (`scripts/rekey.py`) is the road if the owner wants it sharper.

## C7 — six chapter bodies retaken under the no-numbers rule (7 s, 12.25 each, quoted exactly)

The owner 2026-10-18: "if she says six she is showing four fingers". Lesson 7 in the house:
a body gesture may never carry a specific the words carry (a number, an object, a direction),
because the generator miscounts and a 7 s loop wraps under a 6-23 s line so no gesture lands
on its word. The counting takes are kept in bodies/ as `<id>-counts.mp4`, not for the page.
- 07 · job `617f7ac5-6e6b-424d-8b71-1bec49676ec3` · hand on chest, opens to the viewer, other hand
  in the pocket, palm up with a nod, out, back. Gate PASS 0.0 %; hand on chest, opens, the pocket, palm up, back; no count. Body made.
- 08 · job `e21cf547-b07e-43eb-a026-4c30f383d7fa` · palms rise as if lifting, one hand in the pocket,
  the other explains palm up, out, back. Gate PASS 0.0 %; palms rise, the pocket, the free hand explains, back; no count. Body made.
- g1 · job `384685d9-62b0-402c-8c73-cc1979180ff2` · hands gather to the chest, open wide, a nod
  with an open palm, back. Gate PASS 0.0 %; hands gather, open wide, a nod; no count. Body made.
- a-need · job `c0e7925c-c914-407b-9b93-8cb9c3e0498f` · empty palms lift (nothing), a sweep across,
  a step forward and back. Gate PASS 0.0 %; palms lift, the sweep, the step forward and back; no count. Body made.
- a-time · job `38dbce29-083a-4ff8-92bc-f12055db275f` · a flat hand left to right (time), into the
  pocket, a nod palm up, out, back. Gate PASS 0.0 %; the hand across, the pocket, the nod; no count. Body made.
- a-cancel · job `1eae227f-5f13-4d84-bc61-847207ea75cf` · an easy shrug, a hand over her heart with
  a nod, back. Gate PASS 0.0 %; the shrug, the hand over her heart; no count. Body made. All six retakes passed first time.
Six retakes: 73.5 credits. 02's "index then a second finger" shows a two the words do not say; left as
is on the owner's list of six, flagged.

## C8 — the greeting on the same body, and three bodies retaken with her feet planted

The owner 2026-10-18, on the page: after the wake-up she becomes a different woman (the
greeting was the Mini render from the first still, 720x1280; everything after it is the Kling
body from G1 option 2, 1172x2084), and the "What is Vaydin?" body crosses her legs mid-loop.
Kling v3.0 pro, 9:16, sound off, "IN THE DARK" preset declined; prices read the same minute,
the rate now 2.5 credits a second (1.75 the day before); balance 130.49 before. Owner: "send four".
- greeting · 10 s · 25 credits · job `dca7db1d-bc44-40e5-8bad-38295c43fec6` · start = G2 asleep
  (`f084cc70`), end = G1 option 2 (`4e3d005a`): asleep, stirs, rubs her eyes, stretches, sits,
  stands, settles into the standing pose, lips closed. 10 s sits past the 7 s where the green
  holds; `scripts/rekey.py` is the rescue. Her lips go on with `scripts/opener_lipsync.py`.
- w1 · 7 s · 17.5 · job `82b8d489-49c0-4052-9e04-e98e94fe5e7d` · feet planted, never a step:
  hand over her heart, palms open, one hand into the pocket while the other explains, out, back.
- 02 · 7 s · 17.5 · job `23734532-72ea-4f37-9cc7-05c1624234ea` · feet planted: one open hand
  inviting, both open wide, a small shrug, back. No count.
- a-need · 7 s · 17.5 · job `15c34b56-8060-4a71-b9a5-7337d8a12ded` · feet planted: empty palms
  lift, a sweep across, hand on chest with a nod, back. No step.
- Gates: flat green (`green_gate.py`) · feet never move · no count · first frame = last · lips
  closed · the greeting: ends in the standing pose, her face and clothes those of the loops.
- Verdicts, all four back within ten minutes, every gate PASS at 0.0 % wash, feet planted, no count,
  first frame = last on the three bodies: the greeting (241 frames) sleeps five seconds, stirs,
  rises fast at about 6.5 s, stands from 7 s with a hand to her chest and an open palm, ends
  on the still; its last frame against the idle loop's first measures 1.74 mean difference,
  no pixel over 40, so the clip plus five seconds of the idle loop is the 361-frame source
  `media/clips/guide-opener3-src.mp4`, lips from 7.5 s by `opener_lipsync.py --src`. The old
  bodies stay as `w1-crossed`, `02-counts`, `a-need-step`; the new ones are the bodies.
- Lips: w1 1038 s, 02 632 s, a-need 783 s on the lab; the greeting 361 frames, join 7.5 s,
  blend 6, 4158 KB, her mouth closed on the pause after "There" and open on "Thank you" (frames
  at 9.3 and 10.2 s). `public/guide/opener.mp4` is now 1172x2084 like the loops; the Mini
  greeting lives on in git history (commit 85537e2 and before).
Four jobs: 77.5 credits (balance 130.49 to 52.99, read after).

## C9 — her mouth sealed in the silent loops; the greeting's first words still owed

The owner 2026-10-18 night, on the page: (1) lying down she says "Mmm, it's so dark" with
sealed lips; (2) after the intro her lips keep moving with no sound. Frames read at 6 a
second: (2) is the idle and talk loops themselves (C6): Kling mouthed words in both though
told "lips closed, no talking"; the greeting's silent tail inherited it through the lip model,
which redraws the mouth it is given on silence. No credits: `scripts/seal.py` pastes a
closed-mouth patch (frame 240 of `guide-opener3-src.mp4`, her standing still) over her mouth
in every frame, placed by matching the ring of nose, cheeks and chin around it; the seam is
invisible at full size. New `media/guide/base-loop.mp4`, `talk-loop.mp4`, `public/guide/
idle.mp4` (1435 KB), `talk.mp4` (1490 KB). Every line without a body (20) is stale against the
sealed base and waits for a render (about 3 h CPU, or a GPU). The greeting source
`guide-opener3-src.mp4` carries the sealed idle as its tail, and `opener_lipsync.py --end`
hands the frames after the last word back to the clip; not yet rendered.
(1) The lip model finds her lying face but paints the mouth on her cheek (face tilted). A
test with her band of the frame rotated upright (-45°, -60°) was stopped on the owner's word
to shut down; result unknown. The bodies also mouth words in places; under a line the model
draws the mouth while she speaks, so only pauses show it; left for now.
Lesson: queued lip-sync runs overwrite each other's manifest entries (w1, 02 repaired by hand);
one call per batch, in `scripts/LIPSYNC.md`.

## C10 — the twenty stale lines rendered on this PC's CPU: fourteen made, six retired, the greeting's tail sealed

The owner 2026-10-19 morning: the GPU on AWS waited on three doors (the key, a driver script
refused in auto mode, the account's G-instance quota), so his word was the CPU. No credits.
One detached call (`lipsync.py` with fourteen ids `&&` `opener_lipsync.py --src
media/clips/guide-opener3-src.mp4 --join 7.5 --end 11.6`), low priority, log in the lab.
- Fourteen answer lines over the sealed idle, 10:57 to 13:20, 8540 s in all: a-ads 683,
  a-bot 634, a-branches 629, a-chatgpt 817, a-clients 878, a-contact 594, a-diagnostic 619,
  a-engine 621, a-proof 599, a-where 583, a-who 555, x-choose 208, x-hello 521, x-unknown 599.
  The cost is per face frame, not per second of speech: the detector runs over as many base
  frames as the line has sound, capped at the loop's 108, about 5 s a frame on this CPU
  (x-choose, 1.7 s of speech, 208 s). Lines 4 and 5 ran slow while OneDrive re-uploaded
  the finished clips. A cache of the detection over the one base would make every line a
  minute or two; not built.
- The six retired lines (03, 04, 05, 06, 09, 11) were left out and stay stale until their
  deletion is said. `lipsync.py --check` lists exactly those six.
- The greeting: the first run failed at its last ffmpeg call after 17 min of inference, the
  output being also the sound's input (opener.mp4), which ffmpeg refuses; fixed in
  `opener_lipsync.py` (written beside the work, moved in), re-run 13:38 to 13:56. 361 frames,
  join 180, blend 6, end 278, 4340 KB (was 4158). Frames read: pursed on the pause at 9.3 s,
  open on "Thank you" at 10.2 s, closed at 12.5 s and 14.2 s, where it mouthed before.
- Still open from C9: her first words lying down have no lips (the model paints the mouth on
  her tilted cheek); the rotated-band test is untouched. House lesson 8: the untested step
  runs first, never last in a long batch.

## C11 — her first words lying down have lips; a line on its own body rests on her still

The owner 2026-10-19 afternoon, on the phone: (1) "Mmm, it's so dark in here" with a closed
mouth; (2) when a line ends or is stopped she snaps into the loop, read as lag. No credits.
- (1) A probe (four waking frames, nine angles) showed the detector finds her lying face at
  every angle; the model simply paints the mouth at the bottom of the box, which on a face
  on its side is her cheek. `scripts/opener_lying.py`: frames 84-120 turned -60° (her face
  upright), 120-180 at 0°, each band through the model against its slice of the sound, turned
  back, and only the mouth of the detected face box blended in, the box per frame because
  she moves while rising (the first try, one box per band, painted nothing from 6.5 s on;
  stopped and redone). Source `media/clips/guide-opener4-src.mp4`, 361 frames; the tail as
  before (`opener_lipsync.py --src ... --join 7.5 --end 11.6`): 361 frames, 4596 KB. Frames
  read: open on her lips at 3.8-4.8 s, painted through 5.4-7.0 s on the generator's own
  motion blur, one blurred frame (159) untouched. CPU: two bands about 25 min, the tail 18.
- (2) Measured: the loop's first frame and a body's first and last differ by 2 mean; the
  loop's middle by 8 with 152k pixels over 40. The page started a body line at the loop's
  phase and resumed the loop at the body's time. Now a body line starts at frame 0, the loop
  resumes at frame 0 when it ends, and that cross is 450 ms (200 elsewhere). `lipsync.py`
  writes `public/guide/lines/bodies.json`; the page reads it at wake. A line stopped
  mid-gesture still crosses from arms in the air; only a render change would end every
  gesture on the still.
- Also on the phone: the cloud is a wide row above her, the bottom bar one slim row with a
  WhatsApp icon (commit 08c96c5).
- C11, second pass, the owner on the phone 17:00: the first head render had a smear on her
  face from 6.3 s and a patch near her chest as she rose. Frames read against the generator's
  own: the smear is Kling's motion blur as she springs up, and the model had drawn a crisp
  mouth into it for "here" (6.5-7.2 s), which reads as a broken face. The rising band now
  ends at 6.25 s (frame 150), the model's box smoothing is off there, and a box the wrong
  size for her face or jumping away from it is dropped (none were). Frames 150-179 measure 0
  pixels changed against the generator's clip. `--only 1 --splice` redid that band alone,
  spliced before frame 180 onto the tail already made: 361 frames, 4428 KB. The "patch" was
  her white top, present in the original. Page screenshots, 52 over the first 11 s, show
  nothing stray.

# The particle guide's armour

His word 2026-10-22: she goes; in her place a man made of gold dots, powerful (his reference: the Destroyer from the film Thor, with his own helmet). Three concepts to pick from before anything is made in 3D. Sources `media/stills/armour-*.png` (not in git).

- Date 2026-10-22 · GPT Image 2.5 (flare) · high · 2K · 3:4 · 2.75 credits each, quoted exactly before; 8.25 in all (balance 635.14 before)
- Jobs: Sentinel `d737a291-5e9a-49f9-98b0-d877ff686506` · Falcon `3fb37f45-7ac2-48eb-9ad7-552c519d8e76` · Crown `a6f05b13-a2a0-4738-8ae7-05876760f480`
- One frame for all three: a calm guardian bust, exactly frontal and symmetrical, a faceless helmet with a warm white visor line, brushed matte gold, "powerful but not threatening: no weapons, no spikes, no fire, no teeth", soft studio light on plain dark charcoal, no text. Then each: Sentinel a smooth knight's helm and shoulder plates overlapping like feathers; Falcon a helm like an Arabian falconry hood with mashrabiya lattice on cheeks and shoulders; Crown upright fins fanning like a crown, a cross of light on the faceplate and a round core in the chest.
- What came back: all three as asked, first take. The Crown's cross of light reads as a religious cross once it is dots; on the pick page its vertical seam is thinned out of the dots. If the Crown is chosen, its picture is remade without the seam before it goes to 3D.
- Shown as dots on a private page, https://claude.ai/artifact/GimzVEgpUEZLu6e1v2otVa (`lab/particle-guide/pick/`). Verdict: OWED, the owner's pick.

# His voice (the particle guide)

His word 2026-10-22: a male voice, deep, a teacher explaining, a little robotic for an AI, able to be serious, funny and sceptical; ElevenLabs direct. The key is read at run time from the clinic-growth-bot house's `.env` on his word ("yes yes"), never printed or copied. Tools in `lab/particle-guide/voice/`.

- Account: Creator, active, commercial licence; 8,614 of 363,000 characters used before, 10,183 after: 1,569 for everything below.
- Library: 210 male English middle-aged and older voices (educational, narrative, conversational), plus searches for "robot", "AI assistant", "android". Pitch measured on every sample after a check on known ones (her recording 213 Hz, two male samples 112 and 124 Hz).
- One test line with emotion tags ([warm] [curious] [skeptical] [laughs] [serious]), never for the site, recorded with Eleven v3 in Russ, The Professor, Clyde, Jon (AI assistant), Paul, Marcus (robotic, deep), Sigma (AI system), Benjamin (slightly robotic), and Paul on Eleven v4. No take reads a tag aloud (checked by transcribing each). Every take is heard as "Vadon" by the transcriber: the name's sound is OWED, the owner's ear.
- Voice Design, 3 previews each: "deep, warm male AI guide, teacher-like, a subtle synthetic shimmer" and "friendly futuristic AI companion, deep, lightly robotic, warm and full of feeling". Not saved to the account yet.
- Russ with our own robotic layer (ffmpeg, phase-zeroed copy mixed in at about a fifth and two fifths).
- All 17 on a private page, https://claude.ai/artifact/4JrAauqe9pjKsT5P4h6ACg (`lab/particle-guide/voices.html`). Verdict: OWED, the owner's ear.

# His voice, every line (Jon)

His pick 2026-10-22: Jon ("Natural Authority, Agent / Assistant", ElevenLabs library), Clyde the backup; the name as written (A); a light AI layer (2). Lines approved by him the same day: his wake ("Mmm… oh, hello there." / "Thank you for waking me. I'm Vaydin's guide."), his poke-6 ("Fine. I'll just go back to sleep, then."), x-personal as "Vaydin's guide", and his line "Dubai never sleeps…" recorded both ways: tag-a "…neither does your clinic", tag-b "…your clinic never misses them". Which one is true waits on his answer: the site says replies are approved by reception with a tap (a-bot, 08, a-engine).

- Eleven v3, emotion tags on 36 of 74 lines (`media/voice/jon/script.json`, raw takes beside it, not in git). Web files: the light AI layer (phase-zeroed copy at 0.24) then the site's chain (trim, 150 ms tail, -16 LUFS, mono 32 kHz 40 kbps), into `public/voice/` on this branch only. Tools: `lab/particle-guide/voice/record.py`, `verify.py`, `extract.mjs`.
- Every line transcribed back and compared with its words: 7 of 74 flagged, each opened. False: 00b ("Hmm" for "Mmm"), poke-3, x-choose (short lines), a-legit (a second, larger transcriber hears it right, laugh included). Real: x-hello garbled ("Pit ticket chapter" by both), re-recorded clean; x-kind and x-thanks rushed, re-recorded. The larger transcriber hears the name as "Vayden".
- Characters: 10,183 before, 14,228 after (4,045 for the name tests, the 74 lines and three retakes).

# His greeting and sixth poke, retaken (Jon)

His word 2026-10-23: he wakes by himself now, so the greeting loses "Thank you for waking me"; and he never sleeps ("Dubai never sleeps"), so the sixth poke gets a joke instead of going back to sleep. Words and price shown to him first (119 characters quoted); his yes, the key read at run time as before.

- 01: "[warm] I'm Vaydin's guide." poke-6: "[skeptical] Sleep? In Dubai? Never. [laughs] Hibernation mode, though. Until you get serious." Eleven v3, voice `sB7vwSCyX0tQmU24cW2C`, one take each, `record.py ... 01 poke-6`. Yesterday's raw takes kept beside them as `*.before-2026-10-23.mp3`.
- Transcribed back (`verify.py`): 0 of 2 flagged; every word heard, no direction read aloud. 01 is 1.36 s, poke-6 6.47 s.
- The greeting rebuilt from its three files: 00b at 0, 01 at 2.58, tag-b at 4.39 (01's length plus the same 0.45 s pause): 10.59 s, -17.1 LUFS (the old one -17.3). Placement checked on the second word of each part as heard.
- Characters: 14,314 before (86 more than the line above says, spent after it was written), 14,366 after: 52 for both lines.
