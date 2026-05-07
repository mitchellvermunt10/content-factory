# MP4 Export Proof — Atelier Nord · Instagram Reel 9:16

Run: 2026-05-06T14:41:33Z

## Setup

- ffmpeg: `ffmpeg version 6.1.1-essentials_build-www.gyan.dev Copyright (c) 2000-2023 the FFmpeg developers`
- ffprobe: `ffprobe version 2023-02-13-git-2296078397-essentials_build-www.gyan.dev Copyright (c) 2007-2023 the FFmpeg developers`
- Script gedownload door Playwright: `tests/mp4-proof/atelier-nord-export-reel-9x16.sh` (3428 bytes)

## Inputs gegenereerd

| Bestand | Type | Duur | Resolutie / bitrate |
|---|---|---|---|
| `s01-s01-a.mp4` | h264 lavfi | 2s | 1280×720 30fps · 7715 bytes |
| `s01-s01-b.mp4` | h264 lavfi | 2s | 1280×720 30fps · 7716 bytes |
| `s02-s02-a.mp4` | h264 lavfi | 2.5s | 1280×720 30fps · 11177 bytes |
| `s02-s02-b.mp4` | h264 lavfi | 2.5s | 1280×720 30fps · 11179 bytes |
| `s03-s03-a.mp4` | h264 lavfi | 3s | 1280×720 30fps · 11915 bytes |
| `s03-s03-b.mp4` | h264 lavfi | 4s | 1280×720 30fps · 13377 bytes |
| `s03-s03-c.mp4` | h264 lavfi | 5s | 1280×720 30fps · 17571 bytes |
| `s04-s04-a.mp4` | h264 lavfi | 6s | 1280×720 30fps · 19050 bytes |
| `vo.mp3` | mp3 silent | 27s | 192kbps · 649552 bytes |
| `music.mp3` | mp3 silent | 27s | 192kbps · 649552 bytes |

## Script execution

- Exit code: `0`
- Log: `tests/mp4-proof/script-run.log` (248 regels)

### Laatste 30 regels van de log

```
    Metadata:
      handler_name    : SoundHandler
      vendor_id       : [0][0][0][0]
      encoder         : Lavc60.31.102 aac
frame=    0 fps=0.0 q=0.0 size=       0kB time=00:00:00.46 bitrate=   0.8kbits/s dup=1 drop=0 speed=28.2x    frame=   40 fps=0.0 q=0.0 size=       0kB time=00:00:04.55 bitrate=   0.1kbits/s dup=1 drop=0 speed= 8.8x    frame=  202 fps=199 q=0.0 size=       0kB time=00:00:09.96 bitrate=   0.0kbits/s dup=1 drop=0 speed=9.79x    frame=  339 fps=223 q=0.0 size=       0kB time=00:00:14.51 bitrate=   0.0kbits/s dup=1 drop=0 speed=9.56x    frame=  498 fps=247 q=0.0 size=       0kB time=00:00:19.82 bitrate=   0.0kbits/s dup=1 drop=0 speed=9.82x    frame=  632 fps=251 q=0.0 size=       0kB time=00:00:24.28 bitrate=   0.0kbits/s dup=1 drop=0 speed=9.63x    [mp4 @ 000002014c69a4c0] Starting second pass: moving the moov atom to the beginning of the file
[out#0/mp4 @ 000002014c6a81c0] video:61kB audio:7kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: 44.268217%
frame=  811 fps=279 q=-1.0 Lsize=      98kB time=00:00:26.98 bitrate=  29.7kbits/s dup=1 drop=0 speed=9.27x    
[libx264 @ 000002014c950780] frame I:4     Avg QP: 0.50  size:   438
[libx264 @ 000002014c950780] frame P:204   Avg QP: 0.03  size:    78
[libx264 @ 000002014c950780] frame B:603   Avg QP: 0.19  size:    73
[libx264 @ 000002014c950780] consecutive B-frames:  0.7%  0.2%  0.4% 98.6%
[libx264 @ 000002014c950780] mb I  I16..4: 100.0%  0.0%  0.0%
[libx264 @ 000002014c950780] mb P  I16..4:  0.0%  0.0%  0.0%  P16..4:  0.0%  0.0%  0.0%  0.0%  0.0%    skip:100.0%
[libx264 @ 000002014c950780] mb B  I16..4:  0.0%  0.0%  0.0%  B16..8:  0.3%  0.0%  0.0%  direct: 0.0%  skip:99.7%  L0: 0.0% L1:100.0% BI: 0.0%
[libx264 @ 000002014c950780] final ratefactor: -40.76
[libx264 @ 000002014c950780] 8x8 transform intra:0.0%
[libx264 @ 000002014c950780] direct mvs  spatial:79.3% temporal:20.7%
[libx264 @ 000002014c950780] coded y,uvDC,uvAC intra: 0.0% 0.0% 0.0% inter: 0.0% 0.0% 0.0%
[libx264 @ 000002014c950780] i16 v,h,dc,p: 99%  0%  1%  0%
[libx264 @ 000002014c950780] i8c dc,h,v,p: 100%  0%  0%  0%
[libx264 @ 000002014c950780] Weighted P-Frames: Y:2.9% UV:2.9%
[libx264 @ 000002014c950780] kb/s:18.26
[aac @ 000002014c6ed740] Qavg: 65536.000
width=1080
height=1920
r_frame_rate=30/1
duration=27.033333
r_frame_rate=0/0
duration=27.005011
✓ Klaar: atelier-nord/exports/atelier-nord-reel-9x16.mp4
```

