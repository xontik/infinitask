import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    username: 'xontik',
    email: 'xontik@gmail.com',
    password: '$2a$10$.in2OW/29PVb3RLgUaeyU.th07svIb7XXkSqxDkQR05cVE16R9xZ2',
  },
  {
    username: 'Nilu',
    email: 'nilu@prisma.io',
    password: 'secret42',
  },
  {
    username: 'Mahmoud',
    email: 'mahmoud@prisma.io',
    password: 'secret42',
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
