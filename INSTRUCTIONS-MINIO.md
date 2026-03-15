# Setup Guide: MinIO Storage Migration

Your video platform has been fully transitioned from Local storage into purely Object-Based secure S3 patterns via **MinIO**! Here is your deployment topology:

---

## 🏗 Storage Pipeline: How it Works
We entirely disconnected native disk serving. Here is the modern stream workflow:
1. **Upload**: Administrator uploads `mp4`.
2. **Buffer**: Intercepted in-memory or fast disk path via Multer.
3. **Execution**: FFmpeg asynchronously shards the entire video into 10-second `AES-128` encrypted `.ts` payloads locally.
4. **Push**: Files stream automatically up to **MinIO** (`videos/${videoId}/*`).
5. **Clean**: Local temporary memory wipes itself clean instantly.

### 🔑 Streaming Encryption Hook: The Ultimate Protection
The frontend requests:
`GET /api/stream/:videoId?token=xxxxx`

Your `streamController` dynamically downloads the raw master M3U8 list from MinIO in memory, analyzes it line by line, and generates **Secure Presigned S3 Extracted Checksums** linking your encryption chunks correctly over limited lifetimes.
It effectively outputs dynamically signed HLS files so users NEVER observe the real MinIO URLs and their tokens expire within exactly 1 hour. No external CDN proxies are required, keeping your server RAM footprint extremely small.

---

## 🔥 Running MinIO Locally

To make this work locally without AWS, spin up a MinIO Docker instance if you haven't already:

1. **Start MinIO Docker Container:**
```bash
docker run -p 9000:9000 -p 9001:9001 -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" minio/minio server /data --console-address ":9001"
```
2. **Setup Buckets**: Navigate to `http://localhost:9001` (Admin Username: `minioadmin` // Password: `minioadmin`).
3. **Create**: Hit the **Buckets** tab, create one named exactly `videolearn`.
4. Leave it as completely `Private`. You don't need to configure public policies because our backend controller completely presigns URLs handling authorization for you!

That's it! Reboot your Express node process and test out the end-to-end MinIO pipeline uploads!
