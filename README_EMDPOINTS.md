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

Body efectivo:
{ "metodoPago": "efectivo", "montoRecibido": 50.00 }

Body tarjeta / transferencia:
{ "metodoPago": "tarjeta" }
```

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

# 📚 Cruds de Historial Clínico, Vacunas y Auditoría

> Base URL: `http://localhost:3000/api`

---

## 📖 Historial Clínico — `/api/historial`

### 1. Crear historial clínico
**POST** `/api/historial`

```json
{
  "mascota_id": 2,
  "motivo": "Revisión general",
  "diagnostico_inicial": "Paciente sano",
  "observaciones": "Sin novedades",
  "veterinario_id": 6
}


# 📚 API Documentation — Historial Clínico, Vacunas y Auditoría

> **Base URL:** `http://localhost:3000/api`

---

## 📖 Historial Clínico — `/api/historial`

### 1. Crear historial clínico
**`POST`** `/api/historial`

```json
{
  "mascota_id": 2,
  "motivo": "Revisión general",
  "diagnostico_inicial": "Paciente sano",
  "observaciones": "Sin novedades",
  "veterinario_id": 6
}
```

---

### 2. Obtener historial por ID
**`GET`** `/api/historial/:id`

---

### 3. Obtener historial por mascota
**`GET`** `/api/historial/mascota/:mascota_id`

---

### 4. Actualizar historial
**`PUT`** `/api/historial/:id`

```json
{
  "motivo": "Revisión anual",
  "diagnostico_inicial": "Paciente saludable",
  "observaciones": "Todo en orden"
}
```

---

### 5. Eliminar historial *(soft delete)*
**`DELETE`** `/api/historial/:id`

---

### 6. Agregar consulta médica
**`POST`** `/api/historial/consultas`

```json
{
  "historial_id": 1,
  "fecha": "2026-05-19T10:00:00",
  "sintomas": "Tos seca, fiebre 39°C",
  "diagnostico": "Infección respiratoria",
  "tratamiento": "Amoxicilina 250mg cada 12h",
  "observaciones": "Reposo por 3 días",
  "veterinario_id": 6
}
```

---

### 7. Obtener consultas por historial
**`GET`** `/api/historial/:historial_id/consultas`

---

### 8. Obtener consulta por ID
**`GET`** `/api/historial/consultas/:id`

---

### 9. Actualizar consulta médica
**`PUT`** `/api/historial/consultas/:id`

```json
{
  "fecha": "2026-05-20T10:00:00",
  "sintomas": "Tos seca, fiebre 38.5°C",
  "diagnostico": "Infección respiratoria mejorando",
  "tratamiento": "Amoxicilina 250mg cada 12h por 5 días",
  "observaciones": "Evolución favorable"
}
```

---

### 10. Eliminar consulta médica *(soft delete)*
**`DELETE`** `/api/historial/consultas/:id`

---

## 💉 Vacunas — `/api/vacunas`

### 1. Registrar vacuna
**`POST`** `/api/vacunas`

```json
{
  "mascota_id": 2,
  "nombre_vacuna": "Antirrábica",
  "fecha_aplicacion": "2026-05-19",
  "proxima_dosis": "2027-05-19",
  "lote": "ABC123",
  "observaciones": "Sin reacciones adversas",
  "veterinario_id": 6
}
```

### 2. Obtener vacunas por mascota *(con ordenamiento)*
**`GET`** `/api/vacunas/mascota/:mascota_id`

**Query params opcionales:**

| Parámetro | Tipo | Valores permitidos | Por defecto |
|---|---|---|---|
| `order_by` | `string` | `fecha_aplicacion`, `proxima_dosis`, `nombre_vacuna`, `lote` | `fecha_aplicacion` |
| `order` | `string` | `ASC`, `DESC` | `DESC` |

