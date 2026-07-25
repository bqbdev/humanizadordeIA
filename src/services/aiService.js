import { localRewrite } from "../engines/localRewriter.js";

export async function rewriteText(text, options) {
  await new Promise((resolve) => setTimeout(resolve, 280));
  return localRewrite(text, options);
}