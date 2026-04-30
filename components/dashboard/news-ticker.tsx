"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { TickerItem } from "@/lib/rss";

type NewsTickerProps = {
  items: TickerItem[];
  reducedMotionEnabled?: boolean;
};

export function NewsTicker({ items, reducedMotionEnabled = false }: NewsTickerProps) {
  if (!items.length) {
    return null;
  }

  if (reducedMotionEnabled) {
    return <StaticTicker items={items} />;
  }

  return (
    <>
      <div className="hidden motion-reduce:block">
        <StaticTicker items={items} />
      </div>
      <div className="overflow-hidden rounded-full border border-white/10 bg-black/30 motion-reduce:hidden">
        <motion.div
          className="flex min-w-max gap-8 px-4 py-2"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 32,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {[...items, ...items].map((item, index) => (
            <TickerLink key={`${item.id}-${item.link}-${index}`} item={item} />
          ))}
        </motion.div>
      </div>
    </>
  );
}

function StaticTicker({ items }: { items: TickerItem[] }) {
  return (
    <div className="overflow-x-auto rounded-full border border-white/10 bg-black/30">
      <div className="flex min-w-max gap-8 px-4 py-2">
        {items.map((item) => (
          <TickerLink key={`${item.id}-${item.link}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function TickerLink({ item }: { item: TickerItem }) {
  return (
    <Link
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
    >
      <span className="rounded-full bg-primary/20 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-primary-foreground">
        {item.source}
      </span>
      <span>{item.title}</span>
    </Link>
  );
}
