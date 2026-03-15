# Setup Guide: Local Streaming Integration

## Prerequisites
1. FFmpeg libraries are packed automatically using standard configurations, but ensure Node.js can execute binary files on your path.
2. Ensure you have completely removed AWS variables from `.env` logic context.

---

## 🏗 Storage Pipeline Updates
Your backend was radically updated to detach AWS S3. It natively constructs files directly onto local disk under:
```
backend/
 └── uploads/
      ├── raw-videos/ (Initial Multer input buffer)
      ├── hls/ (Segmented secure streaming data + crypto keys)
      └── thumbnails/
```

### 1. Uploading Processing Hook
1. Admin Posts Video (using multipart data matching exactly original schema logic).
2. It hits `/api/videos/upload`. `videoController` kicks off an async worker (`videoProcessor`).
3. Video status swaps instantly to `processing`. The `ffmpeg-static` node module wraps ffmpeg entirely inside the backend dynamically executing:
  `ffmpeg -i raw_path -hls_time 10 -hls_playlist_type vod -hls_segment_filename ... -hls_key_info_file ...`

### 2. Deep Video Encryption
Videos undergo **AES-128 cryptographic hashing**.
A randomly synthesized 16 byte string constructs `/uploads/hls/:id/encryption.key`. 
*Nobody can download or spoof local segment endpoints without passing authentication verifying valid keys*.

### 3. Student Streaming Playback Network
Data resolves correctly inside `/api/stream/*` routers. Ensure Student Client consumes endpoints directly as streaming proxy contexts.

- `GET /api/stream/:videoId` => Outputs `index.m3u8` playlist.
- `GET /api/stream/:videoId/key` => Secure `encryption.key` handler preventing brute HLS ripping.
- `GET /api/stream/:videoId/:segment` => Raw `chunk_xxx.ts` blob segments requested periodically by the player.

---

## 🚀 Frontend React Player Usage

Your frontend has a dedicated React wrapper leveraging `Video.js`:

```tsx
import VideoPlayer from '@/components/VideoPlayer';

// In your specific Video viewing screen
<VideoPlayer 
  options={{
    autoplay: true,
    controls: true,
    sources: [{
      src: `${import.meta.env.VITE_API_URL}/stream/${videoId}`,
      type: 'application/x-mpegURL'
    }]
  }} 
/>
```
*Note: Your `VideoPlayer.tsx` automatically strips HTML5 default context menus, aggressively limiting casual student downloads via right-clicking!*

---

> Be sure you apply strict Authorization Header verifications inside `/api/stream` handlers when pushing this to full production ensuring only explicitly enrolled students bypass standard stream keys constraints. Your existing `studentRoutes` already hosts functional Login / Registration hooks mapping fully inside Prisma `Student`.
