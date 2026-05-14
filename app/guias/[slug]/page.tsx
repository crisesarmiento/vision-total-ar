import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenText, MonitorPlay } from "lucide-react";
import { TrackAnalyticsEvents } from "@/components/analytics/track-analytics-events";
import { PublicFooter } from "@/components/public-footer";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EVERGREEN_GUIDES_INDEX_PATH,
  getEvergreenGuideBySlug,
  getEvergreenGuideRoute,
  getEvergreenGuides,
} from "@/lib/evergreen-guides";
import { getCanonicalUrl } from "@/lib/seo";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";

type GuidePageParams = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getEvergreenGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageParams): Promise<Metadata> {
  const { slug } = await params;
  const guide = getEvergreenGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guía no disponible",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = getCanonicalUrl(getEvergreenGuideRoute(guide));

  return {
    title: {
      absolute: `${guide.title} | Vision AR`,
    },
    description: guide.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonicalUrl,
      type: "article",
      locale: "es_AR",
      siteName: "Vision AR",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function GuidePage({ params }: GuidePageParams) {
  const { slug } = await params;
  const guide = getEvergreenGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const structuredData = buildBreadcrumbStructuredData([
    { name: "Inicio", url: "/" },
    { name: "Guías", url: EVERGREEN_GUIDES_INDEX_PATH },
    { name: guide.navLabel, url: getEvergreenGuideRoute(guide) },
  ]);

  return (
    <>
      <JsonLdScript id="guide-json-ld" data={structuredData} />
      <TrackAnalyticsEvents
        events={[
          {
            name: "search_landing_view",
            properties: {
              surface: "guide",
            },
          },
        ]}
      />
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60">
          <Link href={EVERGREEN_GUIDES_INDEX_PATH} className="inline-flex items-center gap-2 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Guías
          </Link>
          <span aria-hidden="true">/</span>
          <span>{guide.navLabel}</span>
        </div>

        <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              {guide.eyebrow}
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              {guide.headline}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
              {guide.intro}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href={guide.primaryCta.href}>
                  <MonitorPlay className="h-4 w-4" />
                  {guide.primaryCta.label}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={guide.secondaryCta.href}>{guide.secondaryCta.label}</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-6">
              {guide.sections.map((section) => (
                <section key={section.title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <div className="mt-4 grid gap-4 text-base leading-7 text-white/70">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-white/10 bg-black/20 p-5 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
              <BookOpenText className="h-3.5 w-3.5" />
              Guía
            </div>
            <p className="mt-4 text-sm leading-6 text-white/65">{guide.description}</p>
            <Badge variant="outline" className="mt-4">
              {guide.updatedLabel}
            </Badge>

            <div className="mt-6 border-t border-white/10 pt-5">
              <h2 className="text-sm font-semibold text-white">Enlaces relacionados</h2>
              <div className="mt-3 grid gap-3">
                {guide.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-primary/40 hover:bg-white/10"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-medium text-white">{link.label}</span>
                        {link.description ? (
                          <span className="mt-1 block text-sm leading-5 text-white/60">
                            {link.description}
                          </span>
                        ) : null}
                      </span>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </article>
      </main>
      <PublicFooter />
    </>
  );
}
