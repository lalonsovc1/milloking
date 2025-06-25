// Variables y elementos
const questionTextEl = document.getElementById('question-text');
const answersEls = document.querySelectorAll('.answer');
const circles = document.querySelectorAll('.circle');
const resultEl = document.getElementById('result');
const callTimerEl = document.getElementById('call-timer');
const btnFifty = document.getElementById('fifty');
const btnCall = document.getElementById('call');
const btnRoulette = document.getElementById('roulette');
const btnWizard = document.getElementById('wizard');

let preguntas = [];

let currentQuestionIndex = 0;
let currentAnswerIndex = 0;  // respuestas mostradas
let isWriting = false;
let canStartWriting = false; // indica si ya cargó la pregunta pero espera space para empezar a escribir
let canShowAnswers = false;  // indica que terminó de escribir la pregunta y puede mostrar respuestas con space
let selectedAnswer = null;
let confirmed = false;
let usedComodines = {
  fifty: false, call: false, roulette: false, wizard: false
};




function resetEstadoPregunta() {
  currentAnswerIndex = 0;
  isWriting = false;
  canStartWriting = false;
  canShowAnswers = false;
  selectedAnswer = null;
  confirmed = false;
  answersEls.forEach(a => {
    a.style.opacity = '0';
    a.style.animation = '';  // Limpia cualquier animación previa

    a.classList.remove('selected', 'correct', 'incorrect', 'hidden', 'slide-left', 'slide-right');
    enviarEstadoAlAdmin();
    
  });
  questionTextEl.textContent = '';
  resultEl.classList.add('hidden');
  callTimerEl.style.display = 'none';
}

function escribirTexto(text, callback) {
  let i = 0;
  isWriting = true;
  questionTextEl.textContent = '';
  const interval = setInterval(() => {
    questionTextEl.textContent += text.charAt(i++);
    if (i >= text.length) {
      clearInterval(interval);
      isWriting = false;
      canShowAnswers = true;
      if (callback) callback();
    }
  }, 50);
}

function prepararPregunta() {
  resetEstadoPregunta();
  const p = preguntas[currentQuestionIndex];
  answersEls.forEach((el, i) => el.querySelector('span').textContent = p.answers[i]);
  // no escribe la pregunta todavía, solo indica que está lista para empezar
  canStartWriting = true;
}

function mostrarRespuesta(i) {
  if (i < answersEls.length) {
    answersEls[i].style.opacity = '1';
    answersEls[i].classList.add('visible');
    const el = answersEls[i];

    el.classList.remove('slide-left', 'slide-right'); // Limpiar por si acaso

    // Forzar reflow para reiniciar animación
    void el.offsetWidth;

    const animClass = i % 2 === 0 ? 'slide-left' : 'slide-right';

    el.classList.add(animClass);
    el.style.opacity = '1';
  }
}



function actualizarSeleccion() {
  answersEls.forEach((el, i) => {
    const selected = i === selectedAnswer;

    el.classList.remove('selected');

    // Forzar reflow para reiniciar animación
    void el.offsetWidth;

    if (selected) {
      el.classList.add('selected');

      // Si tiene slide-left o slide-right, reaplicamos ambas animaciones
      if (el.classList.contains('slide-left')) {
        el.style.animation = 'slideInLeft 0.5s ease forwards, pulsoSeleccion 1s ease-in-out infinite';
      } else if (el.classList.contains('slide-right')) {
        el.style.animation = 'slideInRight 0.5s ease forwards, pulsoSeleccion 1s ease-in-out infinite';
      } else {
        el.style.animation = 'pulsoSeleccion 1s ease-in-out infinite';
      }
    } else {
      el.style.animation = ''; // Detener animación si no está seleccionado
    }
  });
}


const audioCorrect = new Audio('correcto.mp3');
const audioIncorrect = new Audio('perder.mp3');
const audioCall = new Audio('jurasic.mp3')
audioIncorrect.volume = 0.2; // volumen al 30%
audioCorrect.currentTime = 0;
audioCall.volume = 0.2;

