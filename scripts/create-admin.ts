import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'jordonafoster@gmail.com';
  const password = 'wohxaB-dangyq-xuxxy0';
  const name = 'Jordon Foster';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const hashedPassword = await hash(password, 12);

    if (existingUser) {
      // Update existing user to admin
      const user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          name: existingUser.name || name,
        },
      });
      console.log('✅ Admin user updated successfully!');
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
    } else {
      // Create new admin user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      console.log('✅ Admin user created successfully!');
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
