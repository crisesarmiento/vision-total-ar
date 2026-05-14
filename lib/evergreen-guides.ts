export type EvergreenGuideLink = {
  href: string;
  label: string;
  description?: string;
};

export type EvergreenGuideSection = {
  title: string;
  body: string[];
};

export type EvergreenGuide = {
  slug: string;
  path: `/guias/${string}`;
  navLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  updatedLabel: string;
  primaryCta: EvergreenGuideLink;
  secondaryCta: EvergreenGuideLink;
  relatedLinks: EvergreenGuideLink[];
  sections: EvergreenGuideSection[];
};

export const EVERGREEN_GUIDES_INDEX_PATH = "/guias";

export const EVERGREEN_GUIDES: EvergreenGuide[] = [
  {
    slug: "seguir-ultimo-momento-argentina",
    path: "/guias/seguir-ultimo-momento-argentina",
    navLabel: "Último momento",
    title: "Cómo seguir el último momento en Argentina con varias señales",
    description:
      "Guía práctica para monitorear noticias de último momento en Argentina con señales en paralelo, categorías de canales y una grilla multiview.",
    eyebrow: "Guía de monitoreo",
    headline: "Seguir el último momento exige mirar más de una señal",
    intro:
      "Cuando una noticia cambia rápido, una sola transmisión puede mostrar apenas una parte del contexto. Vision AR ayuda a observar señales argentinas en paralelo para comparar tiempos de reacción, móviles, placas, entrevistas y prioridades de agenda sin saltar entre pestañas.",
    updatedLabel: "Guía evergreen para monitoreo de noticias argentinas.",
    primaryCta: {
      href: "/",
      label: "Abrir dashboard",
      description: "Entrar a la grilla multiview principal.",
    },
    secondaryCta: {
      href: "/canales/categoria/noticias",
      label: "Ver noticias",
      description: "Explorar señales de noticias argentinas.",
    },
    relatedLinks: [
      {
        href: "/canales/categoria/noticias",
        label: "Canales de noticias",
        description: "Señales nacionales para coberturas en vivo.",
      },
      {
        href: "/canales/categoria/tv",
        label: "TV argentina",
        description: "Señales generalistas y regionales para ampliar contexto.",
      },
      {
        href: "/canales/tn",
        label: "TN en Vision AR",
        description: "Ficha pública de una señal de noticias disponible.",
      },
    ],
    sections: [
      {
        title: "Empezar por una grilla clara",
        body: [
          "Para una cobertura de último momento conviene abrir una grilla simple, como 2x2 o 3x3, y reservar cada pantalla para una fuente con rol distinto: una señal de noticias nacional, una señal con móviles frecuentes, una señal de streaming y una señal de TV o regional cuando el tema lo justifique.",
          "La meta no es decidir de inmediato cuál fuente tiene razón, sino detectar qué información se repite, qué detalles aparecen solo en una señal y qué datos todavía son inciertos.",
        ],
      },
      {
        title: "Comparar ritmo y contexto",
        body: [
          "En eventos en desarrollo, el valor del multiview está en ver cambios de ritmo: cuándo una señal interrumpe programación, cuándo suma un móvil, cuándo actualiza una placa y cuándo espera confirmación antes de avanzar.",
          "Vision AR no reemplaza la verificación periodística ni produce las transmisiones. La plataforma organiza accesos para que el usuario pueda comparar cobertura de fuentes de terceros desde una experiencia más ordenada.",
        ],
      },
      {
        title: "Usar categorías para no perder foco",
        body: [
          "La categoría de noticias sirve como punto de partida para señales enfocadas en agenda nacional. Las categorías de streaming y TV argentina pueden sumar reacción social, conversación en vivo o mirada territorial.",
          "Si la noticia cambia de tema, por ejemplo de política a deportes o de una cobertura nacional a un hecho regional, la grilla puede ajustarse sin abandonar el dashboard.",
        ],
      },
    ],
  },
  {
    slug: "comparar-cobertura-en-vivo",
    path: "/guias/comparar-cobertura-en-vivo",
    navLabel: "Comparar cobertura",
    title: "Cómo comparar cobertura en vivo entre canales argentinos",
    description:
      "Criterios para comparar cobertura en vivo entre canales argentinos sin perder neutralidad: agenda, fuentes, ritmo, contexto y señales relacionadas.",
    eyebrow: "Guía de comparación",
    headline: "Comparar cobertura es mirar diferencias concretas, no solo opiniones",
    intro:
      "Dos señales pueden cubrir el mismo hecho con prioridades, tiempos y recursos distintos. Una comparación útil separa lo verificable de la interpretación: qué muestran, qué omiten, qué fuentes citan y cómo actualizan la información durante la transmisión.",
    updatedLabel: "Guía evergreen para comparación neutral de coberturas.",
    primaryCta: {
      href: "/",
      label: "Abrir dashboard",
      description: "Comparar señales en paralelo.",
    },
    secondaryCta: {
      href: "/canales",
      label: "Ver catálogo",
      description: "Explorar el directorio público de canales.",
    },
    relatedLinks: [
      {
        href: "/canales",
        label: "Directorio de canales",
        description: "Todas las señales públicas organizadas por categoría.",
      },
      {
        href: "/canales/categoria/streaming",
        label: "Streaming argentino",
        description: "Señales digitales para conversación y reacción en vivo.",
      },
      {
        href: "/canales/categoria/noticias",
        label: "Noticias argentinas",
        description: "Señales de actualidad para seguimiento continuo.",
      },
    ],
    sections: [
      {
        title: "Definir qué se está comparando",
        body: [
          "Antes de abrir muchas pantallas, conviene elegir una pregunta simple: qué señal actualiza primero, cuál aporta contexto local, cuál entrevista protagonistas o cuál mantiene una explicación más sostenida.",
          "Esa pregunta evita que la comparación se convierta en ruido. Vision AR permite cambiar señales, pero la grilla funciona mejor cuando cada pantalla tiene un propósito claro.",
        ],
      },
      {
        title: "Observar señales de cobertura",
        body: [
          "Los elementos comparables suelen ser visibles: placas, móviles, zócalos, entrevistas, conferencias, archivo, mapas, datos oficiales y presencia de especialistas. Esos elementos ayudan a entender cómo cada medio construye la cobertura.",
          "También importa la ausencia de información. Si una señal espera confirmación o decide no mostrar una imagen, esa decisión puede ser tan relevante como una actualización rápida.",
        ],
      },
      {
        title: "Mantener una lectura neutral",
        body: [
          "Vision AR no clasifica canales por postura política ni recomienda una interpretación editorial. La herramienta está pensada para que el usuario compare señales en paralelo y saque conclusiones propias.",
          "Las marcas, transmisiones y contenidos audiovisuales pertenecen a sus respectivos proveedores. Las páginas de Vision AR agregan contexto de uso del producto, no cobertura periodística propia.",
        ],
      },
    ],
  },
  {
    slug: "combinaciones-publicas",
    path: "/guias/combinaciones-publicas",
    navLabel: "Combinaciones públicas",
    title: "Cómo usar combinaciones públicas para monitoreo de noticias",
    description:
      "Guía sobre combinaciones públicas en Vision AR: cuándo sirven, cómo compartirlas y qué límites mantienen frente a señales de terceros.",
    eyebrow: "Guía de combinaciones",
    headline: "Una combinación pública convierte una grilla útil en un enlace compartible",
    intro:
      "Las combinaciones públicas permiten guardar una selección de señales y abrirla después desde una URL estable. Son útiles para equipos, lectores o usuarios que quieren volver a una misma grilla de monitoreo sin reconstruirla cada vez.",
    updatedLabel: "Guía evergreen para uso responsable de combinaciones públicas.",
    primaryCta: {
      href: "/",
      label: "Crear combinación",
      description: "Abrir el dashboard y armar una grilla.",
    },
    secondaryCta: {
      href: "/canales",
      label: "Elegir señales",
      description: "Revisar el catálogo público antes de armar la grilla.",
    },
    relatedLinks: [
      {
        href: "/canales",
        label: "Catálogo de señales",
        description: "Punto de partida para elegir canales.",
      },
      {
        href: "/canales/categoria/noticias",
        label: "Noticias",
        description: "Categoría frecuente para combinaciones de monitoreo.",
      },
      {
        href: "/terminos",
        label: "Términos de uso",
        description: "Límites públicos sobre señales y combinaciones.",
      },
    ],
    sections: [
      {
        title: "Cuándo conviene compartir una grilla",
        body: [
          "Una combinación pública sirve cuando la selección de señales tiene valor por sí misma: seguir una elección, comparar cobertura de un hecho nacional, monitorear señales deportivas durante una conferencia o reunir fuentes de streaming alrededor de un tema.",
          "La combinación debe ayudar a otra persona a entender por qué esas señales están juntas. Un nombre claro y una descripción breve evitan que el enlace parezca una lista sin contexto.",
        ],
      },
      {
        title: "Qué muestra Vision AR y qué no",
        body: [
          "Vision AR puede guardar la organización de la grilla, la visibilidad pública y los enlaces necesarios para abrirla. Eso no convierte a Vision AR en propietaria de los streams ni cambia las condiciones de cada proveedor.",
          "Si una señal deja de estar disponible, cambia su embed o restringe acceso, la combinación puede perder una pantalla aunque el enlace público siga existiendo.",
        ],
      },
      {
        title: "Buenas prácticas de publicación",
        body: [
          "Usá combinaciones públicas para curadurías útiles, no para suplantar medios, publicar spam, prometer disponibilidad permanente o sugerir acuerdos comerciales que no existen.",
          "Cuando una combinación apunta a seguimiento informativo, es mejor incluir señales con roles diferentes para que la grilla aporte comparación real y no repita cuatro versiones del mismo ángulo.",
        ],
      },
    ],
  },
  {
    slug: "uso-responsable-fuentes-en-vivo",
    path: "/guias/uso-responsable-fuentes-en-vivo",
    navLabel: "Uso responsable",
    title: "Uso responsable de fuentes en vivo y señales de terceros",
    description:
      "Criterios públicos para usar Vision AR de forma responsable con fuentes en vivo, transmisiones de terceros, contexto y disponibilidad de señales.",
    eyebrow: "Guía responsable",
    headline: "El monitoreo en vivo necesita contexto, límites y respeto por las fuentes",
    intro:
      "Ver varias señales en paralelo puede mejorar el contexto, pero también exige cuidado. Las transmisiones pertenecen a terceros, las coberturas pueden cambiar y la velocidad del vivo no reemplaza la verificación de datos sensibles.",
    updatedLabel: "Guía evergreen sobre fuentes, terceros y uso público responsable.",
    primaryCta: {
      href: "/",
      label: "Abrir dashboard",
      description: "Entrar a la experiencia multiview principal.",
    },
    secondaryCta: {
      href: "/politica-editorial",
      label: "Leer política editorial",
      description: "Revisar criterios públicos de contenido.",
    },
    relatedLinks: [
      {
        href: "/canales",
        label: "Catálogo de señales",
        description: "Explorar fuentes públicas organizadas por categoría.",
      },
      {
        href: "/politica-editorial",
        label: "Política editorial",
        description: "Criterios sobre contenido original y señales de terceros.",
      },
      {
        href: "/acerca-de",
        label: "Acerca de Vision AR",
        description: "Qué hace la plataforma y qué no hace.",
      },
      {
        href: "/privacidad",
        label: "Privacidad",
        description: "Información pública sobre datos y analítica.",
      },
    ],
    sections: [
      {
        title: "Reconocer la propiedad de terceros",
        body: [
          "Los nombres, marcas, logos, reproductores, imágenes y transmisiones pertenecen a sus respectivos canales, plataformas o titulares de derechos. Vision AR organiza una experiencia de visualización y comparación, pero no produce esos contenidos.",
          "Esa distinción es importante para usuarios, buscadores y futuras superficies de monetización: una página útil debe aportar contexto original sin apropiarse de la señal que muestra o enlaza.",
        ],
      },
      {
        title: "Evitar conclusiones apresuradas",
        body: [
          "El vivo puede mostrar información incompleta, placas provisorias o testimonios todavía no verificados. Mirar varias señales ayuda a detectar coincidencias y diferencias, pero no convierte una versión temprana en confirmación definitiva.",
          "Para temas sensibles, conviene esperar fuentes primarias, comunicados oficiales o actualizaciones consistentes antes de compartir conclusiones.",
        ],
      },
      {
        title: "Mantener el uso dentro del producto",
        body: [
          "Vision AR está diseñado para abrir el dashboard, organizar señales y compartir combinaciones públicas cuando tienen contexto. No debe usarse para redistribuir transmisiones fuera de sus condiciones, automatizar abuso o confundir controles de terceros.",
          "Si una fuente cambia sus reglas o disponibilidad, Vision AR puede ajustar la navegación pública, retirar referencias o degradar una superficie para mantener cumplimiento y estabilidad.",
        ],
      },
    ],
  },
];

export function getEvergreenGuides() {
  return EVERGREEN_GUIDES;
}

export function getEvergreenGuideBySlug(slug: string) {
  return EVERGREEN_GUIDES.find((guide) => guide.slug === slug);
}

export function getEvergreenGuideRoute(guide: EvergreenGuide) {
  return guide.path;
}

export function getEvergreenGuidePaths() {
  return EVERGREEN_GUIDES.map(getEvergreenGuideRoute);
}

export function getEvergreenGuideSitemapPaths() {
  return [EVERGREEN_GUIDES_INDEX_PATH, ...getEvergreenGuidePaths()];
}
