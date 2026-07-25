import { tokenize } from "../engines/tokenizer.js";

const stopwords = new Set("a o as os de da do das dos e em no na nos nas um uma para por com que se ao à aos às é são foi ser como mais mas ou seu sua seus suas isso isto esse essa ele ela eles elas eu você nós já muito também".split(" "));
const redundancyPatterns = ["basicamente", "na verdade", "de fato", "em outras palavras", "cada vez mais", "de certa forma", "no que diz respeito"];
const connectors = ["além disso", "portanto", "porém", "contudo", "entretanto", "assim", "logo", "então", "por outro lado"];

const syllables = (word) => {
  const groups = word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[aeiouy]+/g);
  return Math.max(1, groups?.length || 1);
};

export function analyze(text) {
  const t = tokenize(text);
  const normalized = t.words.map((w) => w.toLocaleLowerCase("pt-BR"));
  const relevant = normalized.filter((w) => w.length > 2 && !stopwords.has(w));
  const frequencies = relevant.reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map());
  const repeated = [...frequencies.entries()].filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const longSentences = t.sentences.filter((s) => tokenize(s).words.length > 28);
  const shortSentences = t.sentences.filter((s) => tokenize(s).words.length < 4);
  const longParagraphs = t.paragraphs.filter((p) => tokenize(p).words.length > 110);
  const unique = new Set(normalized);
  const diversity = normalized.length ? Math.round((unique.size / normalized.length) * 100) : 0;
  const totalSyllables = normalized.reduce((sum, w) => sum + syllables(w), 0);
  const avgSentence = t.words.length / Math.max(t.sentences.length, 1);
  const avgSyllables = totalSyllables / Math.max(t.words.length, 1);
  const readability = Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * avgSentence - 60.1 * avgSyllables)));
  const passive = t.sentences.filter((s) => /\b(foi|foram|é|são|era|eram|será|serão)\s+\w+(ado|ada|ados|adas|ido|ida|idos|idas)\b/i.test(s));
  const adverbs = normalized.filter((w) => /mente$/.test(w));
  const lower = text.toLowerCase();
  const redundancies = redundancyPatterns.filter((p) => lower.includes(p));
  const connectorCounts = connectors.map((c) => [c, lower.split(c).length - 1]).filter(([, n]) => n > 1);
  const minutes = Math.max(1, Math.ceil(t.words.length / 220));
  const issues = [
    longSentences.length && `${longSentences.length} frase${longSentences.length > 1 ? "s" : ""} longa${longSentences.length > 1 ? "s" : ""}`,
    longParagraphs.length && `${longParagraphs.length} parágrafo${longParagraphs.length > 1 ? "s" : ""} extenso${longParagraphs.length > 1 ? "s" : ""}`,
    repeated.length && `${repeated.length} palavra${repeated.length > 1 ? "s" : ""} repetida${repeated.length > 1 ? "s" : ""}`,
    passive.length && `${passive.length} possível${passive.length > 1 ? "is" : ""} voz${passive.length > 1 ? "es" : ""} passiva${passive.length > 1 ? "s" : ""}`,
  ].filter(Boolean);
  return { ...t, wordCount: t.words.length, sentenceCount: t.sentences.length, paragraphCount: t.paragraphs.length, diversity, readability, repeated, longSentences, shortSentences, longParagraphs, passive, adverbs, redundancies, connectorCounts, minutes, issues };
}

export const readabilityLabel = (score) => score >= 75 ? "Muito fácil" : score >= 55 ? "Clara" : score >= 35 ? "Moderada" : "Complexa";