function manejarRespuesta() {
  const correcta = preguntas[currentQuestionIndex].correct;

  if (selectedAnswer === correcta) {
    audioCorrect.play();  // 🔊 reproducir sonido correcto
    answersEls[selectedAnswer].classList.add('correct');
    circles[currentQuestionIndex].classList.add('active');
    resultEl.classList.add('hidden'); // ocultar mensaje

    currentQuestionIndex++;
    if (currentQuestionIndex >= preguntas.length) {
      setTimeout(() => mostrarResultado(true), 1500);
    } else {
      setTimeout(() => prepararPregunta(), 1500);
    }
  } else {
    audioIncorrect.play();  // 🔊 reproducir sonido incorrecto
    answersEls[selectedAnswer].classList.add('incorrect');
    resultEl.classList.add('hidden'); // ocultar mensaje
    // si deseas igual puedes dejar que muestre el mensaje de fin
    setTimeout(() => mostrarResultado(false), 1500);
  }
}


const endImageEl = document.getElementById('end-image');
const finalScreen = document.getElementById('final-screen');

function mostrarResultado(gano) {
  canShowAnswers = false;
  canStartWriting = false;
  isWriting = false;

  resultEl.classList.remove('hidden');
  endImageEl.style.display = 'none';

  // Ocultar todos los comodines
  btnFifty.style.display = 'none';
  btnCall.style.display = 'none';
  btnRoulette.style.display = 'none';
  btnWizard.style.display = 'none';

  if (gano) {
    resultEl.textContent = "¡Felicidades! Has ganado el Concursillo.";
    resultEl.style.color = 'lime';
  } else {
    // Eliminar preguntas del DOM
    document.getElementById("pre1")?.remove();
    document.getElementById("pre2")?.remove();
    document.getElementById("pre3")?.remove();
    document.getElementById("pre4")?.remove();
    document.querySelector(".question")?.remove();
    document.querySelector(".progress")?.remove();

    resultEl.textContent = "";
    resultEl.style.color = 'red';
    endImageEl.style.display = 'block';

    // Mostrar la pantalla final
    finalScreen.classList.remove('hidden');

    // Quitar scroll si quieres pantalla fija
    document.body.style.overflow = 'hidden';
  }
}



window.addEventListener('keydown', (e) => {
  if (isWriting) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (canStartWriting) {
      // primer espacio, comienza a escribir la pregunta
      const p = preguntas[currentQuestionIndex];
      escribirTexto(p.question);
      canStartWriting = false;
      return;
    }

    if (canShowAnswers && !confirmed) {
      // mostrar respuestas una por una con space
      if (currentAnswerIndex < answersEls.length) {
        mostrarRespuesta(currentAnswerIndex++);
      }
      return;
    }
  }

  // Sólo permitir selección si ya se mostraron todas las respuestas
 if (currentAnswerIndex === answersEls.length && !confirmed && !isWriting) {

    if (['1','2','3','4'].includes(e.key)) {
      selectedAnswer = Number(e.key) - 1;
      actualizarSeleccion();
    } else if (e.key === 'Enter' && selectedAnswer !== null) {
      confirmed = true;
      manejarRespuesta();
    }
  }
});

fetch('preguntas.json')
  .then(res => res.json())
  .then(data => {
    preguntas = data;
    prepararPregunta();
    enviarEstadoAlAdmin();
  })
  .catch(err => {
    questionTextEl.textContent = "Error cargando preguntas.";
    console.error(err);
  });


