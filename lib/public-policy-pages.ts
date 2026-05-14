export type PublicPolicyPageSlug =
  | "acerca-de"
  | "contacto"
  | "privacidad"
  | "terminos"
  | "politica-editorial";

export type PublicPolicySection = {
  title: string;
  body: string[];
};

export type PublicPolicyPage = {
  slug: PublicPolicyPageSlug;
  path: `/${PublicPolicyPageSlug}`;
  navLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  updatedLabel: string;
  sections: PublicPolicySection[];
};

export const PUBLIC_POLICY_PAGES: PublicPolicyPage[] = [
  {
    slug: "acerca-de",
    path: "/acerca-de",
    navLabel: "Acerca de",
    title: "Acerca de Vision AR",
    description:
      "Conocé qué es Vision AR, cómo funciona como interfaz multiview y cuál es su relación con las señales argentinas de terceros.",
    eyebrow: "Confianza",
    headline: "Vision AR organiza señales argentinas para monitoreo multiview",
    intro:
      "Vision AR es una interfaz pública para seguir varias señales argentinas en vivo desde una sola pantalla. Su objetivo es ayudar a comparar coberturas, tonos y tiempos de reacción sin reemplazar a los medios que producen cada transmisión.",
    updatedLabel: "Actualizado para preparación de monetización y búsqueda.",
    sections: [
      {
        title: "Qué hace Vision AR",
        body: [
          "El producto reúne accesos a señales públicas y embeds provistos por terceros para facilitar una experiencia de monitoreo multiview. La grilla, las combinaciones y las páginas de descubrimiento son parte de Vision AR; las transmisiones no lo son.",
          "La experiencia está pensada para personas que quieren comparar cobertura de noticias, streaming, TV y deportes argentinos en tiempo real.",
        ],
      },
      {
        title: "Propiedad de contenidos",
        body: [
          "Los streams, marcas, nombres de canales, logos, piezas audiovisuales y broadcasts pertenecen a sus respectivos proveedores, canales o titulares de derechos.",
          "Vision AR no afirma propiedad editorial sobre esas transmisiones ni modifica el contenido emitido por cada fuente.",
        ],
      },
      {
        title: "Alcance editorial",
        body: [
          "Vision AR no prioriza una mirada editorial propia sobre las señales: ofrece herramientas para que el usuario observe varias fuentes en paralelo.",
          "Las páginas públicas pueden incluir contexto original sobre el uso del producto, pero no deben presentarse como cobertura periodística propia de Vision AR.",
        ],
      },
    ],
  },
  {
    slug: "contacto",
    path: "/contacto",
    navLabel: "Contacto",
    title: "Contacto",
    description:
      "Canales públicos para reportar problemas, enviar feedback o informar asuntos sensibles relacionados con Vision AR.",
    eyebrow: "Contacto público",
    headline: "Feedback y reportes para Vision AR",
    intro:
      "Vision AR usa canales públicos y seguros para recibir comentarios sin publicar emails privados, cuentas internas, direcciones legales o enlaces a dashboards de operación.",
    updatedLabel: "Contacto público mediante GitHub; reportes sensibles por SECURITY.md.",
    sections: [
      {
        title: "Feedback general",
        body: [
          "Para errores no sensibles, pedidos de mejora o comentarios generales, usá GitHub Issues en el repositorio público de Vision AR: https://github.com/crisesarmiento/vision-total-ar/issues",
          "Antes de abrir un issue, revisá si ya existe uno similar para mantener la discusión agrupada.",
        ],
      },
      {
        title: "Reportes sensibles",
        body: [
          "No publiques vulnerabilidades, credenciales, datos privados, tokens, URLs internas ni detalles explotables en issues públicos.",
          "Para asuntos de seguridad o privacidad, seguí SECURITY.md y usá el canal privado de reporte de vulnerabilidades de GitHub cuando esté disponible.",
        ],
      },
      {
        title: "Derechos y señales de terceros",
        body: [
          "Si una fuente cambia su disponibilidad, marca, embed o condiciones de uso, Vision AR puede actualizar o retirar referencias públicas para mantener una experiencia correcta.",
          "Los reclamos sobre contenido transmitido por terceros deben dirigirse al canal o proveedor responsable de esa transmisión.",
        ],
      },
    ],
  },
  {
    slug: "privacidad",
    path: "/privacidad",
    navLabel: "Privacidad",
    title: "Política de privacidad",
    description:
      "Información pública sobre datos, analítica, cookies, publicidad futura y límites de privacidad en Vision AR.",
    eyebrow: "Privacidad",
    headline: "Privacidad, analítica y publicidad en Vision AR",
    intro:
      "Esta página describe, a nivel público, cómo Vision AR trata datos de uso, analítica y tecnologías de terceros. No incluye valores privados de entorno, IDs de cuentas ni configuraciones internas.",
    updatedLabel: "Preparada para analítica actual y publicidad futura.",
    sections: [
      {
        title: "Datos de uso y cuenta",
        body: [
          "Vision AR puede usar datos necesarios para operar la experiencia, como sesión de usuario, preferencias, combinaciones guardadas, favoritos y señales seleccionadas.",
          "Las páginas públicas no deben exponer datos privados de usuarios, combinaciones privadas, credenciales, rutas internas ni valores de configuración.",
        ],
      },
      {
        title: "Analítica",
        body: [
          "La analítica pública de Vision AR está gobernada por la variable NEXT_PUBLIC_ENABLE_WEB_ANALYTICS. Cuando su valor es false, la analítica web de Vercel y los eventos asociados deben permanecer deshabilitados.",
          "Cuando la analítica esté habilitada en un entorno, se usa para entender actividad agregada del producto, rendimiento de páginas públicas y activación, sin documentar ni publicar identificadores privados de proveedor.",
        ],
      },
      {
        title: "Cookies, identificadores y anuncios",
        body: [
          "Vision AR no debe incluir IDs de AdSense, tokens de verificación, URLs privadas de cuenta ni valores de dashboard en el repositorio público.",
          "Si en el futuro se habilitan anuncios, Google y otros proveedores externos podrán usar cookies, identificadores del navegador, web beacons, direcciones IP u otras tecnologías similares para servir, limitar, medir o personalizar anuncios.",
          "Google y sus socios pueden mostrar anuncios basados en visitas anteriores a Vision AR u otros sitios. Los usuarios pueden administrar anuncios personalizados desde la configuración de anuncios de Google y las opciones que ofrezca cada proveedor.",
          "Si se habilitan proveedores publicitarios adicionales, Vision AR deberá mantener esta página actualizada con información pública suficiente sobre terceros, cookies y opciones de control disponibles.",
        ],
      },
      {
        title: "Límites de publicación",
        body: [
          "El repositorio público documenta nombres de variables y comportamiento esperado, no valores secretos ni información de cuentas de producción.",
          "Los reportes sensibles de privacidad o seguridad deben seguir SECURITY.md en lugar de issues públicos.",
        ],
      },
    ],
  },
  {
    slug: "terminos",
    path: "/terminos",
    navLabel: "Términos",
    title: "Términos de uso",
    description:
      "Condiciones públicas de uso de Vision AR, límites sobre señales de terceros y comportamiento esperado del usuario.",
    eyebrow: "Términos",
    headline: "Condiciones de uso de Vision AR",
    intro:
      "Estos términos explican el uso esperado de Vision AR como herramienta multiview. No reemplazan condiciones, licencias ni políticas de los canales o plataformas que proveen cada señal.",
    updatedLabel: "Términos públicos para uso del producto y contenido de terceros.",
    sections: [
      {
        title: "Uso permitido",
        body: [
          "Podés usar Vision AR para organizar, monitorear y compartir combinaciones públicas de señales disponibles desde la experiencia del producto.",
          "No uses Vision AR para interferir con servicios de terceros, automatizar abuso, evadir controles de acceso, redistribuir transmisiones fuera de sus condiciones o publicar contenido engañoso.",
        ],
      },
      {
        title: "Contenido de terceros",
        body: [
          "Las señales, marcas, logos, embeds, reproductores y broadcasts pertenecen a sus respectivos proveedores o titulares de derechos.",
          "Vision AR puede enlazar, embeber o describir señales públicas, pero no otorga permisos sobre contenido de terceros ni garantiza disponibilidad continua de cada stream.",
        ],
      },
      {
        title: "Combinaciones públicas",
        body: [
          "Las combinaciones públicas deben usarse como curadurías útiles y no como spam, suplantación, desinformación o reclamo de propiedad sobre señales de terceros.",
          "Vision AR puede ajustar, ocultar o retirar superficies públicas si afectan seguridad, privacidad, cumplimiento, calidad del producto o derechos de terceros.",
        ],
      },
      {
        title: "Sin garantía de disponibilidad",
        body: [
          "Las señales pueden cambiar, quedar offline, restringir embeds o modificar sus condiciones sin aviso desde Vision AR.",
          "Vision AR puede degradar funciones, pausar integraciones o cambiar la navegación pública para proteger estabilidad, seguridad o cumplimiento.",
        ],
      },
    ],
  },
  {
    slug: "politica-editorial",
    path: "/politica-editorial",
    navLabel: "Política editorial",
    title: "Política editorial y de contenidos",
    description:
      "Criterios públicos sobre contenido, señales, curaduría, ownership de terceros y límites editoriales de Vision AR.",
    eyebrow: "Contenido",
    headline: "Política editorial y de contenidos de Vision AR",
    intro:
      "Vision AR organiza señales para comparación y monitoreo. La plataforma aporta contexto de producto y navegación, pero no se presenta como propietaria ni autora de las transmisiones embebidas.",
    updatedLabel: "Criterios públicos para señales, curaduría y monetización responsable.",
    sections: [
      {
        title: "Criterio de inclusión",
        body: [
          "Las señales se organizan por utilidad pública para monitoreo argentino: noticias, streaming, TV, deportes y categorías relacionadas que ayuden a comparar coberturas.",
          "La inclusión de una señal no implica endorsement, afiliación, patrocinio, relación comercial ni acuerdo editorial con Vision AR.",
        ],
      },
      {
        title: "Contenido original de Vision AR",
        body: [
          "Vision AR puede publicar texto original para explicar el producto, categorías, uso de señales, navegación, privacidad, términos y contexto de monitoreo.",
          "Ese contenido no debe copiar descripciones de canales ni sugerir que Vision AR produce las transmisiones.",
        ],
      },
      {
        title: "Límites para monetización",
        body: [
          "Antes de activar anuncios, las páginas públicas deben evitar superficies delgadas dominadas solo por embeds y deben mantener contenido propio útil para el usuario.",
          "Los anuncios no deben colocarse de forma que confundan controles de reproducción, sugieran propiedad sobre broadcasts de terceros o generen clics accidentales alrededor del player.",
        ],
      },
      {
        title: "Correcciones y actualizaciones",
        body: [
          "Si una señal, categoría o descripción queda desactualizada, Vision AR puede corregirla o retirarla para mantener precisión pública.",
          "Los reportes sensibles deben seguir SECURITY.md; los ajustes editoriales no sensibles pueden iniciarse desde GitHub Issues.",
        ],
      },
    ],
  },
];

export const PUBLIC_POLICY_PATHS = PUBLIC_POLICY_PAGES.map((page) => page.path);

export const PUBLIC_POLICY_LINKS = PUBLIC_POLICY_PAGES.map((page) => ({
  href: page.path,
  label: page.navLabel,
}));

export function getPublicPolicyPage(slug: PublicPolicyPageSlug) {
  return PUBLIC_POLICY_PAGES.find((page) => page.slug === slug);
}