**Ejemplos:**
```bash
# Orden por defecto (fecha_aplicacion DESC)
GET /api/vacunas/mascota/2

# Orden por próxima dosis ascendente
GET /api/vacunas/mascota/2?order_by=proxima_dosis&order=ASC

# Orden por nombre de vacuna descendente
GET /api/vacunas/mascota/2?order_by=nombre_vacuna&order=DESC

# Orden por lote ascendente
GET /api/vacunas/mascota/2?order_by=lote&order=ASC
```

---

### 3. Obtener vacuna por ID
**`GET`** `/api/vacunas/:id`

---

### 4. Actualizar vacuna
**`PUT`** `/api/vacunas/:id`

```json
{
  "nombre_vacuna": "Antirrábica (Refuerzo)",
  "fecha_aplicacion": "2026-05-20",
  "proxima_dosis": "2027-05-20",
  "lote": "DEF456",
  "observaciones": "Vacuna aplicada sin complicaciones"
}
```

---

### 5. Eliminar vacuna *(soft delete)*
**`DELETE`** `/api/vacunas/:id`

---

### 6. Obtener alertas de vacunas próximas
**`GET`** `/api/vacunas/alertas`

---

### 7. Marcar notificación como enviada
**`POST`** `/api/vacunas/:id/notificar`

```json
POST /api/vacunas/5/notificar     # ← 5 es el ID de la vacuna
{
  "propietario_id": 3             # ← ID del propietario
}
```

---

## 📜 Auditoría — `/api/auditoria`

> ⚠️ **Todos los endpoints requieren rol de Administrador.**
> 🔐 **Header requerido en todos los endpoints:** `Authorization: Bearer <token>`

---

### 1. Obtener todas las acciones *(con filtros y paginación)*
**`GET`** `/api/auditoria`

**Query params opcionales:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `usuario_id` | `number` | Filtrar por ID de usuario |
| `modulo` | `string` | Filtrar por módulo (`ventas`, `historial_clinico`, `vacunas`, `consultas_medicas`) |
| `accion` | `string` | Filtrar por acción (`CREATE`, `UPDATE`, `DELETE`, `CONFIRMAR`, `ANULAR`) |
| `fecha_inicio` | `date` | Fecha de inicio del rango (`YYYY-MM-DD`) |
| `fecha_fin` | `date` | Fecha de fin del rango (`YYYY-MM-DD`) |
| `page` | `number` | Número de página *(por defecto: 1)* |
| `limit` | `number` | Registros por página *(por defecto: 20)* |

**Ejemplos:**
```bash
# Página 1, 20 registros (valores por defecto)
GET /api/auditoria

# Página 2, 10 registros por página
GET /api/auditoria?page=2&limit=10

# Filtrar por módulo de ventas
GET /api/auditoria?modulo=ventas&page=1&limit=15

# Filtrar por usuario y rango de fechas
GET /api/auditoria?usuario_id=6&fecha_inicio=2026-05-01&fecha_fin=2026-05-31&page=1&limit=20
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 6,
      "usuario_nombre": "Dr Luis",
      "modulo": "vacunas",
      "accion": "CREATE",
      "descripcion": "Registró vacuna Antirrábica para mascota ID 2",
      "ip": "127.0.0.1",
      "referencia_id": 1,
      "fecha": "2026-05-19T13:44:01.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error `401` — sin autenticación:**
```json
{
  "success": false,
  "message": "No autorizado: token no proporcionado"
}
```

**Error `403` — sin permiso de administrador:**
```json
{
  "success": false,
  "message": "Acceso denegado: se requiere rol de administrador"
}
```

---

### 2. Obtener acciones por usuario *(con paginación)*
**`GET`** `/api/auditoria/usuario/:usuario_id`

**Query params opcionales:** `page`, `limit`

```bash
GET /api/auditoria/usuario/6?page=1&limit=10
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3. Obtener acciones por módulo *(con paginación)*
**`GET`** `/api/auditoria/modulo/:modulo`

**Query params opcionales:** `page`, `limit`

