# Backend API - Veterinaria

## Descripción
Este proyecto corresponde al backend principal del sistema de gestión para una veterinaria.  
La API está desarrollada con Node.js y Express y permite gestionar información almacenada en una base de datos MySQL.

------------------------------------------------------------

# Tecnologías utilizadas

- Node.js  
- Express.js  
- MySQL  
- Postman para pruebas de la API  

------------------------------------------------------------

# Estructura del proyecto

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

------------------------------------------------------------

# Requisitos

Antes de iniciar el proyecto debes tener instalado:

- Node.js
- MySQL
- Git
- Postman (opcional para pruebas)

------------------------------------------------------------

# Instalación del proyecto

1. Clonar el repositorio

git clone URL_DEL_REPOSITORIO

2. Entrar al proyecto

cd backend

3. Instalar dependencias

npm install

------------------------------------------------------------

# Configurar variables de entorno

Crear un archivo .env en la raíz del proyecto.

Ejemplo:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=db_veterinaria
PORT=3000

------------------------------------------------------------

# Ejecutar el proyecto

Para iniciar el servidor:

npm run dev

o

node server.js

El servidor se ejecutará en:

http://localhost:3000

------------------------------------------------------------

# Endpoints principales (Ejemplo)

Obtener todos los dueños

GET /api/users


Obtener dueño por ID

GET /api/users/:id


Crear dueño

POST /api/users

Ejemplo de body:

{
 "nombreDueno": "Carlos",
 "apellidosDueno": "Ramirez",
 "telefono": "78945612",
 "correoElectronico": "carlos@email.com"
}


Actualizar dueño

PUT /api/users/:id

Ejemplo de body:

{
 "nombreDueno": "Carlos",
 "apellidosDueno": "Ramirez",
 "telefono": "78945612",
 "correoElectronico": "carlos@email.com"
}


Eliminar dueño

DELETE /api/users/:id

------------------------------------------------------------

# Pruebas de la API

Las pruebas pueden realizarse utilizando:

- Postman
- Thunder Client en Visual Studio Code

------------------------------------------------------------

# Guía básica de ramas en Git

Las ramas (branches) permiten trabajar en nuevas funcionalidades sin afectar la rama principal del proyecto.

Normalmente el proyecto tiene una rama principal llamada:

main

Cada desarrollador puede crear su propia rama para trabajar.

------------------------------------------------------------

1. Ver las ramas del proyecto

Para ver las ramas que existen en tu repositorio local:

git branch

Para ver también las ramas del repositorio remoto:

git branch -a

------------------------------------------------------------

2. Crear una nueva rama

Para crear una nueva rama:

git branch nombre-rama

Ejemplo:

git branch feature-login

------------------------------------------------------------

3. Cambiarse a una rama

Para moverte a otra rama:

git checkout nombre-rama

Ejemplo:

git checkout feature-login

------------------------------------------------------------

4. Crear y cambiar a la rama al mismo tiempo

Puedes crear la rama y moverte a ella en un solo comando:

git checkout -b nombre-rama

Ejemplo:

git checkout -b feature-crud-usuarios

------------------------------------------------------------

5. Guardar cambios en la rama

Primero agregas los archivos modificados:

git add .

Luego haces el commit:

git commit -m "Se agregó CRUD de usuarios"

------------------------------------------------------------

6. Subir la rama a GitHub

Para subir tu rama al repositorio remoto:

git push origin nombre-rama

Ejemplo:

git push origin feature-crud-usuarios

------------------------------------------------------------

7. Actualizar tu repositorio con cambios de GitHub

Para traer cambios del repositorio remoto:

git pull origin main

------------------------------------------------------------

8. Cambiar a la rama principal

git checkout main

------------------------------------------------------------

9. Unir una rama a main (merge)

Primero debes estar en main:

git checkout main

Luego unir la rama:

git merge nombre-rama

Ejemplo:

git merge feature-crud-usuarios

------------------------------------------------------------

10. Borrar una rama local

Cuando ya no se necesita una rama:

git branch -d nombre-rama

Ejemplo:

git branch -d feature-crud-usuarios

------------------------------------------------------------

11. Borrar una rama en GitHub

Para eliminar una rama del repositorio remoto:

git push origin --delete nombre-rama

Ejemplo:

git push origin --delete feature-crud-usuarios

------------------------------------------------------------

12. Flujo de trabajo recomendado en equipo

1) Actualizar proyecto

git pull origin main

2) Crear rama

git checkout -b feature-nueva-funcion

3) Trabajar y guardar cambios

git add .
git commit -m "Nueva funcionalidad"

4) Subir la rama

git push origin feature-nueva-funcion

5) Crear Pull Request en GitHub.

------------------------------------------------------------

Buenas prácticas

Nunca trabajar directamente en main.

Siempre crear una rama para cada funcionalidad.

Ejemplos de nombres de ramas:

feature-login
feature-crud-mascotas
feature-crud-clientes
fix-error-login