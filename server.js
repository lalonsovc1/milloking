import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { createClient } from "@retconned/kick-js";
import puppeteer from "puppeteer";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const canal = "matnarok2";
const sacrificables = new Set();
let socketConectado = null;

app.use(express.static(__dirname));

wss.on("connection", ws => {
  console.log("🎮 Cliente conectado al WebSocket");
  socketConectado = ws;
});

server.listen(3000, () => {
  console.log("🌐 Servidor activo en: http://localhost:3000");
});

function enviarSacrificio(mensaje) {
  if (socketConectado) {
    socketConectado.send(mensaje);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: "/usr/bin/chromium"
  });

  const client = createClient(canal, {
    readOnly: true,
    puppeteerInstance: browser
  });

  client.on("ChatMessage", message => {
    const usuario = message.sender.username;
    const contenido = message.content.toLowerCase();

    if (contenido.includes("xdd")) {
      if (!sacrificables.has(usuario)) {
        sacrificables.add(usuario);
        console.log(`⚔️ ${usuario} se ha ofrecido como sacrificio.`);
        enviarSacrificio("ADD:" + usuario);
      }
    }

    if (contenido === ":3" && sacrificables.size > 0) {
      const lista = Array.from(sacrificables);
      const elegido = lista[Math.floor(Math.random() * lista.length)];
      console.log(`🔥 El elegido es: ${elegido}`);
      enviarSacrificio("WINNER:" + elegido);
      sacrificables.clear();
    }
  });

  console.log(`🤖 Bot escuchando el canal de ${canal}...`);
})();
