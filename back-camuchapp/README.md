# Camuchapp Backend

Backend NestJS para la plataforma Camuchapp (Tienda/Farmacia).

## Requisitos Previos

1. **Node.js** v18+
2. **PostgreSQL** v15+ con extensión `pgvector` instalada.
   - En Linux: `sudo apt-get install postgresql-15-pgvector`
   - En Docker: Usar imagen `pgvector/pgvector:pg15`

## Configuración de Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/db_camuchapp"
GEMINI_API_KEY="AIzaSy..."
```

## Instalación

```bash
npm install
```

## Base de Datos

1. **Migraciones**:
   ```bash
   npx prisma migrate dev
   ```
   *Nota: Si falla por falta de extensión vector, asegúrate que tu DB la soporte.*

2. **Generar Cliente**:
   ```bash
   npx prisma generate
   ```

## Módulo Chat AI (RAG + SQL)

El sistema cuenta con un asistente híbrido en `/api/chat`:
- **SQL Agent**: Responde preguntas sobre inventario, precios y ventas usando LangChain SQL.
- **RAG Agent**: Responde preguntas cualitativas buscando en embeddings de productos.

### Generación de Embeddings
El sistema calcula automáticamente embeddings para productos nuevos cada hora (Cron Job).
Para forzar una generación inicial, asegúrate de tener productos activos y espera al job programado o invócalo manualmente en desarrollo.

### Uso del Endpoint

**POST** `/api/chat`

```json
{
  "message": "¿Qué precio tienen los jeans?"
}
```

**Respuesta:**
```json
{
  "answer": "Los jeans tienen un precio de $45.00...",
  "products": [...],
  "sources": ["SQL Agent"]
}
```

## Testing

Para correr los tests e2e con Testcontainers (requiere Docker):

```bash
npm run test:e2e
```