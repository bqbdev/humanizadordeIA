import { localRewrite } from "../engines/localRewriter.js";

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

export async function rewriteText(text, options = {}) {
  if (options.signal?.aborted) throw new DOMException("Operação cancelada", "AbortError");
  await new Promise((resolve) => setTimeout(resolve, 40));
  try {
    const result = localRewrite(text, options);
    if (typeof result !== "string" || !result.trim()) throw new Error("Resultado vazio");
    return result;
  } catch (error) {
    console.warn("O motor principal usou a recuperação segura.", error);
    return fallbackRewrite(text, options.variation);
  }
}
