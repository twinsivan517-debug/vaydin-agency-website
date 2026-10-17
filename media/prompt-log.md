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
