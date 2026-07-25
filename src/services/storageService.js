const KEYS = { document: "clareia.document.v1", settings: "clareia.settings.v1", history: "clareia.history.v1" };
const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch { return fallback; } };

export const storage = {
  loadDocument: () => safeParse(localStorage.getItem(KEYS.document), {}),
  saveDocument: (data) => localStorage.setItem(KEYS.document, JSON.stringify(data)),
  loadSettings: () => safeParse(localStorage.getItem(KEYS.settings), {}),
  saveSettings: (data) => localStorage.setItem(KEYS.settings, JSON.stringify(data)),
  loadHistory: () => safeParse(localStorage.getItem(KEYS.history), []),
  pushHistory(version) {
    const history = [version, ...this.loadHistory()].slice(0, 20);
    localStorage.setItem(KEYS.history, JSON.stringify(history));
    return history;
  },
};
