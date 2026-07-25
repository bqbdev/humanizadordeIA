import { analyze, readabilityLabel } from "./analysis/analyzer.js";
import { rewriteText } from "./services/aiService.js";
import { storage } from "./services/storageService.js";
import { diffWords } from "./utils/diff.js";
import { exportTxt, exportMarkdown, exportDocx, exportPdf } from "./services/exportService.js";
import { icon } from "./utils/icons.js";

const SAMPLE = `Escrever bem não significa usar palavras difíceis. Um bom texto conduz o leitor com clareza, apresenta cada ideia no momento certo e evita repetições que não acrescentam significado.

Com apoio da inteligência artificial, é possível revisar a estrutura, ajustar o tom e encontrar formas mais naturais de dizer a mesma coisa. A tecnologia, porém, deve preservar a intenção de quem escreve — não substituir sua voz.`;

const saved = storage.loadDocument();
const prefs = { theme: "light", apiKey: "", model: "gemini-3.5-flash", mode: "gemini", ...storage.loadSettings() };
const state = {
  original: saved.original ?? SAMPLE,
  result: saved.result ?? "",
  style: saved.style ?? "Natural",
  audience: saved.audience ?? "Público geral",
  size: saved.size ?? "keep",
  targetWords: saved.targetWords ?? 250,
  variation: 0,
  history: storage.loadHistory(),
  controller: null,
  activeTab: "editor",
};

document.documentElement.dataset.theme = prefs.theme;
document.querySelector('meta[name="theme-color"]').content = prefs.theme === "dark" ? "#171816" : "#f7f7f4";

