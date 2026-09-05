/* =========================================================================
   CONFIGURA AQUÍ TU EVALUACIÓN
   Tipos de pregunta disponibles:
   - "choice": opción única. options: [..]; expected: índice esperado (opcional,
     define qué respuesta cuenta como correcta); weight: valor máximo del reactivo
     (por defecto 1); optionValues: [..] permite asignar un puntaje distinto a cada
     opción; hasNA:true si la última opción es "N/A" y debe excluirse del cálculo
     cuando se selecciona; followUp: { onValue, label } agrega un campo de texto
     que aparece solo si se elige esa opción (p.ej. "¿porqué?").
   - "checklist": selección múltiple de casillas. items: [..]. Informativo,
     no se califica.
   - "text" / "textarea": campo abierto. Informativo, no se califica.
   ========================================================================= */
const QUESTIONS = [
  { type:"date", text:"Fecha" },
  { type:"text", text:"Ruta", placeholder:"Escribe la ruta" },
  { type:"text", text:"Vendedor", placeholder:"Escribe el nombre del vendedor" },
  { type:"text", text:"Código de cliente", placeholder:"Escribe el código de cliente" },
  { type:"text", text:"Nombre del cliente", placeholder:"Escribe el nombre del cliente" },


  { type:"choice",
  text:"¿El cliente cuenta con publicidad?", options:["Sí","No"], expected:0, weight:4.54,
},
  { type:"choice",
  text:"¿El vendedor saludó al cliente amablemente?", options:["Sí","No"], expected:0, weight:4.54, },
  { type:"choice",
  text:"¿El refrigerador Danone está conectado y a la temperatura correcta?", options:["Sí","No","N/A"], expected:0, weight:0, hasNA:true },
  { type:"photo", text:"Foto del refrigerador Danone", optional:true },

  { type:"choice",
  text:"¿El vendedor revisó caducidades?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },
  { type:"choice",
  text:"¿El producto caducado es de fecha actual?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },
  { type:"choice",
  text:"¿El vendedor separó el producto caducado o en mal estado?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },
  { type:"choice",
  text:"¿El vendedor acomodó su espacio antes de surtir?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },
  { type:"choice",
  text:"¿El vendedor revisó el historial de venta al hacer el pedido?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },
  { type:"choice",
  text:"¿El vendedor utilizó el catálogo para negociar?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },

  { type:"choice",
  text:"¿Hay exhibición de Danone?", options:["Sí","No"], expected:0, weight:11, },
  { type:"photo", text:"Foto de la exhibición Danone", multiple:true, optional:true },

  { type:"checklist", 
  text:"¿Hay presencia de las marcas clave Danone?",
  items:["Danup / Licuados","Activia 225g","Danone 220g","Danonino 170","Danonino 90g","Danonino 42g","Danonino maxi","Danonino pouch","Oikos","Danmix","Dany","Flan","Natalla","Danone c/cereal", "Sin producto"], 
  expected:0, 
  weight:14,
  optionValues:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0] },

  { type:"choice", 
  text:"¿Hay exhibición de Kinder?", options:["Sí","No"], expected:0, weight:5.5, },
  { type:"choice",
  text:"¿Tiene chuponeras?", options:["Sí","No"], expected:0, weight:5.5,
    followUp:{ onValue:0, label:"¿Cuántas?" } },

  { type:"checklist", text:"¿Qué productos Kinder tiene?",
    items:["Sorpresa","Delice","Chocolate","Maxi","Bueno","Mini Bueno", "Sin producto"], 
  expected:0, 
  weight:6,
  optionValues:[1,1,1,1,1,1,0] },
  { type:"checklist", text:"¿Qué productos Nutella tiene?",
    items:["200g","G15","B-ready","Go!", "Sin producto"],
  expected:0, 
  weight:4,
  optionValues:[1,1,1,1,0] },
  { type:"checklist", text:"¿Hay productos complementarios?",
    items:["Palomitas","Iberia","Delicia","Tic-tac","Yakult", "Sin producto"],
  expected:0, 
  weight:5,
  optionValues:[1,1,1,1,1,0] },

  { type:"choice", text:"¿El vendedor acomodó y frentió el producto que surtió?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },
  { type:"choice", text:"¿El vendedor dejó limpia su área?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },
  { type:"choice", text:"¿El vendedor se despide amable al terminar la venta?", options:["Sí","No"], expected:0, weight:4.54,
    followUp:{ onValue:1, label:"¿Por qué?" } },

  { type:"textarea", text:"Observaciones", placeholder:"Escribe cualquier observación adicional" }
];

const PASSING_SCORE = 60; // porcentaje mínimo de cumplimiento
function getPctBand(pct){
  if(pct >= 90) return { label:"Nivel de servicio alto", tone:"pass", comment:"Cumplimiento sobresaliente. El estándar se está cubriendo con margen." };
  if(pct >= 80) return { label:"Nivel de servicio medio", tone:"pass", comment:"Cumplimiento sólido. Ya está dentro del estándar esperado." };
  if(pct >= 70) return { label:"Nivel de servicio bajo", tone:"warn", comment:"Cumplimiento aceptable, pero aún puede mejorarse." };
  if(pct >= 60) return { label:"Aprobado", tone:"warn", comment:"Requiere ajustes importantes para alcanzar el estándar." };
  return { label:"Mala ejecucion", tone:"fail", comment:"No alcanza el nivel mínimo de cumplimiento requerido." };
}
const STORAGE_KEY = " es_guardadas_v1";
const THEME_KEY = "eval_theme_v1";

function applyTheme(theme){
  const btn = document.getElementById("themeToggle");
  if(theme === "light"){
    document.documentElement.setAttribute("data-theme", "light");
    if(btn) btn.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if(btn) btn.textContent = "🌙";
  }
}

function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
  const btn = document.getElementById("themeToggle");
  if(btn){
    btn.addEventListener("click", () => {
      const current = localStorage.getItem(THEME_KEY) || "dark";
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
}
initTheme();

function showExitConfirm(){
  const modal = document.getElementById("exitModal");
  if(modal) modal.classList.remove("hidden");
}
function hideExitConfirm(){
  const modal = document.getElementById("exitModal");
  if(modal) modal.classList.add("hidden");
}
function initExitModal(){
  const cancelBtn = document.getElementById("cancelExitBtn");
  const confirmBtn = document.getElementById("confirmExitBtn");
  if(cancelBtn) cancelBtn.addEventListener("click", hideExitConfirm);
  if(confirmBtn){
    confirmBtn.addEventListener("click", () => {
      hideExitConfirm();
      current = -1;
      QUESTIONS.forEach((q, i) => { answers[i] = defaultAnswer(q); });
      renderIntro();
    });
  }
}
initExitModal();

function loadSaved(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }catch(e){
    return [];
  }
}

function persistSaved(list){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }catch(e){
    return false;
  }
}

/* =========================================================================
   SINCRONIZACIÓN EN LA NUBE (Firebase Firestore)
   Reemplaza los valores de abajo por los de TU proyecto de Firebase
   (Configuración del proyecto → tus apps → objeto firebaseConfig).
   Mientras no los reemplaces, la app sigue funcionando normal, solo local.
   ========================================================================= */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBSxPFcHNt9vEIlvvDAEHuZerPI1MsLRRI",
  authDomain: "punto-de-venta-1f9f5.firebaseapp.com",
  projectId: "punto-de-venta-1f9f5",
  storageBucket: "punto-de-venta-1f9f5.firebasestorage.app",
  messagingSenderId: "724566766871",
  appId: "1:724566766871:web:4e6944e3cdb070867eb352"
};

let db = null;
let cloudReady = false;

function initCloud(){
  try{
    if(!window.firebase || FIREBASE_CONFIG.apiKey === "TU_API_KEY"){
      console.warn("Firebase no está configurado todavía (FIREBASE_CONFIG). La app funcionará solo localmente.");
      return;
    }
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    // Deja que seq guarde cambios sin internet y los mande solo cuando haya señal.
    db.enablePersistence({ synchronizeTabs:true }).catch((err) => {
      console.warn("Persistencia offline no disponible:", err.code);
    });
    cloudReady = true;
    syncPendingToCloud();
  }catch(e){
    console.warn("No se pudo iniciar la sincronización en la nube:", e);
  }
}

function markSynced(id, synced){
  const list = loadSaved();
  const idx = list.findIndex(i => i.id === id);
  if(idx !== -1){
    list[idx].synced = synced;
    persistSaved(list);
  }
}

function pushToCloud(item){
  if(!cloudReady || !db) return;
  db.collection("evaluaciones").doc(String(item.id))
    .set(item)
    .then(() => markSynced(item.id, true))
    .catch((err) => console.warn("No se pudo sincronizar todavía (se reintentará):", err.message));
}

function syncPendingToCloud(){
  if(!cloudReady) return;
  loadSaved().filter(item => !item.synced).forEach(pushToCloud);
}

// Reintenta apenas el teléfono recupera señal, y también al abrir la app.
window.addEventListener("online", syncPendingToCloud);
initCloud();

/* ========================================================================= */

const ICON_SVG = `
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L22 8L12 14L2 8L12 2Z" fill="white" opacity="0.95"/>
    <path d="M2 12L12 18L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    <path d="M2 16L12 22L22 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/>
  </svg>
`;

let current = -1; // -1 = pantalla de bienvenida

function defaultAnswer(q){
  if(q.type === "choice") return { value:null, extra:"" };
  if(q.type === "checklist") return { value:[] };
  if(q.type === "photo") return { value: q.multiple ? [] : "" };
  return { value:"" };
}
const answers = QUESTIONS.map(defaultAnswer);

const scoredQuestions = () => QUESTIONS.filter(q => q.type === "choice");

function canProceed(){
  const q = QUESTIONS[current];
  const ans = answers[current];
  if(q.type === "choice") return ans.value !== null;
  if(q.type === "checklist") return ans.value.length > 0;
  if(q.type === "photo"){
    if(q.optional) return true;
    return q.multiple ? ans.value.length > 0 : !!ans.value;
  }
  return ans.value.trim().length > 0;
}

const main = document.getElementById("main");

function progressHTML(){
  const pct = Math.round((current / QUESTIONS.length) * 100);
  return `
    <div class="progress-wrap">
      <div class="progress-outer"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-caption">Pregunta ${current + 1} de ${QUESTIONS.length}</div>
    </div>
  `;
}

function renderIntro(){
  const savedCount = loadSaved().length;
  main.innerHTML = `
    <div class="screen intro">
      <div class="icon-badge">${ICON_SVG}</div>
      <h1>Evaluación-Punto de Venta</h1>
      <p>Responde cada punto de la visita. Al finalizar verás el porcentaje de cumplimiento y el detalle de cada respuesta.</p>
      <div class="meta-grid">
        <div class="meta-card">
          <div class="n">${QUESTIONS.length}</div>
          <div class="l">Puntos a revisar</div>
        </div>
        <div class="meta-card">
          <div class="n">${PASSING_SCORE}%</div>
          <div class="l">Cumplimiento mínimo</div>
        </div>
      </div>
      <button class="btn-primary btn-wide" id="startBtn">Empezar <span>→</span></button>
      <button class="btn-ghost btn-wide" id="savedBtn" style="margin-top:6px;">Evaluaciones guardadas${savedCount ? ` (${savedCount})` : ""}</button>
      <div class="helper-text">Podrás avanzar y retroceder libremente entre preguntas.</div>
      <a href="panel" class="btn-ghost" style="margin-top:14px; font-size:12.5px;">Panel de gerente →</a>
    </div>
  `;
  document.getElementById("startBtn").addEventListener("click", () => {
    current = 0;
    renderQuestion();
  });
  document.getElementById("savedBtn").addEventListener("click", renderSavedList);
}

function renderSavedList(){
  const allList = loadSaved();
  let searchTerm = "";
  let filterMode = "all";

  main.innerHTML = `
    <div class="screen">
      <div class="saved-header">
        <h2>Evaluaciones guardadas</h2>
        <button class="btn-ghost" id="backToIntroBtn" style="padding:8px 10px;">Volver</button>
      </div>
      <input class="field-input search-input" id="searchInput" type="text" placeholder="Buscar por cliente, vendedor, ruta o fecha">
      <div class="filter-chips" id="filterChips">
        <button class="chip active" data-filter="all">Todas</button>
        <button class="chip" data-filter="pass">Aprobadas</button>
        <button class="chip" data-filter="fail">No aprobadas</button>
      </div>
      <div class="results-count" id="resultsCount"></div>
      <div class="saved-list" id="savedListContainer"></div>
    </div>
  `;

  function matchesFilters(item){
    if(filterMode === "pass" && !item.passed) return false;
    if(filterMode === "fail" && item.passed) return false;
    const term = searchTerm.trim().toLowerCase();
    if(!term) return true;
    const haystack = [item.meta.nombreCliente, item.meta.vendedor, item.meta.ruta, item.meta.fecha, item.meta.codigoCliente]
      .join(" ").toLowerCase();
    return haystack.includes(term);
  }

  function renderList(){
    const filtered = allList.filter(matchesFilters).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    document.getElementById("resultsCount").textContent = allList.length
      ? `${filtered.length} de ${allList.length} evaluaciones`
      : "";
    const container = document.getElementById("savedListContainer");
    container.innerHTML = filtered.length === 0
      ? `<div class="saved-empty">${allList.length === 0 ? "Aún no hay evaluaciones guardadas." : "No se encontraron evaluaciones con ese criterio."}</div>`
      : filtered.map(item => `
        <div class="saved-item" data-id="${item.id}">
          <div class="info">
            <div class="top-line">${item.meta.nombreCliente || "Sin nombre de cliente"}</div>
            <div class="sub-line">${item.meta.fecha || "Sin fecha"} · ${item.meta.vendedor || "Sin vendedor"} · ${item.meta.ruta || "Sin ruta"}</div>
          </div>
          <span class="saved-badge ${item.passed ? "pass" : "fail"}">${item.pct}%</span>
          <span title="${item.synced ? "Sincronizado con la nube" : "Pendiente de sincronizar"}" style="font-size:14px;">${item.synced ? "☁️" : "⏳"}</span>
          <button class="saved-view" data-id="${item.id}" title="Ver detalle">📝</button>
          <button class="saved-delete" data-id="${item.id}" title="Eliminar">✕</button>
        </div>
      `).join("");

    container.querySelectorAll(".saved-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        persistSaved(loadSaved().filter(item => String(item.id) !== id));
        renderSavedList();
      });
    });

    container.querySelectorAll(".saved-view").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = allList.find(i => String(i.id) === btn.dataset.id);
        if(item) renderSavedDetail(item);
      });
    });
  }

  document.getElementById("backToIntroBtn").addEventListener("click", renderIntro);
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderList();
  });
  document.querySelectorAll("#filterChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      filterMode = chip.dataset.filter;
      document.querySelectorAll("#filterChips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderList();
    });
  });

  renderList();
}

