import type { SVGProps } from "react";

const PATHS = {
  logo: "M3 5h18v16H3zM3 10h18M8 2v5M16 2v5M7 14h4M13 14h4M7 18h6",
  bell: "M6 17V10a6 6 0 0 1 12 0v7M4 17h16M10 21h4",
  calendar: "M3 5h18v16H3zM3 10h18M8 2v5M16 2v5",
  clock: "M3 3h18v18H3zM12 7v5h4",
  alert: "M12 3L2 21h20zM12 10v5M12 17.5v.5",
  edit: "M4 20h4L20 8l-4-4L4 16zM14 6l4 4",
  message: "M3 4h18v13H10l-5 4v-4H3z",
  sparkle: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
  arrow: "M4 12h16M14 6l6 6-6 6",
  check: "M4 12l5 5L20 6",
  user: "M5 21v-4h14v4M8 7h8v6H8z",
  scissors: "M4 4l16 16M4 20L20 4M3 8h5v-5H3zM3 21h5v-5H3z",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number | string;
}

// Square caps and mitred joins keep every icon sharp-cornered to match the UI.
export default function Icon({ name, size = "1.1em", className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={`icon ${className ?? ""}`}
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
