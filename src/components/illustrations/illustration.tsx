import "server-only";
import { useId } from "react";
import illustrations from "./illustrations.json";
import { UID_TOKEN } from "./uid-token";

export type IllustrationName = keyof typeof illustrations;

interface IllustrationProps {
  name: IllustrationName;
  className?: string | undefined;
  /** Rendered width in px (height follows the viewBox); defaults to the file's size. */
  width?: number | undefined;
}

/**
 * Inline illustration from docs/design/assets/illustrations (generated into
 * illustrations.json by scripts/sync-design-assets.ts). Always decorative. Ids are unique
 * per instance, `data-anim` layers stay for IllustrationMotion. Server-only, so the SVG
 * markup never ends up in client bundles – pass it to client components as a prop.
 */
export function Illustration({ name, className, width }: IllustrationProps) {
  const uid = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-`;
  const source: { viewBox: string; width: number; height: number; markup: string } & {
    preserveAspectRatio?: string;
  } = illustrations[name];
  const w = width ?? source.width;
  const h = Math.round((w / source.width) * source.height);
  return (
    <svg
      className={className}
      viewBox={source.viewBox}
      preserveAspectRatio={source.preserveAspectRatio}
      width={w}
      height={h}
      aria-hidden="true"
      focusable="false"
      data-illustration={name}
      dangerouslySetInnerHTML={{ __html: source.markup.replaceAll(UID_TOKEN, uid) }}
    />
  );
}
