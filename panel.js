/* =========================================================================
   PANEL DE GERENTE — muestra las evaluaciones que los vendedores subieron
   a Firestore. Usa la misma configuración de Firebase que la app principal.
   Por ahora no pide login: cualquiera con este archivo puede ver los datos.
   ========================================================================= */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBSxPFcHNt9vEIlvvDAEHuZerPI1MsLRRI",
  authDomain: "punto-de-venta-1f9f5.firebaseapp.com",
  projectId: "punto-de-venta-1f9f5",
  storageBucket: "punto-de-venta-1f9f5.firebasestorage.app",
  messagingSenderId: "724566766871",
  appId: "1:724566766871:web:4e6944e3cdb070867eb352"
};

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

const THEME_KEY = "eval_theme_v1"; // comparte el tema con la app principal

function applyTheme(theme){
  if(theme === "light"){
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("themeToggle").textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    document.getElementById("themeToggle").textContent = "🌙";
  }
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
  document.getElementById("themeToggle").addEventListener("click", () => {
    const current = localStorage.getItem(THEME_KEY) || "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}
initTheme();

const main = document.getElementById("main");
let allItems = [];
let searchTerm = "";
let filterMode = "all";

async function loadEvaluaciones(){
  renderList(true);
  try{
    const snap = await db.collection("evaluaciones").orderBy("savedAt", "desc").get();
    allItems = snap.docs.map(doc => doc.data());
    renderList();
  }catch(e){
    console.error(e);
    main.innerHTML = `
      <div class="screen">
        <div class="saved-header"><h2>Panel de Evaluaciones</h2></div>
        <div class="saved-empty">No se pudieron cargar los datos. Revisa tu conexión a internet o las reglas de Firestore.</div>
      </div>
    `;
  }
}

function matchesFilters(item){
  if(filterMode === "pass" && !item.passed) return false;
  if(filterMode === "fail" && item.passed) return false;
  const term = searchTerm.trim().toLowerCase();
  if(!term) return true;
  const haystack = [item.meta?.nombreCliente, item.meta?.vendedor, item.meta?.ruta, item.meta?.fecha, item.meta?.codigoCliente]
    .join(" ").toLowerCase();
  return haystack.includes(term);
}

function renderList(loading){
  const filtered = loading ? [] : allItems.filter(matchesFilters);
  const passCount = allItems.filter(i => i.passed).length;
  const avgPct = allItems.length ? Math.round(allItems.reduce((s, i) => s + (i.pct || 0), 0) / allItems.length) : 0;

  main.innerHTML = `
    <div class="screen">
      <div class="saved-header">
        <h2>Panel de Evaluaciones</h2>
        <button class="panel-refresh" id="refreshBtn" title="Actualizar">🔄</button>
      </div>
      <div class="panel-stats">
        <div class="meta-card"><div class="n">${allItems.length}</div><div class="l">Visitas</div></div>
        <div class="meta-card"><div class="n">${passCount}</div><div class="l">Aprobadas</div></div>
        <div class="meta-card"><div class="n">${avgPct}%</div><div class="l">Promedio</div></div>
      </div>
      <input class="field-input search-input" id="searchInput" type="text" placeholder="Buscar por cliente, vendedor, ruta o fecha" value="${searchTerm.replace(/"/g,'&quot;')}">
      <div class="filter-chips" id="filterChips">
        <button class="chip${filterMode === "all" ? " active" : ""}" data-filter="all">Todas</button>
        <button class="chip${filterMode === "pass" ? " active" : ""}" data-filter="pass">Aprobadas</button>
        <button class="chip${filterMode === "fail" ? " active" : ""}" data-filter="fail">No aprobadas</button>
      </div>
      <div class="results-count">${loading ? "Cargando…" : `${filtered.length} de ${allItems.length} evaluaciones`}</div>
      <div class="saved-list" id="savedListContainer">
        ${loading ? "" : (filtered.length === 0
          ? `<div class="saved-empty">${allItems.length === 0 ? "Aún no hay evaluaciones en la nube." : "No se encontraron evaluaciones con ese criterio."}</div>`
          : filtered.map((item, i) => `
            <div class="saved-item" data-index="${allItems.indexOf(item)}">
              <div class="info">
                <div class="top-line">${item.meta?.nombreCliente || "Sin nombre de cliente"}</div>
                <div class="sub-line">${item.meta?.fecha || "Sin fecha"} · ${item.meta?.vendedor || "Sin vendedor"} · ${item.meta?.ruta || "Sin ruta"}</div>
              </div>
              <span class="saved-badge ${item.passed ? "pass" : "fail"}">${item.pct}%</span>
              <button class="saved-view" data-index="${allItems.indexOf(item)}" title="Ver detalle">📝</button>
            </div>
          `).join(""))
        }
      </div>
    </div>
  `;

  document.getElementById("refreshBtn").addEventListener("click", loadEvaluaciones);
  const searchInput = document.getElementById("searchInput");
  if(searchInput){
    searchInput.addEventListener("input", (e) => { searchTerm = e.target.value; renderList(); });
  }
  document.querySelectorAll("#filterChips .chip").forEach(chip => {
    chip.addEventListener("click", () => { filterMode = chip.dataset.filter; renderList(); });
  });
  document.querySelectorAll(".saved-view").forEach(btn => {
    btn.addEventListener("click", () => renderDetail(allItems[parseInt(btn.dataset.index, 10)]));
  });
}

function renderDetail(item){
  main.innerHTML = `
    <div class="screen">
      <div class="saved-header">
        <h2>Detalle de evaluación</h2>
        <button class="btn-ghost" id="backBtn" style="padding:8px 10px;">Volver</button>
      </div>
      <div class="result-head">
        <div class="seal"><span class="pct">${item.pct}%</span></div>
        <div class="result-sub">${item.meta?.nombreCliente || "Sin nombre de cliente"}</div>
        <div class="result-sub">${item.meta?.fecha || "Sin fecha"} · ${item.meta?.vendedor || "Sin vendedor"} · ${item.meta?.ruta || "Sin ruta"}</div>
      </div>
      <div class="breakdown">
        <div class="breakdown-title">Detalle de la visita</div>
        ${(item.rows || []).map((r, i) => `
          <div class="b-row">
            <span class="b-mark ${r.mark}">${r.mark === "ok" ? "✓" : r.mark === "bad" ? "✕" : "•"}</span>
            <span class="b-body">
              <span class="b-text">${i + 1}. ${r.text}</span>
              <span class="b-answer">${r.sub}</span>
              ${r.photos && r.photos.length ? `
                <span class="b-photos">
                  ${r.photos.map(src => `<img src="${src}" alt="Evidencia">`).join("")}
                </span>
              ` : ""}
            </span>
          </div>
        `).join("")}
      </div>
      ${item.listScoringRows && item.listScoringRows.length ? `
        <div class="list-score-summary">
          <div class="breakdown-title">Productos colocados</div>
          ${item.listScoringRows.map((r) => `
            <div class="b-row">
              <span class="b-mark neutral">•</span>
              <span class="b-body">
                <span class="b-text">${r.text}</span>
                <span class="b-answer">${r.points} de ${r.maxPoints} puntos · ${r.selected}</span>
              </span>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
  document.getElementById("backBtn").addEventListener("click", () => renderList());
}

loadEvaluaciones();
