# Etapa 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar solo lo necesario para instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el proyecto
COPY . .

# Build de Next.js
RUN npm run build

# Etapa 2: Run
FROM node:22-alpine

WORKDIR /app

# Copiar lo que se generó en la etapa 1
COPY --from=builder /app ./

# Puerto interno que usará la aplicación
EXPOSE 3201

# Comando para producción
CMD ["npm", "start"]
