import { Entrada } from "../_piezas/entrada";
import { DetrasDeEscena, Ejemplo, Encabezado, Lienzo, LugarLogo, Pasos, Renglon } from "../_piezas/piezas";

export default function Newsletter() {
  return (
    <Entrada className="flex flex-col gap-14">
      <Encabezado
        modulo="Módulo B · Generá tus contenidos"
        titulo="Un mail que tus clientes"
        clave="quieren abrir."
        bajada="BrandIA escribe tu newsletter con tu voz, lo diseña con tu marca y te lo deja listo para mandar. Vos lo leés, pedís cambios en palabras y lo aprobás."
      />

      <Lienzo nota="Tu newsletter, como lo ve tu cliente">
        <div className="mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-[16px] bg-card">
          <div className="flex flex-col gap-1.5 border-b p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Asunto:</span>
              <span className="font-semibold">Lo nuevo de este mes</span>
              <Ejemplo texto="Ejemplo" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>De:</span>
              <Renglon ancho="8rem" />
            </div>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <LugarLogo className="self-center" />
            <span className="grid aspect-[16/7] place-items-center rounded-sm bg-muted text-xs text-muted-foreground">
              Imagen con tu marca
            </span>
            <Renglon ancho="60%" alto="1rem" />
            <div className="flex flex-col gap-2">
              <Renglon />
              <Renglon />
              <Renglon ancho="85%" />
            </div>
            <span className="self-start rounded-full bg-foreground/15 px-5 py-2.5 text-xs font-semibold text-muted-foreground">
              Botón con tu marca
            </span>
            <div className="border-t pt-3">
              <Renglon ancho="40%" alto="0.4rem" />
            </div>
          </div>
        </div>
      </Lienzo>

      <Pasos
        pasos={[
          { titulo: "Elige el tema", texto: "Te propone de qué hablar este mes: novedades, temporada o algo que tus clientes preguntan." },
          { titulo: "Lo escribe", texto: "Con tu voz de marca: el trato, las palabras que usás y las que no." },
          { titulo: "Lo diseña", texto: "Con tu logo, tus colores y tus tipografías. Se lee bien en el celular." },
          { titulo: "Lo mandás", texto: "Lo aprobás y sale a tu lista de clientes, el día que elijas." },
        ]}
      />

      <DetrasDeEscena>Todavía no se escribe ni se manda ningún mail desde BrandIA.</DetrasDeEscena>
    </Entrada>
  );
}
