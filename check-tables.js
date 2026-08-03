const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")
  .then(r => { r.forEach(t => console.log(t.tablename)); prisma.$disconnect(); })
  .catch(e => { console.error(e.message); prisma.$disconnect(); });
