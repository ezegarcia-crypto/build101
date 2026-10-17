"use client";

import { useEffect } from "react";

import {
  cargarFuentes,
  fuente,
  type IdentidadIA,
  rolesDe,
  svgSeguro,
  textoSobre,
} from "@/components/brandbook/identidad";
import type { FichaWeb } from "@/lib/ia/web/ficha-web";
import type { Seccion, Web } from "@/lib/ia/web/web";

// La web del cliente dibujada con SU marca (design-system.md, punto 5: acá no va nada de BrandIA).
// La estructura y los textos los escribe la IA; los colores, las tipografías y el logo salen de la identidad;
// los datos de contacto salen de la ficha de la web, tal cual los dijo la persona.
// Usa consultas de contenedor (@container) para que la vista "celular" se vea como en un celular de verdad.

type Boton = NonNullable<Seccion["boton"]>;

/** WhatsApp: si el número no trae país y empieza con 0, se asume Uruguay (+598) */
function linkWhatsapp(numero: string, mensaje?: string | null) {
  let d = numero.replace(/\D/g, "");
  if (!numero.trim().startsWith("+") && d.startsWith("0")) d = `598${d.slice(1)}`;
  return `https://wa.me/${d}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}

function destino(boton: Boton, ficha: FichaWeb): string | null {
  const c = ficha.contacto;
  switch (boton.accion) {
    case "whatsapp":
      return c.whatsapp ? linkWhatsapp(c.whatsapp, boton.mensaje) : null;
    case "telefono": {
      const tel = c.telefono ?? c.whatsapp;
      return tel ? `tel:${tel.replace(/[^\d+]/g, "")}` : null;
    }
    case "email":
      return c.email ? `mailto:${c.email}` : null;
    case "instagram":
      return c.instagram ? `https://instagram.com/${c.instagram.replace(/^@/, "")}` : null;
    case "mapa":
      return c.direccion
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.direccion, c.zona].filter(Boolean).join(", "))}`
        : null;
    default:
      return null;
  }
}

type Colores = ReturnType<typeof rolesDe> & { sobrePrincipal: string; sobreAcento: string; titulos: string; texto2: string };

function BotonWeb({ boton, ficha, colores, grande }: { boton: Boton; ficha: FichaWeb; colores: Colores; grande?: boolean }) {
  if (boton.accion === "ninguna") return null;
  const href = destino(boton, ficha);
  const clase = `inline-flex items-center justify-center rounded-full font-semibold ${grande ? "px-6 py-3.5 text-base" : "px-5 py-2.5 text-sm"}`;
  if (!href) {
    // El botón existe pero la persona no dio el dato: se marca, no se inventa
    return (
      <span className={`${clase} border-2 border-dashed opacity-70`} style={{ borderColor: colores.texto }}>
        {boton.texto} · falta tu {boton.accion === "mapa" ? "dirección" : boton.accion}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${clase} transition-transform duration-300 ease-brandia hover:-translate-y-0.5`}
      style={{ background: colores.principal, color: colores.sobrePrincipal }}
    >
      {boton.texto}
    </a>
  );
}

/** El lugar de la foto. No hay fotos todavía: se dice qué foto va, sin hacerla pasar por real */
function Foto({ texto, colores, alto }: { texto: string; colores: Colores; alto?: boolean }) {
  return (
    <figure
      className={`relative grid place-items-end overflow-hidden rounded-[14px] p-4 ${alto ? "aspect-[4/3]" : "aspect-[16/9] @2xl:aspect-[4/3]"}`}
      style={{ background: colores.acento, color: colores.sobreAcento }}
    >
      <figcaption className="text-xs leading-snug opacity-80">Foto · {texto}</figcaption>
    </figure>
  );
}

function Falta({ que, colores }: { que: string; colores: Colores }) {
  return (
    <span className="inline-block rounded-full border border-dashed px-3 py-1 text-xs opacity-70" style={{ borderColor: colores.texto }}>
      Falta: {que}
    </span>
  );
}

