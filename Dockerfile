# Usa una imagen oficial de Node.js ligera con Debian
FROM node:18-slim

# Instala Chromium necesario para Puppeteer y kick-js
RUN apt-get update && apt-get install -y chromium

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json (si tienes)
COPY package*.json ./

# Instala dependencias de Node.js
RUN npm install

# Copia el resto de archivos de tu proyecto
COPY . .

# Expone el puerto 3000 que usas en tu servidor
EXPOSE 3000

# Arranca tu aplicación (ajusta si tu archivo principal no es index.js)
CMD ["node", "server.js"]