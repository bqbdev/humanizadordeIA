import test from "node:test";
import assert from "node:assert/strict";
import { contextualLocalRewrite } from "../src/engines/contextualLocalRewriter.js";
import { rewriteText } from "../src/services/aiService.js";

test("reescreve um texto geral sem alterar seu tema", () => {
  const source = "A tecnologia está cada vez mais presente no cotidiano das pessoas, transformando a maneira como nos comunicamos, trabalhamos e adquirimos conhecimento. Embora seus avanços proporcionem inúmeras facilidades, o uso excessivo dos recursos digitais pode comprometer as relações humanas e a qualidade de vida. Nesse contexto, torna-se fundamental estabelecer um equilíbrio entre os benefícios da inovação e a preservação das interações sociais. Assim, utilizar a tecnologia de maneira consciente e responsável é essencial para aproveitar suas vantagens sem prejudicar o bem-estar individual e coletivo.";
  const result = contextualLocalRewrite(source);

  assert.notEqual(result, source);
  assert.match(result, /tecnologia/i);
  assert.match(result, /inovação/i);
  assert.doesNotMatch(result, /solução digital/i);
  assert.doesNotMatch(result, /a bem-estar/i);
  assert.doesNotMatch(result, /proporcionem\./i);
});

test("transforma uma concessão em oração independente com concordância", () => {
  const source = "Embora as medidas sejam importantes, elas podem comprometer os resultados.";
  const result = contextualLocalRewrite(source, { variation: 1 });

  assert.doesNotMatch(result, /medidas sejam/i);
  assert.match(result, /medidas são/i);
});

test("gera variações diferentes", () => {
  const source = "Nesse contexto, torna-se fundamental estabelecer um equilíbrio entre os benefícios e os riscos.";
  assert.notEqual(
    contextualLocalRewrite(source, { variation: 0 }),
    contextualLocalRewrite(source, { variation: 1 }),
  );
});

test("reestrutura finalidade, condição, simultaneidade e sequência", () => {
  const samples = [
    "A empresa pretende ampliar sua presença no mercado por meio de uma estratégia que combina atendimento personalizado e preços competitivos.",
    "O contrato poderá ser rescindido caso uma das partes deixe de cumprir as obrigações previstas, sem prejuízo da aplicação das penalidades estabelecidas.",
    "Enquanto as pessoas corriam para se proteger, Marina permaneceu junto à janela.",
    "O sistema processa os dados e valida os campos antes de enviar a confirmação ao usuário.",
    "A avaliação formativa permite acompanhar o desenvolvimento dos estudantes e identificar dificuldades.",
  ];

  for (const source of samples) {
    const result = contextualLocalRewrite(source);
    assert.notEqual(result, source);
    assert.doesNotMatch(result, /\b(para para|a bem-estar)\b/i);
    assert.doesNotMatch(result, /\bse .{0,40}\b(deixe|deixa|seja|tenha|possa|esteja)\b/i);
    assert.doesNotMatch(result, /\bobserva-se as\b/i);
    assert.doesNotMatch(result, /\bmarina\b/);
  }
});

test("o serviço completo não rejeita uma reordenação estrutural válida", async () => {
  const source = "O sistema processa os dados recebidos, valida os campos obrigatórios e armazena as informações no banco de dados antes de enviar a confirmação ao usuário.";
  const result = await rewriteText(source);

  assert.notEqual(result, source);
  assert.match(result, /^Antes de enviar a confirmação ao usuário,/i);
});