btnFifty.addEventListener('click', () => {
  if (usedComodines.fifty || !canShowAnswers) return;
  usedComodines.fifty = true;
  btnFifty.style.opacity = '0.4';

  const correcta = preguntas[currentQuestionIndex].correct;

  // Indices de respuestas incorrectas
  const incorrectas = [];
  for (let i = 0; i < 4; i++) {
    if (i !== correcta) incorrectas.push(i);
  }

  // Mezclar aleatoriamente y tomar 2
  const ocultar = incorrectas.sort(() => Math.random() - 0.5).slice(0, 2);

  // Ocultar esas 2 respuestas
  ocultar.forEach(i => {
    answersEls[i].classList.add('hidden');
  });

  // 🧠 Iniciar modo sacrificio
  iniciarModoSacrificio(); // <- esta función la definimos abajo
});




let listaSacrificables = [];

function iniciarModoSacrificio() {
  const listaContenedor = document.getElementById('lista-sacrificables');
  const ul = document.getElementById('sacrificio-lista');
  ul.innerHTML = '';
  listaSacrificables = [];
  listaContenedor.style.display = 'block';

  const socket = new WebSocket("ws://" + location.host);

  socket.onmessage = (event) => {
    const data = event.data;

    if (data.startsWith("ADD:")) {
      const nombre = data.replace("ADD:", "").trim();
      if (!listaSacrificables.includes(nombre)) {
        listaSacrificables.push(nombre);

        const li = document.createElement('li');
        li.textContent = nombre;
        ul.appendChild(li);
      }
    }

    if (data.startsWith("WINNER:")) {
      const ganador = data.replace("WINNER:", "").trim();
      animarRuleta(ganador);
    }
  };
}

function animarRuleta(ganador) {
  const contenedor = document.getElementById('sacrificio-scroll'); // <– este sí tiene scroll
  const ul = document.getElementById('sacrificio-lista');
  ul.innerHTML = '';

  const ciclo = [...listaSacrificables, ...listaSacrificables, ...listaSacrificables];
  ciclo.forEach(nombre => {
    const li = document.createElement('li');
    li.textContent = nombre;
    ul.appendChild(li);
  });

  const altura = 30;
  const index = ciclo.lastIndexOf(ganador);
  const destino = index * altura;

  let pos = 0;
  const scroll = setInterval(() => {
    contenedor.scrollTop = pos;
    pos += 10;
    if (pos >= destino) {
      clearInterval(scroll);
      setTimeout(() => {
        document.getElementById('lista-sacrificables').style.display = 'none';
        mostrarGanador(ganador);
      }, 1000);
    }
  }, 20);
}


function mostrarGanador(nombre) {
  const msg = document.createElement('div');
  msg.style.position = 'absolute';
  msg.style.top = '40%';
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.background = 'red';
  msg.style.color = 'white';
  msg.style.padding = '20px 40px';
  msg.style.fontSize = '24px';
  msg.style.fontWeight = 'bold';
  msg.style.borderRadius = '20px';
  msg.style.boxShadow = '0 0 20px red';
  msg.style.zIndex = '9999';
  msg.style.textAlign = 'center';

  // 🧩 Contenido interno organizado en columnas
  msg.innerHTML = `
    <div style="font-size: 32px; margin-bottom: 10px;">${nombre.toUpperCase()}</div>
    <div style="font-size: 22px; margin-bottom: 15px;">🔥 ¡HA SIDO SACRIFICADO! 🔥</div>
    <img src="tu-gif-aqui.gif" style="width: 200px; border-radius: 10px;" />
  `;

  document.body.appendChild(msg);

  // ❌ Eliminar el mensaje luego de 5 segundos
  setTimeout(() => msg.remove(), 5000);
}



const callImage = document.getElementById('callImage');

