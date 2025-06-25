let preguntas = [];
let currentQuestionIndex = 0;
let usedComodines = {
  fifty: false,
  call: false,
  roulette: false,
  wizard: false
};

function actualizarPanelAdmin() {
  const p = preguntas[currentQuestionIndex];
  if (!p) return;

  document.getElementById('admin-question').textContent = `Pregunta ${currentQuestionIndex + 1}: ${p.question}`;

  const ul = document.getElementById('admin-answers');
  ul.innerHTML = '';
  p.answers.forEach((resp, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${resp}`;
    if (i === p.correct) li.classList.add('correct');
    ul.appendChild(li);
  });

  document.getElementById('admin-description').textContent = `📘 ${p.description}`;

  document.getElementById('comodin-fifty').textContent = usedComodines.fifty ? '✅' : '❌';
  document.getElementById('comodin-call').textContent = usedComodines.call ? '✅' : '❌';
  document.getElementById('comodin-roulette').textContent = usedComodines.roulette ? '✅' : '❌';
  document.getElementById('comodin-wizard').textContent = usedComodines.wizard ? '✅' : '❌';

  document.getElementById('admin-progress').textContent = `Pregunta ${currentQuestionIndex + 1} de ${preguntas.length}`;
}

// Escuchar mensajes desde el juego principal
  window.onload = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'solicitarEstado' }, '*');
    }
  };

  // Escuchar el estado que envía el juego
  window.addEventListener('message', (e) => {
    console.log('Mensaje recibido en admin:', e.data);
    if (e.data.type === 'update') {
      preguntas = e.data.preguntas;
      currentQuestionIndex = e.data.index;
      usedComodines = e.data.comodines;
      actualizarPanelAdmin(); // <-- asegúrate de tener esta función definida
    }
  });

  function regalarComodin(tipo) {
    window.opener.postMessage({
      type: 'regalarComodin',
      comodin: tipo
    }, '*');
  }





let recompensasAdmin = Array(15).fill('').map((_, i) => `${i + 1}`);

function actualizarRecompensas(nuevas) {
  recompensasAdmin = nuevas;
  window.opener.postMessage({
    type: 'actualizarRecompensas',
    recompensas: recompensasAdmin
  }, '*');
}

window.addEventListener('message', (e) => {
  if (e.data.type === 'recompensasActualizadas') {
    recompensasAdmin = e.data.recompensas;
    actualizarUIAdmin();
  }
});

function actualizarUIAdmin() {
  const container = document.getElementById('rewardsAdminContainer');
  container.innerHTML = '';

  recompensasAdmin.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'recompensa-item';

    const numero = document.createElement('span');
    numero.textContent = i + 1;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = r;
    input.dataset.index = i;

    input.addEventListener('input', (ev) => {
      const idx = ev.target.dataset.index;
      recompensasAdmin[idx] = ev.target.value;
      actualizarRecompensas(recompensasAdmin);
    });

    item.appendChild(numero);
    item.appendChild(input);
    container.appendChild(item);
  });
}

window.onload = () => {
  actualizarUIAdmin();
};
