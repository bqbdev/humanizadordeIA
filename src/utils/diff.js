export function diffWords(before = "", after = "") {
  const a = before.split(/(\s+)/);
  const b = after.split(/(\s+)/);
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0, html = "";
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  while (i < m && j < n) {
    if (a[i] === b[j]) { html += esc(a[i]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { if (a[i].trim()) html += `<del>${esc(a[i])}</del>`; else html += a[i]; i++; }
    else { if (b[j].trim()) html += `<ins>${esc(b[j])}</ins>`; else html += b[j]; j++; }
  }
  while (i < m) html += a[i].trim() ? `<del>${esc(a[i++])}</del>` : a[i++];
  while (j < n) html += b[j].trim() ? `<ins>${esc(b[j++])}</ins>` : b[j++];
  return html.replace(/\n/g, "<br>");
}
