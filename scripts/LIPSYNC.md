# Lip-sync lines: how the clips in `public/guide/lines/` are made

One body, many mouths. `media/guide/base-loop.mp4` is her calm standing loop
(4.5 s, 24 fps, seamless). Every voice line in `public/voice/` is run through
Wav2Lip over that loop by `scripts/lipsync.py`, which writes one clip per line
and a manifest of what each clip was made from. The page plays the base as
idle and a line's clip while she speaks, on one clock, so only the mouth
changes.

## The lab (outside the repo; code ships, the lab does not)

The model, its weights and a Python environment live in a folder named by
`LIPSYNC_LAB` (default `L:/lipsync`). Paths must stay short on Windows, hence
the drive letter: `subst L: <some local folder>`.

    L:/lipsync/venv            python -m venv venv; pip install torch torchvision
                               --index-url https://download.pytorch.org/whl/cpu;
                               pip install "numpy<2" opencv-python librosa numba tqdm scipy
    L:/lipsync/Wav2Lip         git clone --depth 1 https://github.com/Rudrabha/Wav2Lip
    L:/lipsync/models/wav2lip_gan.pth   435,801,865 bytes
    L:/lipsync/Wav2Lip/face_detection/detection/sfd/s3fd.pth   89,843,225 bytes

Four one-line patches to the checkout, for current libraries and safe loading:
`torch.load(..., weights_only=True)` in `inference.py` (both calls) and in
`face_detection/detection/sfd/sfd_detector.py`; `dtype=int` for `np.int` in
`face_detection/utils.py`; keyword arguments `sr=`, `n_fft=` in
`librosa.filters.mel` in `audio.py`.

## The base loop

From the generated idle clip (job id in `media/prompt-log.md`), its last half
second faded over its first so it loops without a seam:

    ffmpeg -i idle.mp4 -filter_complex "[0:v]split=2[x][y];
      [x]trim=start=4.5,setpts=PTS-STARTPTS,format=yuva420p,fade=t=out:st=0:d=0.5:alpha=1[tail];
      [y]trim=end=4.5,setpts=PTS-STARTPTS[main];[main][tail]overlay=eof_action=pass,format=yuv420p"
      -r 24 -c:v libx264 -crf 18 -g 12 -pix_fmt yuv420p -an media/guide/base-loop.mp4

`public/guide/idle.mp4` is the same at crf 24.

## Cost and time

Zero credits. On this PC's CPU (Ryzen 7 7730U) a 13 s line takes about 5
minutes; the whole set is a couple of hours, unattended. A changed line or a
changed base is redone on the next run; nothing else is touched.
