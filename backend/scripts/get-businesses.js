const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.business.findMany().then(b => { 
  console.log(JSON.stringify(b, null, 2)); 
  p.$disconnect(); 
});