function renderSavedDetail(item){
  main.innerHTML = `
    <div class="screen">
      <div class="saved-header">
        <h2>Detalle de evaluación</h2>
        <button class="btn-ghost" id="backToSavedBtn" style="padding:8px 10px;">Volver</button>
      </div>
      <div class="result-head">
        <div class="seal"><span class="pct">${item.pct}%</span></div>
        <div class="result-sub">${item.meta.nombreCliente || "Sin nombre de cliente"}</div>
        <div class="result-sub">${item.meta.fecha || "Sin fecha"} · ${item.meta.vendedor || "Sin vendedor"} · ${item.meta.ruta || "Sin ruta"}</div>
      </div>
      <div class="breakdown">
        <div class="breakdown-title">Detalle de la visita</div>
        ${item.rows.map((r, i) => `
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
  document.getElementById("backToSavedBtn").addEventListener("click", renderSavedList);
}

function renderChoice(q){
  const ans = answers[current];
  const showFollowUp = q.followUp && ans.value === q.followUp.onValue;
  return `
    <div class="options" id="optionsWrap">
      ${q.options.map((opt, i) => `
        <button class="option${ans.value === i ? " selected" : ""}" data-index="${i}">
          <span class="bullet">${String.fromCharCode(65 + i)}</span>
          <span>${opt}</span>
          ${Array.isArray(q.optionValues) ? `<span class="option-score">(${q.optionValues[i]})</span>` : ""}
        </button>
      `).join("")}
    </div>
    ${showFollowUp ? `
      <div class="followup-wrap">
        <label class="followup-label">${q.followUp.label}</label>
        <input class="field-input" id="followUpInput" type="text" value="${ans.extra.replace(/"/g,'&quot;')}" placeholder="Escribe aquí">
      </div>
    ` : ""}
  `;
}

