# Migration to MongoDB (Using Prisma)

We've completely migrated the backend database layer to **MongoDB**.
Your `prisma/schema.prisma` file is fully upgraded mapping `@map("_id") @db.ObjectId` configurations explicitly.

---

### ⚠️ IMPORTANT: Prisma Requires a MongoDB Replica Set

Prisma uses database transactions under the hood for data-integrity mapping. **MongoDB only supports transacting queries when running configured as a Replica Set.**

If you are using a standard standalone local installation of Windows MongoDB (viewed via Compass), you **must** convert it permanently to a Replica Set to let the Express backend API function successfully!

### Option A: Convert Local Windows Installation (Fastest)

1. Open your MongoDB Config File. Typically located at:
   `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg`
2. At the very bottom, add these two exact lines:
   ```yaml
   replication:
     replSetName: rs0
   ```
3. Open Windows Services (`services.msc`), find **MongoDB Server**, and click **Restart**.
4. Open your terminal and run `mongosh`. Inside that shell type:
   `rs.initiate()`
   *(It will output an `ok: 1` success response).*

### Option B: Use Docker (Alternative)

If you don't care about your local Windows install, you can spin one up safely with a Replica Set via Docker:
```bash
docker rm -f mongo
docker run -d -p 27017:27017 --name mongo mongo:latest --replSet rs0
docker exec -it mongo mongosh --eval "rs.initiate()"
```

---

### Startup After Fixing:

Once your local database supports Replica Sets (`rs0`):
1. Navigate back into your Backend wrapper:
   `cd e:/admin-dashboard/backend`
2. Sync the schemas correctly:
   `npx prisma db push`
3. Generate the admin seeds again safely to login using Compass:
   `node seed.js`
4. Start your Node Backend processing wrapper:
   `npm start`
