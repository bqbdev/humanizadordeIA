import { tokenize } from "./tokenizer.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const deviation = (values, mean = average(values)) => values.length
  ? Math.sqrt(average(values.map((value) => (value - mean) ** 2)))
  : 0;

const connectorPattern = /\b(além disso|portanto|dessa forma|assim|contudo|entretanto|por isso|ao mesmo tempo|na prática|ainda assim|por outro lado)\b/giu;
const contentWords = (text) => text.toLocaleLowerCase("pt-BR").match(/[\p{L}]{4,}/gu) || [];

export function extractStyleSignature(text = "") {
  const tokens = tokenize(text);
  const sentenceLengths = tokens.sentences.map((sentence) => tokenize(sentence).words.length).filter(Boolean);
  const meanSentenceLength = average(sentenceLengths);
  const words = contentWords(text);
  const uniqueWords = new Set(words);
  const sentenceCount = Math.max(1, sentenceLengths.length);

  return {
    meanSentenceLength,
    sentenceDeviation: deviation(sentenceLengths, meanSentenceLength),
    shortSentenceRatio: sentenceLengths.filter((length) => length <= 10).length / sentenceCount,
    longSentenceRatio: sentenceLengths.filter((length) => length >= 24).length / sentenceCount,
    commaRate: (text.match(/,/g) || []).length / sentenceCount,
    colonRate: (text.match(/[:;]/g) || []).length / sentenceCount,
    dashRate: (text.match(/—/g) || []).length / sentenceCount,
    connectorRate: (text.match(connectorPattern) || []).length / sentenceCount,
    lexicalDiversity: words.length ? uniqueWords.size / words.length : 0,
  };
}

const FEATURES = [
  "meanSentenceLength", "sentenceDeviation", "shortSentenceRatio", "longSentenceRatio",
  "commaRate", "colonRate", "dashRate", "connectorRate", "lexicalDiversity",
];

export function learnStyleProfile(current = {}, editedText = "") {
  const signature = extractStyleSignature(editedText);
  const samples = Math.max(0, Number(current.samples) || 0);
  const weight = samples < 5 ? 1 / (samples + 1) : 0.18;
  const next = { samples: samples + 1, updatedAt: new Date().toISOString() };

  FEATURES.forEach((feature) => {
    const previous = Number(current[feature]);
    next[feature] = Number.isFinite(previous)
      ? previous * (1 - weight) + signature[feature] * weight
      : signature[feature];
  });
  return next;
}

const normalizedDifference = (value, target, scale) => Math.abs(value - target) / Math.max(scale, 0.01);

export function styleDistance(text, profile = {}) {
  if (!profile.samples) return 0;
  const value = extractStyleSignature(text);
  return (
    normalizedDifference(value.meanSentenceLength, profile.meanSentenceLength, 18)
    + normalizedDifference(value.sentenceDeviation, profile.sentenceDeviation, 10)
    + normalizedDifference(value.shortSentenceRatio, profile.shortSentenceRatio, 1)
    + normalizedDifference(value.longSentenceRatio, profile.longSentenceRatio, 1)
    + normalizedDifference(value.commaRate, profile.commaRate, 2)
    + normalizedDifference(value.colonRate, profile.colonRate, 1)
    + normalizedDifference(value.dashRate, profile.dashRate, 1)
    + normalizedDifference(value.connectorRate, profile.connectorRate, 1)
    + normalizedDifference(value.lexicalDiversity, profile.lexicalDiversity, 1)
  ) / FEATURES.length;
}

const bigrams = (text) => {
  const words = contentWords(text);
  return new Set(words.slice(0, -1).map((word, index) => `${word} ${words[index + 1]}`));
};

export function structuralDifference(source, result) {
  const original = bigrams(source);
  const rewritten = bigrams(result);
  if (!original.size) return source.trim() === result.trim() ? 0 : 1;
  let retained = 0;
  original.forEach((pair) => { if (rewritten.has(pair)) retained += 1; });
  return clamp(1 - retained / original.size, 0, 1);
}

export function adaptiveCandidateScore(source, candidate, profile = {}) {
  const structure = structuralDifference(source, candidate);
  const distance = styleDistance(candidate, profile);
  const repeatedOpenings = tokenize(candidate).sentences
    .map((sentence) => contentWords(sentence)[0])
    .filter(Boolean)
    .reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map());
  const repetitionPenalty = [...repeatedOpenings.values()].some((count) => count >= 3) ? 0.25 : 0;
  return structure * 2 - distance - repetitionPenalty;
}

