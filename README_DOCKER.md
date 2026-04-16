# VetCare - Base de Datos MySQL con Docker

Este proyecto incluye la configuración necesaria para levantar un servidor de base de datos MySQL usando Docker para el sistema **VetCare**.

---

## Requisitos

Antes de comenzar, asegúrate de tener instalado:

* Docker
* Docker Desktop (preferencia)

---

## Cómo iniciar el servidor

1. Clona el repositorio o descarga los archivos
2. Ubícate en la carpeta donde está el archivo `docker-compose.yml`
3. Ejecuta el siguiente comando:

```bash
docker compose up -d
```

✔ Esto hará lo siguiente:

* Creará el contenedor de MySQL
* Creará la base de datos `vetcare`
* Levantará el servidor en segundo plano

---

## Cómo detener el servidor

Cuando ya no necesites el servidor puedes pararlo desde la terminal o desde Docker Desktop, esta accion no borra la base de datos ni nada que este en el servidor.

```bash
docker compose stop
```

---

## Cómo volver a iniciar el servidor

Cuando necesites nuevamente hacer uso del servidor ejecuta el siguiente comando en la terminal o lo puedes hacer desde Docker Desktop.

```bash
docker compose start
```

---

## IMPORTANTE ⚠️

Este comando si **ELIMINA** el contenedor y toda la informarcion que posea.

```bash
docker compose down
```

## Información de conexión

Usa estos datos para conectarte desde tu motor de base de datos:

* **Host:** localhost
* **Puerto:** 3306
* **Usuario:** root
* **Contraseña:** 1234
* **Base de datos:** vetcare

---

## Notas importantes

* Los datos se guardan en un volumen de Docker, por lo que **no se pierden al apagar el contenedor**
* No es necesario configurar rutas manuales (funciona en Windows, Mac y Linux)
* Si tienes otro MySQL instalado, puedes cambiar el puerto en el `docker-compose.yml`

Ejemplo:

```yaml
ports:
  - "3307:3306"
```
