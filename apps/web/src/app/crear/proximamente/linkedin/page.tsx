import { Entrada } from "../_piezas/entrada";
import { DetrasDeEscena, Encabezado, Lienzo, Pasos } from "../_piezas/piezas";
import { Publicacion } from "../_piezas/publicacion";

export default function LinkedIn() {
  return (
    <Entrada className="flex flex-col gap-14">
      <Encabezado
        modulo="Módulo B · Generá tus contenidos"
        titulo="Tu marca en LinkedIn,"
        clave="sin dejar de sonar a vos."
        bajada="Un tono más profesional para contar qué hacés, cómo trabajás y lo que aprendiste. BrandIA lo escribe con tu voz y lo acompaña con imágenes de tu marca."
      />

      <Lienzo nota="Así se vería en tu perfil">
        <div className="mx-auto w-full max-w-xl">
          <Publicacion ejemplo="Hace un año arrancamos con una idea chica. Hoy queremos contarte qué aprendimos en el camino." />
        </div>
      </Lienzo>

      <Pasos
        pasos={[
          { titulo: "Parte de tu marca", texto: "Usa lo que ya sabe de tu negocio: qué hacés, para quién y cómo hablás." },
          { titulo: "Propone temas", texto: "Historias del negocio, logros, consejos de tu rubro y novedades." },
          { titulo: "Escribe y diseña", texto: "El texto con tu voz y la imagen con tu marca, en el formato de LinkedIn." },
          { titulo: "Aprobás y sale", texto: "Lo revisás, pedís cambios en palabras y se publica desde tus redes en un solo lugar." },
        ]}
      />

      <DetrasDeEscena>Todavía no se escribe ni se publica nada en LinkedIn desde BrandIA.</DetrasDeEscena>
    </Entrada>
  );
}
