# SGER – Sistema de Gestión de Entregas y Reparto

SGER es un proyecto escolar de una aplicación web diseñada para administrar repartidores, pedidos y zonas de entrega, implementando autenticación por OAuth 2.0 y una base de datos distribuida mediante fragmentación horizontal en MongoDB.

Objetivo del proyecto
Desarrollar un sistema web que administre repartidores, órdenes y zonas de entrega,
donde la base de datos se encuentre distribuida por localidades (fragmentación horizontal
o colecciones particionadas en MongoDB).

Características principales

 - Autenticación con Google OAuth 2.0 mediante Passport.js
 - Gestión de usuarios y recursos
 - Vistas con EJS
 - API con Express.js
 - Conexión a base de datos con Mongoose (MongoDB)
 - Variables de entorno con dotenv

Tecnologías utilizadas
- Node.js
- Express
- Passport + Google OAuth 2.0
- EJS
- MongoDB + Mongoose
- dotenv


Instalación
    Clonar el repositorio:
        git clone https://github.com/AngelMariscall/SGER.git
        cd 

    Instalar dependencias:
        npm install

    Configurar archivo .env:
        GOOGLE_CLIENT_ID=tu_id
        GOOGLE_CLIENT_SECRET=tu_secret
        CALLBACK_URL=http://localhost:3000/auth/google/callback
        MONGO_URI=mongodb://localhost:27017/(nombre de la base de datos)
        PORT=3000