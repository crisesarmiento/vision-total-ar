import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PUBLIC_POLICY_LINKS } from "@/lib/public-policy-pages";
import { cn } from "@/lib/utils";

type PublicFooterProps = {
  className?: string;
};

export function PublicFooter({ className }: PublicFooterProps) {
  return (
    <footer
      className={cn(
        "mx-auto w-full max-w-7xl border-t border-white/10 px-4 py-8 text-sm text-white/60 md:px-6",
        className,
      )}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="max-w-2xl">
          <p className="font-medium text-white">Vision AR</p>
          <p className="mt-2 leading-6">
            Interfaz multiview para monitorear señales argentinas. Las transmisiones,
            marcas y contenidos pertenecen a sus respectivos proveedores.
          </p>
        </div>
        <nav aria-label="Páginas públicas de confianza" className="flex flex-wrap gap-3 md:justify-end">
          {PUBLIC_POLICY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/45">
        <a
          href="https://github.com/crisesarmiento/vision-total-ar/issues"
          className="inline-flex items-center gap-1.5 hover:text-white"
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          GitHub Issues
        </a>
        <Link href="/contacto" className="inline-flex items-center gap-1.5 hover:text-white">
          <ShieldCheck className="h-3.5 w-3.5" />
          Reportes sensibles por SECURITY.md
        </Link>
      </div>
    </footer>
  );
}