**Módulos disponibles:** `ventas` · `historial_clinico` · `consultas_medicas` · `vacunas`

```bash
GET /api/auditoria/modulo/ventas?page=2&limit=15
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 15,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 4. Obtener acciones por acción específica *(con paginación)*
**`GET`** `/api/auditoria/accion/:accion`

**Query params opcionales:** `page`, `limit`

**Acciones disponibles:** `CREATE` · `UPDATE` · `DELETE` · `CONFIRMAR` · `ANULAR`

```bash
GET /api/auditoria/accion/CREATE?page=1&limit=20
```

---

### 5. Obtener acciones por rango de fechas *(con paginación)*
**`GET`** `/api/auditoria/fecha/:fecha_inicio/:fecha_fin`

**Query params opcionales:** `page`, `limit`

```bash
GET /api/auditoria/fecha/2026-05-01/2026-05-31?page=1&limit=50
```

---

### 6. Dashboard — Conteo por módulo
**`GET`** `/api/auditoria/dashboard/modulos`

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    { "modulo": "ventas", "total": 45 },
    { "modulo": "vacunas", "total": 12 },
    { "modulo": "historial_clinico", "total": 8 }
  ]
}
```

---

### 7. Dashboard — Conteo por usuario
**`GET`** `/api/auditoria/dashboard/usuarios`

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    { "Nombre_Usuario": "Admin", "total": 30 },
    { "Nombre_Usuario": "Dr Luis", "total": 25 }
  ]
}
```

---

### 📋 Resumen de endpoints

| Método | Endpoint | Paginación | Requiere Admin |
|---|---|---|---|
| `GET` | `/api/auditoria` | ✅ `page`, `limit` | ✅ |
| `GET` | `/api/auditoria/usuario/:id` | ✅ `page`, `limit` | ✅ |
| `GET` | `/api/auditoria/modulo/:modulo` | ✅ `page`, `limit` | ✅ |
| `GET` | `/api/auditoria/accion/:accion` | ✅ `page`, `limit` | ✅ |
| `GET` | `/api/auditoria/fecha/:inicio/:fin` | ✅ `page`, `limit` | ✅ |
| `GET` | `/api/auditoria/dashboard/modulos` | ❌ No | ✅ |
| `GET` | `/api/auditoria/dashboard/usuarios` | ❌ No | ✅ |

---

---

### Obtener citas por veterinario
**`GET`** `/api/citas/veterinario/:id`

Obtiene todas las citas asignadas a un veterinario específico.

**Parámetros de URL:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `number` | ID del veterinario |

```bash
GET /api/citas/veterinario/6
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    {
      "IdCita": 10,
      "FechaHora": "2026-05-20T04:16:00.000Z",
      "Mascota": "canelo 2",
      "Id_Mascota": 2,
      "Tipo_Consulta": "Consulta General",
      "Estado": "Cancelada",
      "Id_Veterinario": 6,
      "Propietario": "Bryan"
    }
  ]
}
```

**Error `404`:**
```json
{
  "success": false,
  "message": "No se encontraron citas para este veterinario"
}
```

---

### Obtener historial de citas por mascota
**`GET`** `/api/citas/mascota/historial/:id`

Obtiene el historial completo de citas de una mascota específica.

**Parámetros de URL:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `number` | ID de la mascota |

```bash
GET /api/citas/mascota/historial/2
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    {
      "IdCita": 10,
      "FechaHora": "2026-05-20T04:16:00.000Z",
      "Tipo_Consulta": "Consulta General",
      "Estado": "Cancelada"
    },
    {
      "IdCita": 8,
      "FechaHora": "2026-05-15T10:30:00.000Z",
      "Tipo_Consulta": "Vacunación",
      "Estado": "Completada"
    }
  ]
}
```

**Error `404`:**
```json
{
  "success": false,
  "message": "No se encontraron citas para esta mascota"
}
```

---

### Completar cita
**`PATCH`** `/api/citas/:id/completar`

Marca una cita como completada. No requiere body.

**Parámetros de URL:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `number` | ID de la cita |

```bash
PATCH /api/citas/10/completar
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Cita completada exitosamente",
  "data": {
    "id": 10,
    "estado": "completada"
  }
}
```

**Errores posibles:**

| Código | Mensaje |
|---|---|
| `404` | No existe una cita con IdCita 10 |
| `409` | La cita ya está completada |

**Error `409`:**
```json
{
  "success": false,
  "message": "La cita ya está completada"
}
```

---

## 📋 Resumen de endpoints — Citas

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/citas` | Obtener todas las citas |
| `GET` | `/api/citas/:id` | Obtener cita por ID |
| `GET` | `/api/citas/mascota/:idMascota` | Obtener citas por mascota |
| `GET` | `/api/citas/veterinario/:id` | Obtener citas por veterinario |
| `GET` | `/api/citas/mascota/historial/:id` | Historial de citas de mascota |
| `POST` | `/api/citas` | Crear nueva cita |
| `PUT` | `/api/citas/:id` | Actualizar cita completa |
| `PATCH` | `/api/citas/:id/estado` | Actualizar solo el estado |
| `PATCH` | `/api/citas/:id/completar` | Completar cita |
| `DELETE` | `/api/citas/:id` | Eliminar cita |