function SeccionWeb({
  s,
  web,
  ficha,
  colores,
  esPrimera,
}: {
  s: Seccion;
  web: Web;
  ficha: FichaWeb;
  colores: Colores;
  esPrimera: boolean;
}) {
  const titulo = { fontFamily: colores.titulos };
  const c = ficha.contacto;

  if (s.tipo === "portada") {
    const centrada = web.estilo === "cercana";
    return (
      <section id={s.id} className={`grid gap-6 px-5 py-10 @2xl:px-10 @2xl:py-16 ${s.foto && !centrada ? "@2xl:grid-cols-2 @2xl:items-center" : ""}`}>
        <div className={`flex flex-col gap-4 ${centrada ? "items-center text-center" : ""}`}>
          <h1 className="text-[2.1rem] leading-[1.05] @2xl:text-[3.2rem]" style={titulo}>
            {s.titulo}
          </h1>
          {s.texto && <p className="max-w-[32em] text-base leading-relaxed opacity-85 @2xl:text-lg">{s.texto}</p>}
          {s.boton && (
            <div className="mt-2">
              <BotonWeb boton={s.boton} ficha={ficha} colores={colores} grande />
            </div>
          )}
        </div>
        {s.foto && <Foto texto={s.foto} colores={colores} alto={web.estilo === "vidriera"} />}
      </section>
    );
  }

  if (s.tipo === "destacado") {
    return (
      <section id={s.id} className="px-5 py-8 @2xl:px-10" style={{ background: colores.principal, color: colores.sobrePrincipal }}>
        <p className="text-xl leading-snug @2xl:text-2xl" style={titulo}>
          {s.titulo}
        </p>
        {s.texto && <p className="mt-2 text-sm opacity-90">{s.texto}</p>}
        {s.boton && (
          <div className="mt-4">
            <BotonWeb boton={s.boton} ficha={ficha} colores={{ ...colores, principal: colores.fondo, sobrePrincipal: colores.texto }} />
          </div>
        )}
      </section>
    );
  }

  const encabezado = (
    <>
      <h2 className="text-[1.6rem] leading-tight @2xl:text-[2.1rem]" style={titulo}>
        {s.titulo}
      </h2>
      {s.texto && <p className="mt-2 max-w-[36em] leading-relaxed opacity-85">{s.texto}</p>}
    </>
  );

  if (s.tipo === "ubicacion") {
    return (
      <section id={s.id} className="grid gap-5 px-5 py-10 @2xl:grid-cols-2 @2xl:px-10">
        <div>
          {encabezado}
          <dl className="mt-5 flex flex-col gap-3 text-[15px]">
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase opacity-60">Dirección</dt>
              <dd>{c.direccion ? [c.direccion, c.zona].filter(Boolean).join(" · ") : <Falta que="la dirección" colores={colores} />}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase opacity-60">Horarios</dt>
              <dd>{c.horarios ?? <Falta que="el horario" colores={colores} />}</dd>
            </div>
          </dl>
          {s.boton && (
            <div className="mt-5">
              <BotonWeb boton={s.boton} ficha={ficha} colores={colores} />
            </div>
          )}
        </div>
        {s.foto && <Foto texto={s.foto} colores={colores} />}
      </section>
    );
  }

  if (s.tipo === "contacto") {
    const datos = [c.whatsapp && `WhatsApp ${c.whatsapp}`, c.telefono && `Tel. ${c.telefono}`, c.email, c.instagram].filter(Boolean);
    return (
      <section id={s.id} className="flex flex-col items-start gap-4 px-5 py-12 @2xl:px-10">
        {encabezado}
        {datos.length > 0 && <p className="text-sm opacity-75">{datos.join(" · ")}</p>}
        {s.boton && <BotonWeb boton={s.boton} ficha={ficha} colores={colores} grande />}
      </section>
    );
  }

  // productos, como_pedir y sobre
  const pasos = s.tipo === "como_pedir";
  return (
    <section
      id={s.id}
      className="px-5 py-10 @2xl:px-10"
      style={esPrimera ? undefined : s.tipo === "como_pedir" ? { background: colores.texto2 } : undefined}
    >
      <div className={s.foto && s.tipo === "sobre" ? "grid gap-6 @2xl:grid-cols-2 @2xl:items-center" : ""}>
        <div>{encabezado}</div>
        {s.foto && s.tipo === "sobre" && <Foto texto={s.foto} colores={colores} />}
      </div>
      {s.items.length > 0 && (
        <ol className={`mt-6 grid gap-3 ${s.items.length > 1 ? "@xl:grid-cols-2" : ""} ${s.items.length > 2 ? "@4xl:grid-cols-3" : ""}`}>
          {s.items.map((it, i) => (
            <li key={`${it.titulo}-${i}`} className="rounded-[14px] border p-4" style={{ borderColor: `${colores.texto}26` }}>
              {pasos && (
                <span className="mb-2 block text-sm font-semibold" style={{ color: colores.principal }}>
                  {i + 1}
                </span>
              )}
              <p className="text-lg leading-snug" style={titulo}>
                {it.titulo}
              </p>
              {it.texto && <p className="mt-1 text-sm leading-relaxed opacity-80">{it.texto}</p>}
            </li>
          ))}
        </ol>
      )}
      {s.foto && s.tipo !== "sobre" && (
        <div className="mt-6">
          <Foto texto={s.foto} colores={colores} />
        </div>
      )}
      {s.boton && (
        <div className="mt-6">
          <BotonWeb boton={s.boton} ficha={ficha} colores={colores} />
        </div>
      )}
    </section>
  );
}