btnCall.addEventListener('click', () => {
  callImage.style.display = 'none';
  if (usedComodines.call || !canShowAnswers) return;
  btnCall.style.opacity = '0.4';
  usedComodines.call = true;
  let tiempo = 45;

  // Mostrar temporizador
  callTimerEl.style.display = 'block';
  callTimerEl.textContent = `⏱️ Llamada: ${tiempo}s`;
  audioCall.play();


  callImage.style.display = 'block';

  const interval = setInterval(() => {
    tiempo--;
    callTimerEl.textContent = `⏱️ Llamada: ${tiempo}s`;
    if (tiempo <= 0) {
      clearInterval(interval);
      callTimerEl.style.display = 'none';
      callImage.style.display = 'none';
      callImage.innerHTML = ''; // Limpia el contenido si deseas ocultarlo después
    }
  }, 1000);
});



const magiaImage = document.getElementById('magiaImage');
const audioMagia = new Audio('magia.mp3')
audioIncorrect.volume = 0.2; // volumen al 30%
// Mago: pasa directamente a la siguiente pregunta después de un tiempo
btnWizard.addEventListener('click', () => {
  
  if (usedComodines.wizard || !canShowAnswers) return;
  usedComodines.wizard = true;
  btnWizard.style.opacity = '0.4';
  // Mostrar la imagen primero
  magiaImage.style.display = 'block';
  audioMagia.play();
  // Esperar unos segundos antes de pasar a la siguiente pregunta
  setTimeout(() => {
    magiaImage.style.display = 'none';
    circles[currentQuestionIndex].classList.add('active');
    currentQuestionIndex++;

    if (currentQuestionIndex >= preguntas.length) {
      mostrarResultado(true);
    } else {
      prepararPregunta();
    }
  }, 5000); // 3000 milisegundos = 3 segundos
});



window.addEventListener('DOMContentLoaded', () => {
  // Forzar el foco del navegador en OBS
  window.focus();
  document.body.tabIndex = 0;
  document.body.focus();

  // También escuchar clic para asegurar el foco (por si acaso)
  document.body.addEventListener('click', () => {
    document.body.focus();
  });
});

window.addEventListener('message', (event) => {
  const data = event.data;

  if (data.type === 'regalarComodin') {
    const comodin = data.comodin;
    if (usedComodines.hasOwnProperty(comodin)) {
      usedComodines[comodin] = false;

      const btn = {
        fifty: btnFifty,
        call: btnCall,
        roulette: btnRoulette,
        wizard: btnWizard
      }[comodin];

      if (btn) {
        btn.style.opacity = '1'; // Reactivar botón visualmente
      }

      console.log(`🎁 Comodín ${comodin} regalado desde admin`);
    }
  }

  // 👇 Nuevo: responder si el admin pide el estado
  if (data.type === 'solicitarEstado') {
    enviarEstadoAlAdmin(); // Esto vuelve a mandar el estado al panel admin
  }
});

window.onload = () => {
  // Enviar estado inicial al admin cuando el juego carga o se recarga
  enviarEstadoAlAdmin();
};




// --- Variables y elementos previos (no los repito, asumo que ya están) ---

// Añade este canvas en tu HTML, por ejemplo:
// <canvas id="rouletteCanvas" width="300" height="300" style="display:none; margin: 20px auto; display: block;"></canvas>

// Código de la ruleta:

const rouletteCanvas = document.getElementById('rouletteCanvas');
const ctx = rouletteCanvas.getContext('2d');
const rouletteOptions = [0, 1, 2, 3];
const rouletteColors = ['#ff4136', '#2ecc40', '#0074D9', '#ffdc00' ];

function drawRoulette(currentAngle) {
  const centerX = rouletteCanvas.width / 2;
  const centerY = rouletteCanvas.height / 2;
  const radius = 140;
  const slice = (2 * Math.PI) / rouletteOptions.length;

  ctx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);

  rouletteOptions.forEach((opt, i) => {
    // 🔁 Cambio clave aquí:
    const start = currentAngle - Math.PI / 2 + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, end);
    ctx.fillStyle = rouletteColors[i];
    ctx.fill();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(start + slice / 2);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(opt, radius / 2, 10);
    ctx.restore();
  });

  // Flecha indicadora (sin cambios)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius - 10);
  ctx.lineTo(centerX - 10, centerY - radius + 10);
  ctx.lineTo(centerX + 10, centerY - radius + 10);
  ctx.closePath();
  ctx.fill();
}


