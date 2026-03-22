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

To make this work locally without AWS, spin up a MinIO Docker instance:

1. **Start MinIO via Docker Compose:**
   The `docker-compose.yml` file is configured to start MinIO and automatically create the `videolearn` bucket for you.
   ```bash
   docker compose up -d
   ```

2. **Access the Dashboard**: Navigate to `http://localhost:9001`
   - **Username**: `minioadmin`
   - **Password**: `minioadmin`

3. **Bucket Verification**:
   The `videolearn` bucket is created automatically on startup by the `createbuckets` helper container. You can verify it by clicking the **Buckets** tab in the dashboard.

4. **Persistence**:
   Data is stored in a persistent Docker volume named `minio_data`, so your videos will remain available even if the containers are removed.

That's it! Reboot your Express node process and test out the end-to-end MinIO pipeline uploads!

