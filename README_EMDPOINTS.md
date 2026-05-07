# 🐾 API Clínica Veterinaria

Backend REST API para la gestión de una clínica veterinaria, desarrollado con **Node.js**, **Express** y **MySQL**.


## 📚 Endpoints

> Base URL: `http://localhost:3000`

---

### 🔑 Auth — Autenticación





## 🔐 Autenticación

Todos los endpoints protegidos requieren que el middleware de autenticación inyecte `req.usuario` con la siguiente forma:

```js
req.usuario = {
  id   : 1,   // Usuarios.id
  RolId: 1    // Usuarios.RolId ← usado por verificarPermiso
}
```

> Mientras no exista el módulo de Login, agregar temporalmente en `index.js`:
> ```js
> app.use((req, res, next) => {
>   req.usuario = { id: 1, RolId: 1 };
>   next();
> });
> ```

---

## 📦 HU-02: Módulo Permisos

Base: `/api/permisos`

Requiere que el rol autenticado tenga permisos sobre el módulo `Permisos`.

---

### `POST /api/permisos`
Crea un nuevo permiso o actualiza uno existente para un rol y módulo.

**Headers**
```
Content-Type: application/json
```

**Body**
```json
{
  "RolId"         : 1,
  "Modulo"        : "Usuarios",
  "Puede_Crear"   : 1,
  "Puede_Leer"    : 1,
  "Puede_Editar"  : 1,
  "Puede_Eliminar": 1
}
```

**Respuesta exitosa — permiso creado `200`**
```json
{
  "ok"     : true,
  "mensaje": "Permiso creado correctamente.",
  "data"   : {
    "insertId" : 1,
    "afectados": 1
  }
}
```

**Respuesta exitosa — permiso actualizado `200`**
```json
{
  "ok"     : true,
  "mensaje": "Permiso actualizado correctamente.",
  "data"   : {
    "insertId" : 0,
    "afectados": 2
  }
}
```

**Error — RolId inválido `400`**
```json
{
  "ok"     : false,
  "mensaje": "RolId es obligatorio y debe ser un número válido."
}
```

**Error — Modulo vacío `400`**
```json
{
  "ok"     : false,
  "mensaje": "Modulo es obligatorio y debe ser una cadena no vacía."
}
```

**Error — sin autenticación `401`**
```json
{
  "ok"     : false,
  "mensaje": "No autenticado. Se requiere token de sesión."
}
```

**Error — sin permiso `403`**
```json
{
  "ok"     : false,
  "mensaje": "Acceso denegado. No tienes permiso \"Puede_Crear\" sobre el módulo \"Permisos\"."
}
```

---

### `GET /api/permisos`
Lista todos los permisos registrados con su nombre de rol.

**Headers**
```
Content-Type: application/json
```

**Body:** ninguno

**Respuesta exitosa `200`**
```json
{
  "ok"  : true,
  "data": [
    {
      "id"            : 1,
      "RolId"         : 1,
      "Nombre_Rol"    : "Administrador",
      "Modulo"        : "Permisos",
      "Puede_Crear"   : 1,
      "Puede_Leer"    : 1,
      "Puede_Editar"  : 1,
      "Puede_Eliminar": 1
    },
    {
      "id"            : 2,
      "RolId"         : 1,
      "Nombre_Rol"    : "Administrador",
      "Modulo"        : "Usuarios",
      "Puede_Crear"   : 1,
      "Puede_Leer"    : 1,
      "Puede_Editar"  : 1,
      "Puede_Eliminar": 1
    }
  ]
}
```

**Error — sin autenticación `401`**
```json
{
  "ok"     : false,
  "mensaje": "No autenticado. Se requiere token de sesión."
}
```

**Error — sin permiso `403`**
```json
{
  "ok"     : false,
  "mensaje": "Acceso denegado. No tienes permiso \"Puede_Leer\" sobre el módulo \"Permisos\"."
}
```

---

### `GET /api/permisos/rol/:rolId`
Lista todos los permisos de un rol específico.

**Parámetros de URL**
| Parámetro | Tipo   | Descripción     |
|-----------|--------|-----------------|
| `rolId`   | number | ID del rol      |

**Ejemplo**
```
GET http://localhost:3000/api/permisos/rol/1
```

