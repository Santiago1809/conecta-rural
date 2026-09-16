// "Verificado por la comunidad" pill badge.
export default function VerifiedBadge({ label = "Verificado por la comunidad" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-verified px-2.5 py-1 text-xs font-semibold text-bosque">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5.2" fill="#1E4B37" />
        <path
          d="M3.8 6.2l1.5 1.5 2.9-3"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}
