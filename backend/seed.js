import prisma from './src/utils/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123';
  
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log('Seeded admin user.');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
