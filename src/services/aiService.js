export async function rewriteText(text, options) {
  if (options?.signal?.aborted) throw new DOMException("Operação cancelada", "AbortError");
  const { transformersRewrite } = await import("../engines/transformersRewriter.js");
  return transformersRewrite(text, options);
}