# 📋 API de Reportes

> Módulo de reportes para administradores del sistema. Permite consultar ventas, productos más vendidos, exportar y descargar reportes en formato JSON.

---

## 🔐 Autenticación

Todas las rutas de este módulo requieren:

- **Rol**: Administrador (`RolId = 1`)
- **Header requerido**:

```http
Authorization: Bearer <token>
```

---

## 📌 Base URL

```
http://localhost:3000/api/reportes
```

---

## 📦 Dependencias

Este módulo utiliza **PDFKit** para la generación de reportes en formato PDF.

### Instalación

```bash
npm install pdfkit
```

### Uso básico con PDFKit

```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('reporte.pdf'));

doc.fontSize(18).text('Reporte de Ventas', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text(`Total ingresos: $4460.00`);

doc.end();
```

> **Nota:** PDFKit requiere Node.js. Consulta la [documentación oficial](https://pdfkit.org/) para opciones avanzadas de formato, tablas e imágenes.

---

## 📚 Endpoints

### 1. Reporte de ventas por fechas

```http
GET /api/reportes/ventas
```

**Query Params:**

| Parámetro      | Tipo     | Requerido | Descripción              |
|----------------|----------|-----------|--------------------------|
| `fecha_inicio` | `string` | ✅ Sí     | Fecha de inicio (`YYYY-MM-DD`) |
| `fecha_fin`    | `string` | ✅ Sí     | Fecha de fin (`YYYY-MM-DD`)    |

**Ejemplo:**
```
GET /api/reportes/ventas?fecha_inicio=2026-01-01&fecha_fin=2026-05-31
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    {
      "fecha": "2026-05-25T06:00:00.000Z",
      "num_ventas": 1,
      "total_ingresos": "170.00",
      "promedio_venta": "170.000000",
      "confirmadas": "1",
      "anuladas": "0"
    }
  ],
  "resumen": {
    "total_ingresos": "4460.00",
    "total_ventas": 12,
    "ticket_promedio": "371.666667",
    "ventas_anuladas": 10
  },
  "periodo": {
    "fecha_inicio": "2026-01-01",
    "fecha_fin": "2026-05-31"
  }
}
```

---

### 2. Productos más vendidos

```http
GET /api/reportes/productos-mas-vendidos
```

**Query Params:**

| Parámetro      | Tipo      | Requerido | Descripción                        |
|----------------|-----------|-----------|------------------------------------|
| `fecha_inicio` | `string`  | ✅ Sí     | Fecha de inicio (`YYYY-MM-DD`)     |
| `fecha_fin`    | `string`  | ✅ Sí     | Fecha de fin (`YYYY-MM-DD`)        |
| `limit`        | `integer` | ❌ No     | Número máximo de resultados (default: 10) |

**Ejemplo:**
```
GET /api/reportes/productos-mas-vendidos?fecha_inicio=2026-01-01&fecha_fin=2026-05-31&limit=10
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    {
      "producto_id": 1,
      "producto": "Amoxicilina 250mg",
      "categoria": "Medicamentos",
      "total_vendido": 10,
      "total_ingresos": 850.00,
      "num_ventas": 5
    }
  ],
  "periodo": {
    "fecha_inicio": "2026-01-01",
    "fecha_fin": "2026-05-31"
  },
  "total_productos": 5
}
```

---

### 3. Listar reportes generados

```http
GET /api/reportes/listar
```

**Query Params (opcionales):**

| Parámetro | Tipo      | Requerido | Descripción                     |
|-----------|-----------|-----------|---------------------------------|
| `page`    | `integer` | ❌ No     | Página actual (default: `1`)    |
| `limit`   | `integer` | ❌ No     | Resultados por página (default: `20`) |

**Ejemplo:**
```
GET /api/reportes/listar?page=1&limit=20
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo_reporte": "ventas",
      "parametros": "{\"fecha_inicio\":\"2026-01-01\",\"fecha_fin\":\"2026-05-31\"}",
      "fecha_inicio": "2026-01-01",
      "fecha_fin": "2026-05-31",
      "total_registros": 7,
      "archivo_nombre": "reporte_ventas_2026-01-01_2026-05-31_2026-05-27T10-30-00.json",
      "fecha_generacion": "2026-05-27T10:30:00.000Z",
      "generado_por": "Administrador"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4. Exportar reporte de ventas

Genera y guarda un archivo JSON con el reporte de ventas.

```http
GET /api/reportes/ventas/export
```

**Query Params:**

| Parámetro      | Tipo     | Requerido | Descripción              |
|----------------|----------|-----------|--------------------------|
| `fecha_inicio` | `string` | ✅ Sí     | Fecha de inicio (`YYYY-MM-DD`) |
| `fecha_fin`    | `string` | ✅ Sí     | Fecha de fin (`YYYY-MM-DD`)    |

**Ejemplo:**
```
GET /api/reportes/ventas/export?fecha_inicio=2026-01-01&fecha_fin=2026-05-31
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Reporte generado exitosamente",
  "data": { "..." : "..." },
  "archivo": "reporte_ventas_2026-01-01_2026-05-31_2026-05-27T10-30-00.json"
}
```

---

### 5. Exportar productos más vendidos

Genera y guarda un archivo JSON con el top de productos vendidos.

```http
GET /api/reportes/productos-mas-vendidos/export
```

**Query Params:**

| Parámetro      | Tipo      | Requerido | Descripción                        |
|----------------|-----------|-----------|------------------------------------|
| `fecha_inicio` | `string`  | ✅ Sí     | Fecha de inicio (`YYYY-MM-DD`)     |
| `fecha_fin`    | `string`  | ✅ Sí     | Fecha de fin (`YYYY-MM-DD`)        |
| `limit`        | `integer` | ❌ No     | Número máximo de resultados        |

**Ejemplo:**
```
GET /api/reportes/productos-mas-vendidos/export?fecha_inicio=2026-01-01&fecha_fin=2026-05-31&limit=10
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Reporte generado exitosamente",
  "data": { "..." : "..." },
  "archivo": "reporte_productos_2026-01-01_2026-05-31_2026-05-27T10-30-00.json"
}
```

---

### 6. Descargar reporte por ID

Descarga el archivo JSON de un reporte previamente generado.

```http
GET /api/reportes/download/:id
```

**Path Params:**

| Parámetro | Tipo      | Requerido | Descripción         |
|-----------|-----------|-----------|---------------------|
| `id`      | `integer` | ✅ Sí     | ID del reporte      |

**Ejemplo:**
```
GET /api/reportes/download/1
```

**Respuesta:** Descarga directa del archivo JSON del reporte.

---

## ❌ Códigos de error

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| `400` | `Las fechas de inicio y fin son obligatorias` | No se enviaron las fechas requeridas |
| `401` | `No autorizado: token no proporcionado` | Falta el token de autenticación |
| `403` | `Acceso denegado. Solo administradores pueden generar reportes` | El usuario no tiene rol de administrador |
| `404` | `No existe un reporte con ese ID` | El ID del reporte no existe en el sistema |

**Ejemplo de respuesta de error:**
```json
{
  "success": false,
  "message": "Las fechas de inicio y fin son obligatorias"
}
```

---

## 🗂️ Resumen de endpoints

| # | Endpoint | Método | Descripción |
|---|----------|--------|-------------|
| 1 | `/api/reportes/ventas` | `GET` | Reporte de ventas por fechas |
| 2 | `/api/reportes/productos-mas-vendidos` | `GET` | Top productos más vendidos |
| 3 | `/api/reportes/listar` | `GET` | Listar reportes generados |
| 4 | `/api/reportes/ventas/export` | `GET` | Exportar reporte de ventas (JSON) |
| 5 | `/api/reportes/productos-mas-vendidos/export` | `GET` | Exportar top productos (JSON) |
| 6 | `/api/reportes/download/:id` | `GET` | Descargar reporte por ID |


# 🧾 Módulo de Facturación Electrónica — VetCare

## 📋 Descripción

Módulo para generar y enviar facturas electrónicas (consumidor final) para ventas confirmadas.
Solo accesible para **Recepcionistas** y **Administradores**.

---

## 🔐 Permisos

| Rol            | Puede facturar |
|----------------|----------------|
| Administrador  | ❌ No           |
| Recepcionista  | ✅ Sí          |
| Veterinario    | ❌ No          |

**Header requerido:**

```http
Authorization: Bearer <token>
```

---

## 📦 Instalación de dependencias

```bash
npm install nodemailer
```

---

# 📄 Módulo de Facturación — VetCare

## 🗄️ Base de datos

### Tablas involucradas

| Tabla                | Propósito                                                |
|----------------------|----------------------------------------------------------|
| `ventas`             | Cabecera de venta (`requiere_factura`, `correo_factura`) |
| `facturaelectronica` | Registro de factura generada                             |
| `propietarios`       | Datos del cliente (Nombre, Correo)                       |
| `tiposdocumento`     | Solo `id = 1` (Factura Electrónica)                      |

> ⚠️ Las tablas `clientesfacturacion` y `estadosfactura` fueron eliminadas.
> `Id_Cliente` en `facturaelectronica` ahora apunta directamente a `propietarios`.

---

## 🛠️ Migración de base de datos

Ejecutar este script SQL antes de usar el módulo:

```sql
USE vetcare;

