import { channels, getChannelById, type ChannelCategory, type NewsChannel } from "@/lib/channels";

export type PublicChannelCategory = {
  slug: ChannelCategory;
  label: string;
  title: string;
  description: string;
  intro: string;
  context: string;
};

export const PUBLIC_CHANNEL_CATEGORIES: Record<ChannelCategory, PublicChannelCategory> = {
  noticias: {
    slug: "noticias",
    label: "Noticias",
    title: "Canales de noticias argentinas en vivo",
    description:
      "Compará señales de noticias argentinas en vivo en Vision AR: TN, C5N, LN+, A24 y más canales para monitoreo multiview.",
    intro:
      "Reuní señales argentinas de noticias en una misma grilla para seguir coberturas nacionales, móviles, análisis político y último momento sin saltar entre pestañas.",
    context:
      "La categoría de noticias está pensada para comparar enfoques editoriales, tiempos de reacción y prioridades de agenda durante coberturas en vivo.",
  },
  streaming: {
    slug: "streaming",
    label: "Streaming",
    title: "Streaming argentino en vivo",
    description:
      "Seguí señales de streaming argentino e independiente en Vision AR para comparar conversaciones, agenda social y cobertura en vivo.",
    intro:
      "Explorá señales digitales argentinas con conversación en vivo, cultura, actualidad y comunidades que reaccionan rápido a la agenda del día.",
    context:
      "El streaming suma voces nativas de plataformas digitales y ayuda a leer cómo circulan los temas públicos fuera de la televisión tradicional.",
  },
  tv: {
    slug: "tv",
    label: "TV argentina",
    title: "Canales de TV argentina en vivo",
    description:
      "Explorá señales de TV argentina, generalistas y regionales, con enlaces para abrirlas en el dashboard multiview de Vision AR.",
    intro:
      "Encontrá señales de televisión argentina generalista, pública y regional para tener una mirada amplia sobre programación, actualidad y coberturas especiales.",
    context:
      "La TV abierta y regional aporta contexto territorial, cobertura local y señales de alto alcance para complementar el monitoreo nacional.",
  },
  deportes: {
    slug: "deportes",
    label: "Deportes",
    title: "Canales deportivos argentinos en vivo",
    description:
      "Reuní señales deportivas argentinas en Vision AR para monitorear fútbol, actualidad deportiva y coberturas en paralelo.",
    intro:
      "Seguí señales deportivas argentinas para monitorear fútbol, agenda de clubes, torneos y programas de análisis en paralelo con otras coberturas.",
    context:
      "Las señales deportivas ayudan a detectar cambios de agenda durante partidos, conferencias, mercados de pases y coberturas de último momento.",
  },
};

export const PUBLIC_CHANNEL_CATEGORY_ORDER: ChannelCategory[] = [
  "noticias",
  "streaming",
  "tv",
  "deportes",
];

export function getPublicChannelBySlug(slug: string) {
  return getChannelById(slug);
}

export function getPublicCategoryBySlug(slug: string) {
  if (!isPublicCategorySlug(slug)) {
    return undefined;
  }

  const category = PUBLIC_CHANNEL_CATEGORIES[slug];

  return getChannelsForCategory(category.slug).length ? category : undefined;
}

export function getChannelsForCategory(category: ChannelCategory) {
  return channels.filter((channel) => channel.category === category);
}

export function getPublicCategories() {
  return PUBLIC_CHANNEL_CATEGORY_ORDER.map((slug) => PUBLIC_CHANNEL_CATEGORIES[slug]).filter(
    (category) => getChannelsForCategory(category.slug).length > 0,
  );
}

export function getChannelsByPublicCategory() {
  return getPublicCategories().map((category) => ({
    category,
    channels: getChannelsForCategory(category.slug),
  }));
}

export function getPublicChannelRoute(channel: NewsChannel) {
  return `/canales/${channel.id}`;
}

export function getPublicCategoryRoute(category: PublicChannelCategory) {
  return `/canales/categoria/${category.slug}`;
}

export function getPublicChannelRoutes() {
  return channels.map(getPublicChannelRoute);
}

export function getPublicCategoryRoutes() {
  return getPublicCategories().map(getPublicCategoryRoute);
}

export function getPublicChannelSitemapPaths() {
  return ["/canales", ...getPublicCategoryRoutes(), ...getPublicChannelRoutes()];
}

export function getChannelSeoDescription(channel: NewsChannel) {
  return `${channel.name} en Vision AR: ${channel.description} Abrí el dashboard multiview para comparar esta señal con otros canales argentinos en vivo.`;
}

export function getRefreshTierLabel(channel: NewsChannel) {
  if (channel.refreshTier === 1) {
    return "Alta prioridad editorial";
  }

  if (channel.refreshTier === 2) {
    return "Seguimiento regular";
  }

  return "Seguimiento complementario";
}

function isPublicCategorySlug(slug: string): slug is ChannelCategory {
  return slug in PUBLIC_CHANNEL_CATEGORIES;
}