**Respuesta exitosa `200`**
```json
{
  "ok"  : true,
  "data": [
    {
      "id"            : 1,
      "RolId"         : 1,
      "Modulo"        : "Permisos",
      "Puede_Crear"   : 1,
      "Puede_Leer"    : 1,
      "Puede_Editar"  : 1,
      "Puede_Eliminar": 1
    },
    {
      "id"            : 2,
      "RolId"         : 1,
      "Modulo"        : "Usuarios",
      "Puede_Crear"   : 1,
      "Puede_Leer"    : 1,
      "Puede_Editar"  : 1,
      "Puede_Eliminar": 1
    }
  ]
}
```

**Respuesta — rol sin permisos `200`**
```json
{
  "ok"  : true,
  "data": []
}
```

**Error — sin autenticación `401`**
```json
{
  "ok"     : false,
  "mensaje": "No autenticado. Se requiere token de sesión."
}
```

**Error — sin permiso `403`**
```json
{
  "ok"     : false,
  "mensaje": "Acceso denegado. No tienes permiso \"Puede_Leer\" sobre el módulo \"Permisos\"."
}
```

---

### `DELETE /api/permisos/rol/:rolId/modulo/:modulo`
Elimina el permiso de un rol sobre un módulo específico.

**Parámetros de URL**
| Parámetro | Tipo   | Descripción             |
|-----------|--------|-------------------------|
| `rolId`   | number | ID del rol              |
| `modulo`  | string | Nombre del módulo       |

**Ejemplo**
```
DELETE http://localhost:3000/api/permisos/rol/1/modulo/Usuarios
```

**Respuesta exitosa `200`**
```json
{
  "ok"     : true,
  "mensaje": "Permiso eliminado correctamente."
}
```

**Error — no encontrado `404`**
```json
{
  "ok"     : false,
  "mensaje": "No se encontró ningún permiso con esos parámetros."
}
```

**Error — sin autenticación `401`**
```json
{
  "ok"     : false,
  "mensaje": "No autenticado. Se requiere token de sesión."
}
```

**Error — sin permiso `403`**
```json
{
  "ok"     : false,
  "mensaje": "Acceso denegado. No tienes permiso \"Puede_Eliminar\" sobre el módulo \"Permisos\"."
}
```

---

## 🛡️ Middleware `verificarPermiso` — Uso en otros módulos

Para proteger cualquier endpoint de cualquier módulo, importar y usar así:

```js
const { verificarPermiso } = require('../middlewares/permisos.middleware');

// Crear
router.post('/citas',       verificarPermiso('Citas', 'Puede_Crear'),    CitasController.crear);

// Leer
router.get('/citas',        verificarPermiso('Citas', 'Puede_Leer'),     CitasController.listar);

// Editar
router.put('/citas/:id',    verificarPermiso('Citas', 'Puede_Editar'),   CitasController.editar);

// Eliminar
router.delete('/citas/:id', verificarPermiso('Citas', 'Puede_Eliminar'), CitasController.eliminar);
```

**Módulos disponibles (configurables desde BD)**
| Modulo       | Descripción              |
|--------------|--------------------------|
| `Permisos`   | Gestión de permisos      |
| `Usuarios`   | Gestión de usuarios      |
| `Pacientes`  | Gestión de pacientes     |
| `Citas`      | Gestión de citas         |

---

## 📋 Resumen de endpoints

| Método   | Ruta                                        | Descripción                        | Permiso requerido          |
|----------|---------------------------------------------|------------------------------------|----------------------------|
| `POST`   | `/api/permisos`                             | Crear o actualizar permiso         | `Permisos` → `Puede_Crear` |
| `GET`    | `/api/permisos`                             | Listar todos los permisos          | `Permisos` → `Puede_Leer`  |
| `GET`    | `/api/permisos/rol/:rolId`                  | Listar permisos de un rol          | `Permisos` → `Puede_Leer`  |
| `DELETE` | `/api/permisos/rol/:rolId/modulo/:modulo`   | Eliminar permiso de un rol/módulo  | `Permisos` → `Puede_Eliminar` |

---

## 🗄️ Estructura de la tabla `permisos`