function spinRoulette(callback) {
  rouletteCanvas.style.display = 'block';
  let start = performance.now();
  const totalRotation = Math.random() * 6 + 6; // entre 6 y 12 vueltas
  const duration = 3000;

  function animate(now) {
    let elapsed = now - start;
    let progress = Math.min(elapsed / duration, 1);
    let ease = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
    rouletteAngle = ease * totalRotation * 2 * Math.PI;
    drawRoulette(rouletteAngle);

   if (progress < 1) {
  requestAnimationFrame(animate);
} else {
  const slice = (2 * Math.PI) / rouletteOptions.length;

  // Ajustamos sumando pi/2 en vez de restar para alinear con la flecha
  let adjustedAngle = (rouletteAngle + Math.PI / 2) % (2 * Math.PI);

  let index = Math.floor(adjustedAngle / slice);

  // Corregimos inversión si es necesario
  index = (rouletteOptions.length - index) % rouletteOptions.length;

  const result = rouletteOptions[index];

  console.log('Resultado de la ruleta:', result);

  setTimeout(() => {
    rouletteCanvas.style.display = 'none';
    callback(result);
  }, 2000);
    }
  }

  requestAnimationFrame(animate);
}


// Evento para el botón ruleta:

btnRoulette.addEventListener('click', () => {
  if (usedComodines.roulette || !canShowAnswers) return;
  usedComodines.roulette = true;
  btnRoulette.style.opacity = '0.4';

spinRoulette((cantidad) => {
  // cantidad será 0, 1, 2 o 3 y eso representa directamente cuántas respuestas eliminar
  let respuestasAEliminar = cantidad;

  if (respuestasAEliminar === 0) {
    // No elimina nada
    return;
  }

  const correcta = preguntas[currentQuestionIndex].correct;

  // Lista de respuestas incorrectas visibles
  const incorrectasVisibles = [];
  for (let i = 0; i < answersEls.length; i++) {
    if (i !== correcta && !answersEls[i].classList.contains('hidden')) {
      incorrectasVisibles.push(i);
    }
  }

  const numAEliminar = Math.min(respuestasAEliminar, incorrectasVisibles.length);

  // Mezclar con Fisher-Yates
  for (let i = incorrectasVisibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [incorrectasVisibles[i], incorrectasVisibles[j]] = [incorrectasVisibles[j], incorrectasVisibles[i]];
  }

  // Ocultar respuestas
  for (let i = 0; i < numAEliminar; i++) {
    answersEls[incorrectasVisibles[i]].classList.add('hidden');
  }
  });
});



function updateProgress(currentQuestionNumber) {
  circles.forEach((circle, index) => {
    circle.classList.remove('active-green', 'blink-gray');

    if (index < currentQuestionNumber - 1) {
      // Preguntas ya respondidas: verde fijo
      circle.classList.add('active-green');
    } else if (index === currentQuestionNumber - 1) {
      // Pregunta actual: parpadeo gris
      circle.classList.add('blink-gray');
    } else {
      // Preguntas futuras: gris neutro (por defecto)
      // No hay clase extra necesaria
    }
  });
}




function prepararPregunta() {
  resetEstadoPregunta();
  const p = preguntas[currentQuestionIndex];
  answersEls.forEach((el, i) => el.querySelector('span').textContent = p.answers[i]);
  canStartWriting = true;

  updateProgress(currentQuestionIndex + 1);
}


let adminWindow = null;

function abrirPanelAdmin() {
  if (adminWindow && !adminWindow.closed) {
    adminWindow.focus();
  } else {
    adminWindow = window.open('admin.html', '_blank', 'width=600,height=600');
  }
}