## Output

✓ **Bestaat**: `tests/mp4-proof/atelier-nord/exports/atelier-nord-reel-9x16.mp4` (100239 bytes)

### ffprobe (json)

```json
{
    "streams": [
        {
            "index": 0,
            "codec_name": "h264",
            "codec_long_name": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
            "profile": "High",
            "codec_type": "video",
            "codec_tag_string": "avc1",
            "codec_tag": "0x31637661",
            "width": 1080,
            "height": 1920,
            "coded_width": 1080,
            "coded_height": 1920,
            "closed_captions": 0,
            "film_grain": 0,
            "has_b_frames": 2,
            "sample_aspect_ratio": "1:1",
            "display_aspect_ratio": "9:16",
            "pix_fmt": "yuv420p",
            "level": 50,
            "chroma_location": "left",
            "field_order": "progressive",
            "refs": 1,
            "is_avc": "true",
            "nal_length_size": "4",
            "id": "0x1",
            "r_frame_rate": "30/1",
            "avg_frame_rate": "30/1",
            "time_base": "1/15360",
            "start_pts": 0,
            "start_time": "0.000000",
            "duration_ts": 415232,
            "duration": "27.033333",
            "bit_rate": "18469",
            "bits_per_raw_sample": "8",
            "nb_frames": "811",
            "extradata_size": 47,
            "disposition": {
                "default": 1,
                "dub": 0,
                "original": 0,
                "comment": 0,
                "lyrics": 0,
                "karaoke": 0,
                "forced": 0,
                "hearing_impaired": 0,
                "visual_impaired": 0,
                "clean_effects": 0,
                "attached_pic": 0,
                "timed_thumbnails": 0,
                "captions": 0,
                "descriptions": 0,
                "metadata": 0,
                "dependent": 0,
                "still_image": 0
            },
            "tags": {
                "language": "und",
                "handler_name": "VideoHandler",
                "vendor_id": "[0][0][0][0]",
                "encoder": "Lavc60.31.102 libx264"
            }
        },
        {
            "index": 1,
            "codec_name": "aac",
            "codec_long_name": "AAC (Advanced Audio Coding)",
            "profile": "LC",
            "codec_type": "audio",
            "codec_tag_string": "mp4a",
            "codec_tag": "0x6134706d",
            "sample_fmt": "fltp",
            "sample_rate": "44100",
            "channels": 2,
            "channel_layout": "stereo",
            "bits_per_sample": 0,
            "initial_padding": 0,
            "id": "0x2",
            "r_frame_rate": "0/0",
            "avg_frame_rate": "0/0",
            "time_base": "1/44100",
            "start_pts": 0,
            "start_time": "0.000000",
            "duration_ts": 1190921,
            "duration": "27.005011",
            "bit_rate": "2092",
            "nb_frames": "1164",
            "extradata_size": 5,
            "disposition": {
                "default": 1,
                "dub": 0,
                "original": 0,
                "comment": 0,
                "lyrics": 0,
                "karaoke": 0,
                "forced": 0,
                "hearing_impaired": 0,
                "visual_impaired": 0,
                "clean_effects": 0,
                "attached_pic": 0,
                "timed_thumbnails": 0,
                "captions": 0,
                "descriptions": 0,
                "metadata": 0,
                "dependent": 0,
                "still_image": 0
            },
            "tags": {
                "language": "und",
                "handler_name": "SoundHandler",
                "vendor_id": "[0][0][0][0]"
            }
        }
    ],
    "format": {
        "filename": "C:/Users/pathi/Desktop/AI-Studio/content-factory/tests/mp4-proof/atelier-nord/exports/atelier-nord-reel-9x16.mp4",
        "nb_streams": 2,
        "nb_programs": 0,
        "format_name": "mov,mp4,m4a,3gp,3g2,mj2",
        "format_long_name": "QuickTime / MOV",
        "start_time": "0.000000",
        "duration": "27.033333",
        "size": "100239",
        "bit_rate": "29663",
        "probe_score": 100,
        "tags": {
            "major_brand": "isom",
            "minor_version": "512",
            "compatible_brands": "isomiso2avc1mp41",
            "encoder": "Lavf60.16.100"
        }
    }
}
```

### Verificatie

| Check | Verwacht | Gemeten | Status |
|---|---|---|---|
| Resolutie | 1080×1920 | 1080×1920 | ✓ |
| Framerate | 30/1 (30 fps) | 30/1 | ✓ |
| Duration  | 27s ±1s | 27.033333s | ✓ |
| Audio aanwezig | ja | true (aac) | ✓ |

