export default function GopuramIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`gopuram-icon ${className}`} viewBox="0 0 64 72" aria-hidden="true">
      <g className="gopuram-finial">
        <circle cx="32" cy="3.5" r="2.25" />
        <path d="M29.2 6h5.6l2.2 4H27z" />
      </g>
      <path className="gopuram-tier" d="M25.5 11h13l3.2 6H22.3z" />
      <path className="gopuram-band" d="M21.2 18h21.6l2.6 2.8H18.6z" />
      <path className="gopuram-tier" d="M19 22h26l3.7 7.2H15.3z" />
      <path className="gopuram-band" d="M14 30.3h36l2.6 3.1H11.4z" />
      <path className="gopuram-tier" d="M12.5 35h39l4.1 8.3H8.4z" />
      <path className="gopuram-band" d="M7 44.7h50l2.4 3.3H4.6z" />
      <path className="gopuram-tier" d="M6.4 49.6h51.2L61 58H3z" />
      <path className="gopuram-base" d="M2.5 59.7h59v8.8h-59z" />
      <path className="gopuram-door" d="M25.7 48.8h12.6v19.7H25.7z" />
      <path className="gopuram-arch" d="M23.6 49.2c.4-6.2 3.2-9.2 8.4-9.2s8 3 8.4 9.2h-3.2c-.6-4-2.3-6-5.2-6s-4.6 2-5.2 6z" />
      <g className="gopuram-niches">
        <rect x="27.1" y="13.1" width="3.2" height="2.5" rx=".6" />
        <rect x="33.7" y="13.1" width="3.2" height="2.5" rx=".6" />
        <rect x="21.8" y="24.8" width="3.5" height="3" rx=".6" />
        <rect x="30.2" y="24.8" width="3.5" height="3" rx=".6" />
        <rect x="38.7" y="24.8" width="3.5" height="3" rx=".6" />
        <rect x="15.8" y="38" width="3.7" height="3.2" rx=".6" />
        <rect x="23.7" y="38" width="3.7" height="3.2" rx=".6" />
        <rect x="36.6" y="38" width="3.7" height="3.2" rx=".6" />
        <rect x="44.5" y="38" width="3.7" height="3.2" rx=".6" />
        <rect x="10.8" y="52.6" width="4.1" height="3.5" rx=".6" />
        <rect x="18.2" y="52.6" width="4.1" height="3.5" rx=".6" />
        <rect x="41.7" y="52.6" width="4.1" height="3.5" rx=".6" />
        <rect x="49.1" y="52.6" width="4.1" height="3.5" rx=".6" />
      </g>
      <path className="gopuram-highlight" d="M32 11v28.2M19 22h26M12.5 35h39M6.4 49.6h51.2" />
    </svg>
  );
}