-- 1. AGREGAR COLUMNAS A ventas
ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS requiere_factura BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS correo_factura VARCHAR(150) NULL;

-- 2. AGREGAR COLUMNAS A facturaelectronica
ALTER TABLE facturaelectronica
  ADD COLUMN IF NOT EXISTS RutaComprobante VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS IdentificadorComprobante VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS EstadoEnvio ENUM('pendiente', 'enviado', 'fallido') NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS FechaEnvio DATETIME NULL,
  ADD COLUMN IF NOT EXISTS MensajeError TEXT NULL,
  ADD COLUMN IF NOT EXISTS CorreoDestino VARCHAR(150) NULL;

-- 3. ACTUALIZAR FOREIGN KEY (Id_Cliente → propietarios)
ALTER TABLE facturaelectronica DROP FOREIGN KEY IF EXISTS facturaelectronica_ibfk_2;
ALTER TABLE facturaelectronica DROP FOREIGN KEY IF EXISTS fk_factura_cliente;

ALTER TABLE facturaelectronica
  ADD CONSTRAINT fk_factura_cliente
  FOREIGN KEY (Id_Cliente) REFERENCES propietarios(Id) ON DELETE CASCADE;

-- 4. TIPOS DE DOCUMENTO
DELETE FROM tiposdocumento WHERE Tipo_Documento = 'Credito Fiscal';

