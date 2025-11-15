const { PrismaClient } = require('@prisma/client');

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ['warn', 'error'],
  });
}

prisma = global.prisma;

prisma.$connect().catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;