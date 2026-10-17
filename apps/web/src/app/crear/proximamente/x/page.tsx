import { Entrada } from "../_piezas/entrada";
import { DetrasDeEscena, Encabezado, Lienzo, Pasos } from "../_piezas/piezas";
import { Publicacion } from "../_piezas/publicacion";

export default function X() {
  return (
    <Entrada className="flex flex-col gap-14">
      <Encabezado
        modulo="Módulo B · Generá tus contenidos"
        titulo="Corto, seguido"
        clave="y con tu voz."
        bajada="En X lo que importa es estar seguido y decir mucho en poco. BrandIA te propone mensajes cortos con la voz de tu marca para toda la semana."
      />

      <Lienzo nota="Así se verían en tu cuenta">
        <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-2">
          <Publicacion imagen={false} ejemplo="Mucho de lo que sabemos lo aprendimos equivocándonos. Hoy te contamos un error que nos enseñó un montón." />
          <Publicacion imagen={false} ejemplo="Abrimos un rato más tarde los viernes. Vení, te esperamos." />
        </div>
      </Lienzo>

      <Pasos
        pasos={[
          { titulo: "Arma la semana", texto: "Varios mensajes cortos, cada uno con una idea sola." },
          { titulo: "Con tu voz", texto: "Respeta cómo hablás: el trato, el humor y las palabras de tu marca." },
          { titulo: "Al momento justo", texto: "Propone el horario en que tu público está más atento." },
          { titulo: "Aprobás y sale", texto: "Los revisás de a uno o todos juntos y se publican desde tus redes en un solo lugar." },
        ]}
      />

      <DetrasDeEscena>Todavía no se escribe ni se publica nada en X desde BrandIA.</DetrasDeEscena>
    </Entrada>
  );
}
