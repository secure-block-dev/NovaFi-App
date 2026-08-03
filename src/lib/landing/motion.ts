import type { Variants } from "framer-motion";

/** Shared snappy ease-out used by every fade/rise transition on the site. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Mount-entrance variant: fade + rise, staggered via `custom={delaySeconds}`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE_OUT },
  }),
};
