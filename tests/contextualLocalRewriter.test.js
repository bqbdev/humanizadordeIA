import test from "node:test";
import assert from "node:assert/strict";
import { contextualLocalRewrite } from "../src/engines/contextualLocalRewriter.js";

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

