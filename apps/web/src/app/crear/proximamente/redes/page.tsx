import { Entrada } from "../_piezas/entrada";
import { DetrasDeEscena, Ejemplo, Encabezado, Lienzo, Pasos, Renglon } from "../_piezas/piezas";

const REDES = ["Instagram", "Facebook", "TikTok", "LinkedIn", "X", "Newsletter"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
// Qué día cae cada pieza de muestra en el calendario (solo para dibujar la vista)
const PIEZAS: Record<number, string[]> = { 0: ["Posteo"], 2: ["Historia", "LinkedIn"], 4: ["Reel"], 5: ["Newsletter"] };

export default function Redes() {
  return (
    <Entrada className="flex flex-col gap-14">
      <Encabezado
        modulo="Módulo B · Generá tus contenidos"
        titulo="Todas tus redes,"
        clave="en un solo lugar."
        bajada="Conectás tus cuentas una sola vez. Desde acá ves todo lo que BrandIA preparó con tu marca, lo aprobás y se publica solo, en el día y la hora que mejor te funcionan."
      />

      <Lienzo nota="Tus cuentas y tu calendario">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-2 rounded-[16px] bg-card p-4">
            <p className="label">Tus cuentas</p>
            <ul className="flex flex-col divide-y">
              {REDES.map((r) => (
                <li key={r} className="flex items-center justify-between gap-3 py-2.5 text-[0.9375rem]">
                  <span className="font-semibold">{r}</span>
                  <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">Sin conectar</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col gap-3 rounded-[16px] bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="label">Tu semana</p>
              <Ejemplo texto="Calendario de ejemplo" />
            </div>
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="grid min-w-[34rem] grid-cols-7 gap-1.5">
                {DIAS.map((d, i) => (
                  <div key={d} className="flex min-h-36 min-w-0 flex-col gap-1.5 rounded-sm bg-muted p-1.5">
                    <span className="text-center text-[0.6875rem] font-semibold text-muted-foreground">{d}</span>
                    {(PIEZAS[i] ?? []).map((p) => (
                      <span
                        key={p}
                        className="flex flex-col gap-1 rounded-sm border bg-background p-1.5 text-[0.625rem] leading-tight font-semibold sm:text-[0.6875rem]"
                      >
                        <span className="truncate">{p}</span>
                        <Renglon alto="0.3rem" />
                        <Renglon ancho="60%" alto="0.3rem" />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Cada pieza va a salir con tu marca. Tocás una, la revisás y la aprobás.
            </p>
          </div>
        </div>
      </Lienzo>

      <Pasos
        pasos={[
          { titulo: "Conectás tus cuentas", texto: "Una sola vez, con el permiso de cada red. Tus claves nunca pasan por BrandIA." },
          { titulo: "BrandIA prepara la semana", texto: "Posteos, historias, reels y mails con tu marca y tu voz, pensados para tu rubro." },
          { titulo: "Vos aprobás", texto: "Ves todo en un calendario. Cambiás lo que quieras pidiéndolo en palabras." },
          { titulo: "Se publica solo", texto: "Cada pieza sale en su red, en el día y la hora elegidos. Después ves cómo le fue." },
        ]}
      />

      <DetrasDeEscena>
        Para conectar y publicar en varias redes desde una sola conexión, la opción que estamos evaluando
        es Zernio. Todavía no hay ninguna cuenta conectada.
      </DetrasDeEscena>
    </Entrada>
  );
}