INSERT INTO tiposdocumento (Id, Tipo_Documento) VALUES (1, 'Factura Electronica')
ON DUPLICATE KEY UPDATE Tipo_Documento = VALUES(Tipo_Documento);

-- 5. ELIMINAR TABLAS QUE YA NO SE USAN
DROP TABLE IF EXISTS clientesfacturacion;
DROP TABLE IF EXISTS estadosfactura;

-- 6. VERIFICAR ESTRUCTURA FINAL
DESCRIBE ventas;
DESCRIBE facturaelectronica;
SELECT * FROM tiposdocumento;
```

---

## 📌 Base URL

```
http://localhost:3000/api/ventas
```

---

## 📦 Endpoints

### 1. Generar factura

```http
POST /api/ventas/:id/factura/generar
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

| Campo             | Tipo      | Requerido | Descripción                                                        |
|-------------------|-----------|-----------|--------------------------------------------------------------------|
| `requiereFactura` | `boolean` | ✅ Sí     | Debe ser `true` para generar la factura                            |
| `correoEnvio`     | `string`  | ❌ No     | Correo alternativo. Si no se envía, usa el correo del propietario  |

> ✅ Ya **no se necesita enviar `idPropietario`** — se obtiene automáticamente de la venta.

**Opciones de body:**

