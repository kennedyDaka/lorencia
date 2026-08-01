const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.$executeRawUnsafe('DELETE FROM auth.users');
    console.log('Deleted auth users: ' + result);
  } catch(e) {
    console.log('Error: ' + e.message.substring(0, 200));
  }
  await prisma.$disconnect();
})();