function renderChecklist(q){
  const ans = answers[current];
  const items = Array.isArray(q.items) ? q.items : (Array.isArray(q.options) ? q.options : []);
  return `
    <div class="options" id="optionsWrap">
      ${items.map((item, i) => `
        <button class="option${ans.value.includes(i) ? " selected" : ""}" data-index="${i}">
          <span class="bullet chk">${ans.value.includes(i) ? "✓" : ""}</span>
          <span>${item}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderTextField(q){
  const ans = answers[current];
  return `
    <input class="field-input" id="textInput" type="text" value="${ans.value.replace(/"/g,'&quot;')}" placeholder="${q.placeholder || ""}">
  `;
}

function renderDateField(q){
  const ans = answers[current];
  return `
    <input class="field-input" id="textInput" type="date" value="${ans.value.replace(/"/g,'&quot;')}">
  `;
}

function renderTextArea(q){
  const ans = answers[current];
  return `
    <textarea class="field-input" id="textInput" placeholder="${q.placeholder || ""}">${ans.value}</textarea>
  `;
}

function fileToDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Reduce el tamaño de la foto antes de guardarla (localStorage tiene poco espacio)
function compressImage(dataURL, maxSize = 900, quality = 0.7){
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if(width > height && width > maxSize){ height *= maxSize / width; width = maxSize; }
      else if(height > maxSize){ width *= maxSize / height; height = maxSize; }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

function renderPhoto(q){
  const ans = answers[current];
  const photos = q.multiple ? ans.value : (ans.value ? [ans.value] : []);
  return `
    <div class="photo-wrap" id="photoWrap">
      <div class="photo-grid" id="photoGrid">
        ${photos.map((src, i) => `
          <div class="photo-thumb">
            <img src="${src}" alt="Foto ${i + 1}">
            <button type="button" class="photo-remove" data-index="${i}" title="Quitar">✕</button>
          </div>
        `).join("")}
        ${(q.multiple || photos.length === 0) ? `
          <label class="photo-add">
            <input type="file" accept="image/*" capture="environment" id="photoInput" hidden>
            <span class="photo-add-icon">📷</span>
            <span>${photos.length ? "Agregar" : "Tomar foto"}</span>
          </label>
        ` : ""}
      </div>
      ${q.optional ? `<div class="followup-label" style="margin-top:10px;">Opcional</div>` : ""}
    </div>
  `;
}

function renderQuestion(){
  const q = QUESTIONS[current];
  let body = "";
  if(q.type === "choice") body = renderChoice(q);
  else if(q.type === "checklist") body = renderChecklist(q);
  else if(q.type === "text") body = renderTextField(q);
  else if(q.type === "date") body = renderDateField(q);
  else if(q.type === "textarea") body = renderTextArea(q);
  else if(q.type === "photo") body = renderPhoto(q);

  main.innerHTML = `
    <div class="screen">
      ${progressHTML()}
      <div class="q-eyebrow">${
        q.type === "checklist" ? `Selección múltiple · ${q.optional ? "opcional" : "obligatorio"}` :
        (q.type.startsWith("text") || q.type === "date") ? `Campo abierto · ${q.optional ? "opcional" : "obligatorio"}` :
        q.type === "photo" ? `Evidencia fotográfica · ${q.optional ? "opcional" : "obligatorio"}` :
        `Reactivo ${current + 1} · ${q.optional ? "opcional" : "obligatorio"}`
      }</div>
      <p class="q-text">${q.text}</p>
      ${body}
      <div class="nav-row">
        <button class="btn-ghost" id="backBtn" ${current === 0 ? "disabled" : ""}>Atrás</button>
        <button class="btn-ghost btn-exit" id="exitBtn">Salir</button>
        <button class="btn-primary" id="nextBtn" ${canProceed() ? "" : "disabled"}>
          ${current === QUESTIONS.length - 1 ? "Finalizar" : "Siguiente"} <span>→</span>
        </button>
      </div>
    </div>
  `;

  if(q.type === "choice"){
    document.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => {
        answers[current].value = parseInt(btn.dataset.index, 10);
        renderQuestion();
      });
    });
    const followUpInput = document.getElementById("followUpInput");
    if(followUpInput){
      followUpInput.addEventListener("input", (e) => {
        answers[current].extra = e.target.value;
      });
    }
  } else if(q.type === "checklist"){
    document.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.index, 10);
        const arr = answers[current].value;
        const pos = arr.indexOf(i);
        if(pos === -1) arr.push(i); else arr.splice(pos, 1);
        renderQuestion();
      });
    });
  } else if(q.type === "photo"){
    const input = document.getElementById("photoInput");
    if(input){
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const raw = await fileToDataURL(file);
        const compressed = await compressImage(raw);
        if(q.multiple) answers[current].value.push(compressed);
        else answers[current].value = compressed;
        renderQuestion();
      });
    }
    document.querySelectorAll(".photo-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.index, 10);
        if(q.multiple) answers[current].value.splice(i, 1);
        else answers[current].value = "";
        renderQuestion();
      });
    });
  } else {
    const input = document.getElementById("textInput");
    if(input){
      input.addEventListener("input", (e) => {
        answers[current].value = e.target.value;
        document.getElementById("nextBtn").disabled = !canProceed();
      });
    }
  }

  document.getElementById("backBtn").addEventListener("click", () => {
    if(current > 0){ current--; renderQuestion(); }
  });
  document.getElementById("exitBtn").addEventListener("click", showExitConfirm);
  document.getElementById("nextBtn").addEventListener("click", () => {
    if(current < QUESTIONS.length - 1){ current++; renderQuestion(); }
    else renderResults();
  });
}