| Opción                      | Body                                                         |
|-----------------------------|--------------------------------------------------------------|
| Usar correo del propietario | `{"requiereFactura": true}`                                  |
| Enviar a otro correo        | `{"requiereFactura": true, "correoEnvio": "otro@email.com"}` |

**Respuesta exitosa `201`:**
```json
{
  "success": true,
  "message": "Factura generada exitosamente",
  "data": {
    "factura": { "id": 2 },
    "numeroControl": "FAC-20260527-9431",
    "codigoGeneracion": "CG-1779899838450-RKC70HC4"
  }
}
```

**Errores posibles:**

| Código | Mensaje                                      |
|--------|----------------------------------------------|
| `400`  | Esta venta no requiere factura               |
| `400`  | Solo se pueden facturar ventas confirmadas   |
| `400`  | El propietario debe tener nombre             |
| `400`  | Se requiere un correo para enviar la factura |
| `404`  | No existe una venta con id X                 |
| `404`  | No existe un propietario con ese ID          |
| `409`  | Esta venta ya tiene una factura generada     |

---

### 2. Enviar factura por correo

```http
POST /api/ventas/:id/factura/enviar
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Body:** `{}` (vacío)

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Factura enviada a cliente@email.com",
  "data": {
    "estadoEnvio": "enviado",
    "fechaEnvio": "2026-05-27T16:38:58.311Z"
  }
}
```

**Errores posibles:**

| Código | Mensaje                                      |
|--------|----------------------------------------------|
| `400`  | No hay correo destino para enviar la factura |
| `404`  | Esta venta no tiene factura asociada         |

---

### 3. Obtener factura de una venta

```http
GET /api/ventas/:id/factura
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": {
    "Id": 2,
    "NumeroControl": "FAC-20260527-9431",
    "CodigoGeneracion": "CG-1779899838450-RKC70HC4",
    "EstadoEnvio": "enviado",
    "CorreoDestino": "cliente@email.com",
    "NombreFiscal": "Bryan"
  }
}
```

**Error `404`:**
```json
{
  "success": false,
  "message": "Esta venta no tiene factura asociada"
}
```

---

## 🔄 Flujo completo

