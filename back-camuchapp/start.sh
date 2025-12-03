#!/bin/sh

# Ejecutar migraciones de base de datos
echo "Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

# Iniciar la aplicación
echo "Iniciando aplicación..."
node dist/main
