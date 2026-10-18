import { z } from "zod";

// Módulo B, las historias destacadas del perfil: un círculo por pilar del plan del mes. La IA elige,
// para cada pilar, un ícono de una lista cerrada (lucide-react) y el nombre corto que va debajo.
// La lista es cerrada para que la pantalla siempre lo pueda dibujar; el mapa nombre → ícono vive en
// components/feed/instagram.tsx (TypeScript avisa si falta alguno).

export const MODELO_DESTACADAS = "anthropic/claude-haiku-5.5";

export const ICONOS = [
  "Sparkles", "Heart", "Star", "Users", "MessageCircle", "Lightbulb", "BookOpen", "GraduationCap",
  "Camera", "Image", "Video", "Megaphone", "Tag", "ShoppingBag", "Gift", "Percent", "Calendar",
  "Clock", "MapPin", "Store", "House", "Leaf", "Sprout", "Flower2", "Sun", "Mountain", "Waves",
  "Coffee", "Utensils", "ChefHat", "Wine", "Cake", "Pizza", "IceCreamCone", "Flame", "Shirt",
  "Scissors", "Gem", "Glasses", "Palette", "Brush", "PenTool", "Hammer", "Wrench", "Dumbbell",
  "Bike", "Footprints", "Music", "Mic", "Briefcase", "Handshake", "Building2", "Sofa", "Lamp",
  "TrendingUp", "Target", "Rocket", "Zap", "Trophy", "Award", "BadgeCheck", "ShieldCheck",
  "CircleHelp", "Quote", "Newspaper", "Truck", "Package", "Baby", "PawPrint", "Smile", "HandHeart",
  "Recycle", "Stethoscope", "Pill", "Brain", "Plane", "Car", "Laptop", "WandSparkles",
] as const;

export type Icono = (typeof ICONOS)[number];

export const destacadasSchema = z.object({
  destacadas: z
    .array(
      z.object({
        pilar: z.string().describe("El nombre del pilar, tal cual vino"),
        nombre_corto: z.string().describe("Lo que va debajo del círculo: una o dos palabras, 12 letras como máximo"),
        icono: z.enum(ICONOS).describe("El ícono de la lista que mejor representa ese pilar para este negocio"),
      }),
    )
    .describe("Una por pilar, en el mismo orden"),
});

export const PROMPT_DESTACADAS = `Sos el community manager de BrandIA. Armás las historias destacadas del perfil de Instagram de una marca: un círculo por cada pilar de contenido del mes.

Para cada pilar:
- Elegí el ícono de la lista que mejor lo represente para ESTE negocio en particular (lo que vende o hace, su rubro), no un ícono genérico. Evitá repetir íconos entre pilares.
- Escribí el nombre corto que va debajo del círculo, como en Instagram: una o dos palabras, 12 letras como máximo, en español rioplatense, con mayúscula inicial.

Devolvé una destacada por pilar, en el mismo orden en que vienen.`;

export function pedidoDestacadas({ marca, objetivo, pilares }: { marca: string; objetivo?: string; pilares: { nombre: string; para_que: string }[] }) {
  return [
    `Marca: ${marca}`,
    objetivo ? `Objetivo del mes: ${objetivo}` : "",
    `Pilares:\n${pilares.map((p, i) => `${i + 1}. ${p.nombre}: ${p.para_que}`).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
