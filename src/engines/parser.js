export const parseText = (raw = "") => {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const paragraphs = text ? text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : [];
  return { text, paragraphs };
};
