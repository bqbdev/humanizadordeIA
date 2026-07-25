import { pipeline } from "@huggingface/transformers";

const MODEL = "onnx-community/Qwen2.5-0.5B-Instruct";
let generatorPromise;

const normalize = (text) => text
  .replace(/^```(?:text|markdown)?\s*/i, "")
  .replace(/\s*```$/, "")
  .replace(/^(texto reescrito|reescrita|resultado)\s*:\s*/i, "")
  .replace(/[ \t]+/g, " ")
  .replace(/\s+([,.;:!?])/g, "$1")
  .trim();

const getGenerator = (onProgress) => {
  if (!generatorPromise) {
    const hasWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;
    generatorPromise = pipeline("text-generation", MODEL, {
      device: hasWebGpu ? "webgpu" : "wasm",
      dtype: hasWebGpu ? "q4f16" : "q4",
      progress_callback: (event) => {
        if (event.status === "progress" && Number.isFinite(event.progress)) {
          onProgress?.(`Preparando modelo · ${Math.round(event.progress)}%`);
        }
      },
    });
  }
  return generatorPromise;
};

const meaningfulWords = (text) => new Set(
  (text.toLocaleLowerCase("pt-BR").match(/[\p{L}]{4,}/gu) || [])
    .filter((word) => !["para","como","mais","pela","pelo","uma","entre","também","quando","ainda","sobre"].includes(word)),
);

const difference = (source, result) => {
  const before = meaningfulWords(source);
  const after = meaningfulWords(result);
  if (!before.size) return 1;
  let retained = 0;
  before.forEach((word) => { if (after.has(word)) retained += 1; });
  return 1 - retained / before.size;
};

const numbersPreserved = (source, result) => {
  const numbers = source.match(/\d+(?:[.,]\d+)?%?/g) || [];
  return numbers.every((number) => result.includes(number));
};

const suspiciousPatterns = [
  /\b(diversos|muitos|alguns|outros)\s+(pessoas|ideias|situações|ferramentas|estratégias|atividades)\b/i,
  /\bde (modo|jeito) (respeitosa|clara|equilibrada|adequada|construtiva|positiva)\b/i,
  /\bde forma (respeitoso|claro|equilibrado|adequado|construtivo|positivo)\b/i,
  /\b(a|uma|da|na|pela)\s+(projeto|método|propósito|processo|resultado)\b/i,
  /\b(favorecer|contribuir|possibilitar)\s+para\b/i,
  /\b\w+\s*\/\s*\w+\b/,
];

const isAcceptable = (source, result) => (
  result.length >= source.length * 0.55
  && result.length <= source.length * 1.55
  && difference(source, result) >= 0.32
  && numbersPreserved(source, result)
  && !suspiciousPatterns.some((pattern) => pattern.test(result))
);

const extractGenerated = (output) => {
  const generated = output?.[0]?.generated_text;
  if (Array.isArray(generated)) return generated.at(-1)?.content || "";
  return typeof generated === "string" ? generated : "";
};

async function generateParagraph(generator, paragraph, style, variation, review = false) {
  const instruction = review
    ? `Revise a reescrita abaixo em português brasileiro. Corrija integralmente concordância verbal e nominal, regência, pontuação, coesão e frases incompletas. Mantenha o sentido, todos os fatos, nomes, números e informações do original. Preserve a transformação lexical e estrutural já feita. Entregue somente o parágrafo final, sem título, explicação, aspas ou marcação.\n\nORIGINAL:\n${paragraph}`
    : `Reescreva integralmente o parágrafo em português brasileiro, no estilo ${style}. Reconstrua as frases e substitua massivamente verbos, substantivos, adjetivos, conectivos e expressões por alternativas naturais. Não faça troca mecânica palavra por palavra. Preserve rigorosamente o sentido, todos os fatos, nomes, números e informações. Não invente, não resuma e não amplie. Use concordância verbal e nominal, regência, pontuação, coesão e coerência corretas. Evite fragmentos. A redação final deve ficar claramente diferente do original. Entregue somente o novo parágrafo, sem título, explicação, aspas ou marcação. Variação: ${variation}.\n\nPARÁGRAFO:\n${paragraph}`;
  const output = await generator([
    { role: "system", content: "Você é um revisor profissional especializado na norma-padrão da língua portuguesa brasileira." },
    { role: "user", content: instruction },
  ], {
    max_new_tokens: Math.min(640, Math.max(160, Math.ceil(paragraph.length * 0.75))),
    do_sample: true,
    temperature: review ? 0.2 : 0.72,
    top_p: review ? 0.82 : 0.9,
    repetition_penalty: 1.12,
  });
  return normalize(extractGenerated(output));
}

export async function transformersRewrite(text, { style = "Natural", variation = 0, onProgress } = {}) {
  onProgress?.("Carregando motor de reescrita");
  const generator = await getGenerator(onProgress);
  const paragraphs = text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const rewritten = [];

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    onProgress?.(`Reescrevendo parágrafo ${index + 1} de ${paragraphs.length}`);
    let candidate = "";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      candidate = await generateParagraph(generator, paragraph, style, variation + index + attempt);
      if (!isAcceptable(paragraph, candidate)) {
        onProgress?.(`Revisando automaticamente o parágrafo ${index + 1}`);
        candidate = await generateParagraph(generator, `${paragraph}\n\nREESCRITA A REVISAR:\n${candidate}`, style, variation + index + attempt, true);
      }
      if (isAcceptable(paragraph, candidate)) break;
      onProgress?.(`Criando nova construção para o parágrafo ${index + 1}`);
    }

    if (!isAcceptable(paragraph, candidate)) {
      throw new Error("O motor não conseguiu produzir uma versão simultaneamente diferente e segura para este conteúdo.");
    }
    rewritten.push(candidate);
  }

  return rewritten.join("\n\n");
}