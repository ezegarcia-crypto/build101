// Las pantallas "en construcción", agrupadas por módulo. La página índice las lista desde acá.
export type Seccion = { ruta: string; nombre: string; resumen: string };

export const GRUPOS: { modulo: string; secciones: Seccion[] }[] = [
  {
    modulo: "Módulo B · Generá tus contenidos",
    secciones: [
      {
        ruta: "redes",
        nombre: "Todas tus redes en un solo lugar",
        resumen: "Conectás tus cuentas una vez y BrandIA publica y programa todo desde acá.",
      },
      {
        ruta: "pauta",
        nombre: "Pauta en Meta",
        resumen: "Qué anuncios funcionan en tu rubro y tu anuncio armado con tu marca.",
      },
      {
        ruta: "newsletter",
        nombre: "Newsletter",
        resumen: "Un mail para tus clientes, con tu voz y tu diseño, listo para mandar.",
      },
      {
        ruta: "linkedin",
        nombre: "LinkedIn",
        resumen: "Publicaciones con un tono más profesional, sin dejar de sonar a vos.",
      },
      {
        ruta: "x",
        nombre: "X",
        resumen: "Mensajes cortos y frecuentes, con la voz de tu marca.",
      },
      {
        ruta: "web",
        nombre: "Tu web",
        resumen: "Contás qué necesitás y BrandIA arma tu web con tu marca. La cambiás hablando.",
      },
    ],
  },
  {
    modulo: "Módulo C · BranderIA",
    secciones: [
      {
        ruta: "branderia",
        nombre: "BranderIA",
        resumen: "Elegís tus productos y BrandIA los produce con tu marca y te los manda.",
      },
    ],
  },
];
