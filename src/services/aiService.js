import { contextualLocalRewrite } from "../engines/contextualLocalRewriter.js";

const normalizeFallback = (text = "") => text
  .replace(/\r\n?/g, "\n")
  .replace(/[ \t]+/g, " ")
  .replace(/\s+([,.;:!?])/g, "$1")
  .replace(/([.!?])(?=[\p{Lu}])/gu, "$1 ")
  .trim();

const fallbackRewrite = (text, variation = 0) => {
  const choices = variation % 2 === 0
    ? [[/\balém disso\b/gi, "Também"], [/\bdessa forma\b/gi, "Com isso"], [/\bcom o objetivo de\b/gi, "para"]]
    : [[/\balém disso\b/gi, "Somado a isso"], [/\bdessa forma\b/gi, "Assim"], [/\bcom o objetivo de\b/gi, "a fim de"]];
  return choices.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), normalizeFallback(text));
};

const comparableWords = (text = "") => text.toLocaleLowerCase("pt-BR").match(/[\p{L}]{4,}/gu) || [];

const changedWordRatio = (source, result) => {
  const original = new Set(comparableWords(source));
  const rewritten = new Set(comparableWords(result));
  if (!original.size) return source.trim() === result.trim() ? 0 : 1;
  let retained = 0;
  original.forEach((word) => { if (rewritten.has(word)) retained += 1; });
  return 1 - retained / original.size;
};

export async function rewriteText(text, options = {}) {
  if (options.signal?.aborted) throw new DOMException("Operação cancelada", "AbortError");
  await new Promise((resolve) => setTimeout(resolve, 40));
  try {
    const result = contextualLocalRewrite(text, options);
    if (typeof result !== "string" || !result.trim()) throw new Error("Resultado vazio");
    if (result.trim() === text.trim() || changedWordRatio(text, result) < 0.08) {
      const recovered = fallbackRewrite(result, options.variation);
      if (recovered.trim() !== text.trim()) return recovered;
      throw new Error("O texto precisa de uma nova construção");
    }
    return result;
  } catch (error) {
    console.warn("O motor principal usou a recuperação segura.", error);
    try {
      const retry = contextualLocalRewrite(text, { ...options, variation: (options.variation ?? 0) + 1 });
      if (retry.trim() !== text.trim() && changedWordRatio(text, retry) >= 0.08) return retry;
    } catch (retryError) {
      console.warn("A segunda construção também precisou de recuperação.", retryError);
    }
    const recovered = fallbackRewrite(text, options.variation);
    if (recovered.trim() !== text.trim()) return recovered;
    throw new Error("Não foi possível alterar este trecho com segurança. Acrescente mais contexto e tente novamente.");
  }
}
