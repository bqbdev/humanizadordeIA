const audienceGuides = {
  "Ensino Fundamental": "vocabulário simples, frases curtas e explicações concretas",
  "Ensino Médio": "clareza, vocabulário acessível e conceitos bem conectados",
  Faculdade: "rigor conceitual, precisão e progressão lógica",
  Profissional: "clareza executiva, confiança e objetividade",
  Cliente: "benefícios claros, linguagem acolhedora e sem jargão",
  WhatsApp: "tom natural, direto, breve e adequado a mensagem",
  "Redes sociais": "abertura envolvente, ritmo e leitura escaneável",
  "Público geral": "linguagem inclusiva, clara e amplamente compreensível",
};

const styleGuides = {
  Natural: "soar humano, espontâneo e sem fórmulas artificiais",
  Formal: "usar registro formal, preciso e elegante",
  Acadêmico: "usar rigor, coesão argumentativa e vocabulário técnico pertinente",
  Didático: "explicar em sequência progressiva e facilitar a compreensão",
  Objetivo: "ir direto ao ponto e remover tudo que não agrega",
  Conversacional: "usar ritmo de conversa, proximidade e naturalidade",
  Profissional: "ser claro, seguro, conciso e orientado a resultado",
};

const sizeInstruction = ({ size, targetWords }) => ({
  keep: "Mantenha aproximadamente o mesmo número de palavras (variação máxima de 10%).",
  reduce: "Reduza o texto em cerca de 35%, preservando todas as ideias importantes.",
  expand: "Expanda o texto em cerca de 40% com explicações e transições úteis, sem inventar fatos.",
  target: `Aproxime o resultado de ${targetWords} palavras (tolerância de 8%), sem cortar frases de modo abrupto.`,
}[size] || "");

export function buildPrompt(text, options) {
  const variation = options.variation > 0 ? `Esta é a variação ${options.variation}. Use uma organização e escolhas linguísticas diferentes das anteriores.` : "";
  return `Você é um editor sênior de língua portuguesa. Reescreva o texto abaixo com alta qualidade editorial.

OBJETIVOS
- Preserve fatos, intenção, nuance e significado original.
- Melhore clareza, coerência, coesão, fluidez, pontuação e estrutura.
- Elimine redundâncias e repetições desnecessárias.
- Varie construções e conectivos sem criar um tom artificial.
- Não invente fatos, exemplos, números, fontes, nomes ou conclusões.
- Público: ${options.audience}. Diretriz: ${audienceGuides[options.audience]}.
- Estilo: ${options.style}. Diretriz: ${styleGuides[options.style]}.
- ${sizeInstruction(options)}
- ${variation}

Responda SOMENTE com o texto final reescrito. Não use introduções, comentários, rótulos ou cercas de código.

TEXTO:
${text}`;
}
