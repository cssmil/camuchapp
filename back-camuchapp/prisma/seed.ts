import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre_completo: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      rol: 'Administrador',
    },
  });

  console.log('Usuario de prueba creado:', usuario);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
