export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={(size * 120) / 100}
      height={size}
      viewBox="0 0 120 100"
      aria-hidden="true"
      className="block"
    >
      <g fill="none" stroke="var(--ink)" strokeWidth="15">
        <rect x="20" y="24" width="52" height="52" rx="19" transform="rotate(-14 46 50)" />
        <rect x="48" y="24" width="52" height="52" rx="19" transform="rotate(14 74 50)" />
      </g>
    </svg>
  );
}

export default function Logo({ height = 24 }: { height?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={height} />
      <span
        className="font-serif font-semibold leading-none tracking-tight text-ink"
        style={{ fontSize: height * 1.05 }}
      >
        sorrel
      </span>
    </span>
  );
}
