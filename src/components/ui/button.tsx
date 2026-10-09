"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from "react";
import { ButtonContent, type ButtonContentProps } from "./button-content";
import { buttonClassName, type ButtonStyleOptions } from "./button-styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions &
  Omit<ButtonContentProps, "children"> & {
    children: ReactNode;
    ref?: Ref<HTMLButtonElement> | undefined;
  };

/**
 * Button with variants and states. `loading` keeps the button focusable but blocks
 * repeated clicks (`aria-disabled`, ux-spec §4.1).
 */
export function Button({
  variant,
  size,
  block,
  className,
  icon,
  iconEnd,
  loading = false,
  loadingLabel,
  children,
  type = "button",
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  const blocked = loading || rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, block, className })}
      aria-busy={loading || undefined}
      aria-disabled={blocked || undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (blocked) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      <ButtonContent icon={icon} iconEnd={iconEnd} loading={loading} loadingLabel={loadingLabel}>
        {children}
      </ButtonContent>
    </button>
  );
}
