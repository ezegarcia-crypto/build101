import { NoObjectGeneratedError } from "ai";

// Si la IA devuelve algo que no respeta el formato, se reintenta una vez antes de dar error.
export async function conReintento<T>(llamada: () => Promise<T>): Promise<T> {
  try {
    return await llamada();
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) return llamada();
    throw error;
  }
}
