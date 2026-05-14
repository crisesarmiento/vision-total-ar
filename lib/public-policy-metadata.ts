import type { Metadata } from "next";
import {
  getPublicPolicyPage,
  type PublicPolicyPageSlug,
} from "@/lib/public-policy-pages";
import { getCanonicalUrl } from "@/lib/seo";

export function getPublicPolicyMetadata(slug: PublicPolicyPageSlug): Metadata {
  const page = getPublicPolicyPage(slug);

  if (!page) {
    return {
      title: "Página no disponible",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = getCanonicalUrl(page.path);

  return {
    title: {
      absolute: `${page.title} | Vision AR`,
    },
    description: page.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      type: "website",
      locale: "es_AR",
      siteName: "Vision AR",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}
