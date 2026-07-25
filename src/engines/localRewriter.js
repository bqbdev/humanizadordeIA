const swaps = [
  [/\bdevido ao fato de\b/gi, "porque"],
  [/\bcom o objetivo de\b/gi, "para"],
  [/\bno momento atual\b/gi, "atualmente"],
  [/\buma grande quantidade de\b/gi, "muitos"],
  [/\bna minha opinião pessoal\b/gi, "na minha opinião"],
  [/\bplanejar antecipadamente\b/gi, "planejar"],
  [/\bcontinua a permanecer\b/gi, "permanece"],
  [/\bmas porém\b/gi, "porém"],
];

const clean = (text) => swaps.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text)
  .replace(/[ \t]+/g, " ")
  .replace(/\s+([,.;:!?])/g, "$1")
  .replace(/([.!?])(?=[A-ZÀ-Ú])/g, "$1 ")
  .trim();

export function localRewrite(text, { size = "keep", targetWords = 0 } = {}) {
  let result = clean(text);
  if (size === "reduce") {
    result = result.replace(/\b(basicamente|realmente|literalmente|certamente|obviamente|simplesmente)\b[,]?\s*/gi, "")
      .replace(/\b(na verdade|de fato|de certa forma|em outras palavras)[,]?\s*/gi, "");
  }
  if (size === "expand" && result) result += "\n\nEm síntese, a ideia central ganha força quando seus pontos são apresentados em uma sequência clara, com transições que tornam a leitura mais fluida.";
  if (size === "target" && targetWords > 0) {
    const words = result.split(/\s+/);
    if (words.length > targetWords) result = words.slice(0, targetWords).join(" ").replace(/[,;:]?$/, ".");
  }
  return result;
}
