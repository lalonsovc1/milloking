import { enviarSacrificio } from "./server.js";
import { createClient } from "@retconned/kick-js";


const canal = "alonso-vc"; // <- Reemplaza esto

const sacrificables = new Set();

const client = createClient(canal, { readOnly: true });

console.log(`✅ Bot escuchando el canal de ${canal} (modo lectura)`);

// Espera mensajes
client.on("ChatMessage", message => {
  const usuario = message.sender.username;
  const contenido = message.content.toLowerCase();

  if (contenido.includes("yo me sacrifico")) {
    if (!sacrificables.has(usuario)) {
      sacrificables.add(usuario);
      console.log(`⚔️ ${usuario} se ha ofrecido como sacrificio.`);
    }
  }

if (contenido === "!sortear" && sacrificables.size > 0) {
  const lista = Array.from(sacrificables);
  const elegido = lista[Math.floor(Math.random() * lista.length)];
  console.log(`🔥 El elegido es: ${elegido}`);
  
  enviarSacrificio(elegido); // ENVÍA A LA WEB
  sacrificables.clear();
}

});
