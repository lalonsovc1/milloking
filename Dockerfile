FROM node:18-slim

RUN apt-get update && apt-get install -y chromium

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox"

EXPOSE 3000

CMD ["node", "server.js"]
