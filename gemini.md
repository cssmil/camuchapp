# Guía de Arquitectura y Convenciones del Proyecto (CamuchApp)

Este documento sirve como la fuente única de verdad para las convenciones, arquitectura y decisiones técnicas del proyecto **CamuchApp** (Tienda de Ropa). Seguir estas directrices es **obligatorio** para mantener la consistencia y calidad del código.

## Resumen de Convenciones Críticas (Puntos Clave)

- **Idioma:** Todo en español (código, comentarios, nombres de variables/funciones).
- **Giro del Negocio:** Tienda de Ropa (inventario, tallas implícitas en descripción/variantes, gestión visual).
- **Base de Datos:** PostgreSQL con extensión `vector`.
- **Backend:**
    - La API tiene un prefijo global `/api` (ej: `http://localhost:3001/api/usuarios`).
    - Zona horaria forzada a `America/Lima`.
    - Las validaciones se manejan con `class-validator` en los DTOs y un `ValidationPipe` global.
- **Frontend:**
    - La URL del backend está centralizada en `src/config/environments.ts`. **Nunca** hardcodear URLs.
    - El estado de la sesión se gestiona globalmente (`SessionContext.tsx`).
- **Despliegue:** Contenerizado con Docker (Dokploy).

---

## Arquitectura del Backend (NestJS)

### Stack Principal
- **Framework:** NestJS
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL (Provider `postgresql`)
- **Extensiones DB:** `vector` (para capacidades de IA/RAG)
- **Autenticación:** Passport.js con estrategia JWT
- **IA / LLM:** LangChain + Google GenAI (Gemini 2.0 Flash)
- **Almacenamiento:** MinIO (S3 compatible) o local según entorno.

### Estructura de Carpetas y Módulos
La estructura se basa en módulos por funcionalidad en `src/modules`.

**Módulos Actuales:**
- `auth`: Autenticación (login, JWT).
- `categorias`: Gestión de categorías de ropa (ej: Polos, Pantalones).
- `chat`: **(Nuevo)** Módulo de IA con arquitectura RAG + SQL Agent.
- `clientes`: Gestión de clientes.
- `dashboard`: Endpoints analíticos y resumen de datos.
- `gastos`: Gestión de gastos operativos.
- `minio`: Servicio de almacenamiento de archivos (imágenes de productos).
- `productos`: CRUD de inventario, gestión de stock y precios.
- `proveedores`: Gestión de proveedores.
- `usuarios`: Gestión de usuarios del sistema (roles: Administrador, Colaborador).
- `ventas`: Gestión de transacciones de venta.

### Configuración Principal (`main.ts`)
- **Prefijo Global:** `/api`
- **Puerto:** 3001
- **Timezone:** `process.env.TZ = 'America/Lima'`
- **CORS:** Habilitado.
- **Archivos Estáticos:** Se sirven desde `/uploads`.

### Arquitectura del Chat IA (`chat` module)
El sistema incorpora un asistente inteligente ("Camucha") capaz de responder preguntas sobre inventario y ventas.
- **Modelos:** `gemini-2.0-flash` (Chat) y `text-embedding-004` (Embeddings).
- **Flujo Híbrido:**
    1.  **Clasificador de Intención:** Decide si la pregunta requiere datos exactos (**SQL**) o información cualitativa (**RAG**).
    2.  **Agente SQL:** Genera consultas SQL de *solo lectura* para estadísticas, precios exactos o conteos. Incluye protecciones de seguridad.
    3.  **Agente RAG:** Usa `pgvector` para buscar productos similares por descripción o características semánticas.
- **Memoria:** Contextualiza preguntas de seguimiento reescribiéndolas como preguntas independientes.

---

## Arquitectura del Frontend (Next.js)

### Stack Principal
- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **UI:** Tailwind CSS v4, `shadcn/ui` (componentes), `lucide-react` (iconos).
- **Gráficos:** `recharts`
- **Peticiones HTTP:** `axios`
- **Manejo de Fechas:** `date-fns`

### Despliegue Frontend
- **Puerto:** 3201 (definido en Dockerfile/Package).
- **Estrategia:** Docker Multistage Build (Builder -> Runner).

### Gestión de Estado
- **SessionContext:** Maneja la autenticación y datos del usuario decodificados del JWT.
- **Componentes:** Uso extensivo de *Client Components* para interactividad (formularios, tablas, gráficos).

---

## Base de Datos (PostgreSQL + Prisma)

### Esquema General
- Tablas en `snake_case` singular (ej: `usuario`, `producto`, `venta`).
- **Auditoría:** Campos `creado_en`, `actualizado_en` (con índices para optimización), `creado_por`.
- **Soft Delete:** Campos `esta_activo`, `fecha_eliminado`.

### Modelos Clave (Resumen)

**Modelo `Producto` (Ropa/Inventario)**
Incluye soporte para embeddings vectoriales.
```prisma
model Producto {
  id              Int     @id @default(autoincrement())
  nombre          String
  descripcion     String? // Detalles de tela, estilo, etc.
  precio          Decimal
  stock           Int
  categoria_id    Int
  foto_url        String?
  
  // IA / Búsqueda Semántica
  embedding     Unsupported("vector(768)")?
  
  // ... auditoría
}
```

**Modelo `Venta`**
Optimizada con índices en fechas para reportes rápidos.
```prisma
model Venta {
  id          Int      @id @default(autoincrement())
  fecha       DateTime @default(now())
  total       Decimal
  // ... relaciones
  
  @@index([creado_en])
  @@index([esta_activo])
}
```

**Tablas de IA**
- `Conversation`: Historial de chats.
- `AiMessage`: Mensajes individuales (user/assistant) con metadatos SQL.

---

## Despliegue (Dokploy / Docker)

El proyecto ha migrado a una arquitectura contenerizada gestionada por **Dokploy**.

### Backend (`back-camuchapp/Dockerfile`)
- **Base:** `node:22-alpine`
- **Proceso:**
    1.  Instalación de deps (incluyendo dev para Prisma Generate).
    2.  Build (`nest build`).
    3.  Imagen final ligera (solo deps de producción).
- **Start Script:** `start.sh` (Maneja migraciones y seed si es necesario).
- **Variables Clave:** `DATABASE_URL`, `GEMINI_API_KEY`, `TZ='America/Lima'`.

### Frontend (`front-camuchapp/Dockerfile`)
- **Base:** `node:22-alpine`
- **Proceso:** Build de Next.js optimizado (standalone output).
- **Puerto Expuesto:** 3201