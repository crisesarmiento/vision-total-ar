import Link from "next/link";
import { ArrowLeft, ExternalLink, MonitorPlay, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicPolicyPage } from "@/lib/public-policy-pages";

type PublicPolicyPageViewProps = {
  page: PublicPolicyPage;
};

function containsTrustedGithubIssuesUrl(text: string) {
  const urlCandidates = text.match(/https?:\/\/[^\s)]+/g) ?? [];

  return urlCandidates.some((candidate) => {
    try {
      const parsed = new URL(candidate);
      const normalizedPath = parsed.pathname.replace(/\/+$/, "");
      return (
        parsed.protocol === "https:" &&
        parsed.hostname === "github.com" &&
        normalizedPath === "/crisesarmiento/vision-total-ar/issues"
      );
    } catch {
      return false;
    }
  });
}

function renderBodyText(text: string) {
  if (containsTrustedGithubIssuesUrl(text)) {
    return (
      <>
        Para errores no sensibles, pedidos de mejora o comentarios generales, usá{" "}
        <a
          href="https://github.com/crisesarmiento/vision-total-ar/issues"
          className="font-medium text-primary hover:text-primary/80"
          rel="noreferrer"
          target="_blank"
        >
          GitHub Issues
        </a>{" "}
        en el repositorio público de Vision AR.
      </>
    );
  }

  return text;
}

export function PublicPolicyPageView({ page }: PublicPolicyPageViewProps) {
  return (
    <>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span>{page.navLabel}</span>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              {page.eyebrow}
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              {page.headline}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
              {page.intro}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/">
                  <MonitorPlay className="h-4 w-4" />
                  Abrir dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/canales">Ver canales</Link>
              </Button>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
              <ShieldCheck className="h-3.5 w-3.5" />
              Página pública
            </div>
            <p className="mt-4 text-sm leading-6 text-white/65">{page.updatedLabel}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary">Sin login</Badge>
              <Badge variant="outline">Canonical</Badge>
              <Badge variant="outline">Public-safe</Badge>
            </div>
            <a
              href="https://github.com/crisesarmiento/vision-total-ar/issues"
              className="mt-5 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
              GitHub Issues
            </a>
          </aside>
        </section>

        <section className="mt-10 grid gap-4">
          {page.sections.map((section) => (
            <Card key={section.title} className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-white/70 sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{renderBodyText(paragraph)}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
