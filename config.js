// =============================================================
// CONFIGURACIÓN DE LA RULETA
// Este es el único sitio donde se definen los quesitos y el enlace
// de apoyo. Los espectadores solo ven la ruleta ya montada (index.html);
// nadie puede editar esto desde la web pública, porque ya no existe
// ningún panel para hacerlo ahí.
//
// Para cambiar los quesitos: edita el array WHEEL_OPTIONS a mano, o
// usa admin.html para generarlo visualmente y pega aquí el resultado.
// Después, sube este archivo a tu servidor (FTP, panel de tu hosting,
// GitHub, etc.) para que el cambio se aplique.
// =============================================================

const THRONE_WISHLIST_URL = "https://throne.com/tu-usuario";

const WHEEL_OPTIONS = [
  { texto: "Teclado",       enlace: "" },
  { texto: "Micrófono",     enlace: "" },
  { texto: "Vuelve a tirar", enlace: "" },
  { texto: "Webcam",        enlace: "" },
  { texto: "Auriculares",   enlace: "" },
  { texto: "Vuelve a tirar", enlace: "" },
  { texto: "Luz de aro",    enlace: "" },
  { texto: "Sorpresa",      enlace: "" },
];
