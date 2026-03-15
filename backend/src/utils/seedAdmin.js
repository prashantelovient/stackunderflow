import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';

export async function ensureDefaultAdmin() {
  const shouldSeed = String(process.env.SEED_ADMIN || '').toLowerCase() === 'true';
  if (!shouldSeed) {
    return;
  }

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const existing = await Admin.findOne({ email });
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hashedPassword });
  console.log(`Seeded default admin: ${email}`);
}
