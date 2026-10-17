import { Entrada } from "../_piezas/entrada";
import { DetrasDeEscena, Encabezado, Lienzo, LugarLogo, Pasos, Renglon } from "../_piezas/piezas";

export default function Pauta() {
  return (
    <Entrada className="flex flex-col gap-14">
      <Encabezado
        modulo="Módulo B · Generá tus contenidos"
        titulo="Anuncios que"
        clave="funcionan en tu rubro."
        cartel="En construcción · siguiente etapa"
        bajada="BrandIA mira qué anuncios están funcionando en negocios como el tuyo y te arma el tuyo con tu marca. Vos elegís a quién mostrárselo y cuánto invertir."
      />

      <Lienzo nota="Lo que encuentra la IA y tu anuncio">
        <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-3 rounded-[16px] bg-card p-4">
            <p className="label">Qué funciona en tu rubro</p>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2 rounded-sm bg-muted p-2">
                  <span className="aspect-square rounded-sm bg-foreground/10" />
                  <Renglon />
                  <Renglon ancho="70%" />
                </div>
              ))}
            </div>
            <ul className="flex flex-col gap-2 text-[0.9375rem] text-muted-foreground">
              <li>· Cuánto tiempo lleva activo cada anuncio</li>
              <li>· A cuánta gente llegó</li>
              <li>· Qué tienen en común los que mejor andan</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-[16px] bg-card p-4">
            <p className="label">Tu anuncio</p>
            <div className="flex items-center gap-2">
              <LugarLogo className="size-8" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Renglon ancho="45%" />
                <span className="text-[0.6875rem] text-muted-foreground">Publicidad</span>
              </div>
            </div>
            <Renglon />
            <Renglon ancho="80%" />
            <span className="grid aspect-square place-items-center rounded-sm bg-muted text-center text-xs text-muted-foreground">
              La imagen se genera
              <br />
              con tu marca
            </span>
            <span className="self-start rounded-full border px-3 py-1 text-xs font-semibold">Más información</span>
          </div>
        </div>
      </Lienzo>

      <Pasos
        pasos={[
          { titulo: "Mira tu rubro", texto: "Busca anuncios activos de negocios como el tuyo y la IA se queda con los que de verdad son de tu rubro." },
          { titulo: "Te cuenta qué ve", texto: "En palabras simples: qué se repite en los que más duran y llegan más lejos." },
          { titulo: "Arma tu anuncio", texto: "Imagen y texto con tu marca y tu voz, inspirados en lo que funciona, nunca copiados." },
          { titulo: "Vos decidís", texto: "Elegís a quién mostrárselo y cuánto invertir. Nada se publica ni se paga sin tu OK." },
        ]}
      />

      <DetrasDeEscena>
        Los anuncios del rubro salen de la librería pública de anuncios de Meta. Y para saber cómo les va a
        tus contenidos, estamos evaluando herramientas que predicen su rendimiento. Esta parte llega después
        de la hackathon.
      </DetrasDeEscena>
    </Entrada>
  );
}
