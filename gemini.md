# Guía de Arquitectura y Convenciones del Proyecto

Este documento sirve como la fuente única de verdad para las convenciones, arquitectura y decisiones técnicas del proyecto. Seguir estas directrices es **obligatorio** para mantener la consistencia y calidad del código.

## Resumen de Convenciones Críticas (Puntos Clave)

- **Idioma:** Todo en español (código, comentarios, nombres de variables/funciones).
- **Base de Datos:** El campo para la contraseña en el modelo `usuario` es `password`. Cualquier DTO o servicio que interactúe con él debe usar este nombre.
- **Backend:**
    - La API tiene un prefijo global `/api` (ej: `http://localhost:3001/api/usuarios`).
    - Las validaciones se manejan con `class-validator` en los DTOs y un `ValidationPipe` global.
- **Frontend:**
    - La URL del backend está centralizada en `src/config/environments.ts`. **Nunca** hardcodear URLs.
    - Las llamadas a la API se centralizan en `src/services/api.ts`, que usa una instancia de `axios` con un interceptor para añadir el token JWT.
    - El estado de la sesión del usuario (datos, rol) se gestiona globalmente a través de `SessionContext.tsx`.

---

## Arquitectura del Backend (NestJS)

### Stack Principal
- **Framework:** NestJS
- **ORM:** Prisma
- **Base de Datos:** MariaDB (a través del provider `mysql` de Prisma)
- **Autenticación:** Passport.js con estrategia JWT (`passport-jwt`)
- **Validación:** `class-validator` y `class-transformer`
- **Servicios Externos:** Cloudinary (configurado en `src/config/cloudinary.config.ts`)

### Estructura de Carpetas y Módulos
La estructura se basa en módulos por funcionalidad, ubicados en `src/modules`.

**Módulos Actuales:**
- `auth`: Autenticación (login).
- `categorias`: Gestión de categorías de productos.
- `clientes`: Gestión de clientes.
- `dashboard`: Endpoints para resúmenes de datos.
- `gastos`: Gestión de gastos.
- `productos`: CRUD de productos, inventario.
- `proveedores`: Gestión de proveedores.
- `usuarios`: CRUD de usuarios del sistema.
- `ventas`: Gestión de ventas y sus detalles.

### Configuración Principal (`main.ts`)
- **Prefijo Global:** Se establece un prefijo global `/api` para todas las rutas.
- **CORS:** Habilitado para permitir la comunicación con el frontend (`app.enableCors()`).
- **Pipes de Validación:** Se usa un `ValidationPipe` global que fuerza el uso de DTOs y elimina campos no definidos (`whitelist: true`, `forbidNonWhitelisted: true`).

### Variables de Entorno
Las variables de entorno (ej: `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_URL`) se gestionan a través de un archivo `.env` en la raíz de `back-rejablanca`.

---

## Arquitectura del Frontend (Next.js)

### Stack Principal
- **Framework:** Next.js (con App Router)
- **Lenguaje:** TypeScript
- **UI:** Tailwind CSS y `shadcn/ui` para los componentes.
- **Peticiones HTTP:** `axios`
- **Manejo de Fechas:** `date-fns`

### Estructura de Carpetas
Se sigue la estructura definida originalmente, con una clara separación entre `app`, `components`, `services`, `context`, etc.

### Gestión de Estado Global (`SessionContext.tsx`)
- La aplicación envuelve todas las rutas del dashboard en un `SessionProvider`.
- Este provider lee el token JWT de `localStorage` al cargar la aplicación.
- Decodifica el token (usando `jwt-decode`) para extraer los datos del usuario (ID, email, rol, nombre).
- Provee estos datos a cualquier componente que los necesite a través del hook `useSession()`.
- Incluye una función `logout` para limpiar la sesión.

### Comunicación con la API
- **Configuración Centralizada (`src/config/environments.ts`):** Define la URL base del backend.
- **Cliente API (`src/services/api.ts`):**
    - Crea una única instancia de `axios` con la URL base y un timeout.
    - Utiliza un **interceptor** que se activa después del login para añadir automáticamente el `Authorization: Bearer <token>` a todas las peticiones salientes.

---

## Base de Datos (MariaDB + Prisma)

### Principios
Se mantienen los principios de nombres (`snake_case`, singular), soft-delete y campos de auditoría definidos en la versión original de este documento.

### Esquema de Modelos Clave (`schema.prisma`)

A continuación se muestran los modelos más importantes como referencia.

**Modelo `usuario`**
```prisma
model usuario {
  id              Int        @id @default(autoincrement())
  nombre_completo String?    @db.VarChar(200)
  email           String     @unique @db.VarChar(100)
  // NOTA CRÍTICA: El campo de la contraseña se llama 'password'.
  password        String     @db.VarChar(255)
  rol             RolUsuario @default(Colaborador)

  // ... relaciones y campos de auditoría/soft-delete
}
```

**Modelo `Producto`**
```prisma
model Producto {
  id                Int       @id @default(autoincrement())
  nombre            String    @db.VarChar(200)
  descripcion       String?   @db.Text
  precio            Decimal   @db.Decimal(10, 2)
  codigo_producto   String?   @unique @db.VarChar(50)
  stock             Int       @default(0)
  stock_minimo      Int       @default(5)
  fecha_vencimiento DateTime?
  
  // ... relaciones y campos de auditoría/soft-delete
}
```

**Modelo `Venta`**
```prisma
model Venta {
  id             Int          @id @default(autoincrement())
  fecha          DateTime     @default(now())
  total          Decimal      @db.Decimal(10, 2)
  cliente_id     Int?
  usuario_id     Int
  detalles_venta DetalleVenta[]

  // ... relaciones y campos de auditoría/soft-delete
}
```

---

## Despliegue (Render)

El despliegue del backend está automatizado a través del archivo `render.yaml`.

- **Servicio:** `back-rejablanca` (aplicación web de tipo Node.js).
- **Comando de Construcción:** `npm install --include=dev && npx prisma generate && npm run build && npm run postbuild`. Este comando asegura que todas las dependencias se instalen, el cliente de Prisma se genere, el código se compile y cualquier script post-compilación se ejecute.
- **Comando de Inicio:** `npm run start:prod`. Inicia la aplicación en modo producción.
