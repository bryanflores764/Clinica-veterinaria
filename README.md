# VetCare - Sistema de Gestión Veterinaria

## Descripción

El sistea web se desarrollo para la gestión integral de una clínica veterinaria VetCare, con el objetivo de optimizar y digitalizar los procesos internos que normalmente se realizan de forma manual.

El proyecto surge a partir de la necesidad de contar con una herramienta tecnológica que permita administrar de manera más eficiente la información relacionada con los usuarios del sistema, clientes, mascotas, citas médicas, historial clínico, control de vacunación, facturación y reportes administrativos. Actualmente, muchos de estos procesos pueden realizarse en papel o de forma poco centralizada, lo que puede provocar pérdida de información, duplicidad de registros, dificultad para consultar datos importantes y poca organización en el seguimiento de los pacientes.

Por esta razón, VetCare busco centralizar la información en esta plataforma accesible, ordenada y fácil de utilizar, permitiendo que cada área de la clínica pueda realizar sus actividades de manera más rápida y segura. El sistema está orientado al trabajo del personal administrativo, recepcionistas y veterinarios, brindando funcionalidades específicas según el rol de cada usuario.

Además, al contar con un sistema digital, la clínica puede mejorar el control de sus procesos, reducir errores en el manejo de datos, agilizar la atención a los clientes y mantener un mejor seguimiento del estado de salud de cada mascota. De esta manera, VetCare contribuye a una gestión más moderna, eficiente y confiable dentro de la veterinaria.

---

##  Sitio desplegado

El sistema se encuentra desplegado y disponible en el siguiente enlace:

```txt
https://clinica-veterinaria-1-er4w.onrender.com
```

---

##  Credenciales de acceso para prueba

### Administrador

```txt
Correo: admin@vetcare.com
Contraseña: VetC@re123
```

###  Recepcionista

```txt
Correo: recepcionista1@vetcare.com
Contraseña: VetC@re123
```

### Veterinario

```txt
Correo: veterinario1@vetcare.com
Contraseña: VetC@re123
```

---

##  Tecnologías utilizadas

### Frontend

- HTML5
    
- CSS3
    
- JavaScript
### Backend

- Node.js
    
- Express.js
    
- MySQL
    
- JWT para autenticación
    
- Bcrypt para encriptación de contraseñas
    
- Nodemailer para envío de correos
    

### Base de datos

- MySQL
    
- Aiven como servicio de base de datos en la nube
    

### Herramientas adicionales

- Git y GitHub
    
- Postman para pruebas de API
    
- Render para despliegue del frontend y backend
    

---

## Área de despliegue

Para la publicación del sistema se utilizaron servicios en la nube:

- **Render:** utilizado para desplegar el frontend y el backend del sistema.
    
- **Aiven:** utilizado para alojar la base de datos MySQL en la nube.
    

Esto permite que el sistema se pueda probar desde internet sin necesidad de ejecutarlo localmente.

---

## Estructura del proyecto

```txt
Clinica-veterinaria
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── repositories
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── assets
│   │   ├── icons
│   │   └── img
│   │
│   ├── css
│   │   ├── administrador
│   │   ├── recepcionista
│   │   ├── veterinario
│   │   └── index.css
│   │
│   ├── js
│   │   ├── administrador
│   │   ├── recepcionista
│   │   ├── veterinario
│   │   └── index.js
│   │
│   ├── pages
│   │   ├── administrador
│   │   ├── recepcionista
│   │   └── veterinario
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── VetCare.sql
└── README.md
```

---

## Módulos principales del sistema

El sistema cuenta con diferentes módulos según el rol del usuario:

### Administrador

- Gestión de usuarios
    
- Gestión de clientes
    
- Gestión de mascotas
    
- Historial de acciones
	
- Reportes de ventas
    
- Administración general del sistema
	
- Gestion de consulta
	
### Recepcionista

- Registro citas
    
- Registro de mascotas
    
- Gestión de clientes
    
- Inventario de tienda
    
- Historial de citas
    
### Veterinario

- Consulta de citas asignadas
    
- Registro de historial clínico
    
- Control de vacunación
    
- Seguimiento de pacientes
    

---

## Requisitos para ejecución local

Antes de ejecutar el proyecto de forma local, asegúrate de tener instalado:

- Node.js
    
- MySQL
    
- Git
    
- pnpm
    
- Postman o Thunder Client opcional para pruebas
    

---

#  Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/bryanflores764/Clinica-veterinaria.git
```

### 2. Entrar al proyecto

```bash
cd Clinica-veterinaria
```

---

## Configuración de la base de datos

El repositorio incluye el archivo `VetCare.sql`, el cual contiene la estructura de la base de datos necesaria para ejecutar el sistema.

### 1. Importar la base de datos

Abre MySQL Workbench o tu gestor de base de datos preferido, importa el archivo:

```txt
VetCare.sql
```

Luego ejecútalo para crear la base de datos y sus respectivas tablas.

### 2. Configurar variables de entorno del backend

Dentro de la carpeta `backend`, crea o modifica el archivo `.env` con la siguiente estructura:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=vetcare
DB_PORT=3306

JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1d

EMAIL_USER=tu_correo
EMAIL_PASS=tu_contraseña_de_aplicacion
```

---

##  Ejecutar el backend

Entra a la carpeta del backend:

```bash
cd backend
```

Instala las dependencias:

```bash
pnpm install
```

Ejecuta el servidor:

```bash
pnpm run dev
```

El backend estará disponible en:

```txt
http://localhost:3000
```

---

##  Ejecutar el frontend

El frontend del sistema está desarrollado con **HTML, CSS y JavaScript puro**, por lo tanto no es necesario ejecutar comandos como `npm run dev`.

Para visualizar el frontend de forma local se recomienda utilizar la extensión **Live Server** de Visual Studio Code.
### Pasos para ejecutar el frontend

1. Abrir el proyecto en **Visual Studio Code**.
    
2. Entrar a la carpeta `frontend`.
    
3. Abrir el archivo `index.html`.
    
4. Hacer clic derecho sobre el archivo.
    
5. Seleccionar la opción:
    

```txt
Open with Live Server
```

El frontend se abrirá automáticamente en el navegador, normalmente en una dirección similar a:

```txt
http://127.0.0.1:5500/frontend/index.html
```

o

```txt
http://localhost:5500/frontend/index.html
```

---

## 🔗 Configuración de conexión frontend-backend

Para que el frontend se comunique correctamente con el backend, se debe configurar la URL de la API.

En desarrollo local puede utilizarse:

```js
window.API_URL = "http://localhost:3000";
```

En producción se utiliza la URL del backend desplegado en Render.

Se puede ver en el apartado de Frontend en `config.js`

---

## Funcionalidades destacadas

- Inicio de sesión con autenticación por roles.
    
- Gestión de usuarios del sistema.
    
- Registro y administración de mascotas.
    
- Control de citas veterinarias.
    
- Registro de historial clínico.
    
- Control de vacunación.
    
- Generación de facturas.
    
- Envío de facturas por correo electrónico.
    
- Reportes administrativos.
    
- Interfaz separada según el tipo de usuario.
    

---

## Roles del sistema

El sistema cuenta con tres tipos principales de usuarios:

|Rol|Descripción|
|---|---|
|Administrador|Encargado de la gestión general del sistema.|
|Recepcionista|Encargado del registro de clientes, mascotas, citas y facturación.|
|Veterinario|Encargado del seguimiento médico, historial clínico y vacunación.|

---

##  Base de datos

La base de datos fue desarrollada en MySQL y contiene las tablas necesarias para el funcionamiento del sistema, incluyendo usuarios, roles, dueños, mascotas, citas, historial clínico, vacunas, productos, facturas y reportes.

En producción, la base de datos se encuentra alojada en **Aiven**, permitiendo conexión remota desde el backend desplegado en Render.

---

##  Estado del proyecto

El sistema se encuentra desplegado y funcional como proyecto académico para la gestión de la ficticia clínica veterinaria VetCare.

---

## Autores

Proyecto desarrollado por estudiantes de la Universidad de Oriente, UNIVO, como parte de un proyecto académico orientado a brindar una solución tecnológica para la gestión de la Veterinaria VetCare.

---
## Institución

Universidad de Oriente UNIVO  
San Miguel, El Salvador

---

## Licencia

Este proyecto fue desarrollado con fines académicos.
