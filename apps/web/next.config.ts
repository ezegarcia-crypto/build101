import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  // La portada es la web de BrandIA tal cual la teníamos (public/brandia.html) y la
  // landing de lista de espera, también tal cual (public/lista-de-espera.html).
  // La app, donde se crea la marca, vive en /crear.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/brandia.html" },
        { source: "/lista-de-espera", destination: "/lista-de-espera.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default withVarlock(nextConfig);
