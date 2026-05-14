import { notFound } from "next/navigation";
import { PublicPolicyPageView } from "@/components/public-policy-page";
import { getPublicPolicyMetadata } from "@/lib/public-policy-metadata";
import { getPublicPolicyPage } from "@/lib/public-policy-pages";

export const metadata = getPublicPolicyMetadata("privacidad");

export default function PrivacyPage() {
  const page = getPublicPolicyPage("privacidad");

  if (!page) {
    notFound();
  }

  return <PublicPolicyPageView page={page} />;
}