```sql
CREATE TABLE permisos (
  id             INT         NOT NULL AUTO_INCREMENT,
  RolId          INT         NOT NULL,
  Modulo         VARCHAR(100) NOT NULL,
  Puede_Crear    BIT         NOT NULL DEFAULT 0,
  Puede_Leer     BIT         NOT NULL DEFAULT 0,
  Puede_Editar   BIT         NOT NULL DEFAULT 0,
  Puede_Eliminar BIT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_Permisos_Rol_Modulo (RolId, Modulo),
  FOREIGN KEY (RolId) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE
);
```
#### POST `/api/auth/login` — Iniciar sesión
```json
// Body
{
  "correo": "bryan@gmail.com",
  "contrasena": "123456"
}

// ✅ Respuesta 200
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "Nombre_Usuario": "Bryan García",
      "Correo": "bryan@gmail.com",
      "RolId": 1
    }
  }
}

// ❌ Respuesta 401
{
  "success": false,
  "message": "Credenciales incorrectas"
}

// ❌ Respuesta 403
{
  "success": false,
  "message": "Usuario desactivado, contacta al administrador"
}
```

#### POST `/api/auth/logout` — Cerrar sesión
```json
// Sin body

// ✅ Respuesta 200
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### 👥 Usuarios — `/api/usuarios`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar todos los usuarios |
| POST | `/api/usuarios` | Crear nuevo usuario |
| PUT | `/api/usuarios/:id` | Editar usuario |
| PATCH | `/api/usuarios/:id/toggle` | Activar/Desactivar usuario |

#### GET `/api/usuarios` — Listar usuarios
```json
// Sin body

// ✅ Respuesta 200
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "Nombre_Usuario": "Bryan García",
      "Correo": "bryan@gmail.com",
      "activo": 1,
      "Nombre_Rol": "Administrador"
    }
  ]
}
```

#### POST `/api/usuarios` — Crear usuario
```json
// Body
{
  "nombre_usuario": "Bryan García",
  "correo": "bryan@gmail.com",
  "contrasena": "123456",
  "rolId": 1
}

// ✅ Respuesta 201
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 1,
    "Nombre_Usuario": "Bryan García",
    "Correo": "bryan@gmail.com",
    "RolId": 1
  }
}

// ❌ Respuesta 409
{
  "success": false,
  "message": "El correo \"bryan@gmail.com\" ya está registrado"
}
```

#### PUT `/api/usuarios/:id` — Editar usuario
```json
// Body
// Body sin cambiar contraseña
{
  "nombre_usuario": "Bryan García López",
  "correo": "bryan.nuevo@gmail.com",
  "rolId": 2
}

// Body cambiando contraseña (opcional)
{
  "nombre_usuario": "Bryan García López",
  "correo": "bryan.nuevo@gmail.com",
  "rolId": 2,
  "contrasena": "nuevaPassword123"
}



// ✅ Respuesta 200
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": 1,
    "Nombre_Usuario": "Bryan García López",
    "Correo": "bryan.nuevo@gmail.com",
    "RolId": 2
  }
}

// ❌ Respuesta 404
{
  "success": false,
  "message": "No existe un usuario con id 1"
}
```

#### PATCH `/api/usuarios/:id/toggle` — Activar/Desactivar usuario
```json
// Sin body

// ✅ Respuesta activado 200
{
  "success": true,
  "message": "Usuario activado exitosamente",
  "data": {
    "id": 1,
    "Nombre_Usuario": "Bryan García",
    "activo": 1
  }
}

// ✅ Respuesta desactivado 200
{
  "success": true,
  "message": "Usuario desactivado exitosamente",
  "data": {
    "id": 1,
    "Nombre_Usuario": "Bryan García",
    "activo": 0
  }
}


#### DELETE http://localhost:3000/api/usuarios/1
// Sin body

// ✅ 200
{
  "success": true,
  "message": "Usuario \"Bryan García\" eliminado exitosamente"
}

// ❌ 404 - No existe
{
  "success": false,
  "message": "No existe un usuario con id 1"
}
```




---

### 🎭 Roles — `/api/roles`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/roles` | Listar todos los roles |
| POST | `/api/roles` | Crear nuevo rol |
| PUT | `/api/roles/:id` | Editar rol |

#### GET `/api/roles` — Listar roles
```json
// Sin body

// ✅ Respuesta 200
{
  "success": true,
  "message": "Roles obtenidos exitosamente",
  "data": [
    { "id": 1, "Nombre_Rol": "Administrador" },
    { "id": 2, "Nombre_Rol": "Veterinario" }
  ]
}
```