```
1. Recepcionista inicia sesión
   ↓
2. POST /api/ventas                       → Crear venta (con idPropietario)
   ↓
3. POST /api/ventas/:id/detalle           → Agregar productos
   ↓
4. PATCH /api/ventas/:id/confirmar        → Confirmar venta
   ↓
5. POST /api/ventas/:id/factura/generar   → Generar factura (propietario automático)
   ↓
6. POST /api/ventas/:id/factura/enviar    → Enviar por correo
   ↓
7. Cliente recibe el correo ✅
```

---

## 📋 Ejemplo completo en Postman

**Paso 1 — Login:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "correo": "recepcionista@vetcare.com",
  "contrasena": "123456"
}
```

**Paso 2 — Crear venta:**
```http
POST http://localhost:3000/api/ventas
Authorization: Bearer <token>
Content-Type: application/json

{
  "idPropietario": 1
}
```

**Paso 3 — Agregar producto:**
```http
POST http://localhost:3000/api/ventas/19/detalle
Authorization: Bearer <token>
Content-Type: application/json

{
  "idProducto": 1,
  "cantidad": 2
}
```

**Paso 4 — Confirmar venta:**
```http
PATCH http://localhost:3000/api/ventas/19/confirmar
Authorization: Bearer <token>
```

**Paso 5 — Generar factura:**
```http
POST http://localhost:3000/api/ventas/19/factura/generar
Authorization: Bearer <token>
Content-Type: application/json

{
  "requiereFactura": true
}

por si quiero enviarla ah otro correo 

{
  "requiereFactura": true,
  "correoEnvio": "ronaldo2005aws@gmail.com"
}
```

**Paso 6 — Enviar factura:**
```http
POST http://localhost:3000/api/ventas/19/factura/enviar
Authorization: Bearer <token>
```

**Paso 7 — Ver factura:**
```http
GET http://localhost:3000/api/ventas/19/factura
Authorization: Bearer <token>
```

---

## ❌ Errores comunes

| Error                                      | Causa                     | Solución                              |
|--------------------------------------------|---------------------------|---------------------------------------|
| `401 Unauthorized`                         | Token inválido o expirado | Volver a hacer login                  |
| `403 Forbidden`                            | Sin permisos              | Usar cuenta Recepcionista o Admin     |
| Solo se pueden facturar ventas confirmadas | Venta no confirmada       | Ejecutar Paso 4 primero               |
| Esta venta ya tiene una factura generada   | Factura duplicada         | Solo se permite una factura por venta |
| Esta venta no requiere factura             | `requiereFactura: false`  | Enviar `requiereFactura: true`        |
| No hay correo destino                      | Propietario sin correo    | Agregar `correoEnvio` en el body      |

---

## 📁 Archivos del módulo

| Archivo                | Ruta                                |
|------------------------|-------------------------------------|
| `emailSender.js`       | `utils/emailSender.js`              |
| `ventas.service.js`    | `services/ventas.service.js`        |
| `ventas.controller.js` | `controllers/ventas.controller.js`  |
| `ventas.repository.js` | `repository/ventas.repository.js`   |
| `ventas.routes.js`     | `routes/ventas.routes.js`           |

---

## 🗂️ Resumen de endpoints

| # | Método  | Endpoint                          | Body                              |
|---|---------|-----------------------------------|-----------------------------------|
| 1 | `POST`  | `/api/auth/login`                 | `{correo, contrasena}`            |
| 2 | `POST`  | `/api/ventas`                     | `{idPropietario}`                 |
| 3 | `POST`  | `/api/ventas/:id/detalle`         | `{idProducto, cantidad}`          |
| 4 | `PATCH` | `/api/ventas/:id/confirmar`       | `{}`                              |
| 5 | `POST`  | `/api/ventas/:id/factura/generar` | `{requiereFactura, ?correoEnvio}` |
| 6 | `POST`  | `/api/ventas/:id/factura/enviar`  | `{}`                              |
| 7 | `GET`   | `/api/ventas/:id/factura`         | —                                 |