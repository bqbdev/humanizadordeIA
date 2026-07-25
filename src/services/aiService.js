import { localRewrite } from "../engines/localRewriter.js";

export async function rewriteText(text, options = {}) {
  if (options.signal?.aborted) throw new DOMException("Operação cancelada", "AbortError");
  await new Promise((resolve) => setTimeout(resolve, 40));
  return localRewrite(text, options);
}