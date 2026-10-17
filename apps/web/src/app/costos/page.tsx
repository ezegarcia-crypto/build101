import type { Metadata } from "next";

import { MODULOS, PASOS, type Paso } from "@/lib/ia/gastos";
import { armarReporte, partesDeVozPorMes } from "@/lib/ia/reporte-gastos";
import { pasosDelModelo, USOS } from "@/lib/ia/usos";
import { hayBaseDeDatos, listarPagos, parteDeBrandia, saldos } from "@/lib/pagos";

import { minutos, numero, usd } from "./formato";
import { GraficoEtapas } from "./grafico-etapas";
import { ESTILOS_SERIES, familia, Muestra } from "./series";
import { Precios } from "./precios";
import { type FilaPago, Registro } from "./registro";

// Panel interno del equipo: cuánto gastamos en IA y cuánto cuesta cada paso, para pensar precios.
// No tiene links desde la app y los buscadores no lo indexan.

export const metadata: Metadata = {
  title: "Costos de IA · BrandIA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dia = new Intl.DateTimeFormat("es-UY", { weekday: "short", day: "numeric", month: "numeric", timeZone: "UTC" });
const hora = new Intl.DateTimeFormat("es-UY", { hour: "2-digit", minute: "2-digit", timeZone: "America/Montevideo" });
const diaYHora = new Intl.DateTimeFormat("es-UY", {
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Montevideo",
});

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

function Tabla({
  columnas,
  aIzquierda = [],
  children,
}: {
  columnas: string[];
  /** Columnas (además de la primera) que van alineadas a la izquierda. */
  aIzquierda?: number[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[560px] text-left text-[0.9375rem]">
        <thead>
          <tr className="border-b">
            {columnas.map((c, i) => (
              <th key={c} className={`label px-4 py-3 font-semibold ${i && !aIzquierda.includes(i) ? "text-right" : ""}`}>
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

// El registro de pagos del equipo (Supabase). Si todavía no está conectado o falla, el panel sigue.
async function leerRegistro() {
  if (!hayBaseDeDatos()) return { estado: "sin-base" as const };
  try {
    const pagos = await listarPagos();
    const partes = await partesDeVozPorMes(pagos.filter((p) => p.reparto === "uso_voz").map((p) => p.fecha.slice(0, 7)));
    const filas: FilaPago[] = pagos.map((p) => {
      const parte = parteDeBrandia(p, partes);
      return { ...p, parte, brandia: p.monto_usd * parte };
    });
    return { estado: "ok" as const, filas, ...saldos(pagos, partes) };
  } catch (error) {
    console.error("[costos] no se pudo leer el registro de pagos", error);
    return { estado: "error" as const };
  }
}

export default async function Costos() {
  const [r, registro] = await Promise.all([armarReporte(), leerRegistro()]);
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Montevideo" }).format(new Date());
  // El orden de los modelos dentro de cada barra es fijo (el de las familias), no el del gasto
  const ordenFamilia = (m: string) => ["sonnet", "recraft", "opus", "gpt-image", "otros"].indexOf(familia(m).clave);
  const etapas = r.pasos
    .filter((f) => f.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((f) => ({
      paso: f.paso,
      nombre: PASOS[f.paso].nombre,
      total: f.total,
      modelos: [...f.modelos].sort((a, b) => ordenFamilia(a.modelo) - ordenFamilia(b.modelo)),
    }));
  const gastoDe = (paso: Paso, modelo: string) =>
    r.pasos.find((f) => f.paso === paso)?.modelos.find((m) => m.modelo === modelo)?.total ?? 0;

  // Lo que costó una marca: si ya hay clientes reales que la completaron, su promedio; si no, la suma de promedios por paso
  const pc = r.porCliente;
  const marcaReal = pc.completos?.promedio ?? null;
  const resumenClientes = pc.completos ?? pc.todos;
  const clientes = (n = 0) => `${numero(n)} ${n === 1 ? "cliente" : "clientes"}`;

  const porModulo = (Object.keys(MODULOS) as (keyof typeof MODULOS)[]).map((m) => ({
    modulo: m,
    filas: r.pasos.filter((f) => PASOS[f.paso].modulo === m),
  }));

  return (
    <main className="viz-etapas mx-auto flex w-full min-w-0 max-w-[1080px] flex-col gap-12 overflow-x-clip px-4 py-12 sm:py-16">
      <style>{ESTILOS_SERIES}</style>
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
          valor={marcaReal !== null ? usd(marcaReal) : r.estimados.marcaCompleta === null ? "Faltan datos" : usd(r.estimados.marcaCompleta)}
          detalle={
            marcaReal !== null
              ? `Promedio real de ${clientes(pc.completos?.cantidad)} que la completaron`
              : "Entrevista + direcciones + identidad + logos, sumando el promedio de cada paso"
          }
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
          <h2>
            Lo que costó <Clave>cada cliente</Clave>
          </h2>
          <p className="lead max-w-2xl">
            Cada persona que usa la app, de punta a punta: todo lo que pidió a la IA desde la misma pestaña del
            navegador. Los {pc.enDetalle} más nuevos de los últimos 30 días.
          </p>
        </div>
        {resumenClientes ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 [&>*:first-child]:col-span-2 sm:[&>*:first-child]:col-span-1">
              <Dato
                titulo={pc.completos ? "Promedio por marca completa" : "Promedio por cliente"}
                valor={usd(resumenClientes.promedio)}
                detalle={
                  pc.completos
                    ? `${numero(pc.completos.cantidad)} de ${numero(pc.todos?.cantidad)} llegaron a la identidad y los logos`
                    : "Todavía ninguno llegó a la marca completa: se cuentan todos, lleguen hasta donde lleguen"
                }
              />
              <Dato titulo="El más barato" valor={usd(resumenClientes.minimo)} />
              <Dato titulo="El más caro" valor={usd(resumenClientes.maximo)} />
            </div>
            <Tabla columnas={["Cliente", "Pasos que hizo", "Total"]} aIzquierda={[1]}>
              {r.clientes.map((c) => (
                <tr key={c.id}>
                  <td className="align-top">
                    <span className="font-mono text-sm">{c.id.split("-").at(-1)}</span>
                    <span className="lead block">
                      {c.inicio ? diaYHora.format(c.inicio) : "—"}
                      {c.completo && " · marca completa"}
                    </span>
                  </td>
                  <td className="!text-left align-top">
                    <ul className="flex flex-col gap-0.5">
                      {c.pasos.map((f) => (
                        <li key={f.paso} className="flex justify-between gap-4">
                          <span>{PASOS[f.paso].nombre}</span>
                          <span className="text-muted-foreground">{usd(f.total)}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="align-top font-semibold">{usd(c.total)}</td>
                </tr>
              ))}
            </Tabla>
          </>
        ) : (
          <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">
            Todavía no hay clientes medidos. Aparecen acá apenas alguien hace la entrevista en la app.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2>Para qué se usa cada modelo</h2>
          <p className="lead max-w-2xl">
            Dónde se va la plata: cada barra es una etapa, partida por modelo. Pasá el mouse (o tocá) para ver el
            detalle. Últimos 30 días.
          </p>
        </div>
        {etapas.length > 0 ? (
          <GraficoEtapas etapas={etapas} />
        ) : (
          <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">
            El gráfico aparece con la primera generación anotada. Mientras tanto, abajo está qué modelo usa cada etapa.
          </p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(USOS) as Paso[]).map((paso) => {
            const gastado = r.pasos.find((f) => f.paso === paso)?.total ?? 0;
            return (
              <li key={paso} className="flex flex-col gap-3 rounded-lg border bg-card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg">{PASOS[paso].nombre}</h3>
                  <span className="label shrink-0">
                    {PASOS[paso].modulo} · {gastado ? usd(gastado) : "sin gasto"}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {USOS[paso].map((u, i) => {
                    // Si un modelo cumple dos funciones en la etapa, su gasto se muestra una sola vez
                    const primera = USOS[paso].findIndex((x) => x.modelo === u.modelo) === i;
                    const delModelo = gastoDe(paso, u.modelo);
                    return (
                      <li key={`${paso}-${i}`} className="flex flex-col gap-0.5 text-[0.9375rem]">
                        <span>
                          {u.para}
                          {u.respaldo && <span className="text-muted-foreground"> (respaldo)</span>}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <Muestra modelo={u.modelo} />
                          {u.modelo}
                          {primera && delModelo > 0 && <span className="font-sans">· {usd(delModelo)}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2>Para pensar los precios</h2>
          <p className="lead max-w-2xl">
            Con los costos medidos acá y los supuestos del documento de precios del equipo. Cambiá cualquier número y
            se recalcula todo.
          </p>
        </div>
        <Precios
          pieza={{ valor: r.estimados.pieza, respaldo: 0.09 }}
          marca={
            marcaReal !== null
              ? { valor: marcaReal, respaldo: 1.2, fuente: `Promedio real de ${clientes(pc.completos?.cantidad)} que completaron la marca` }
              : { valor: r.estimados.marcaCompleta, respaldo: 1.2, fuente: "Suma de los promedios de cada paso" }
          }
          vistaPrevia={
            pc.vistaPrevia
              ? { valor: pc.vistaPrevia.promedio, respaldo: 0.38, fuente: `Promedio real de ${clientes(pc.vistaPrevia.cantidad)}` }
              : { valor: r.estimados.vistaPrevia, respaldo: 0.38 }
          }
        />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2>Lo que puso cada uno</h2>
          <p className="lead max-w-2xl">
            Cada pago que alguien hizo para BrandIA (créditos, ElevenLabs, dominio…). El gasto se reparte en tres y acá
            se ve a quién le debe BrandIA.
          </p>
        </div>
        {registro.estado === "ok" && (
          <Registro pagos={registro.filas} socios={registro.socios} total={registro.total} hoy={hoy} />
        )}
        {registro.estado === "sin-base" && (
          <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">
            Falta conectar la base de datos (Supabase) para guardar los pagos.
          </p>
        )}
        {registro.estado === "error" && (
          <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">
            No se pudo leer el registro de pagos. Probá actualizar en un rato.
          </p>
        )}
      </section>

      <hr className="costura my-0" />

      <section className="flex flex-col gap-5">
        <h2>Por modelo</h2>
        <Tabla columnas={["Modelo y para qué se usa", "Llamadas", "Tokens que entran", "Tokens que salen", "Total"]}>
          {r.modelos.map((m) => (
            <tr key={m.model}>
              <td>
                <span className="inline-flex items-center gap-1.5 font-mono text-sm">
                  <Muestra modelo={m.model ?? ""} />
                  {m.model}
                </span>
                <span className="lead block">
                  {[...new Set(pasosDelModelo(m.model ?? "").map((u) => PASOS[u.paso].nombre))].join(" · ") ||
                    "Ya no lo usa ninguna etapa (pruebas anteriores)"}
                </span>
              </td>
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
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-5 text-[0.9375rem]">
          {r.voz === null && "No se pudo leer el uso de ElevenLabs."}
          {r.voz && !r.voz.hayClave && "Todavía no está la clave de ElevenLabs en este entorno."}
          {r.voz?.hayClave && (
            <>
              <p>
                La suscripción es compartida con Gary. Este mes la cuenta usó <strong>{numero(r.voz.cuenta)}</strong>{" "}
                créditos; los audios pasados a texto de BrandIA, <strong>{numero(r.voz.audios)}</strong> (
                {minutos(r.voz.minutosAudios)} de audio).
                {r.voz.agenteViejo > 0 && (
                  <>
                    {" "}
                    Además, el agente de voz que se usó hasta el 17/10 gastó <strong>{numero(r.voz.agenteViejo)}</strong>.
                  </>
                )}
              </p>
              <p className="font-display text-2xl">A BrandIA le toca el {Math.round(r.voz.parte * 1000) / 10} %</p>
              <p className="lead">
                Ese porcentaje se aplica a lo que se pagó de ElevenLabs en el registro de pagos.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
