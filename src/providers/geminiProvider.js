const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

export async function generateWithGemini({ apiKey, model = "gemini-3.5-flash", prompt, signal }) {
  if (!apiKey) throw new Error("Adicione sua chave do Gemini nas configurações.");
  const response = await fetch(`${API_ROOT}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.72, topP: 0.92, maxOutputTokens: 8192 },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "O Gemini não conseguiu processar esta solicitação.");
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) throw new Error("A IA retornou uma resposta vazia. Tente novamente.");
  return text;
}
