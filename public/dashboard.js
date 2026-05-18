const API = window.location.origin;
const TOKEN_KEY = "whisperops_token";

if (!localStorage.getItem(TOKEN_KEY)) {
  window.location.href = "/login.html";
}

// Sidebar navigation
document.querySelectorAll(".sidebar-icon[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-icon").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const target = document.getElementById("view" + view.charAt(0).toUpperCase() + view.slice(1));
    if (target) target.classList.add("active");
  });
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login.html";
});

// Fetch autenticado
async function fetchAPI(endpoint) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
  });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login.html";
    return null;
  }
  return res.json();
}

// Carregar tudo
async function carregarDashboard() {
  const dados = await fetchAPI("/metricas/dashboard");
  if (!dados) return;

  // KPIs
  document.getElementById("kpiConversas").textContent = dados.total_conversas || 0;
  document.getElementById("kpiTempo").textContent = Math.round(dados.tempo_medio_resposta || 0) + "s";
  const scores = dados.conversas.filter((c) => c.metrica?.score).map((c) => c.metrica.score);
  const scoreMedio = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
  document.getElementById("kpiScore").textContent = scoreMedio;

  // Signals
  const conversas = dados.conversas || [];
  const signals = [];
  conversas.forEach((c) => {
    if (!c.metrica) return;
    if (c.metrica.tempo_resposta > 120) {
      signals.push({ icon: "⏱", text: `Resposta demorou ${Math.round(c.metrica.tempo_resposta / 60)}min`, time: "Hoje" });
    }
    if (c.metrica.sentimento === "negativo") {
      signals.push({ icon: "🔻", text: `Sentimento negativo detectado: ${c.cliente_nome}`, time: "Hoje" });
    }
    if (c.metrica.score < 5) {
      signals.push({ icon: "⚠", text: `Score crítico: ${c.metrica.score} — ${c.cliente_nome}`, time: "Hoje" });
    }
  });
  document.getElementById("signalsCount").textContent = signals.length;
  const signalsList = document.getElementById("signalsList");
  if (signals.length) {
    signalsList.innerHTML = signals
      .map(
        (s) =>
          `<div class="signal-item"><span class="signal-icon">${s.icon}</span><div><p class="signal-text">${s.text}</p><p class="signal-time">${s.time}</p></div></div>`
      )
      .join("");
  } else {
    signalsList.innerHTML = '<p class="empty-text">Nenhum sinal detectado.</p>';
  }

  // Heatmap (simulado)
  const heatmapGrid = document.getElementById("heatmapGrid");
  heatmapGrid.innerHTML = "";
  const horas = 16;
  const dias = 7;
  for (let i = 0; i < horas * dias; i++) {
    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    const intensity = Math.floor(Math.random() * 4);
    const colors = ["var(--elevated)", "#1a1a1a", "#2a1a0a", "#3a2000", "#5a2a00"];
    cell.style.background = colors[intensity];
    heatmapGrid.appendChild(cell);
  }

  // Timeline
  const timelineList = document.getElementById("timelineList");
  if (conversas.length) {
    timelineList.innerHTML = conversas
      .slice(0, 8)
      .map(
        (c) =>
          `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><p class="timeline-title">${c.cliente_nome}</p><p class="timeline-meta">${c.status} · ${c.metrica?.sentimento || "—"}</p><p class="timeline-summary">${c.metrica?.resumo_ia?.substring(0, 100) || "Sem análise"}</p></div></div>`
      )
      .join("");
  } else {
    timelineList.innerHTML = '<p class="empty-text">Nenhuma conversa importada.</p>';
  }
}

carregarDashboard();
setInterval(carregarDashboard, 30000);