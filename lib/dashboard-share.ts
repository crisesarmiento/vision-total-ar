import {
  encodeDashboardLayoutShareParam,
  serializeDashboardLayout,
  type DashboardLayout,
} from "@/lib/dashboard-layout";

export type CanonicalDashboardShare = {
  publicSlug: string;
  layout: DashboardLayout;
};

export function getDashboardSharePath(
  layout: DashboardLayout,
  canonicalShare?: CanonicalDashboardShare | null,
) {
  if (
    canonicalShare &&
    serializeDashboardLayout(layout) === serializeDashboardLayout(canonicalShare.layout)
  ) {
    return `/combo/${canonicalShare.publicSlug}`;
  }

  return `/?layout=${encodeDashboardLayoutShareParam(layout)}`;
}

export function getDashboardShareUrl(
  origin: string,
  layout: DashboardLayout,
  canonicalShare?: CanonicalDashboardShare | null,
) {
  return new URL(getDashboardSharePath(layout, canonicalShare), origin).toString();
}
