# Setup Guide: Backend and Frontend Integration

## Prerequisites
1. Node.js (v18+)
2. PostgreSQL (installed and running)
3. AWS Account (for S3 File Uploads)

---

## 🏗 Backend Setup

1. **Navigate to the Backend Directory:**
   ```bash
   cd e:/admin-dashboard/backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Ensure you have configured the `.env` file correctly in the `backend/` directory. Example:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/admin_db?schema=public"
   JWT_SECRET="super-secret-jwt-key"
   AWS_ACCESS_KEY_ID="your_aws_access_key_id"
   AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="your_s3_bucket_name"
   ```

4. **Database Migration and Generation (Prisma):**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   *Your backend is now running at `http://localhost:5000`.*

---

## 🚀 Frontend Setup

1. **Navigate to the Root Directory (React UI):**
   ```bash
   cd e:/admin-dashboard
   ```

2. **Create Frontend Environment Variables:**
   Create a `.env` file in `e:/admin-dashboard/` with the API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   *The React dashboard should start (default `http://localhost:5173`).*

---

## 📌 Implementation Notes
- **API File Service Layer:** We've created service abstractions in `src/services/` (`api.ts`, `videoService.ts`, etc.) to interface cleanly with the Express Backend using Axios.
- **JWT Authorization:** Handled via Interceptors in `src/services/api.ts`. Any token present in localStorage (`token`) will automatically attach to outbound REST API calls.
- **AWS File Upload Integration (Videos):** Implemented using `multer` + `multer-s3`. When submitting videos, the frontend form sends `FormData` and `videoService.uploadVideo` performs a multipart request. The Node backend streams this into S3 without overflowing server memory and saves the reference URL in PostgreSQL.
