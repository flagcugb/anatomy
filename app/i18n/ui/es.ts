import type { UiDictionary } from "../types";

export const ui: UiDictionary = {
  meta: {
    title: "Anatomy Atelier — Aprende anatomía como un artista",
    description:
      "Explora órganos en 3D con detalle médico — corazón, cerebro, pulmones, hígado, riñones, ojo, intestino, páncreas y piel — en un taller de anatomía interactivo.",
    ogTitle: "Anatomy Atelier — Aprende anatomía como un artista",
    ogDescription: "Aprende anatomía como un artista con especímenes 3D inmersivos y médicamente detallados.",
    imageAlt: "Un corazón anatómico flotando sobre un pedestal, junto al logotipo de Anatomy Atelier",
  },
  brand: { tagline: "Aprende anatomía como un artista", home: "Inicio de Anatomy Atelier" },
  nav: { explore: "Explorar", systems: "Sistemas", lessons: "Lecciones", library: "Biblioteca", notes: "Notas" },
  search: { placeholder: "Buscar órganos, temas…", empty: "Ningún órgano coincide con esa búsqueda." },
  profile: { open: "Abrir perfil del estudiante" },
  language: { label: "Idioma", choose: "Elige un idioma" },
  library: {
    title: "Biblioteca de órganos", open: "Abrir biblioteca de órganos", close: "Cerrar biblioteca",
    saved: "Órganos guardados", viewAll: "Ver todos los órganos",
    quoteLine1: "Aprender es", quoteLine2: "un acto de curiosidad.", quoteSign: "¡Sigue explorando!",
  },
  browse: {
    systemsLead: "Mira dónde se sitúa cada espécimen en el cuerpo.",
    libraryLead: "Todos los órganos que hay ahora en el atelier.",
  },
  bodyMap: {
    lead: "Haz clic en un órgano etiquetado para abrir su espécimen 3D. Algunos puntos son solo de orientación.",
    landmark: "Solo ubicación",
    noSpecimen: "Aún no hay espécimen 3D",
    viewSpecimen: "Ver espécimen 3D",
    labels: {
      brain: "Cerebro", eyeball: "Ojo", heart: "Corazón",
      rightLung: "Pulmón derecho", leftLung: "Pulmón izquierdo", liver: "Hígado",
      gallbladder: "Vesícula biliar", stomach: "Estómago", pancreas: "Páncreas",
      rightKidney: "Riñón derecho", leftKidney: "Riñón izquierdo",
      ascendingColon: "Colon ascendente", transverseColon: "Colon transverso", descendingColon: "Colon descendente",
      smallIntestine: "Intestino delgado", bladder: "Vejiga", skin: "Piel",
    },
    blurbs: {
      gallbladder: "Una bolsa pequeña que almacena la bilis del hígado y la vierte en el intestino.",
      stomach: "Un saco muscular que inicia la digestión química y mecánica de los alimentos.",
      bladder: "Un reservorio elástico que retiene la orina hasta que se vacía.",
    },
  },
  tools: {
    label: "Herramientas del visor 3D", rotate: "Girar", zoom: "Zoom", isolate: "Aislar",
    section: "Corte transversal", layers: "Capas", compare: "Comparar", reset: "Restablecer",
  },
  viewer: {
    title: "Visor interactivo: {organ}",
    canvas: "Modelo anatómico 3D interactivo. Arrastra para girar, desplaza para hacer zoom y haz clic en un punto para leer sobre esa estructura.",
    tip: "Consejo", tipDrag: "Arrastra para girar", tipScroll: "Desplaza para hacer zoom",
    tipClick: "Haz clic en un punto para saber más",
    loading: "Preparando {organ}", autoRotate: "Giro automático",
    caption: "Espécimen 3D · haz clic en un punto", structures: "Estructuras de este espécimen",
  },
  info: {
    kicker: "{organ}", keyFacts: "Datos clave", size: "Tamaño", weight: "Peso", daily: "A diario",
    location: "Ubicación", bloodSupply: "Irrigación", function: "Función",
    medical: "Importancia médica", didYouKnow: "¿Sabías que…?", viewLesson: "Ver lección",
    animate: "Animar", quiz: "Cuestionario", compare: "Comparar",
  },
  compare: {
    title: "Comparación de órganos", comparing: "Comparando", reference: "Referencia",
    primaryRole: "Función principal", scale: "Escala", vs: "vs.", close: "Cerrar comparación",
    pick: "Cambiar", choose: "Elige un órgano de referencia",
  },
  cards: {
    resources: "Recursos de aprendizaje: {organ}",
    microscopic: "Vista microscópica", compareOrgans: "Comparar órganos", functionAnimation: "Animación funcional",
    clinicalNotes: "Notas clínicas", whereItWorks: "Dónde actúa", commonConditions: "Enfermedades frecuentes",
    exploreTissue: "Explorar el tejido", openComparison: "Abrir comparación", playAnimation: "Reproducir animación",
    seeAll: "Ver todas", seeSystem: "Ver el sistema",
    systemOrgans: "Órganos de este sistema", seeOrgan: "Ver este órgano", organAria: "Ver el espécimen de {organ}",
    playAria: "Reproducir la animación funcional: {organ}", systemAria: "Ver dónde se sitúa {organ} en el cuerpo",
  },
  quiz: {
    start: "Empezar el cuestionario", find: "Encuentra", progress: "{current} de {total}",
    correct: "Correcto", wrong: "Casi", reveal: "Eso es: {label}", answer: "{label} está marcado en verde",
    done: "Cuestionario terminado", score: "{score} de {total} aciertos", retry: "Intentar de nuevo",
    exit: "Salir del cuestionario", hint: "Haz clic en el punto correspondiente del modelo",
  },
  lesson: { next: "Siguiente", prev: "Atrás" },
  animation: { playing: "Observando cómo trabaja el {organ}", stop: "Detener animación" },
  modal: {
    guided: "Descubrimiento guiado", close: "Cerrar", continueExploring: "Seguir explorando",
    quizTitle: "Cuestionario rápido: {organ}", motionTitle: "{organ} en movimiento",
    bodyTitle: "{organ} en el cuerpo", insideTitle: "Por dentro: {organ}",
    quizPrompt: "¿Qué afirmación describe mejor este órgano ({organ})?",
    quizA: "Desempeña una función especializada en el mantenimiento del cuerpo",
    quizB: "Funciona de forma completamente independiente",
    quizC: "Solo está activo durante el sueño",
    lessonBody:
      "Sigue las estructuras destacadas, gira el espécimen y relaciona la forma con la función. Este breve momento de estudio busca construir un modelo mental duradero.",
    systemIntro: "{location}. Sigue cómo se conecta {organ} con el resto del cuerpo.",
    system: "Sistema", primaryRole: "Función principal", bloodSupply: "Irrigación",
  },
};
