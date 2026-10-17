const dolares = new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const centavos = new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", minimumFractionDigits: 3, maximumFractionDigits: 4 });
const enteros = new Intl.NumberFormat("es-UY");

/** Dólares. Por debajo de 10 centavos muestra más decimales, para que no aparezca todo como 0,00. */
export function usd(n: number) {
  return (n > 0 && n < 0.1 ? centavos : dolares).format(n);
}

export function numero(n: number | undefined) {
  return enteros.format(n ?? 0);
}
