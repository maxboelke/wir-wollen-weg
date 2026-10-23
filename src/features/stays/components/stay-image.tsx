"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./stays.module.css";

/**
 * Image of a suggestion (design-system §9.21, W18-16): the placeholder (stripes + bed plate,
 * D-48) always lies underneath, the image – from our own proxy or a demo image of our own –
 * covers it once loaded. Not loadable → it simply stays the placeholder, no error shown. Never
 * faded in (server HTML / cache must not blink, R-017). Decorative (`alt=""`).
 */
export function StayImage({
  src,
  className,
  lazy = true,
}: {
  src: string | null;
  className?: string | undefined;
  lazy?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    // An error before hydration fires no React event – check the finished image once.
    const image = ref.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, [src]);
  return (
    <span className={cx(styles.image, className)} aria-hidden="true">
      <span className={styles.placeholder}>
        <span className={styles.plate}>
          <Icon name="bed" size={22} />
        </span>
      </span>
      {src && !failed ? (
        // Own proxy or own demo image – never next/image (deployment.md §0.8, Q34).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          className={styles.photo}
          src={src}
          alt=""
          draggable={false}
          decoding="async"
          loading={lazy ? "lazy" : "eager"}
          referrerPolicy="no-referrer"
          onError={() => {
            setFailed(true);
          }}
        />
      ) : null}
    </span>
  );
}
