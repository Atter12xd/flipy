const { PrismaClient } = require('@prisma/client');

/**
 * Singleton de Prisma Client para evitar múltiples instancias
 * En desarrollo, usar global para evitar problemas con hot reload
 */

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo, usar global para persistir la conexión
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'], // Logs en desarrollo
    });
  }
  prisma = global.prisma;
}

// Manejo de cierre de conexión
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;

