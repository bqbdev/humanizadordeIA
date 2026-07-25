const wordPattern = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

export const tokenize = (text = "") => ({
  words: text.match(wordPattern) || [],
  sentences: text.match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map((s) => s.trim()).filter(Boolean) || [],
  paragraphs: text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()) : [],
  punctuation: text.match(/[.,;:!?…—()[\]"“”'‘’]/g) || [],
});
