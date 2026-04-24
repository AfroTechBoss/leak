import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const journalists = [
    { email: 'amara@premiumtimes.com',   name: 'Amara Obi',        newsroom: 'Premium Times',   password: 'journalist123' },
    { email: 'emeka@thecable.ng',        name: 'Emeka Nwosu',      newsroom: 'TheCable',         password: 'journalist123' },
    { email: 'fatima@peoplesgazette.com',name: 'Fatima Musa',       newsroom: 'Peoples Gazette',  password: 'journalist123' },
    { email: 'chioma@humangle.ng',       name: 'Chioma Adeyemi',   newsroom: 'HumAngle',         password: 'journalist123' },
  ];

  for (const j of journalists) {
    const passwordHash = await bcrypt.hash(j.password, 12);
    await prisma.journalist.upsert({
      where: { email: j.email },
      update: {},
      create: { email: j.email, name: j.name, newsroom: j.newsroom, passwordHash },
    });
    console.log(`✓ ${j.name} (${j.email})`);
  }

  console.log('\nSeed complete. Login with password: journalist123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
