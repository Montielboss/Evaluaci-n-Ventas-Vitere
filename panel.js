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
    document.getElementById("sideThemeBtn").textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    document.getElementById("sideThemeBtn").textContent = "🌙";
  }
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
}
initTheme();

function initSideToolbar(){
  document.getElementById("sideThemeBtn").addEventListener("click", () => {
    const current = localStorage.getItem(THEME_KEY) || "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
  document.getElementById("sideRefreshBtn").addEventListener("click", loadEvaluaciones);
  document.getElementById("sideSearchBtn").addEventListener("click", () => {
    searchOpen = !searchOpen;
    renderList();
    if(searchOpen){
      const input = document.getElementById("searchInput");
      if(input) input.focus();
    }
  });
}
initSideToolbar();

document.getElementById("panelBackBtn").addEventListener("click", () => {
  if(document.referrer && document.referrer.indexOf(location.host) !== -1){
    history.back();
  } else {
    location.href = location.pathname.replace(/[^/]*$/, "");
  }
});

const main = document.getElementById("main");
let allItems = [];
let searchTerm = "";
let filterMode = "all";
let searchOpen = false;
let currentView = "list"; // "list" | "detail"

function formatDate(item){
  if(!item.savedAt) return item.meta?.fecha || "Sin fecha";
  const d = new Date(item.savedAt);
  if(isNaN(d.getTime())) return item.meta?.fecha || "Sin fecha";
  return d.toLocaleDateString("es-MX");
}
function formatTime(item){
  if(!item.savedAt) return "";
  const d = new Date(item.savedAt);
  if(isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" });
}

async function loadEvaluaciones(){
  currentView = "list";
  renderList(true);
  try{
    const snap = await db.collection("evaluaciones").orderBy("savedAt", "desc").get();
    allItems = snap.docs.map(doc => doc.data());
    renderList();
  }catch(e){
    console.error(e);
    main.innerHTML = `
      <div class="screen">
        <div class="saved-empty">No se pudieron cargar los datos. Revisa tu conexión a internet o las reglas de Firestore.</div>
      </div>
    `;
  }
}

function matchesFilters(item){
  if(filterMode === "pass" && !item.passed) return false;
  if(filterMode === "fail" && item.passed) return false;
  const term = searchTerm.trim().toLowerCase();
  if(term.length < 3) return true;
  const haystack = [item.meta?.nombreCliente, item.meta?.vendedor, item.meta?.ruta, item.meta?.fecha, item.meta?.codigoCliente]
    .join(" ").toLowerCase();
  return haystack.includes(term);
}

function renderList(loading){
  currentView = "list";
  const filtered = loading ? [] : allItems.filter(matchesFilters);
  const passCount = allItems.filter(i => i.passed).length;
  const avgPct = allItems.length ? Math.round(allItems.reduce((s, i) => s + (i.pct || 0), 0) / allItems.length) : 0;

  main.innerHTML = `
    <div class="screen">
      <div class="panel-top">
        <div class="panel-stats-line">
          <div class="stat"><span class="n">${allItems.length}</span><span class="l">Visitas</span></div>
          <div class="stat"><span class="n">${passCount}</span><span class="l">Aprobadas</span></div>
          <div class="stat"><span class="n">${avgPct}%</span><span class="l">Promedio</span></div>
        </div>
        <div class="filter-chips" id="filterChips">
          <button class="chip${filterMode === "all" ? " active" : ""}" data-filter="all">Todas</button>
          <button class="chip${filterMode === "pass" ? " active" : ""}" data-filter="pass">Aprobadas</button>
          <button class="chip${filterMode === "fail" ? " active" : ""}" data-filter="fail">No aprobadas</button>
        </div>
        <div class="panel-search-wrap${searchOpen ? " open" : ""}">
          <input class="field-input search-input" id="searchInput" type="text" placeholder="Buscar por cliente, vendedor, ruta o fecha" value="${searchTerm.replace(/"/g,'&quot;')}">
        </div>
      </div>

      <div class="results-count">${loading ? "Cargando…" : (searchTerm.trim().length > 0 && searchTerm.trim().length < 3 ? "Escribe al menos 3 caracteres para buscar" : `${filtered.length} de ${allItems.length} evaluaciones`)}</div>

      <div class="panel-grid" id="savedListContainer">
        ${loading ? "" : (filtered.length === 0
          ? `<div class="saved-empty">${allItems.length === 0 ? "Aún no hay evaluaciones en la nube." : "No se encontraron evaluaciones con ese criterio."}</div>`
          : filtered.map((item) => `
            <div class="panel-card" data-index="${allItems.indexOf(item)}">
              <svg class="gauge-svg" viewBox="0 0 100 60">
                <path class="gauge-bg" d="M10 50 A 40 40 0 0 1 90 50" />
                <path class="gauge-fill ${item.passed ? "pass" : "fail"}" data-pct="${item.pct}" d="M10 50 A 40 40 0 0 1 90 50" />
                <text x="50" y="48" text-anchor="middle" class="gauge-pct-text">${item.pct}%</text>
              </svg>
              <div class="top-line">${item.meta?.nombreCliente || "Sin nombre de cliente"}</div>
              <div class="sub-line">${item.meta?.vendedor || "Sin vendedor"} · ${item.meta?.ruta || "Sin ruta"}</div>
              <div class="sub-line">${formatTime(item)}</div>
              <div class="sub-line">${formatDate(item)}</div>
              ${(typeof item.earned === "number" && typeof item.total === "number") ? `<div class="points-line">${Math.round(item.earned * 10) / 10} de ${Math.round(item.total * 10) / 10} puntos</div>` : ""}
            </div>
          `).join(""))
        }
      </div>
    </div>
  `;

  document.querySelectorAll(".gauge-fill").forEach((el) => {
    const len = el.getTotalLength();
    const pct = Math.max(0, Math.min(100, parseFloat(el.dataset.pct) || 0)) / 100;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len * (1 - pct)}`;
  });

  const searchInput = document.getElementById("searchInput");
  if(searchInput){
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      const cursorPos = e.target.selectionStart;
      renderList();
      const newInput = document.getElementById("searchInput");
      if(newInput){
        newInput.focus();
        newInput.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }
  document.querySelectorAll("#filterChips .chip").forEach(chip => {
    chip.addEventListener("click", () => { filterMode = chip.dataset.filter; renderList(); });
  });
  document.querySelectorAll(".panel-card").forEach(el => {
    el.addEventListener("click", () => renderDetail(allItems[parseInt(el.dataset.index, 10)]));
  });
}

function renderDetail(item, editMode){
  currentView = "detail";

  const metaBlock = editMode ? `
    <div style="max-width:380px; margin:0 auto 24px; display:flex; flex-direction:column; gap:10px;">
      <input class="field-input" id="editNombre" type="text" placeholder="Nombre del cliente" value="${(item.meta?.nombreCliente || "").replace(/"/g,'&quot;')}">
      <input class="field-input" id="editVendedor" type="text" placeholder="Vendedor" value="${(item.meta?.vendedor || "").replace(/"/g,'&quot;')}">
      <input class="field-input" id="editRuta" type="text" placeholder="Ruta" value="${(item.meta?.ruta || "").replace(/"/g,'&quot;')}">
      <input class="field-input" id="editFecha" type="date" value="${(item.meta?.fecha || "").replace(/"/g,'&quot;')}">
      <div style="display:flex; gap:10px; margin-top:6px;">
        <button class="btn-primary" id="saveEditBtn" style="flex:1; justify-content:center;">Guardar cambios</button>
        <button class="btn-ghost" id="cancelEditBtn" style="flex:1; justify-content:center;">Cancelar</button>
      </div>
    </div>
  ` : `
    <div class="result-head">
      <div class="seal"><span class="pct">${item.pct}%</span></div>
      <div class="result-sub">${item.meta?.nombreCliente || "Sin nombre de cliente"}</div>
      <div class="result-sub">${formatDate(item)} · ${formatTime(item)} · ${item.meta?.vendedor || "Sin vendedor"} · ${item.meta?.ruta || "Sin ruta"}</div>
    </div>
  `;

  main.innerHTML = `
    <div class="screen">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px; max-width:640px; margin:0 auto 10px;">
        <button class="btn-ghost" id="backBtn" style="padding:8px 10px;">← Volver</button>
        ${editMode ? "" : `
          <div style="display:flex; gap:8px;">
            <button class="btn-ghost" id="editBtn" style="padding:8px 10px;">✏️ Editar</button>
            <button class="btn-ghost btn-exit" id="deleteBtn" style="padding:8px 10px;">🗑️ Eliminar</button>
          </div>
        `}
      </div>
      ${metaBlock}
      ${editMode ? "" : `
      <div class="breakdown" style="max-width:640px; margin:0 auto;">
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
        <div class="list-score-summary" style="max-width:640px; margin:0 auto;">
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
      `}
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => renderList());

  if(editMode){
    document.getElementById("cancelEditBtn").addEventListener("click", () => renderDetail(item, false));
    document.getElementById("saveEditBtn").addEventListener("click", async () => {
      const newMeta = {
        ...item.meta,
        nombreCliente: document.getElementById("editNombre").value,
        vendedor: document.getElementById("editVendedor").value,
        ruta: document.getElementById("editRuta").value,
        fecha: document.getElementById("editFecha").value
      };
      try{
        await db.collection("evaluaciones").doc(String(item.id)).update({ meta: newMeta });
        item.meta = newMeta;
        const idx = allItems.findIndex(i => i.id === item.id);
        if(idx !== -1) allItems[idx].meta = newMeta;
        renderDetail(item, false);
      }catch(e){
        alert("No se pudo guardar el cambio: " + e.message);
      }
    });
  } else {
    document.getElementById("editBtn").addEventListener("click", () => renderDetail(item, true));
    document.getElementById("deleteBtn").addEventListener("click", async () => {
      if(!confirm("¿Seguro que quieres eliminar esta evaluación? No se puede deshacer.")) return;
      try{
        await db.collection("evaluaciones").doc(String(item.id)).delete();
        allItems = allItems.filter(i => i.id !== item.id);
        renderList();
      }catch(e){
        alert("No se pudo eliminar: " + e.message);
      }
    });
  }
}

loadEvaluaciones();
