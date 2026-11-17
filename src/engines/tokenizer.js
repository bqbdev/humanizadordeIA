const wordPattern = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

const splitSentences = (text = "") => {
  if (!text.trim()) return [];
  if (typeof Intl?.Segmenter === "function") {
    return [...new Intl.Segmenter("pt-BR", { granularity: "sentence" }).segment(text)]
      .map(({ segment }) => segment.trim())
      .filter(Boolean);
  }
  const protectedText = text.replace(/(?<=\d)\.(?=\d)/g, "∯");
  return (protectedText.match(/[^.!?…]+(?:[.!?…]+|$)/g) || [])
    .map((sentence) => sentence.replace(/∯/g, ".").trim())
    .filter(Boolean);
};

export const tokenize = (text = "") => ({
  words: text.match(wordPattern) || [],
  sentences: splitSentences(text),
  paragraphs: text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()) : [],
  punctuation: text.match(/[.,;:!?…—()[\]"“”'‘’]/g) || [],
});
