import { Button } from "@build101/ui/components/button";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 py-16">
      <p className="label">Tu marca, andando.</p>
      <h1 className="display mt-3 max-w-2xl">De tu historia a tu marca.</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Contanos tu negocio, hablando o por chat. BrandIA te hace las preguntas justas y arma tu
        identidad de marca.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" disabled>
          Empezar · en construcción
        </Button>
        <Button size="lg" variant="outline" disabled>
          Hablar con BrandIA
        </Button>
      </div>
      <hr className="costura" />
      <section className="rounded-lg border bg-card p-6">
        <h2>En construcción</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Estamos armando BrandIA en build 101. Muy pronto, acá.
        </p>
      </section>
    </main>
  );
}
