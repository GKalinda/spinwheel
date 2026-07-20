// =============================================================
// RULETA PREMIUM — lógica pública (dibujo + giro)
//
// Este archivo NO contiene ningún editor de opciones. Los quesitos
// y el enlace de apoyo vienen de config.js, que se sube al servidor
// aparte y no es accesible ni editable desde esta página.
// =============================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultado = document.getElementById("resultado");
const girarBtn = document.getElementById("girarBtn");
const btnPagar = document.getElementById("btn-pagar");

let ruletaGirando = false;
let rotacionActual = 0;

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
  const slices = WHEEL_OPTIONS.length;
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
    // fillText no interpreta HTML/JS: es seguro incluso con texto arbitrario
    ctx.fillText(WHEEL_OPTIONS[i].texto, centro - 20, 0);
    ctx.restore();
  }
}

function esOpcionDeReintento(texto) {
  const t = texto.toLowerCase();
  return t.includes("vuelve a tirar") || t.includes("otra vez");
}

function esUrlSegura(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

function mostrarEnlaceApoyo(opcionGanadora) {
  const enlaceEspecifico = opcionGanadora.enlace && opcionGanadora.enlace.trim();
  const destino = esUrlSegura(enlaceEspecifico) ? enlaceEspecifico : THRONE_WISHLIST_URL;

  btnPagar.hidden = false;
  btnPagar.onclick = () => {
    // Se abre en una pestaña nueva: la persona decide libremente
    // si visita el enlace, si regala algo o si simplemente lo cierra.
    window.open(destino, "_blank", "noopener,noreferrer");
  };
}

function girarRuleta() {
  if (ruletaGirando || WHEEL_OPTIONS.length === 0) return;

  ruletaGirando = true;
  girarBtn.disabled = true;
  btnPagar.hidden = true;
  resultado.className = "";
  resultado.textContent = "Girando...";

  const slices = WHEEL_OPTIONS.length;
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
    const opcionGanadora = WHEEL_OPTIONS[indiceGanador];

    if (esOpcionDeReintento(opcionGanadora.texto)) {
      resultado.textContent = "¡Tira de nuevo! 🔄";
      resultado.className = "resultado-reintentar";
    } else {
      resultado.textContent = `Resultado: ${opcionGanadora.texto}`;
      resultado.className = "resultado-premio";
      mostrarEnlaceApoyo(opcionGanadora);
    }

    ruletaGirando = false;
    girarBtn.disabled = false;
  }, 4050);
}

// --- Inicialización ---
dibujarRuleta();

canvas.addEventListener('click', () => {
  if (!ruletaGirando) girarRuleta();
});
