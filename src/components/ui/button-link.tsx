import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonContent } from "./button-content";
import { buttonClassName, type ButtonStyleOptions } from "./button-styles";
import type { IconName } from "./icon";

interface ButtonLinkProps extends ButtonStyleOptions {
  href: string;
  icon?: IconName | undefined;
  iconEnd?: IconName | undefined;
  children: ReactNode;
  /** Plain `<a>` (full page load) instead of client-side navigation. */
  external?: boolean | undefined;
}

/** A link that looks like a button (navigation, not an action). */
export function ButtonLink({
  href,
  icon,
  iconEnd,
  children,
  external = false,
  ...style
}: ButtonLinkProps) {
  const content = (
    <ButtonContent icon={icon} iconEnd={iconEnd}>
      {children}
    </ButtonContent>
  );
  const className = buttonClassName(style);
  return external ? (
    <a className={className} href={href}>
      {content}
    </a>
  ) : (
    <Link className={className} href={href}>
      {content}
    </Link>
  );
}
