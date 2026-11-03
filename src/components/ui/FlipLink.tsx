import Link from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "children"> & {
  label: string;
  variant?: "default" | "alt";
};

export default function FlipLink({ label, variant = "default", className = "", ...rest }: Props) {
  const classes = ["btn-flip", variant === "alt" ? "btn-flip--alt" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <Link {...rest} className={classes} data-label={label}>
      {label}
    </Link>
  );
}
