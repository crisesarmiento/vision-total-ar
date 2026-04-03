"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { TickerItem } from "@/lib/rss";

type NewsTickerProps = {
  items: TickerItem[];
};

export function NewsTicker({ items }: NewsTickerProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-full border border-white/10 bg-black/30">
      <motion.div
        className="flex min-w-max gap-8 px-4 py-2"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 32,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {[...items, ...items].map((item) => (
          <Link
            key={`${item.id}-${item.link}`}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
          >
            <span className="rounded-full bg-primary/20 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-primary-foreground">
              {item.source}
            </span>
            <span>{item.title}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
