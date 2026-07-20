const THRONE_WISHLIST_URL = "https://throne.com/tu-usuario";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultado = document.getElementById("resultado");
const girarBtn = document.getElementById("girarBtn");
const listaOpcionesUI = document.getElementById("lista-opciones");
const btnPagar = document.getElementById("btn-pagar");

let ruletaGirando = false;
let rotacionActual = 0;

// Opciones de la ruleta. Puedes editarlas desde el panel lateral.
let opciones = [
  "1€", "4€", "10€", "1€", "Vuelve a tirar",
  "4€", "1€", "10€", "4€", "Vuelve a tirar", "1€"
];

// Paleta oscura + dorado, a juego con el resto del diseño
const colores = [
  "#1b1e2c", "#c9a227", "#2d1f42", "#e6c766",
  "#132a24", "#8b7cf6", "#1b1e2c", "#c9a227",
  "#2d1f42", "#37c98f", "#1b1e2c", "#e6c766"
];

function esColorClaro(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.55;
}

function ajustarColor(color, cantidad) {
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);
  r = Math.max(0, Math.min(255, r + cantidad));
  g = Math.max(0, Math.min(255, g + cantidad));
  b = Math.max(0, Math.min(255, b + cantidad));
  return `rgb(${r}, ${g}, ${b})`;
}

function dibujarRuleta() {
  const slices = opciones.length;
  if (slices === 0) return;
  ctx.clearRect(0, 0, 380, 380);

  const centro = 190;

  for (let i = 0; i < slices; i++) {
    const colorBase = colores[i % colores.length];

    ctx.beginPath();
    ctx.moveTo(centro, centro);
    const gradient = ctx.createRadialGradient(centro, centro, 0, centro, centro, centro);
    gradient.addColorStop(0, ajustarColor(colorBase, 18));
    gradient.addColorStop(1, colorBase);
    ctx.fillStyle = gradient;
    ctx.arc(centro, centro, centro, (i * 2 * Math.PI) / slices, ((i + 1) * 2 * Math.PI) / slices);
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.stroke();

    ctx.save();
    ctx.translate(centro, centro);
    ctx.rotate(((i + 0.5) * 2 * Math.PI) / slices);
    ctx.fillStyle = esColorClaro(colorBase) ? "#201704" : "#f4efe2";

    const fontSize = slices > 15 ? 12 : 15;
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    // fillText no interpreta HTML/JS: es seguro incluso con texto arbitrario del usuario
    ctx.fillText(opciones[i], centro - 20, 0);
    ctx.restore();
  }
}

function mostrarEnlaceApoyo() {
  btnPagar.hidden = false;
  btnPagar.onclick = () => {
    // Se abre en una pestaña nueva: la persona decide libremente
    // si visita la lista, si regala algo o si simplemente la cierra.
    window.open(THRONE_WISHLIST_URL, "_blank", "noopener,noreferrer");
  };
}

function girarRuleta() {
  if (ruletaGirando || opciones.length === 0) return;

  ruletaGirando = true;
  girarBtn.disabled = true;
  btnPagar.hidden = true;
  resultado.className = "";
  resultado.textContent = "Girando...";

  const slices = opciones.length;
  const indiceGanador = Math.floor(Math.random() * slices);
  const vueltasExtras = (Math.floor(Math.random() * 4) + 5) * 360;

  const sliceAngle = 360 / slices;
  const anguloCentroPremio = (indiceGanador * sliceAngle) + (sliceAngle / 2);
  const desfaseAleatorio = (Math.random() * (sliceAngle * 0.8)) - (sliceAngle * 0.4);
  const baseRotacion = 270 - anguloCentroPremio + desfaseAleatorio;

  const moduloActual = rotacionActual % 360;
  let diferenciaRotacion = baseRotacion - moduloActual;
  if (diferenciaRotacion < 0) diferenciaRotacion += 360;

  const rotacionTotal = rotacionActual + vueltasExtras + diferenciaRotacion;

  canvas.style.transition = "transform 4s cubic-bezier(0.2, 0.8, 0.1, 1)";
  canvas.style.transform = `rotate(${rotacionTotal}deg)`;
  rotacionActual = rotacionTotal;

  setTimeout(() => {
    const textoGanador = opciones[indiceGanador];
    const textoNormalizado = textoGanador.toLowerCase();

    if (textoNormalizado.includes("vuelve a tirar") || textoNormalizado.includes("otra vez")) {
      resultado.textContent = "¡Tira de nuevo! 🔄";
      resultado.className = "resultado-reintentar";
    } else {
      resultado.textContent = `Resultado: ${textoGanador}`;
      resultado.className = "resultado-premio";
    }

    // El enlace de apoyo se muestra siempre igual, salga lo que salga:
    // no está condicionado por el resultado de la ruleta.
    mostrarEnlaceApoyo();

    ruletaGirando = false;
    girarBtn.disabled = false;
  }, 4050);
}

// --- Panel lateral ---
function toggleMenu() {
  const panel = document.getElementById('panel-config');
  const overlay = document.getElementById('overlay');
  const abierto = panel.classList.toggle('abierto');
  overlay.classList.toggle('activo');
  panel.setAttribute('aria-hidden', String(!abierto));
}

// --- Editor de opciones (construido con la API del DOM, sin innerHTML
//     con datos del usuario, para evitar inyección de HTML/JS) ---
function renderizarLista() {
  listaOpcionesUI.innerHTML = "";

  opciones.forEach((opcion, index) => {
    const li = document.createElement("li");
    li.className = "item-opcion";

    const input = document.createElement("input");
    input.type = "text";
    input.value = opcion;
    input.maxLength = 24;
    input.setAttribute("aria-label", `Opción ${index + 1}`);
    input.addEventListener("input", (e) => {
      opciones[index] = e.target.value;
      dibujarRuleta();
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn-eliminar";
    btnEliminar.type = "button";
    btnEliminar.textContent = "×";
    btnEliminar.setAttribute("aria-label", `Eliminar opción ${index + 1}`);
    btnEliminar.addEventListener("click", () => eliminarOpcion(index));

    li.appendChild(input);
    li.appendChild(btnEliminar);
    listaOpcionesUI.appendChild(li);
  });

  dibujarRuleta();
}

function eliminarOpcion(index) {
  if (opciones.length > 2) {
    opciones.splice(index, 1);
    renderizarLista();
  } else {
    resultado.className = "";
    resultado.textContent = "La ruleta necesita al menos 2 opciones";
  }
}

function añadirOpcion() {
  if (opciones.length >= 20) {
    resultado.className = "";
    resultado.textContent = "Máximo 20 opciones";
    return;
  }
  opciones.push("Nueva");
  renderizarLista();
  listaOpcionesUI.scrollTop = listaOpcionesUI.scrollHeight;
}

// --- Inicialización ---
renderizarLista();

canvas.addEventListener('click', () => {
  if (!ruletaGirando) girarRuleta();
});
