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

# 🔐 Configuración de variables de entorno

Debes crear un archivo `.env` en la **raíz del proyecto**.

Ejemplo:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=db_veterinaria
PORT=3000
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