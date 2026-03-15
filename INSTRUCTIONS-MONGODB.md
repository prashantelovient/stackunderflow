# MongoDB Setup (Mongoose)

The backend now uses **Mongoose** instead of Prisma. A **replica set is not required**.

## Local Setup (Standalone)
1. Start MongoDB (standalone):
   `npm run db:start`

2. Confirm the backend `.env` points to the same port:
   `DATABASE_URL="mongodb://localhost:27018/videolearn"`

3. Start the backend:
   `cd e:/admin-dashboard/backend`
   `npm start`

## Optional: Seed Admin
Auto-seed the default admin on backend start:
`SEED_ADMIN="true"` in `backend/.env`

Or create the default admin user manually:
`node seed.js`