function renderResults(){
  let earned = 0, total = 0;

  const rows = QUESTIONS.map((q, i) => {
    const ans = answers[i];
    if(q.type === "choice"){
      const isNA = q.hasNA && ans.value === q.options.length - 1;
      if(!isNA){
        if(Array.isArray(q.optionValues)){
          const questionWeight = q.weight ?? Math.max(...q.optionValues);
          total += questionWeight;
          earned += (q.optionValues[ans.value] ?? 0);
        } else {
          total += q.weight;
          if(ans.value === q.expected) earned += q.weight;
        }
      }
      const isCorrect = !isNA && (Array.isArray(q.optionValues)
        ? (q.optionValues[ans.value] ?? 0) === (q.weight ?? Math.max(...q.optionValues))
        : ans.value === q.expected);
      let answerLabel = q.options[ans.value] ?? "Sin responder";
      if(ans.extra) answerLabel += ` — ${q.followUp.label} ${ans.extra}`;
      return { text:q.text, mark: isNA ? "neutral" : (isCorrect ? "ok" : "bad"), sub: answerLabel };
    }
    if(q.type === "checklist"){
      const items = Array.isArray(q.items) ? q.items : (Array.isArray(q.options) ? q.options : []);
      const selected = ans.value.map(idx => items[idx]);
      const selectedPoints = ans.value.reduce((sum, idx) => sum + (q.optionValues[idx] ?? 0), 0);
      const maxPoints = q.weight ?? (Array.isArray(q.optionValues) ? q.optionValues.reduce((sum, n) => sum + n, 0) : 0);
      total += maxPoints;
      earned += selectedPoints;
      return { text:q.text, mark:"neutral", sub: selected.length ? selected.join(", ") : "Ninguno seleccionado" };
    }
    if(q.type === "photo"){
      const photos = q.multiple ? ans.value : (ans.value ? [ans.value] : []);
      return { text:q.text, mark:"neutral", sub: photos.length ? "Con evidencia fotográfica" : "Sin foto", photos };
    }
    return { text:q.text, mark:"neutral", sub: ans.value ? ans.value : "Sin especificar" };
  });

  const listScoringRows = QUESTIONS.map((q, i) => {
    const ans = answers[i];
    if(q.type !== "checklist" || !Array.isArray(q.optionValues)) return null;
    const items = Array.isArray(q.items) ? q.items : (Array.isArray(q.options) ? q.options : []);
    const selected = ans.value.map(idx => items[idx]);
    const points = ans.value.reduce((sum, idx) => sum + (q.optionValues[idx] ?? 0), 0);
    const maxPoints = q.weight ?? q.optionValues.reduce((sum, n) => sum + n, 0);
    return {
      text: q.text,
      points,
      maxPoints,
      selected: selected.length ? selected.join(", ") : "Ninguno seleccionado"
    };
  }).filter(Boolean);

  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  const pctBand = getPctBand(pct);
  const passed = pct >= PASSING_SCORE;

  const meta = {
    fecha: answers[0].value,
    ruta: answers[1].value,
    vendedor: answers[2].value,
    codigoCliente: answers[3].value,
    nombreCliente: answers[4].value
  };

  main.innerHTML = `
    <div class="screen">
      <div class="result-head">
        <div class="seal"><span class="pct">${pct}%</span></div>
        <div class="verdict ${pctBand.tone}">${pctBand.label}</div>
        <div class="result-sub result-band">${pctBand.comment}</div>
        <div class="result-sub">Cumplimiento mínimo requerido: ${PASSING_SCORE}%</div>
      </div>
      <div class="breakdown">
        <div class="breakdown-title">Detalle de la visita</div>
        ${rows.map((r, i) => `
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
      <div class="list-score-summary">
        <div class="breakdown-title">Productos colocados</div>
        ${listScoringRows.map((r) => `
          <div class="b-row">
            <span class="b-mark neutral">•</span>
            <span class="b-body">
              <span class="b-text">${r.text}</span>
              <span class="b-answer">${r.points} de ${r.maxPoints} puntos · ${r.selected}</span>
            </span>
          </div>
        `).join("")}
      </div>
      <div class="save-row" id="saveRow">
        <button class="btn-primary" id="saveBtn">Guardar evaluación</button>
        <button class="btn-ghost" id="discardBtn">No guardar</button>
      </div>
      <div class="save-note" id="saveNote"></div>
      <div class="footer-actions">
        <button class="btn-ghost" id="restartBtn">Repetir evaluación</button>
      </div>
    </div>
  `;

  document.getElementById("saveBtn").addEventListener("click", () => {
    const list = loadSaved();
    const record = { id: Date.now(), savedAt: new Date().toISOString(), pct, passed, meta, rows, listScoringRows, synced:false };
    list.push(record);
    const ok = persistSaved(list);
    pushToCloud(record);
    document.getElementById("saveRow").style.display = "none";
    document.getElementById("saveNote").className = "save-note" + (ok ? " ok" : "");
    document.getElementById("saveNote").textContent = ok ? "Evaluación guardada en este dispositivo." : "No se pudo guardar la evaluación.";
  });
  document.getElementById("discardBtn").addEventListener("click", () => {
    document.getElementById("saveRow").style.display = "none";
    document.getElementById("saveNote").textContent = "Evaluación no guardada.";
  });

  document.getElementById("restartBtn").addEventListener("click", () => {
    current = -1;
    QUESTIONS.forEach((q, i) => { answers[i] = defaultAnswer(q); });
    renderIntro();
  });
}

renderIntro();

if("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    // updateViaCache:"none" evita que el navegador use una copia guardada
    // de service-worker.js; siempre revisa directo con el servidor si hay
    // una versión nueva (en wifi o datos móviles).
    navigator.serviceWorker.register("service-worker.js", { updateViaCache:"none" }).catch(() => {});
  });
}
