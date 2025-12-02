# Etapa 1: Dependencias y Build
FROM node:22-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de paquetes e instalar TODAS las dependencias (incluyendo dev)
COPY package*.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Generar el cliente de Prisma (necesita las dev-dependencies)
RUN npx prisma generate

# Construir la aplicación (compilar TS a JS)
RUN npm run build

# ---

# Etapa 2: Imagen de Producción
FROM node:22-alpine

WORKDIR /app

# Copiar solo los package files e instalar dependencias de PRODUCCIÓN
COPY package*.json ./
RUN npm install --omit=dev

# Copiar los artefactos de la etapa de 'builder'
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# El backend corre en el puerto 3001
EXPOSE 3001

# Comando para iniciar el servidor en producción
CMD ["node", "dist/main"]
