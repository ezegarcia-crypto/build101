import { Entrada } from "../_piezas/entrada";
import { DetrasDeEscena, Encabezado, Pasos } from "../_piezas/piezas";
import { Kit } from "./kit";

export default function BranderIA() {
  return (
    <Entrada className="flex flex-col gap-14">
      <Encabezado
        modulo="Módulo C · BranderIA"
        titulo="De la pantalla"
        clave="a la mano."
        bajada="Elegís los productos y las cantidades. BrandIA los produce con tu marca y te los manda. Vos no coordinás nada."
      />

      <Kit />

      <Pasos
        pasos={[
          { titulo: "Tu marca, lista", texto: "La que armaste en BrandIA. Tu logo cae sobre cada producto." },
          { titulo: "Ves cada producto", texto: "La IA genera la foto de cada uno con tu marca aplicada, antes de pedir." },
          { titulo: "Armás tu kit", texto: "Elegís productos y cantidades. Antes de confirmar ves el resumen." },
          { titulo: "Te llega a tu puerta", texto: "BrandIA lo produce, controla que salga bien y te lo manda." },
        ]}
      />

      <DetrasDeEscena>
        Primera etapa: Uruguay, con doce productos. Los precios se muestran cuando estén cerrados. Hoy no se
        toman pedidos.
      </DetrasDeEscena>
    </Entrada>
  );
}
