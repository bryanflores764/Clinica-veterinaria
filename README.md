# 🐾 Backend API - Veterinaria

## 📖 Descripción

Este proyecto corresponde al **backend principal del sistema de gestión para una veterinaria**.

La API está desarrollada con **Node.js y Express**, y permite gestionar la información almacenada en una base de datos **MySQL**, como dueños, mascotas, citas y otros registros del sistema.

---

## 🚀 Tecnologías utilizadas

- **Node.js**
- **Express.js**
- **MySQL**
- **Postman** (para pruebas de la API)

---

## 📂 Estructura del proyecto

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
│   └── utils
│
├── .env
├── .gitignore
├── package.json
└── server.js
```

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
│   └── veterinario
│
├── index.html
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── VetCare.sql
```

---

## 📋 Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js
- MySQL
- Git
- Postman *(opcional, para pruebas)*

---

## ⚙️ Instalación

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/bryanflores764/Clinica-veterinaria.git
```

### 2️⃣ Entrar a la carpeta del backend

```bash
cd backend
```

### 3️⃣ Instalar dependencias

```bash
npm install
```

---

## ▶️ Ejecutar el servidor

```bash
npm run dev
```

El servidor estará disponible en:

```
http://localhost:3000
```

---

## 🗄️ Configurar la base de datos

El repositorio incluye el script `VetCare.sql` con la estructura completa de la base de datos.

### 1️⃣ Importar el script

Abre **MySQL Workbench o motor de base de datos preferido**, importa el archivo `VetCare.sql` y ejecútalo. Esto creará la base de datos vacía lista para usar.

### 2️⃣ Configurar la conexión

En el archivo `.env` de la carpeta `backend`, define tus credenciales:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=vetcare
DB_PORT=3306
```

### 3️⃣ Crear el primer usuario administrador

El sistema requiere un usuario administrador para poder acceder. Envía la siguiente petición a la API usando Postman o Thunder Client:

**`POST http://localhost:3000/api/usuarios`**

```json
{
  "nombre_usuario": "administrador",
  "correo": "admin@vetcare.com",
  "contrasena": "VetC@re123",
  "rolId": 1
}
```

> Con este usuario de tipo administrador podrás ingresar al sistema y crear desde ahí los demás usuarios (veterinario, recepcionista).

---

💡 **Autor:** Equipo de desarrollo del sistema de gestión veterinaria.