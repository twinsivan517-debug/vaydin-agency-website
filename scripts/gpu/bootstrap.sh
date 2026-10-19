#!/usr/bin/env bash
# Builds the lip-sync lab on a fresh GPU instance (AWS Deep Learning Base AMI,
# Ubuntu 22.04, NVIDIA driver preinstalled). Same layout as scripts/LIPSYNC.md:
# ~/lab/lipsync/{venv,Wav2Lip,models}; the four one-line patches; the two weight
# files from a public mirror, checked against the lab's own sha256 before use.
# Run once per instance: bash bootstrap.sh. Idempotent enough to re-run.
set -euo pipefail

LAB="$HOME/lab/lipsync"
GAN_SHA="ca9ab7b7b812c0e80a6e70a5977c545a1e8a365a6c49d5e533023c034d7ac3d8"
S3FD_SHA="619a31681264d3f7f7fc7a16a42cbbe8b23f31a256f75a366e5a1bcd59b33543"
GAN_URL="https://huggingface.co/camenduru/Wav2Lip/resolve/main/checkpoints/wav2lip_gan.pth"
S3FD_URL="https://huggingface.co/camenduru/Wav2Lip/resolve/main/face_detection/detection/sfd/s3fd.pth"

mkdir -p "$LAB/models"
cd "$LAB"

if ! command -v ffmpeg >/dev/null; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg python3-venv >/dev/null
fi

[ -d Wav2Lip ] || git clone -q --depth 1 https://github.com/Rudrabha/Wav2Lip
mkdir -p Wav2Lip/temp

# The four patches, each applied only if its line is still the original.
sed -i 's/torch.load(checkpoint_path)$/torch.load(checkpoint_path, weights_only=True)/' Wav2Lip/inference.py
sed -i 's/torch.load(checkpoint_path,$/torch.load(checkpoint_path, weights_only=True,/' Wav2Lip/inference.py
sed -i 's/torch.load(path_to_detector)$/torch.load(path_to_detector, weights_only=True)/' Wav2Lip/face_detection/detection/sfd/sfd_detector.py
sed -i 's/dtype=np.int)/dtype=int)/' Wav2Lip/face_detection/utils.py
sed -i 's/librosa.filters.mel(hp.sample_rate, hp.n_fft,/librosa.filters.mel(sr=hp.sample_rate, n_fft=hp.n_fft,/' Wav2Lip/audio.py

if [ ! -x venv/bin/python ]; then
  python3 -m venv venv
  venv/bin/pip install -q --upgrade pip
  venv/bin/pip install -q torch torchvision --index-url https://download.pytorch.org/whl/cu121
  venv/bin/pip install -q "numpy<2" opencv-python-headless librosa numba tqdm scipy
fi

fetch() {  # fetch <url> <path> <sha256>
  if [ ! -f "$2" ] || ! echo "$3  $2" | sha256sum -c --quiet 2>/dev/null; then
    curl -sL --retry 3 -o "$2" "$1"
    echo "$3  $2" | sha256sum -c --quiet
  fi
}
fetch "$GAN_URL" models/wav2lip_gan.pth "$GAN_SHA"
fetch "$S3FD_URL" Wav2Lip/face_detection/detection/sfd/s3fd.pth "$S3FD_SHA"

venv/bin/python - <<'EOF'
import torch
assert torch.cuda.is_available(), "no CUDA device: wrong AMI or instance type"
print("gpu:", torch.cuda.get_device_name(0), "torch", torch.__version__)
EOF
echo "lab ready at $LAB"