#### POST `/api/roles` — Crear rol
```json
// Body
{
  "nombre_rol": "Recepcionista"
}

// ✅ Respuesta 201
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {
    "id": 3,
    "Nombre_Rol": "Recepcionista"
  }
}

// ❌ Respuesta 409
{
  "success": false,
  "message": "El rol \"Recepcionista\" ya existe"
}
```

#### PUT `/api/roles/:id` — Editar rol
```json
// Body
{
  "nombre_rol": "Administrador General"
}

// ✅ Respuesta 200
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": 1,
    "Nombre_Rol": "Administrador General"
  }
}

// ❌ Respuesta 404
{
  "success": false,
  "message": "No existe un rol con id 1"
}
```

---

# 🧪 RUTAS PARA PRUEBAS (POSTMAN)

Base URL:

```
http://localhost:3000/api
```

---

## 🟢 ESPECIES

### Crear especie

POST /api/especies

```json
{
  "nombre": "Perro"
}
```

### Obtener especies

GET /api/especies

### Actualizar especie

PUT /api/especies/1

```json
{
  "nombre": "Canino"
}
```

### Eliminar especie

DELETE /api/especies/1

---

## 🔵 RAZAS

### Crear raza

POST /api/razas

```json
{
  "especieId": 1,
  "nombre": "Labrador"
}
```

### Obtener razas

GET /api/razas

### Actualizar raza

PUT /api/razas/1

```json
{
  "especieId": 1,
  "nombre": "Labrador Retriever"
}
```

### Eliminar raza

DELETE /api/razas/1

---

## 🟣 PROPIETARIOS

### Crear propietario

POST /api/propietarios

```json
{
  "nombre": "Juan Pérez",
  "telefono": "7777-1234",
  "correo": "juan@example.com",
  "direccion": "San Salvador"
}
```

### Obtener propietarios

GET /api/propietarios

### Actualizar propietario

PUT /api/propietarios/1

```json
{
  "nombre": "Juan Pérez Actualizado",
  "telefono": "7000-0000",
  "correo": "juan_new@example.com",
  "direccion": "Santa Ana"
}
```

### Activar / Desactivar

PATCH /api/propietarios/1/toggle

### Eliminar

DELETE /api/propietarios/1

---

## 🟠 MASCOTAS

### Crear mascota

POST /api/mascotas

```json
{
  "propietarioId": 1,
  "razaId": 1,
  "nombre": "Firulais",
  "fecha_nacimiento": "2022-05-10",
  "peso": 12.5,
  "color": "Café"
}
```

### Obtener mascotas

GET /api/mascotas

### Actualizar mascota

PUT /api/mascotas/1

```json
{
  "propietarioId": 1,
  "razaId": 1,
  "nombre": "Firulais Actualizado",
  "fecha_nacimiento": "2022-05-10",
  "peso": 14.0,
  "color": "Negro"
}
```

### Eliminar mascota

DELETE /api/mascotas/1

---

# 🔥 FLUJO RECOMENDADO

1. Crear especie
2. Crear raza
3. Crear propietario
4. Crear mascota

---

# ⚠️ NOTAS

* No puedes crear mascotas sin raza o propietario
* No puedes crear razas sin especie
* Usa IDs existentes

---

🚀 API lista para pruebas completas


## ❌ Códigos de error comunes

| Status | Descripción |
|--------|-------------|
| 400 | Datos inválidos o campos vacíos |
| 401 | No autorizado / credenciales incorrectas |
| 403 | Acceso denegado / usuario desactivado |
| 404 | Recurso no encontrado |
| 409 | Conflicto / dato duplicado |
| 500 | Error interno del servidor |

---


# 🛒 CRUD de Productos y Categorías — VetCare API

## 📋 Descripción

Este módulo permite gestionar productos veterinarios y sus categorías dentro del sistema VetCare. Incluye operaciones CRUD completas, manejo de stock y control de estados.

---

# 🛒 CRUD de Productos

## 🗄️ Tablas involucradas

| Tabla              | Descripción                     |
| ------------------ | ------------------------------- |
| `productos`        | Catálogo de productos           |
| `categorias`       | Clasificación de productos      |
| `movimientosstock` | Historial de entradas y salidas |
| `usuarios`         | Usuario que realiza movimientos |

---

## 🚀 Endpoints

### 1. Crear Producto

POST /api/productos

**Body:**

```json
{
  "idCategoria": 1,
  "nombre_producto": "Amoxicilina 250mg",
  "descripcion": "Antibiótico para mascotas",
  "precio": 25.50,
  "stock": 10
}
```

