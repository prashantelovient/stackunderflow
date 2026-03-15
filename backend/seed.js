import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from './src/utils/db.js';
import { Admin } from './src/models/index.js';

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  console.log('Checking admin user...');

  await connectDb();

  const existingAdmin = await Admin.findOne({ email });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: hashedPassword,
    });

    console.log('Admin seeded successfully');
    console.log('Email:', email);
    console.log('Password:', password);
  } else {
    console.log('Admin already exists');
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDb();
  });
