import { useId } from "react";
import { cx } from "@/lib/cx";
import styles from "./logo.module.css";

interface LogoMarkProps {
  size?: number;
  /** "auto": light surfaces (switches to the on-brand colours in dark mode) · "onBrand": Indigo. */
  tone?: "auto" | "onBrand" | undefined;
  className?: string | undefined;
}

/**
 * Brand mark "Sonnenkalender" B0 (docs/design/assets/logo/logo-mark*.svg) inline, so it
 * follows the theme tokens. Decorative – the product name always stands next to it or on
 * the link (ux-spec §10.6 rule 7). Layers `data-anim` sun/waves for the loading state.
 */
export function LogoMark({ size = 32, tone = "auto", className }: LogoMarkProps) {
  const clipId = `${useId()}-sheet`;
  return (
    <svg
      className={cx(styles.mark, tone === "onBrand" && styles.onBrand, className)}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="6" y="11" width="52" height="47" rx="14" />
        </clipPath>
      </defs>
      <rect className={styles.sheet} x="6" y="11" width="52" height="47" rx="14" />
      <g clipPath={`url(#${clipId})`}>
        <g data-anim="sun">
          <circle className={styles.sun} cx="32" cy="42" r="19" opacity=".25" />
          <circle className={styles.sun} cx="32" cy="42" r="12" />
        </g>
        <g data-anim="waves">
          <path className={styles.wave} d="M0 45C8 41 16 41 24 45S40 49 48 45S60 41 64 43V64H0Z" />
          <path
            className={styles.waveDeep}
            d="M0 52C8 49 16 49 24 52S40 55 48 52S60 49 64 51V64H0Z"
          />
        </g>
      </g>
      <rect className={styles.ring} x="18" y="5" width="7" height="12" rx="3.5" />
      <rect className={styles.ring} x="39" y="5" width="7" height="12" rx="3.5" />
    </svg>
  );
}

interface WordmarkProps {
  /** "Wir wollen" / "When do we" */
  lead: string;
  /** "weg" / "go?" – highlighted as one unit (D-19). */
  accent: string;
  tone?: "auto" | "onBrand" | undefined;
  size?: "md" | "lg" | undefined;
  className?: string | undefined;
}

/**
 * Word mark as live text in Plus Jakarta Sans 800 (design-system §3.3) – same look as
 * logo-wordmark*.svg, but crisp at every size and without the SVG's own colour scheme.
 */
export function Wordmark({ lead, accent, tone = "auto", size = "md", className }: WordmarkProps) {
  return (
    <span
      className={cx(
        styles.wordmark,
        tone === "onBrand" && styles.wordmarkOnBrand,
        size === "lg" && styles.wordmarkLg,
        className,
      )}
    >
      <LogoMark size={size === "lg" ? 40 : 32} tone={tone} />
      <span className={styles.name}>
        {lead} <em className={styles.accent}>{accent}</em>
      </span>
    </span>
  );
}
