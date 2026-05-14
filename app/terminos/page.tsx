import { notFound } from "next/navigation";
import { PublicPolicyPageView } from "@/components/public-policy-page";
import { getPublicPolicyMetadata } from "@/lib/public-policy-metadata";
import { getPublicPolicyPage } from "@/lib/public-policy-pages";

export const metadata = getPublicPolicyMetadata("terminos");

export default function TermsPage() {
  const page = getPublicPolicyPage("terminos");

  if (!page) {
    notFound();
  }

  return <PublicPolicyPageView page={page} />;
}