/** Lo que la vista usa de la identidad (lo mismo que se guarda al publicar, ver lib/webs.ts) */
export type IdentidadVista = Pick<IdentidadIA, "nombre" | "paleta" | "tipografias" | "fuentes_url"> & {
  logo: Pick<IdentidadIA["logo"], "isotipo_svg">;
};

export function VistaWeb({ web, ficha, identidad }: { web: Web; ficha: FichaWeb; identidad: IdentidadVista }) {
  useEffect(() => cargarFuentes(identidad.fuentes_url), [identidad.fuentes_url]);

  const roles = rolesDe(identidad.paleta);
  const colores: Colores = {
    ...roles,
    sobrePrincipal: textoSobre(roles.principal, identidad.paleta),
    sobreAcento: textoSobre(roles.acento, identidad.paleta),
    titulos: fuente(identidad.tipografias.titulos, "serif"),
    // Un fondo apenas distinto para separar secciones, hecho con el color del texto muy suave
    texto2: `${roles.texto}0d`,
  };
  const ig = ficha.contacto.instagram;

  return (
    <div
      // Los links toman el color de la marca, no el naranja de BrandIA (design-system.md, punto 5)
      className="@container min-h-full [&_a]:[color:inherit]"
      style={{ background: colores.fondo, color: colores.texto, fontFamily: fuente(identidad.tipografias.texto, "sans-serif") }}
    >
      <header className="flex items-center justify-between gap-3 px-5 py-4 @2xl:px-10">
        <span className="flex min-w-0 items-center gap-2.5">
          {identidad.logo.isotipo_svg && (
            <span
              className="block size-9 shrink-0 [&>svg]:size-full"
              aria-hidden="true"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: el SVG ya viene limpio de /api/identidad
              dangerouslySetInnerHTML={{ __html: svgSeguro(identidad.logo.isotipo_svg) }}
            />
          )}
          <span className="truncate text-xl" style={{ fontFamily: colores.titulos }}>
            {identidad.nombre}
          </span>
        </span>
        <nav className="hidden gap-5 text-sm opacity-80 @2xl:flex">
          {web.secciones
            .filter((s) => s.tipo !== "portada")
            .slice(0, 4)
            .map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.titulo}
              </a>
            ))}
        </nav>
      </header>

      {web.secciones.map((s, i) => (
        <SeccionWeb key={`${s.id}-${i}`} s={s} web={web} ficha={ficha} colores={colores} esPrimera={i === 0} />
      ))}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-6 text-sm opacity-75 @2xl:px-10" style={{ borderColor: `${colores.texto}26` }}>
        <span>{web.pie}</span>
        {ig && <span>{ig}</span>}
      </footer>
    </div>
  );
}
