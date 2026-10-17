import type { Metadata } from "next";

import { MODULOS, PASOS } from "@/lib/ia/gastos";
import { armarReporte } from "@/lib/ia/reporte-gastos";

import { Calculadora } from "./calculadora";
import { numero, usd } from "./formato";

// Panel interno del equipo: cuánto gastamos en IA y cuánto cuesta cada paso, para pensar precios.
// No tiene links desde la app y los buscadores no lo indexan.

export const metadata: Metadata = {
  title: "Costos de IA · BrandIA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dia = new Intl.DateTimeFormat("es-UY", { weekday: "short", day: "numeric", month: "numeric", timeZone: "UTC" });
const hora = new Intl.DateTimeFormat("es-UY", { hour: "2-digit", minute: "2-digit", timeZone: "America/Montevideo" });

function Clave({ children }: { children: React.ReactNode }) {
  return <span className="font-normal italic [font-variation-settings:'opsz'_144,'SOFT'_100,'WONK'_1]">{children}</span>;
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-5">
      <span className="label">{titulo}</span>
      <span className="font-display text-3xl">{valor}</span>
      {detalle && <span className="lead">{detalle}</span>}
    </div>
  );
}

function Tabla({ columnas, children }: { columnas: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[560px] text-left text-[0.9375rem]">
        <thead>
          <tr className="border-b">
            {columnas.map((c, i) => (
              <th key={c} className={`label px-4 py-3 font-semibold ${i ? "text-right" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:px-4 [&_td]:py-3 [&_td+td]:text-right [&_td+td]:tabular-nums [&_tr+tr]:border-t">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export default async function Costos() {
  const r = await armarReporte();
  const porModulo = (Object.keys(MODULOS) as (keyof typeof MODULOS)[]).map((m) => ({
    modulo: m,
    filas: r.pasos.filter((f) => PASOS[f.paso].modulo === m),
  }));

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-[1080px] flex-col gap-12 overflow-x-clip px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-4">
        <p className="label">BrandIA · solo para el equipo</p>
        <h1 className="display max-w-3xl text-balance">
          Lo que nos cuesta <Clave>la IA.</Clave>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Cada generación queda anotada con su paso. Con esto vemos cuánto cuesta armar una marca o un feed, y
          pensamos los precios. Leído a las {hora.format(r.leidoEl)}; lo último puede tardar unos minutos en
          aparecer. <a href="/costos">Actualizar</a>
        </p>
        {r.errores.length > 0 && (
          <p className="rounded-lg border px-4 py-3 text-[0.9375rem]">
            No se pudo leer {r.errores.join(", ")}. Probá actualizar en un rato.
          </p>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Dato
          titulo="Saldo que queda"
          valor={r.saldo === null ? "—" : usd(r.saldo)}
          detalle={
            r.saldo !== null && r.saldo <= 0
              ? "Sin saldo: la IA puede dejar de responder. Hay que cargar créditos en Vercel."
              : "Créditos del Gateway de Vercel"
          }
        />
        <Dato titulo="Créditos usados" valor={r.gastadoTotal === null ? "—" : usd(r.gastadoTotal)} detalle="Lo que el Gateway descontó del saldo" />
        <Dato titulo="Gastado hoy" valor={usd(r.hoy.total)} detalle={`${numero(r.hoy.llamadas)} llamadas a la IA`} />
        <Dato
          titulo="Una marca completa"
          valor={r.estimados.marcaCompleta === null ? "Faltan datos" : usd(r.estimados.marcaCompleta)}
          detalle="Entrevista + direcciones + identidad + logos, en promedio"
        />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2>Cuánto cuesta cada paso</h2>
          <p className="lead max-w-2xl">
            Una corrida es un pedido de la pantalla (en la entrevista por chat, la conversación entera). Últimos 30
            días.
          </p>
        </div>
        {porModulo.map(
          ({ modulo, filas }) =>
            filas.length > 0 && (
              <div key={modulo} className="flex flex-col gap-3">
                <h3 className="text-xl">
                  {modulo} · {MODULOS[modulo]}
                </h3>
                <Tabla columnas={["Paso", "Corridas", "Promedio", "Más barata · más cara", "Total"]}>
                  {filas.map((f) => (
                    <tr key={f.paso}>
                      <td>
                        {PASOS[f.paso].nombre}
                        <span className="lead block">{numero(f.llamadas)} llamadas</span>
                      </td>
                      <td>{numero(f.corridas)}</td>
                      <td className="font-semibold">{f.corridas ? usd(f.promedio) : "—"}</td>
                      <td>{f.corridas ? `${usd(f.minimo)} · ${usd(f.maximo)}` : "—"}</td>
                      <td>{usd(f.total)}</td>
                    </tr>
                  ))}
                </Tabla>
              </div>
            ),
        )}
        {r.pasos.length === 0 && (
          <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">
            Todavía no hay generaciones anotadas. Apenas alguien use la app, aparecen acá.
          </p>
        )}
        {r.sinEtiqueta > 0.0005 && (
          <p className="lead">
            Además hay {usd(r.sinEtiqueta)} sin paso: lo que se generó antes de que existiera este panel, pruebas
            sueltas y rutas que todavía no usan <code>etiquetar()</code>.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2>Para pensar los precios</h2>
          <p className="lead max-w-2xl">Con el costo promedio de hoy. Cambiá el margen y mirá cuánto cobraríamos.</p>
        </div>
        <Calculadora marca={r.estimados.marcaCompleta} feed={r.estimados.feed} />
      </section>

      <hr className="costura my-0" />

      <section className="flex flex-col gap-5">
        <h2>Por modelo</h2>
        <Tabla columnas={["Modelo", "Llamadas", "Tokens que entran", "Tokens que salen", "Total"]}>
          {r.modelos.map((m) => (
            <tr key={m.model}>
              <td className="font-mono text-sm">{m.model}</td>
              <td>{numero(m.requestCount)}</td>
              <td>{numero(m.inputTokens)}</td>
              <td>{numero(m.outputTokens)}</td>
              <td className="font-semibold">{usd(m.totalCost)}</td>
            </tr>
          ))}
        </Tabla>
      </section>

      <section className="flex flex-col gap-5">
        <h2>Por día</h2>
        <Tabla columnas={["Día", "Llamadas", "Total"]}>
          {r.dias.map((d) => (
            <tr key={d.day}>
              <td>{d.day ? dia.format(new Date(`${d.day}T12:00:00Z`)) : "—"}</td>
              <td>{numero(d.requestCount)}</td>
              <td className="font-semibold">{usd(d.totalCost)}</td>
            </tr>
          ))}
        </Tabla>
      </section>

      <section className="flex flex-col gap-5">
        <h2>La voz (ElevenLabs)</h2>
        <div className="rounded-lg border bg-card p-5 text-[0.9375rem]">
          {r.voz === null && "No se pudo leer el uso de ElevenLabs."}
          {r.voz && !r.voz.hayClave && "Todavía no está la clave de ElevenLabs en este entorno."}
          {r.voz?.hayClave && (
            <>
              Plan {r.voz.plan}: usamos {numero(r.voz.usados)} de {numero(r.voz.limite)} créditos
              {r.voz.renueva && ` (se renuevan el ${dia.format(r.voz.renueva)})`}. La voz no pasa por el Gateway, por
              eso va aparte.
            </>
          )}
        </div>
      </section>
    </main>
  );
}
