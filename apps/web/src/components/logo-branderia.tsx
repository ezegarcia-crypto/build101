// El logo de BranderIA. No hay un archivo propio: se arma con la misma regla que el de BrandIA
// (brandia/marca/logo/README.md): el isotipo oficial, la B modular (sus dos piezas tal cual, sin redibujar),
// y el nombre en Fraunces 700 con la «IA» en Naranja Señal. Como el logo horizontal: isotipo grafito y nombre
// grafito sobre claro; isotipo naranja y nombre hueso sobre grafito (modo oscuro).

/** `className` fija el tamaño con el font-size (text-[28px] = la altura del logo de BrandIA en la barra) */
export function LogoBranderia({ className = "text-[28px]" }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[0.24em] leading-none ${className}`} role="img" aria-label="BranderIA">
      <svg viewBox="0 0 62 76" className="h-[1em] w-auto shrink-0 text-grafito dark:text-naranja" aria-hidden="true">
        <g transform="translate(-10,-12)" fill="currentColor">
          <path d="M10,12 H38.5 A17.5,17.5 0 0 1 38.5,47 H36 V59 H20 V47 H10 Z" />
          <path d="M10,53 H18 V61 H38 V53 H54.5 A17.5,17.5 0 0 1 54.5,88 H10 Z" />
        </g>
      </svg>
      <span
        aria-hidden="true"
        className="font-display text-[1.06em] font-bold tracking-[-0.027em] text-grafito dark:text-hueso"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        Brander<span className="text-naranja">IA</span>
      </span>
    </span>
  );
}
