import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { rolesDe } from "@/components/brandbook/identidad";
import { VistaWeb } from "@/components/web/vista-web";
import { leerWeb } from "@/lib/webs";

// La web publicada de un cliente (paso 8 de equipo/flujo-web-cliente.md, versión demo).
// Es de SU marca (design-system.md, punto 5): sin la barra de BrandIA, solo un pie chico al final.
// Se lee en cada visita, así una nueva publicación se ve enseguida en la misma dirección.

export const dynamic = "force-dynamic";

const buscar = cache(leerWeb);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const datos = await buscar((await params).slug);
  if (!datos) return { title: "Web no encontrada" };
  // openGraph y twitter propios, sin imagen: la web del cliente no hereda la imagen de BrandIA al compartirse
  const { titulo_google: title, descripcion_google: description } = datos.web;
  return { title, description, openGraph: { title, description }, twitter: { card: "summary", title, description } };
}

export default async function WebPublicada({ params }: Props) {
  const datos = await buscar((await params).slug);
  if (!datos) notFound();
  const { fondo, texto } = rolesDe(datos.identidad.paleta);

  return (
    <div className="row-span-full min-h-0 overflow-y-auto" style={{ background: fondo }}>
      <VistaWeb web={datos.web} ficha={datos.ficha_web} identidad={datos.identidad} fotos={datos.fotos} />
      <p className="px-5 pt-2 pb-6 text-center text-xs" style={{ color: texto, opacity: 0.55 }}>
        Hecha con{" "}
        <a href="/" className="underline underline-offset-2" style={{ color: "inherit" }}>
          BrandIA
        </a>
      </p>
    </div>
  );
}
