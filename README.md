# 🐾 Backend API - Veterinaria

## 📖 Descripción

Este proyecto corresponde al **backend principal del sistema de gestión para una veterinaria**.

La API está desarrollada utilizando **Node.js y Express**, y permite gestionar la información almacenada en una base de datos **MySQL**, como dueños, mascotas, citas y otros registros del sistema.

---

# 🚀 Tecnologías utilizadas

- **Node.js**
- **Express.js**
- **MySQL**
- **Postman** (para pruebas de la API)

---

# 📂 Estructura del proyecto

```
backend
│
├── src
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── repositories
│   ├── routes
│   ├── services
│   ├── utils
│
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

```
frontend
│
├── assets
│   ├── icons
│   └── img
│
├── css
│   ├── administrador
│   ├── recepcionista
│   ├── veterinario
│   └── index.css
│
├── js
│   ├── administrador
│   ├── recepcionista
│   ├── veterinario
│   └── index.js
│
├── pages
│   ├── administrador
│   ├── recepcionista
│   ├── veterinario
│
├── index.html
│
├── .gitignore
├── package.json
├── package-lock.json
│
├── README.md
└── VetCare.sql
```
# 📋 Requisitos

Antes de ejecutar el proyecto debes tener instalado:

- Node.js
- MySQL
- Git
- Postman (opcional para pruebas)

---

# ⚙️ Instalación del proyecto

### 1️⃣ Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2️⃣ Entrar al proyecto

```bash
cd backend
```

### 3️⃣ Instalar dependencias

```bash
npm install
npm install express cors mysql2 dotenv
npm install jsonwebtoken bcryptjs
```

---

# ▶️ Ejecutar el proyecto

Para iniciar el servidor puedes utilizar:

```bash
npm run dev
```

o

```bash
node server.js
```

El servidor se ejecutará en:

```
http://localhost:3000
```

# ▶️ Ejecucion de base de datos

El servidor se ejecutará en:

Primero lo que debemos de hacer es crear la base de datos en un motor de base datos **MYSQl**
El script de base datos esta en el repositorio el nombre del script VetCare.sql. Para ejecutar ese archivo nosotros utilizamos MySql Workbench
donde solo importamos el archivo y lo ejecutamos y se crea la base de datos. Despues de crear la base de datos creamos un usuario para iniciar sesión.
#### POST `/api/usuarios` — Crear usuario
```json
// Body
{
  "nombre_usuario": "Bryan García",
  "correo": "bryan@gmail.com",
  "contrasena": "123456",
  "rolId": 1
}

Este es el json para crear el usuario el usario que crearemos es de tipo administrador con ese usuario ingresamos como administrador y crearemos más usuarios para ingresar como veterinario o recepcionista donde podemos probar los otros 2 modulos.

Luego en el archivo connection.js modificar las credenciales que posee el motor de base de datos para crear la configuración  y creación de la base de datos utilizada.
const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
  host     : process.env.DB_HOST     || 'localhost',
  user     : process.env.DB_USER     || 'root',
  password : process.env.DB_PASSWORD || '1234',
  database : process.env.DB_NAME     || 'vetcare',
  port     : process.env.DB_PORT     || 3306,
  waitForConnections: true,
  connectionLimit   : 10,
});

module.exports = connection;


---

# 🔗 Endpoints principales (Ejemplo)

## Obtener todos los dueños

```
GET /api/users
```

---

## Obtener dueño por ID

```
GET /api/users/:id
```

---

## Crear dueño

```
POST /api/users
```

### Ejemplo de body

```json
{
  "nombreDueno": "Carlos",
  "apellidosDueno": "Ramirez",
  "telefono": "78945612",
  "correoElectronico": "carlos@email.com"
}
```

---

## Actualizar dueño

```
PUT /api/users/:id
```

### Ejemplo de body

```json
{
  "nombreDueno": "Carlos",
  "apellidosDueno": "Ramirez",
  "telefono": "78945612",
  "correoElectronico": "carlos@email.com"
}
```

---

## Eliminar dueño

```
DELETE /api/users/:id
```

---

# 🧪 Pruebas de la API

Puedes probar los endpoints utilizando:

- **Postman**
- **Thunder Client** (extensión de Visual Studio Code)

---

# 🌿 Guía básica de ramas en Git

Las **ramas (branches)** permiten trabajar en nuevas funcionalidades sin afectar la rama principal del proyecto.

La rama principal normalmente se llama:

```
main
```

Cada desarrollador puede crear su propia rama para trabajar.

---

# 🔎 1. Ver ramas del proyecto

Ver ramas locales:

```bash
git branch
```

Ver ramas locales y remotas:

```bash
git branch -a
```

---

# 🌱 2. Crear una nueva rama

```bash
git branch nombre-rama
```

Ejemplo:

```bash
git branch feature-login
```

---

# 🔄 3. Cambiarse a una rama

```bash
git checkout nombre-rama
```

Ejemplo:

```bash
git checkout feature-login
```

---

# ⚡ 4. Crear y cambiar a una rama al mismo tiempo

```bash
git checkout -b nombre-rama
```

Ejemplo:

```bash
git checkout -b feature-crud-usuarios
```

---

# 💾 5. Guardar cambios en la rama

Agregar archivos modificados:

```bash
git add .
```

Crear commit:

```bash
git commit -m "Se agregó CRUD de usuarios"
```

---

# ☁️ 6. Subir la rama a GitHub

```bash
git push origin nombre-rama
```

Ejemplo:

```bash
git push origin feature-crud-usuarios
```

---

# 🔄 7. Actualizar tu repositorio con cambios de GitHub

```bash
git pull origin main
```

---

# 🔙 8. Cambiar a la rama principal

```bash
git checkout main
```

---

# 🔀 9. Unir una rama a main (merge)

Primero debes estar en `main`:

```bash
git checkout main
```

Luego unir la rama:

```bash
git merge nombre-rama
```

Ejemplo:

```bash
git merge feature-crud-usuarios
```

---

# 🗑 10. Borrar una rama local

```bash
git branch -d nombre-rama
```

Ejemplo:

```bash
git branch -d feature-crud-usuarios
```

---

# ❌ 11. Borrar una rama en GitHub

```bash
git push origin --delete nombre-rama
```

Ejemplo:

```bash
git push origin --delete feature-crud-usuarios
```

---

# 👥 Flujo de trabajo recomendado en equipo

### 1️⃣ Actualizar proyecto

```bash
git pull origin main
```

### 2️⃣ Crear rama

```bash
git checkout -b feature-nueva-funcion
```

### 3️⃣ Trabajar y guardar cambios

```bash
git add .
git commit -m "Nueva funcionalidad"
```

### 4️⃣ Subir la rama

```bash
git push origin feature-nueva-funcion
```

### 5️⃣ Crear Pull Request en GitHub

---

# ✅ Buenas prácticas

- ❌ Nunca trabajar directamente en **main**
- 🌿 Crear siempre una **rama por funcionalidad**
- 🧾 Usar nombres claros en las ramas

### Ejemplos de nombres de ramas

```
feature-login
feature-crud-mascotas
feature-crud-clientes
fix-error-login
```

---

💡 **Autor:** Equipo de desarrollo del sistema de gestión veterinaria.
