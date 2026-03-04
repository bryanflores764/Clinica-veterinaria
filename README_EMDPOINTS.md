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
{
  "nombre_usuario": "Bryan García López",
  "correo": "bryan.nuevo@gmail.com",
  "rolId": 2
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


