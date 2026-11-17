import { tokenize } from "./tokenizer.js";

const phraseBanks = [
  ["cada vez mais", ["com presença crescente", "de forma cada vez mais ampla", "progressivamente"]],
  ["no cotidiano das pessoas", ["na rotina da população", "no dia a dia", "na vida diária"]],
  ["a maneira como", ["o modo pelo qual", "a forma de", "como"]],
  ["inúmeras facilidades", ["diversas possibilidades", "muitas vantagens", "uma série de benefícios"]],
  ["uso excessivo", ["utilização em excesso", "emprego sem moderação", "uso além do necessário"]],
  ["pode comprometer", ["pode prejudicar", "é capaz de afetar", "pode colocar em risco"]],
  ["relações humanas", ["vínculos entre as pessoas", "relações interpessoais", "laços sociais"]],
  ["qualidade de vida", ["bem-estar", "condições de vida", "bem-estar cotidiano"]],
  ["torna-se fundamental", ["é necessário", "passa a ser indispensável", "é essencial"]],
  ["estabelecer um equilíbrio", ["buscar um ponto de equilíbrio", "conciliar os dois lados", "encontrar uma medida equilibrada"]],
  ["de maneira consciente e responsável", ["com consciência e responsabilidade", "de modo responsável", "com critério e responsabilidade"]],
  ["sem prejudicar", ["sem causar prejuízo a", "preservando", "sem afetar negativamente"]],
  ["desempenha um papel fundamental", ["tem participação decisiva", "exerce uma função central", "é determinante"]],
  ["desempenha um papel essencial", ["tem participação decisiva", "exerce uma função central", "é indispensável"]],
  ["por meio de", ["por intermédio de", "com", "a partir de"]],
  ["além disso", ["Outro aspecto é que", "Somado a isso", "Também"]],
  ["dessa forma", ["Com isso", "Desse modo", "Assim"]],
  ["em síntese", ["Em resumo", "Em linhas gerais", "Em suma"]],
  ["com o objetivo de", ["para", "a fim de", "com a intenção de"]],
  ["contribui para", ["favorece", "colabora com"]],
  ["contribuem para", ["favorecem", "colaboram com"]],
];

const wordBanks = new Map(Object.entries({
  importante: ["relevante", "significativo"], importantes: ["relevantes", "significativos"],
  fundamental: ["essencial", "indispensável"], fundamentais: ["essenciais", "indispensáveis"],
  contribuir: ["colaborar", "ajudar"], contribui: ["colabora", "ajuda"], contribuem: ["colaboram", "ajudam"],
  compreender: ["entender", "interpretar"], compreende: ["entende", "interpreta"],
  utilizar: ["usar", "empregar"], utiliza: ["usa", "emprega"],
  promover: ["favorecer", "estimular"], promove: ["favorece", "estimula"],
  desenvolver: ["aprimorar", "construir"], desenvolve: ["aprimora", "constrói"],
  criar: ["formar", "produzir"], cria: ["forma", "produz"],
  demonstrar: ["mostrar", "evidenciar"], demonstra: ["mostra", "evidencia"], demonstram: ["mostram", "evidenciam"],
  permitir: ["possibilitar", "viabilizar"], permite: ["possibilita", "viabiliza"],
  melhorar: ["aprimorar", "aperfeiçoar"], preservar: ["proteger", "conservar"],
  diversos: ["diferentes", "vários"], diversas: ["diferentes", "várias"],
  sociedade: ["comunidade", "vida coletiva"], conhecimento: ["aprendizado", "saber"],
}));

const hash = (text, variation = 0) => {
  let value = 2166136261 + variation * 1597;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
};

const pick = (choices, seed, offset = 0) => choices[(seed + offset) % choices.length];
const upperFirst = (value = "") => value ? value[0].toLocaleUpperCase("pt-BR") + value.slice(1) : value;
const lowerFirst = (value = "") => value ? value[0].toLocaleLowerCase("pt-BR") + value.slice(1) : value;
const keepCase = (source, replacement) => /^[A-ZÀ-Ú]/.test(source) ? upperFirst(replacement) : replacement;

const independentClause = (clause) => clause
  .replace(/\bsejam\b/giu, "são")
  .replace(/\bestejam\b/giu, "estão")
  .replace(/\btenham\b/giu, "têm")
  .replace(/\bpossam\b/giu, "podem")
  .replace(/\bproporcionem\b/giu, "proporcionam")
  .replace(/\bcontribuam\b/giu, "contribuem")
  .replace(/\bpermitam\b/giu, "permitem")
  .replace(/\bfavoreçam\b/giu, "favorecem")
  .replace(/\bofereçam\b/giu, "oferecem");

