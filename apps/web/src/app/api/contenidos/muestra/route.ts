import { entradaMuestra, leerConKit } from "@/app/api/contenidos/entrada";
import { generarImagen, promptImagen } from "@/lib/ia/contenidos/imagen";
import { medir } from "@/lib/ia/gastos";

// Una de las dos fotos de muestra para «¿Cuál te gusta más?» (components/feed/elegir-estilo.tsx):
// antes de generar el feed, la persona ve los estilos con fotos de SU rubro. La escena se arma con
// lo que contó en la entrevista (sin otra IA de texto) y la foto la hace la IA de imágenes con la marca
// aplicada, como en el feed. Sujeto centrado y con aire, para que sirva en los dos estilos.

export const maxDuration = 120;

export const POST = medir("contenidos-muestra", async (req: Request) => {
  const entrada = await leerConKit(req, entradaMuestra);
  if (entrada instanceof Response) return entrada;
  const { marca, negocio } = entrada.brief;
  const escena =
    entrada.cual === "a"
      ? `Un negocio de ${marca.rubro} en ${marca.ubicacion}. Lo que hace: ${negocio.que_hace}. Una persona trabajando o el producto en uso, en su lugar real, con luz natural.`
      : `Un detalle de cerca de lo que ofrece un negocio de ${marca.rubro}: el producto, la herramienta o el lugar, con textura, materiales reales y luz natural. Lo que lo hace distinto: ${negocio.diferencial}`;
  const img = await generarImagen({ clave: entrada.cual, prompt: promptImagen(escena, entrada.kit, 1080, 1350, "forma"), ancho: 1080, alto: 1350 });
  return Response.json(img);
});