---

### 2. Obtener Productos

GET /api/productos

---

### 3. Actualizar Producto

PUT /api/productos/:id

**Body:**

```json
{
  "idCategoria": 1,
  "nombre_producto": "Amoxicilina 500mg",
  "descripcion": "Actualizado",
  "precio": 30.00
}
```

---

### 4. Ajustar Stock

POST /api/productos/:id/stock

**Body:**

```json
{
  "tipo": "entrada",
  "cantidad": 5,
  "idUsuario": 1
}
```

---

### 5. Desactivar Producto

PATCH /api/productos/:id/desactivar

---

### 6. Ver Movimientos

GET /api/productos/:id/movimientos

---

## 🔄 Tipos de Movimiento

| Tipo      | Descripción     |
| --------- | --------------- |
| `entrada` | Aumenta stock   |
| `salida`  | Disminuye stock |

---

## 📦 Estados del Producto

| Estado     | Descripción      |
| ---------- | ---------------- |
| `activo`   | Disponible       |
| `inactivo` | No se puede usar |

---

## 🗂️ Estructura

```
src/
├── models/productos.model.js
├── repository/productos.repository.js
├── services/productos.service.js
├── controllers/productos.controller.js
└── routes/productos.routes.js
```

---

# 🗂️ CRUD de Categorías

---

## 🚀 Endpoints

### 1. Crear Categoría

POST /api/categorias

**Body:**

```json
{
  "nombre": "Medicamentos"
}
```

---

### 2. Obtener Categorías

GET /api/categorias

---

### 3. Obtener Categoría por ID

GET /api/categorias/:id

---

### 4. Actualizar Categoría

PUT /api/categorias/:id

**Body:**

```json
{
  "nombre": "Vacunas"
}
```

---

### 5. Eliminar Categoría

DELETE /api/categorias/:id

---

## 📦 Reglas

* No se permiten nombres duplicados
* No eliminar categorías en uso (recomendado validar en backend)

---

## 🗂️ Estructura

```
src/
├── models/categorias.model.js
├── repository/categorias.repository.js
├── services/categorias.service.js
├── controllers/categorias.controller.js
└── routes/categorias.routes.js
```

---

## 🔗 Registrar rutas en index.js

```js
const productosRoutes = require('./src/routes/productos.routes');
const categoriasRoutes = require('./src/routes/categorias.routes');

app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
```

---

---

## 🚀 Flujo recomendado

1. Crear categoría
2. Crear producto con categoría
3. Ajustar stock
4. Consultar productos
5. Registrar ventas

---

Listo para usar 🚀



# 🛒 CRUD de Ventas — VetCare API

## 📋 Descripción
Módulo para gestionar ventas de productos veterinarios. Permite crear ventas, agregar productos al detalle, consultar totales, confirmar y anular ventas.

---

## 🗄️ Tablas involucradas

| Tabla | Descripción |
|-------|-------------|
| `ventas` | Cabecera de la venta (propietario, fecha, estado) |
| `detalleventa` | Productos incluidos en cada venta |
| `productos` | Catálogo de productos con stock y precio |
| `propietarios` | Dueños de mascotas que generan la venta |

---

## ⚙️ Requisitos previos


## 🚀 Endpoints

### 1. Crear Venta
Crea la cabecera de una venta nueva. Solo se puede crear para propietarios registrados.

```
POST /api/ventas
```

**Body:**
```json
{
  "idPropietario": 1
}
```

**Respuesta exitosa `201`:**
```json
{
  "success": true,
  "message": "Venta creada exitosamente",
  "data": {
    "id": 1,
    "Id_Propietario": 1
  }
}
```

---

### 2. Agregar Producto al Detalle
Agrega un producto a la venta. Valida que la venta exista y que haya stock suficiente.

```
POST /api/ventas/:id/detalle
```

**Body:**
```json
{
  "idProducto": 1,
  "cantidad": 2
}
```

**Respuesta exitosa `201`:**
```json
{
  "success": true,
  "message": "Producto agregado al detalle exitosamente",
  "data": {
    "id": 1,
    "Id_Venta": 1,
    "Id_Producto": 1,
    "Cantidad": 2,
    "Precio_Unitario": 85.00
  }
}
```

