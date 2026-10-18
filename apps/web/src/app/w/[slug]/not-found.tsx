import { buttonVariants } from "@build101/ui/components/button";
import Link from "next/link";

export default function WebNoEncontrada() {
  return (
    <main className="row-span-full mx-auto flex w-full max-w-[720px] flex-col justify-center gap-4 px-4 py-12">
      <p className="label">Web no encontrada</p>
      <h1 className="display text-[clamp(2.2rem,7vw,3.4rem)]">Acá no hay ninguna web.</h1>
      <p className="lead text-base">Puede que la dirección esté mal escrita o que la web todavía no se haya publicado.</p>
      <div className="mt-2">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Ir a BrandIA
        </Link>
      </div>
    </main>
  );
}
