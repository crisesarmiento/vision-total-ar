import { notFound } from "next/navigation";
import { PublicPolicyPageView } from "@/components/public-policy-page";
import { getPublicPolicyMetadata } from "@/lib/public-policy-metadata";
import { getPublicPolicyPage } from "@/lib/public-policy-pages";

export const metadata = getPublicPolicyMetadata("politica-editorial");

export default function EditorialPolicyPage() {
  const page = getPublicPolicyPage("politica-editorial");

  if (!page) {
    notFound();
  }

  return <PublicPolicyPageView page={page} />;
}
