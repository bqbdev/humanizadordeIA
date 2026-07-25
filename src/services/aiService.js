import { buildPrompt } from "../prompt/prompts.js";
import { generateWithGemini } from "../providers/geminiProvider.js";
import { localRewrite } from "../engines/localRewriter.js";

export async function rewriteText(text, options, signal) {
  if (options.mode === "local") return localRewrite(text, options);
  return generateWithGemini({
    apiKey: options.apiKey,
    model: options.model,
    prompt: buildPrompt(text, options),
    signal,
  });
}
