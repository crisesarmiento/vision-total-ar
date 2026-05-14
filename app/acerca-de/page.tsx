import { notFound } from "next/navigation";
import { PublicPolicyPageView } from "@/components/public-policy-page";
import { getPublicPolicyMetadata } from "@/lib/public-policy-metadata";
import { getPublicPolicyPage } from "@/lib/public-policy-pages";

export const metadata = getPublicPolicyMetadata("acerca-de");

export default function AboutPage() {
  const page = getPublicPolicyPage("acerca-de");

  if (!page) {
    notFound();
  }

  return <PublicPolicyPageView page={page} />;
}
