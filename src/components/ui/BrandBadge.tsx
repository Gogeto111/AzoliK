import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Small two-letter monogram badge used as a stand-in for brand icons
 * (Slack, Stripe, Discord, …) that are not shipped by the installed
 * lucide-react build. Keeps the same 24x24 viewBox / stroke contract
 * as a LucideIcon so it slots in anywhere a Lucide icon is expected.
 */
export function BrandBadge({
  label,
  ...props
}: LucideProps & { label: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill="currentColor"
        stroke="none"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

export function makeBrandBadge(label: string): LucideIcon {
  const C = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
    <BrandBadge label={label} ref={ref} {...props} />
  ));
  C.displayName = `BrandBadge(${label})`;
  return C as unknown as LucideIcon;
}