const normalize = (text) => text
  .replace(/\r\n?/g, "\n")
  .replace(/[ \t]+/g, " ")
  .replace(/\s+([,.;:!?])/g, "$1")
  .replace(/([.!?])(?=[\p{Lu}])/gu, "$1 ")
  .replace(/\s*—\s*/g, " — ")
  .trim();

function rewriteStructure(sentence, seed) {
  let value = sentence;

  // Converte construções recorrentes completas, preservando sujeito e complementos.
  value = value.replace(
    /^(.+?) está cada vez mais presente (.+?),\s*(transformando|modificando|alterando) (.+?)([.!?])$/iu,
    (_, subject, place, verb, effect, end) => `${upperFirst(place)}, ${lowerFirst(subject)} ganhou espaço e ${verb === "transformando" ? "vem transformando" : verb === "modificando" ? "vem modificando" : "vem alterando"} ${effect}${end}`,
  );

  value = value.replace(
    /^Embora (.+?),\s*(.+?)([.!?])$/iu,
    (_, concession, main, end) => seed % 2
      ? `${upperFirst(independentClause(concession))}. Ainda assim, ${lowerFirst(main)}${end}`
      : `${upperFirst(independentClause(concession))}, mas ${lowerFirst(main)}${end}`,
  );

  value = value.replace(
    /^(Nesse|Neste|Diante desse) (contexto|cenário),\s*torna-se (fundamental|essencial|necessário) (.+?)([.!?])$/iu,
    (_, demonstrative, context, adjective, action, end) => `Por esse motivo, é preciso ${lowerFirst(action)}${end}`,
  );

  value = value.replace(
    /^Assim,\s*(.+?) é (essencial|fundamental|indispensável) para (.+?)([.!?])$/iu,
    (_, action, adjective, goal, end) => seed % 2
      ? `Para ${lowerFirst(goal)}, é indispensável ${lowerFirst(action)}${end}`
      : `${upperFirst(action)} torna-se necessário para ${lowerFirst(goal)}${end}`,
  );

  value = value.replace(
    /^(.+?) pode ser (compreendido|compreendida|entendido|entendida) como (.+?)([.!?])$/iu,
    (_, subject, participle, definition, end) => `${upperFirst(subject)} corresponde a ${lowerFirst(definition)}${end}`,
  );

  value = value.replace(
    /^Por meio de (.+?),\s*(.+?)([.!?])$/iu,
    (_, means, effect, end) => `${upperFirst(effect)} com ${lowerFirst(means)}${end}`,
  );

  return value;
}

function rewritePhrases(sentence, seed) {
  return phraseBanks.reduce((value, [phrase, choices], index) => {
    const pattern = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "giu");
    return value.replace(pattern, (match) => keepCase(match, pick(choices, seed, index)));
  }, sentence);
}

function rewriteSafeWords(sentence, seed) {
  let index = 0;
  return sentence.replace(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu, (word) => {
    const choices = wordBanks.get(word.toLocaleLowerCase("pt-BR"));
    if (!choices) return word;
    const replacement = pick(choices, seed, index++);
    return keepCase(word, replacement);
  });
}

function polish(sentence) {
  return normalize(sentence)
    .replace(/\ba bem-estar\b/giu, "o bem-estar")
    .replace(/\buma bem-estar\b/giu, "um bem-estar")
    .replace(/^Também,\s+/iu, "Também ")
    .replace(/\bde modo (responsável|consciente|adequado|equilibrado)a\b/giu, "de modo $1")
    .replace(/\bde forma (responsável|consciente|adequada|equilibrada)o\b/giu, "de forma $1")
    .replace(/\bpara para\b/giu, "para")
    .replace(/\b(com isso|assim|desse modo),?\s+\1\b/giu, "$1")
    .replace(/,\s*\./g, ".");
}

function rewriteSentence(sentence, seed) {
  const structured = rewriteStructure(sentence, seed);
  const phrased = rewritePhrases(structured, seed);
  return polish(rewriteSafeWords(phrased, seed));
}

const isHeading = (paragraph) => paragraph.length <= 100
  && tokenize(paragraph).words.length <= 14
  && !/[.!?]$/.test(paragraph);

export function contextualLocalRewrite(text, { variation = 0 } = {}) {
  const source = normalize(text);
  const seed = hash(source, variation);
  const paragraphs = source.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

  return paragraphs.map((paragraph, paragraphIndex) => {
    if (isHeading(paragraph)) return rewritePhrases(rewriteSafeWords(paragraph, seed + paragraphIndex), seed + paragraphIndex);
    const sentences = tokenize(paragraph).sentences;
    return sentences.map((sentence, sentenceIndex) => rewriteSentence(
      sentence,
      seed + paragraphIndex * 17 + sentenceIndex * 7,
    )).join(" ");
  }).join("\n\n");
}