**Errores posibles:**
| Código | Mensaje |
|--------|---------|
| `400` | Id de venta, Id de producto y cantidad son obligatorios |
| `400` | La cantidad debe ser mayor a 0 |
| `404` | No existe una venta con id X |
| `404` | No existe un producto con id X |
| `409` | Stock insuficiente para "X". Disponible: N |

---

### 3. Ver Total de la Venta
Calcula el total sumando todos los subtotales del detalle. Se actualiza automáticamente al agregar productos.

```
GET /api/ventas/:id/total
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Total calculado exitosamente",
  "data": {
    "idVenta": 1,
    "total": "320.00"
  }
}
```

---

### 4. Obtener Todas las Ventas
Retorna todas las ventas con su propietario y total calculado.

```
GET /api/ventas
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Ventas obtenidas exitosamente",
  "data": [
    {
      "Id": 1,
      "Fecha_Venta": "2025-01-15T10:30:00.000Z",
      "Estado": "activa",
      "Id_Propietario": 1,
      "Propietario": "Carlos Martínez",
      "Total": "320.00"
    }
  ]
}
```

---

### 5. Obtener Venta por ID
Retorna una venta específica con todo su detalle de productos.

```
GET /api/ventas/:id
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Venta obtenida exitosamente",
  "data": {
    "Id": 1,
    "Fecha_Venta": "2025-01-15T10:30:00.000Z",
    "Estado": "activa",
    "Propietario": "Carlos Martínez",
    "Total": "320.00",
    "detalle": [
      {
        "Id": 1,
        "Id_Venta": 1,
        "Id_Producto": 1,
        "Nombre_Producto": "Amoxicilina 250mg",
        "Cantidad": 2,
        "Precio_Unitario": "85.00",
        "Subtotal": "170.00"
      },
      {
        "Id": 2,
        "Id_Venta": 1,
        "Id_Producto": 6,
        "Nombre_Producto": "Vacuna Antirrábica canina",
        "Cantidad": 1,
        "Precio_Unitario": "150.00",
        "Subtotal": "150.00"
      }
    ]
  }
}
```

---

### 6. Confirmar Venta
Confirma la venta y descuenta el stock de cada producto. Valida stock de todos los productos antes de descontar.

```
PATCH /api/ventas/:id/confirmar
```

**Sin body.**

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Venta #1 confirmada exitosamente",
  "data": {
    "id": 1,
    "estado": "confirmada",
    "total": "320.00",
    "mensaje": "Venta #1 confirmada exitosamente"
  }
}
```

**Errores posibles:**
| Código | Mensaje |
|--------|---------|
| `404` | No existe una venta con id X |
| `409` | No se puede confirmar una venta anulada |
| `409` | La venta con id X ya fue confirmada |
| `400` | No se puede confirmar una venta sin productos |
| `409` | Stock insuficiente para "X". Disponible: N, requerido: N |

---

### 7. Anular Venta
Cambia el estado de la venta a `anulada`. No se puede anular una venta ya anulada.

```
PATCH /api/ventas/:id/anular
```

**Sin body.**

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Venta #1 anulada exitosamente",
  "data": {
    "id": 1,
    "mensaje": "Venta #1 anulada exitosamente"
  }
}
```

**Errores posibles:**
| Código | Mensaje |
|--------|---------|
| `404` | No existe una venta con id X |
| `409` | La venta con id X ya está anulada |

---

## 🔄 Flujo recomendado

```
1. POST /api/ventas              → Crear venta (obtén el id)
2. POST /api/ventas/:id/detalle  → Agregar producto 1
3. POST /api/ventas/:id/detalle  → Agregar producto 2 (puedes repetir)
4. GET  /api/ventas/:id/total    → Verificar total
5. GET  /api/ventas/:id          → Revisar detalle completo
6. PATCH /api/ventas/:id/confirmar → Confirmar y descontar stock
```

---

## 📦 Estados de una Venta

```
activa ──────→ confirmada
  │
  └──────────→ anulada
```

| Estado | Descripción |
|--------|-------------|
| `activa` | Recién creada, se pueden agregar productos |
| `confirmada` | Finalizada, stock descontado |
| `anulada` | Cancelada, no se puede modificar |

---

## 🗂️ Estructura de archivos

```
src/
├── models/
│   └── ventas.model.js
├── repository/
│   └── ventas.repository.js
├── services/
│   └── ventas.service.js
├── controllers/
│   └── ventas.controller.js
└── routes/
    └── ventas.routes.js
```

---


