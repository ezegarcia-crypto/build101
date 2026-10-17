// Las ilustraciones de los 12 productos, tal cual la web original de BrandIA (apps/web/public/brandia.html,
// array `P`). Se muestran mientras la IA saca la foto real, con el logo del cliente encima.
// `x`, `y`: centro del logo; `ancho`: su tamaño. Todo en % de la ilustración (viewBox 0 0 100 100).
export const MUESTRAS: Record<string, { svg: string; x: string; y: string; ancho: string }> = {
  tarjetas: {
    x: "38%",
    y: "44%",
    ancho: "17%",
    svg: "<rect x=\"12\" y=\"40\" width=\"64\" height=\"38\" rx=\"3\" fill=\"#6B3A1E\" transform=\"rotate(6 44 59)\"/><rect x=\"20\" y=\"28\" width=\"64\" height=\"38\" rx=\"3\" fill=\"#F3E9D6\" transform=\"rotate(-5 52 47)\"/>",
  },
  folletos: {
    x: "50%",
    y: "44%",
    ancho: "18%",
    svg: "<path d=\"M14 26l24-6v60l-24 6z\" fill=\"#E6D6BD\"/><path d=\"M38 20l24 6v60l-24-6z\" fill=\"#F3E9D6\"/><path d=\"M62 26l24-6v60l-24 6z\" fill=\"#E6D6BD\"/>",
  },
  carpeta: {
    x: "49%",
    y: "36%",
    ancho: "26%",
    svg: "<rect x=\"18\" y=\"14\" width=\"62\" height=\"74\" rx=\"3\" fill=\"#2F3B2F\"/><path d=\"M18 62h62v23a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3z\" fill=\"#26311f\"/>",
  },
  lapicera: {
    x: "46%",
    y: "43%",
    ancho: "12%",
    svg: "<g transform=\"rotate(-35 50 50)\"><rect x=\"44\" y=\"8\" width=\"12\" height=\"70\" rx=\"6\" fill=\"#C8662B\"/><path d=\"M44 78h12l-6 14z\" fill=\"#e7d8c2\"/><rect x=\"47\" y=\"4\" width=\"3\" height=\"30\" rx=\"1.5\" fill=\"#9b4c1f\"/></g>",
  },
  gorro: {
    x: "50%",
    y: "48%",
    ancho: "23%",
    svg: "<path d=\"M18 62c0-22 14-36 32-36s32 14 32 36z\" fill=\"#6B3A1E\"/><path d=\"M14 62h58c8 0 16 3 18 8H14z\" fill=\"#54301a\"/><circle cx=\"50\" cy=\"26\" r=\"3\" fill=\"#54301a\"/>",
  },
  remera: {
    x: "60%",
    y: "42%",
    ancho: "16%",
    svg: "<path d=\"M34 14l-22 12 8 16 8-4v48h44V38l8 4 8-16-22-12c-2 6-8 10-16 10s-14-4-16-10z\" fill=\"#2F3B2F\"/>",
  },
  tote: {
    x: "50%",
    y: "62%",
    ancho: "32%",
    svg: "<path d=\"M36 30c0-10 5-16 14-16s14 6 14 16\" fill=\"none\" stroke=\"#b9ad96\" stroke-width=\"3\"/><path d=\"M20 30h60l-4 60H24z\" fill=\"#E9DFC9\"/>",
  },
  vaso: {
    x: "48%",
    y: "58%",
    ancho: "24%",
    svg: "<rect x=\"62\" y=\"12\" width=\"3\" height=\"20\" rx=\"1.5\" fill=\"#999\"/><path d=\"M28 24h42l-4 64a4 4 0 0 1-4 4H36a4 4 0 0 1-4-4z\" fill=\"#C8662B\"/><rect x=\"26\" y=\"18\" width=\"46\" height=\"9\" rx=\"3\" fill=\"#8f4a1d\"/><path d=\"M70 36h6a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-7\" fill=\"none\" stroke=\"#8f4a1d\" stroke-width=\"5\"/>",
  },
  termo: {
    x: "49%",
    y: "57%",
    ancho: "22%",
    svg: "<rect x=\"36\" y=\"6\" width=\"26\" height=\"10\" rx=\"3\" fill=\"#1c241c\"/><path d=\"M40 16h18l2 8H38z\" fill=\"#1c241c\"/><rect x=\"33\" y=\"24\" width=\"32\" height=\"68\" rx=\"7\" fill=\"#2F3B2F\"/>",
  },
  mate: {
    x: "48%",
    y: "62%",
    ancho: "22%",
    svg: "<path d=\"M34 34c-12 8-16 26-8 40 6 12 22 16 34 10 12-6 16-22 10-36-3-7-8-12-14-14z\" fill=\"#6B3A1E\"/><ellipse cx=\"50\" cy=\"34\" rx=\"17\" ry=\"6\" fill=\"#3d2111\"/><rect x=\"58\" y=\"6\" width=\"3.5\" height=\"34\" rx=\"1.7\" fill=\"#b5b5b5\" transform=\"rotate(14 60 23)\"/>",
  },
  taza: {
    x: "48%",
    y: "58%",
    ancho: "26%",
    svg: "<path d=\"M70 44h6a10 10 0 0 1 0 20h-6\" fill=\"none\" stroke=\"#d8d4ca\" stroke-width=\"5\"/><path d=\"M24 32h48v44a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8z\" fill=\"#FBF8F2\" stroke=\"#d8d4ca\" stroke-width=\"1.5\"/><ellipse cx=\"48\" cy=\"90\" rx=\"30\" ry=\"4\" fill=\"#e3ded3\"/>",
  },
  soporte: {
    x: "50%",
    y: "76%",
    ancho: "16%",
    svg: "<rect x=\"40\" y=\"10\" width=\"26\" height=\"50\" rx=\"5\" fill=\"#1E1E1C\" transform=\"rotate(12 53 35)\"/><rect x=\"43\" y=\"14\" width=\"20\" height=\"40\" rx=\"3\" fill=\"#F3E9D6\" transform=\"rotate(12 53 35)\"/><path d=\"M30 62h40l6 22H24z\" fill=\"#C8662B\"/><rect x=\"20\" y=\"84\" width=\"60\" height=\"6\" rx=\"3\" fill=\"#8f4a1d\"/>",
  },
};