function enviarEstadoAlAdmin() {
  if (!adminWindow || adminWindow.closed) {
    console.warn("Admin window no está abierta");
    return;
  }

  const estado = {
    type: 'update',
    preguntas,
    index: currentQuestionIndex,
    comodines: usedComodines,
    preguntaVisible: questionTextEl.textContent,  // texto actual visible
  };

  adminWindow.postMessage(estado, '*');
  console.log("Estado enviado al admin:", estado);
}
function escribirTexto(text, callback) {
  let i = 0;
  isWriting = true;
  questionTextEl.textContent = '';
  const interval = setInterval(() => {
    questionTextEl.textContent += text.charAt(i++);
    enviarEstadoAlAdmin(); // <-- envía actualización en cada paso (puedes ponerlo con throttling)
    if (i >= text.length) {
      clearInterval(interval);
      isWriting = false;
      canShowAnswers = true;
      if (callback) callback();
    }
  }, 50);
}


function prepararPregunta() {
  resetEstadoPregunta();
  const p = preguntas[currentQuestionIndex];
  answersEls.forEach((el, i) => el.querySelector('span').textContent = p.answers[i]);
  canStartWriting = true;

  updateProgress(currentQuestionIndex + 1);

  enviarEstadoAlAdmin();  // <-- aquí mandas el estado para actualizar admin
}








 const progressPanel = document.getElementById('progressPanel');
  const toggleBtn = document.getElementById('toggleProgressBtn');
  const progressContainer = progressPanel.querySelector('.progress-vertical');

  // Inicializa 15 preguntas con recompensas default
  let recompensas = Array(15).fill('').map((_, i) => ` ${i + 1}`);

  // Función para renderizar la lista vertical con recompensas editables
 function renderProgress() {
  progressContainer.innerHTML = '';
  recompensas.forEach((text, i) => {
    const div = document.createElement('div');
    div.className = 'progress-item';
    div.style.animationDelay = `${i * 0.05}s`; // ← animación escalonada

    const circle = document.createElement('div');
    circle.className = 'circle1';
    circle.textContent = i + 1;

    const reward = document.createElement('div');
    reward.className = 'reward';
    reward.contentEditable = true;
    reward.textContent = text;

    reward.addEventListener('input', () => {
      recompensas[i] = reward.textContent.trim();
      enviarRecompensasAlAdmin();
    });

    div.appendChild(circle);
    div.appendChild(reward);
    progressContainer.appendChild(div);
  });
}



// ⬇️ Agrega esto justo aquí ⬇️
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case '5':
      if (progressPanel.style.display === 'none' || progressPanel.style.display === '') {
        progressPanel.style.display = 'block';
        toggleBtn.textContent = 'Ocultar Progreso';
      } else {
        progressPanel.style.display = 'none';
        toggleBtn.textContent = 'Mostrar Progreso';
      }
      break;
    case '6':
      abrirPanelAdmin();
      break;
  }
});

  // Mensajes desde admin para actualizar recompensas
  window.addEventListener('message', (e) => {
    if (e.data.type === 'actualizarRecompensas' && Array.isArray(e.data.recompensas)) {
      recompensas = e.data.recompensas;
      renderProgress();
    }
  });

  // Envía recompensas actuales al admin (si está abierto)
  function enviarRecompensasAlAdmin() {
    if (window.adminWindow && !window.adminWindow.closed) {
      window.adminWindow.postMessage({
        type: 'recompensasActualizadas',
        recompensas
      }, '*');
    }
  }

  renderProgress();

  function agregarProgreso(numero, recompensa, delay = 0) {
  const container = document.querySelector('.progress-vertical');
  const item = document.createElement('div');
  item.className = 'progress-item';
  item.style.animationDelay = `${delay}s`; // ⏱️ animación escalonada opcional

  item.innerHTML = `
    <div class="circle">${numero}</div>
    <div class="reward" contenteditable="true">${recompensa}</div>
  `;

  container.appendChild(item);
}
