#!/bin/bash

# Script HLS simple - une seule qualité
INPUT="${1:-vv.mp4}"
OUTPUT="hls_simple"

mkdir -p "$OUTPUT"

ffmpeg -i "$INPUT" \
  -c:v libx264 -b:v 1500k -maxrate 1800k -bufsize 3000k \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease" \
  -c:a aac -b:a 128k -ac 2 \
  -f hls \
  -hls_time 6 \
  -hls_list_size 0 \
  -hls_segment_filename "$OUTPUT/segment_%03d.ts" \
  -y \
  "$OUTPUT/playlist.m3u8"

echo "✓ HLS généré dans: $OUTPUT"
