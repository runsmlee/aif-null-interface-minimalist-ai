import { memo, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { readonly size?: number };

const svgDefaults = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Shared icon components to reduce inline SVG duplication.
 * All icons are memoized for optimal render performance.
 */

export const IconSend = memo(function IconSend({
  size = 18,
  ...props
}: IconProps) {
  return (
    <svg
      {...svgDefaults}
      {...props}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
});

export const IconCopy = memo(function IconCopy({
  size = 12,
  ...props
}: IconProps) {
  return (
    <svg
      {...svgDefaults}
      {...props}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
});

export const IconCheck = memo(function IconCheck({
  size = 12,
  ...props
}: IconProps) {
  return (
    <svg
      {...svgDefaults}
      {...props}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
});

export const IconErrorCircle = memo(function IconErrorCircle({
  size = 14,
  ...props
}: IconProps) {
  return (
    <svg
      {...svgDefaults}
      {...props}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
});

export const IconLayers = memo(function IconLayers({
  size = 28,
  ...props
}: IconProps) {
  return (
    <svg
      {...svgDefaults}
      {...props}
      width={size}
      height={size}
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
});

export const IconDownload = memo(function IconDownload({
  size = 14,
  ...props
}: IconProps) {
  return (
    <svg
      {...svgDefaults}
      {...props}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
});

export const IconTrash = memo(function IconTrash({
  size = 12,
  ...props
}: IconProps) {
  return (
    <svg
      {...svgDefaults}
      {...props}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
});
