import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeonHttp(connectionString, {}) as any;
const prisma = new PrismaClient({ adapter } as any);

async function verify() {
  const email = 'uange209@gmail.com';
  const password = 'Ange@123';

  console.log('🔍 Checking user:', email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    console.log('❌ User not found');
    process.exit(1);
  }

  console.log('✅ User found:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasPassword: !!user.password,
  });

  if (!user.password) {
    console.log('❌ User has no password set');
    
    // Set the password
    console.log('🔧 Setting password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('✅ Password set successfully');
  } else {
    // Test password
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match');
      console.log('🔧 Updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      console.log('✅ Password updated successfully');
    }
  }

  await prisma.$disconnect();
}

verify().catch(console.error);