document.querySelector("#app").innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="Clareia — início">
      <span class="brand-mark">${icon("sparkle", 20)}</span>
      <span>clareia</span><em>beta</em>
    </a>
    <nav class="top-actions" aria-label="Ações">
      <span class="save-status"><span></span> Salvo neste dispositivo</span>
      <button class="icon-btn" id="historyBtn" title="Histórico de versões">${icon("history")}</button>
      <button class="icon-btn" id="themeBtn" title="Alternar tema">${icon(prefs.theme === "dark" ? "sun" : "moon")}</button>
      <button class="icon-btn" id="settingsBtn" title="Configurar IA">${icon("settings")}</button>
    </nav>
  </header>

  <main>
    <section class="intro">
      <div>
        <p class="eyebrow">Editor universal de texto com IA</p>
        <h1>Suas ideias, mais <em>claras.</em></h1>
        <p>Reorganize, ajuste o tom e refine qualquer texto sem perder o que você quis dizer.</p>
      </div>
      <div class="shortcut-hint"><kbd>Ctrl</kbd><span>+</span><kbd>Enter</kbd><span>para aprimorar</span></div>
    </section>

    <section class="workspace">
      <div class="toolbar">
        <div class="field">
          <label for="styleSelect">Estilo</label>
          <select id="styleSelect">${["Natural","Formal","Acadêmico","Didático","Objetivo","Conversacional","Profissional"].map(v => `<option ${v === state.style ? "selected" : ""}>${v}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label for="audienceSelect">Para quem</label>
          <select id="audienceSelect">${["Público geral","Ensino Fundamental","Ensino Médio","Faculdade","Profissional","Cliente","WhatsApp","Redes sociais"].map(v => `<option ${v === state.audience ? "selected" : ""}>${v}</option>`).join("")}</select>
        </div>
        <div class="field size-field">
          <label>Tamanho</label>
          <div class="segmented" role="group" aria-label="Tamanho do resultado">
            <button data-size="reduce">Reduzir</button><button data-size="keep">Manter</button><button data-size="expand">Expandir</button><button data-size="target">Meta</button>
          </div>
        </div>
        <div class="field target-field ${state.size === "target" ? "visible" : ""}">
          <label for="targetWords">Palavras</label>
          <input id="targetWords" type="number" min="30" max="5000" value="${state.targetWords}" />
        </div>
        <div class="toolbar-spacer"></div>
        <div class="undo-actions">
          <button class="icon-btn" id="undoBtn" title="Desfazer (Ctrl+Z)">${icon("undo")}</button>
          <button class="icon-btn" id="redoBtn" title="Refazer (Ctrl+Shift+Z)">${icon("redo")}</button>
        </div>
      </div>

      <div class="mobile-tabs">
        <button data-tab="editor" class="active">Original</button>
        <button data-tab="result">Resultado</button>
      </div>

      <div class="editor-grid">
        <article class="editor-panel original-panel">
          <header class="panel-head">
            <div><span class="dot original-dot"></span><h2>Original</h2></div>
            <span id="originalCount">0 palavras</span>
          </header>
          <textarea id="originalText" aria-label="Texto original" placeholder="Cole ou escreva seu texto aqui...">${state.original}</textarea>
          <footer class="panel-foot">
            <button class="text-btn" id="clearBtn">Limpar</button>
            <span id="liveHint">Análise atualizada em tempo real</span>
          </footer>
        </article>

        <article class="editor-panel result-panel">
          <header class="panel-head">
            <div><span class="dot result-dot"></span><h2>Resultado</h2></div>
            <span id="resultCount">0 palavras</span>
          </header>
          <div id="resultText" class="result-text ${state.result ? "" : "empty"}" contenteditable="true" role="textbox" aria-label="Texto reescrito" data-placeholder="Seu texto aprimorado aparecerá aqui.">${state.result}</div>
          <footer class="panel-foot result-foot">
            <button class="text-btn" id="variationBtn" ${state.result ? "" : "disabled"}>${icon("sparkle", 15)} Nova variação</button>
            <div>
              <button class="icon-btn" id="copyBtn" title="Copiar resultado" ${state.result ? "" : "disabled"}>${icon("copy")}</button>
              <div class="export-wrap">
                <button class="icon-btn" id="exportBtn" title="Exportar resultado" ${state.result ? "" : "disabled"}>${icon("download")}</button>
                <div class="export-menu" id="exportMenu"><button data-export="txt">Texto (.txt)</button><button data-export="md">Markdown (.md)</button><button data-export="docx">Word (.docx)</button><button data-export="pdf">PDF (.pdf)</button></div>
              </div>
            </div>
          </footer>
        </article>
      </div>

      <div class="primary-row">
        <div class="privacy-note"><span>${icon("key", 15)}</span><span id="providerLabel">${prefs.mode === "gemini" ? "Gemini · sua chave fica apenas neste navegador" : "Modo local · sem envio de dados"}</span></div>
        <button class="primary-btn" id="rewriteBtn">${icon("sparkle", 18)} <span>Aprimorar texto</span> ${icon("arrow", 18)}</button>
      </div>
    </section>

    <section class="insights" aria-labelledby="analysisTitle">
      <div class="section-title">
        <div><p class="eyebrow">Leitura do texto</p><h2 id="analysisTitle">Um diagnóstico antes de reescrever</h2></div>
        <span class="quality-pill" id="qualityPill">${icon("check", 15)} Texto bem estruturado</span>
      </div>
      <div class="metric-grid">
        <article><span>Palavras</span><strong id="mWords">0</strong><small>total no original</small></article>
        <article><span>Frases</span><strong id="mSentences">0</strong><small id="avgSentence">média de 0 palavras</small></article>
        <article><span>Parágrafos</span><strong id="mParagraphs">0</strong><small>blocos de leitura</small></article>
        <article><span>Diversidade lexical</span><strong id="mDiversity">0%</strong><div class="meter"><i id="diversityBar"></i></div></article>
        <article><span>Legibilidade</span><strong id="mReadability">—</strong><small id="readabilityScore">índice 0/100</small></article>
        <article><span>Tempo de leitura</span><strong id="mTime">1 min</strong><small>a 220 palavras/min</small></article>
      </div>
      <div class="analysis-detail">
        <h3>Pontos de atenção</h3>
        <div id="issueList"></div>
      </div>
    </section>

    <section class="comparison ${state.result ? "" : "hidden"}" id="comparison">
      <div class="section-title"><div><p class="eyebrow">Comparação inteligente</p><h2>Veja exatamente o que mudou</h2></div><div class="legend"><span><i class="removed"></i> removido</span><span><i class="added"></i> adicionado</span></div></div>
      <div class="diff-view" id="diffView"></div>
    </section>
  </main>

  <div class="backdrop" id="backdrop"></div>
  <aside class="drawer" id="settingsDrawer" aria-label="Configurações de IA">
    <header><div><p class="eyebrow">Configurações</p><h2>Provedor de IA</h2></div><button class="icon-btn drawer-close">${icon("close")}</button></header>
    <p class="drawer-copy">O Gemini oferece a melhor relação entre qualidade, gratuidade e implantação estática. Sua chave é salva somente no LocalStorage deste navegador.</p>
    <label class="radio-card"><input type="radio" name="mode" value="gemini" ${prefs.mode === "gemini" ? "checked" : ""}><span><strong>Google Gemini</strong><small>Melhor qualidade · requer chave gratuita</small></span></label>
    <label class="radio-card"><input type="radio" name="mode" value="local" ${prefs.mode === "local" ? "checked" : ""}><span><strong>Revisão local</strong><small>Privada e instantânea · recursos limitados</small></span></label>
    <div class="config-field"><label for="apiKey">Chave da API Gemini</label><div class="password-row"><input id="apiKey" type="password" value="${prefs.apiKey}" placeholder="Cole sua chave aqui"><button id="toggleKey">Mostrar</button></div></div>
    <div class="config-field"><label for="modelName">Modelo</label><input id="modelName" value="${prefs.model}"></div>
    <a class="external-link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Criar chave gratuita no Google AI Studio →</a>
    <button class="primary-btn drawer-save" id="saveSettings">${icon("check", 17)} Salvar configurações</button>
  </aside>

  <aside class="drawer" id="historyDrawer" aria-label="Histórico de versões">
    <header><div><p class="eyebrow">Seu trabalho</p><h2>Histórico de versões</h2></div><button class="icon-btn drawer-close">${icon("close")}</button></header>
    <p class="drawer-copy">As últimas 20 versões ficam guardadas apenas neste dispositivo.</p>
    <div id="historyList" class="history-list"></div>
  </aside>

  <div class="toast" id="toast" role="status"></div>
`;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const originalEl = $("#originalText");
const resultEl = $("#resultText");
let saveTimer;
let undoStack = [state.original], redoStack = [];

const toast = (message, type = "success") => {
  const el = $("#toast"); el.textContent = message; el.className = `toast show ${type}`;
  clearTimeout(el.timer); el.timer = setTimeout(() => el.classList.remove("show"), 2800);
};

const save = () => {
  storage.saveDocument({ original: state.original, result: state.result, style: state.style, audience: state.audience, size: state.size, targetWords: state.targetWords });
  $(".save-status").classList.add("saved");
  setTimeout(() => $(".save-status").classList.remove("saved"), 800);
};

const updateAnalysis = () => {
  const data = analyze(state.original);
  $("#originalCount").textContent = `${data.wordCount} palavra${data.wordCount === 1 ? "" : "s"}`;
  $("#mWords").textContent = data.wordCount.toLocaleString("pt-BR");
  $("#mSentences").textContent = data.sentenceCount;
  $("#mParagraphs").textContent = data.paragraphCount;
  $("#mDiversity").textContent = `${data.diversity}%`;
  $("#diversityBar").style.width = `${data.diversity}%`;
  $("#mReadability").textContent = readabilityLabel(data.readability);
  $("#readabilityScore").textContent = `índice ${data.readability}/100`;
  $("#mTime").textContent = `${data.minutes} min`;
  $("#avgSentence").textContent = `média de ${Math.round(data.wordCount / Math.max(data.sentenceCount, 1))} palavras`;
  const pill = $("#qualityPill");
  pill.innerHTML = data.issues.length ? `${icon("sparkle", 15)} ${data.issues.length} ponto${data.issues.length > 1 ? "s" : ""} a melhorar` : `${icon("check", 15)} Texto bem estruturado`;
  pill.classList.toggle("attention", Boolean(data.issues.length));
  const issues = [];
  if (data.longSentences.length) issues.push(["Frases longas", `${data.longSentences.length} acima de 28 palavras`]);
  if (data.repeated.length) issues.push(["Repetições", data.repeated.map(([w, n]) => `${w} (${n}×)`).join(", ")]);
  if (data.longParagraphs.length) issues.push(["Parágrafos extensos", `${data.longParagraphs.length} acima de 110 palavras`]);
  if (data.redundancies.length) issues.push(["Expressões redundantes", data.redundancies.join(", ")]);
  if (data.passive.length) issues.push(["Voz passiva", `${data.passive.length} possível ocorrência`]);
  if (data.adverbs.length > 4) issues.push(["Advérbios", `${data.adverbs.length} palavras terminadas em “-mente”`]);
  $("#issueList").innerHTML = issues.length ? issues.map(([title, detail]) => `<div class="issue"><span>${icon("sparkle", 14)}</span><div><strong>${title}</strong><small>${detail}</small></div></div>`).join("") : `<div class="issue empty-issue"><span>${icon("check", 15)}</span><div><strong>Nenhum problema relevante</strong><small>O texto apresenta boa estrutura para começar.</small></div></div>`;
};

const updateResult = () => {
  const data = analyze(state.result);
  $("#resultCount").textContent = `${data.wordCount} palavra${data.wordCount === 1 ? "" : "s"}`;
  resultEl.classList.toggle("empty", !state.result);
  ["#variationBtn", "#copyBtn", "#exportBtn"].forEach(s => $(s).disabled = !state.result);
  $("#comparison").classList.toggle("hidden", !state.result);
  if (state.result) $("#diffView").innerHTML = diffWords(state.original, state.result);
};

const scheduleSave = () => {
  clearTimeout(saveTimer);
  $(".save-status").classList.remove("saved");
  saveTimer = setTimeout(save, 500);
};

originalEl.addEventListener("input", () => {
  state.original = originalEl.value;
  undoStack.push(state.original); if (undoStack.length > 80) undoStack.shift();
  redoStack = []; updateAnalysis(); scheduleSave();
});

resultEl.addEventListener("input", () => { state.result = resultEl.innerText; updateResult(); scheduleSave(); });

async function runRewrite(isVariation = false) {
  if (!state.original.trim()) return toast("Escreva ou cole um texto primeiro.", "error");
  if (prefs.mode === "gemini" && !prefs.apiKey) { openDrawer("#settingsDrawer"); return toast("Adicione sua chave gratuita do Gemini.", "error"); }
  state.variation = isVariation ? state.variation + 1 : 0;
  state.controller?.abort();
  state.controller = new AbortController();
  const button = $("#rewriteBtn");
  button.disabled = true; button.classList.add("loading"); button.querySelector("span").textContent = "Aprimorando";
  resultEl.classList.remove("empty"); resultEl.innerHTML = `<div class="result-skeleton"><i></i><i></i><i></i><i></i><i></i></div>`;
  try {
    const result = await rewriteText(state.original, { ...state, ...prefs }, state.controller.signal);
    state.result = result;
    resultEl.textContent = result;
    state.history = storage.pushHistory({ id: crypto.randomUUID(), date: new Date().toISOString(), original: state.original, result, style: state.style, audience: state.audience });
    updateResult(); renderHistory(); save();
    toast(isVariation ? "Nova variação criada." : "Texto aprimorado com sucesso.");
  } catch (error) {
    resultEl.textContent = state.result;
    updateResult();
    if (error.name !== "AbortError") toast(error.message, "error");
  } finally {
    button.disabled = false; button.classList.remove("loading"); button.querySelector("span").textContent = "Aprimorar texto";
  }
}

function openDrawer(selector) {
  $(".drawer.open")?.classList.remove("open");
  $(selector).classList.add("open"); $("#backdrop").classList.add("show");
}
function closeDrawers() { $$(".drawer").forEach(d => d.classList.remove("open")); $("#backdrop").classList.remove("show"); }

function renderHistory() {
  $("#historyList").innerHTML = state.history.length ? state.history.map(v => `<button class="history-item" data-id="${v.id}"><span>${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(v.date))}</span><strong>${v.result.slice(0, 72)}${v.result.length > 72 ? "…" : ""}</strong><small>${v.style} · ${v.audience}</small></button>`).join("") : `<div class="history-empty">${icon("history", 28)}<p>Nenhuma versão criada ainda.</p></div>`;
}

$$("[data-size]").forEach(btn => {
  btn.classList.toggle("active", btn.dataset.size === state.size);
  btn.addEventListener("click", () => {
    state.size = btn.dataset.size; $$("[data-size]").forEach(b => b.classList.toggle("active", b === btn));
    $(".target-field").classList.toggle("visible", state.size === "target"); scheduleSave();
  });
});
$("#styleSelect").addEventListener("change", e => { state.style = e.target.value; scheduleSave(); });
$("#audienceSelect").addEventListener("change", e => { state.audience = e.target.value; scheduleSave(); });
$("#targetWords").addEventListener("input", e => { state.targetWords = Math.max(30, Number(e.target.value)); scheduleSave(); });
$("#rewriteBtn").addEventListener("click", () => runRewrite());
$("#variationBtn").addEventListener("click", () => runRewrite(true));
$("#clearBtn").addEventListener("click", () => { state.original = ""; originalEl.value = ""; updateAnalysis(); scheduleSave(); originalEl.focus(); });
$("#copyBtn").addEventListener("click", async () => { await navigator.clipboard.writeText(state.result); toast("Resultado copiado."); });
$("#exportBtn").addEventListener("click", e => { e.stopPropagation(); $("#exportMenu").classList.toggle("show"); });
document.addEventListener("click", () => $("#exportMenu").classList.remove("show"));
$$("[data-export]").forEach(btn => btn.addEventListener("click", async e => {
  e.stopPropagation(); $("#exportMenu").classList.remove("show");
  try {
    const action = { txt: exportTxt, md: exportMarkdown, docx: exportDocx, pdf: exportPdf }[btn.dataset.export];
    await action(state.result); toast("Arquivo preparado.");
  } catch { toast("Não foi possível exportar. Verifique sua conexão.", "error"); }
}));

$("#themeBtn").addEventListener("click", () => {
  prefs.theme = prefs.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = prefs.theme;
  $("#themeBtn").innerHTML = icon(prefs.theme === "dark" ? "sun" : "moon");
  document.querySelector('meta[name="theme-color"]').content = prefs.theme === "dark" ? "#171816" : "#f7f7f4";
  storage.saveSettings(prefs);
});
$("#settingsBtn").addEventListener("click", () => openDrawer("#settingsDrawer"));
$("#historyBtn").addEventListener("click", () => openDrawer("#historyDrawer"));
$("#backdrop").addEventListener("click", closeDrawers);
$$(".drawer-close").forEach(btn => btn.addEventListener("click", closeDrawers));
$("#toggleKey").addEventListener("click", () => { const input = $("#apiKey"); input.type = input.type === "password" ? "text" : "password"; $("#toggleKey").textContent = input.type === "password" ? "Mostrar" : "Ocultar"; });
$("#saveSettings").addEventListener("click", () => {
  prefs.mode = $('input[name="mode"]:checked').value; prefs.apiKey = $("#apiKey").value.trim(); prefs.model = $("#modelName").value.trim() || "gemini-3.5-flash";
  storage.saveSettings(prefs); $("#providerLabel").textContent = prefs.mode === "gemini" ? "Gemini · sua chave fica apenas neste navegador" : "Modo local · sem envio de dados";
  closeDrawers(); toast("Configurações salvas.");
});
$("#historyList").addEventListener("click", e => {
  const item = e.target.closest("[data-id]"); if (!item) return;
  const version = state.history.find(v => v.id === item.dataset.id); if (!version) return;
  Object.assign(state, { original: version.original, result: version.result, style: version.style, audience: version.audience });
  originalEl.value = state.original; resultEl.textContent = state.result; $("#styleSelect").value = state.style; $("#audienceSelect").value = state.audience;
  updateAnalysis(); updateResult(); save(); closeDrawers(); toast("Versão restaurada.");
});

$("#undoBtn").addEventListener("click", () => {
  if (undoStack.length < 2) return; redoStack.push(undoStack.pop()); state.original = undoStack.at(-1); originalEl.value = state.original; updateAnalysis(); scheduleSave();
});
$("#redoBtn").addEventListener("click", () => {
  if (!redoStack.length) return; state.original = redoStack.pop(); undoStack.push(state.original); originalEl.value = state.original; updateAnalysis(); scheduleSave();
});
$$("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
  state.activeTab = btn.dataset.tab; $$("[data-tab]").forEach(b => b.classList.toggle("active", b === btn));
  $(".workspace").dataset.mobileTab = state.activeTab;
}));
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runRewrite(); }
  if (e.key === "Escape") closeDrawers();
});

updateAnalysis(); updateResult(); renderHistory();
