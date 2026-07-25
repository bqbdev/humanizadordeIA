import { localRewrite } from "../engines/localRewriter.js";

const withTimeout = (promise, milliseconds) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error("O modo contextual excedeu o tempo de espera. A versão rápida continua disponível.")), milliseconds)),
]);

export async function rewriteText(text, options = {}) {
  if (options.signal?.aborted) throw new DOMException("Operação cancelada", "AbortError");
  if (!options.advanced) return localRewrite(text, options);
  const { transformersRewrite } = await import("../engines/transformersRewriter.js");
  return withTimeout(transformersRewrite(text, options), 45000);
}