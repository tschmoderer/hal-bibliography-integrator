/**
 * hal-charts.js — v2.0.0
 * Plugin de visualisation scientifique pour hal-bibliography-integrator
 *
 * NOUVEAUTÉ v2 : thématiques et domaines détectés AUTOMATIQUEMENT
 * depuis les données HAL (keyword_s et domain_s), sans aucune configuration.
 *
 * Dépendances :
 *   - hal-bibliography-integrator (hal.js) — doit être chargé avant ce plugin
 *   - Chart.js (chargé automatiquement via CDN si absent)
 *
 * Intégration minimale :
 *   <div id="hal-charts-integrator"></div>
 *   ...
 *   const hal_integrator_config = { "id": "votre-idhal", "typeList": ["ART","COMM"] };
 *   ...
 *   <script src="./hal-charts.js"></script>
 *
 * Options avancées (toutes facultatives) dans hal_integrator_config.plugins.charts :
 *   "maxCategories"     {number}  Nb max de catégories (défaut : 5)
 *   "renameThematiques" {Object}  Surcharge des libellés détectés automatiquement
 *                                 ex: { "imagerie": "Imagerie per-opératoire" }
 *   "renameDomaines"    {Object}  Surcharge des codes domaine HAL
 *                                 ex: { "spi.med": "Ingénierie biomédicale" }
 *
 * @license GPL-3.0
 */

(function () {
  "use strict";

  // ── Palette ────────────────────────────────────────────────────────────────
  const PALETTE = [
    "#1a56a4", "#e05c2a", "#2e9e6b",
    "#8b3ab8", "#c0392b", "#16a085",
    "#d4ac0d", "#2980b9", "#7f8c8d",
  ];

  // ── Table de traduction des codes domaine HAL ──────────────────────────────
  // Source : https://api.archives-ouvertes.fr/ref/domain/
  const HAL_DOMAIN_LABELS = {
    "info":            "Informatique",
    "info.info-ai":    "IA & Apprentissage",
    "info.info-bi":    "Bioinformatique",
    "info.info-cv":    "Vision par ordinateur",
    "info.info-lg":    "Traitement du langage",
    "info.info-lo":    "Logique & Vérification",
    "info.info-mo":    "Modélisation & Simulation",
    "info.info-ni":    "Réseaux & Télécoms",
    "info.info-ro":    "Robotique",
    "info.info-se":    "Génie logiciel",
    "math":            "Mathématiques",
    "math.math-ap":    "Mathématiques appliquées",
    "math.math-na":    "Analyse numérique",
    "math.math-oc":    "Optimisation & Contrôle",
    "math.math-pr":    "Probabilités",
    "math.math-st":    "Statistiques",
    "phys":            "Physique",
    "phys.phys-opti":  "Optique & Photonique",
    "phys.phys-mphy":  "Physique médicale",
    "spi":             "Sciences de l'ingénieur",
    "spi.signal":      "Traitement du signal",
    "spi.img":         "Imagerie",
    "spi.med":         "Ingénierie biomédicale",
    "spi.opti":        "Optique / Photonique",
    "spi.nano":        "Nanosciences",
    "sdv":             "Sciences du vivant",
    "sdv.bc":          "Biochimie",
    "sdv.can":         "Cancérologie",
    "sdv.neu":         "Neurosciences",
    "sdv.ima":         "Imagerie médicale",
    "sdv.mhep":        "Médecine humaine",
    "sdv.mhep.neu":    "Neurologie",
    "sdv.mhep.chir":   "Chirurgie",
    "sdv.mhep.dent":   "Dentisterie",
    "sdv.mhep.hep":    "Hépatologie / Gastro",
    "sdv.mhep.onco":   "Oncologie",
    "chim":            "Chimie",
    "shs":             "Sciences humaines & sociales",
    "shs.edu":         "Sciences de l'éducation",
    "shs.info":        "Sciences de l'information",
    "stat":            "Statistiques",
    "stat.ml":         "Apprentissage automatique",
  };

  // ── Mots vides ignorés lors de l'extraction de thématiques ────────────────
  const STOPWORDS = new Set([
    "the","a","an","of","in","for","on","and","or","to","with","by","at",
    "de","du","des","la","le","les","un","une","et","en","sur","par","pour",
    "dans","au","aux","est","se","ce","qui","que","d","l","s","j","n","m",
    "based","using","via","new","novel","approach","method","system",
  ]);

  // ── Utilitaires ────────────────────────────────────────────────────────────

  function extractYear(dateStr) {
    if (!dateStr) return null;
    const m = String(dateStr).match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : null;
  }

  /** Minuscules + suppression des accents + nettoyage ponctuation */
  function normalize(str) {
    return String(str)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s/-]/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Traduit un code domaine HAL en libellé lisible.
   * Cherche du plus spécifique (code complet) au plus général (premier segment).
   * Ex : "sdv.mhep.neu" → "Neurologie"
   *      "info.info-xx" → "Informatique"
   */
  function translateDomain(code) {
    const c = String(code).toLowerCase().trim();
    if (HAL_DOMAIN_LABELS[c]) return HAL_DOMAIN_LABELS[c];
    const parts = c.split(".");
    for (let i = parts.length - 1; i > 0; i--) {
      const prefix = parts.slice(0, i).join(".");
      if (HAL_DOMAIN_LABELS[prefix]) return HAL_DOMAIN_LABELS[prefix];
    }
    // Fallback : nettoyer le code brut
    return capitalize(c.replace(/[._-]/g, " "));
  }

  // ── Détection automatique des thématiques ─────────────────────────────────

  /**
   * Extrait les N thématiques les plus fréquentes depuis keyword_s.
   *
   * Algorithme :
   *   1. Chaque mot-clé est tokenisé (séparateurs : virgule, point-virgule, slash)
   *   2. Les mots vides et tokens < 3 caractères sont ignorés
   *   3. Le premier token significatif de chaque terme est utilisé comme clé de regroupement
   *   4. Le libellé conservé est le terme HAL le plus long contenant cette clé
   *   5. Les N clés avec le plus de publications distinctes sont retournées
   *
   * @param {Object[]} publications
   * @param {number}   maxN
   * @param {Object}   renameMap  Surcharges : { libellé_détecté → libellé_souhaité }
   * @returns {Object|null}  mapping { clé_fragment → libellé } ou null si aucun mot-clé
   */
  function autoDetectThematiques(publications, maxN, renameMap) {
    // tokenCount[key] = { label: string, count: number }
    const tokenCount = {};

    publications.forEach((pub) => {
      const keywords = [].concat(pub.keyword_s || []);
      if (!keywords.length) return;

      // Un token ne peut compter qu'une fois par publication
      const seenKeys = new Set();

      keywords.forEach((kw) => {
        // Découpe sur séparateurs multiples
        const terms = String(kw).split(/[,;/|]/).map((t) => t.trim()).filter(Boolean);

        terms.forEach((term) => {
          const norm = normalize(term);
          const words = norm.split(" ").filter((w) => w.length >= 3 && !STOPWORDS.has(w));
          if (!words.length) return;

          // Clé = premier mot significatif (racine de la thématique)
          const key = words[0];
          if (seenKeys.has(key)) return;
          seenKeys.add(key);

          // Libellé : renommage manuel en priorité, sinon terme HAL original capitalisé
          const rawLabel = capitalize(term.trim());
          const label = (renameMap && renameMap[rawLabel])
            ? renameMap[rawLabel]
            : (renameMap && renameMap[key]) ? renameMap[key] : rawLabel;

          if (!tokenCount[key]) {
            tokenCount[key] = { label, count: 0 };
          }
          tokenCount[key].count++;
          // Conserver le libellé le plus informatif (le plus long)
          if (label.length > tokenCount[key].label.length) {
            tokenCount[key].label = label;
          }
        });
      });
    });

    const top = Object.entries(tokenCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, maxN);

    if (!top.length) return null;

    const mapping = {};
    top.forEach(([key, { label }]) => { mapping[key] = label; });
    return mapping;
  }

  /**
   * Extrait les N domaines les plus fréquents depuis domain_s.
   * Traduit les codes HAL en libellés lisibles via HAL_DOMAIN_LABELS.
   *
   * @param {Object[]} publications
   * @param {number}   maxN
   * @param {Object}   renameMap  Surcharges : { code_hal → libellé_souhaité }
   * @returns {Object|null}  mapping { code_hal → libellé } ou null
   */
  function autoDetectDomaines(publications, maxN, renameMap) {
    // domainCount[code] = { label, count }
    const domainCount = {};

    publications.forEach((pub) => {
      const domains = [].concat(pub.domain_s || []);
      if (!domains.length) return;

      // Utiliser le code le plus spécifique disponible (le plus long)
      const mostSpecific = domains.reduce((a, b) =>
        String(b).length > String(a).length ? b : a
      );
      const code = String(mostSpecific).toLowerCase().trim();

      const label = (renameMap && renameMap[code])
        ? renameMap[code]
        : translateDomain(code);

      if (!domainCount[code]) {
        domainCount[code] = { label, count: 0 };
      }
      domainCount[code].count++;
    });

    const top = Object.entries(domainCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, maxN);

    if (!top.length) return null;

    const mapping = {};
    top.forEach(([code, { label }]) => { mapping[code] = label; });
    return mapping;
  }

  // ── Agrégation des données par catégorie × année ──────────────────────────

  /**
   * Pour chaque publication, cherche la première correspondance dans `mapping`,
   * puis agrège par catégorie et par année.
   *
   * @param {Object[]} publications
   * @param {string}   field    "keyword_s" | "domain_s"
   * @param {Object}   mapping  { fragment → label }
   * @param {number[]} years
   */
  function buildCategoryData(publications, field, mapping, years) {
    const byYear = {};
    const total  = {};

    publications.forEach((pub) => {
      const year = extractYear(pub.producedDateY_i || pub.publicationDateY_i);
      if (!year || !years.includes(year)) return;

      const values = [].concat(pub[field] || []);
      let cat = null;

      for (const [fragment, label] of Object.entries(mapping)) {
        const fragNorm = normalize(fragment);
        if (values.some((v) => normalize(String(v)).includes(fragNorm))) {
          cat = label;
          break;
        }
      }
      if (!cat) return;

      if (!byYear[cat]) byYear[cat] = {};
      byYear[cat][year] = (byYear[cat][year] || 0) + 1;
      total[cat] = (total[cat] || 0) + 1;
    });

    return { byYear, total };
  }

  function topCategories(total, maxN) {
    return Object.entries(total)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxN)
      .map(([cat]) => cat);
  }

  // ── Rendu HTML ─────────────────────────────────────────────────────────────

  function renderMetrics(publications, years) {
    const total = publications.length;
    const totalCitations = publications.reduce((s, p) => s + (p.citNb_i || 0), 0);

    const citCounts = publications.map((p) => p.citNb_i || 0).sort((a, b) => b - a);
    let hIndex = 0;
    citCounts.forEach((c, i) => { if (c >= i + 1) hIndex = i + 1; });

    const yearMin = Math.min(...years);
    const yearMax = Math.max(...years);

    const TYPE_LABELS = {
      ART: "article", COMM: "congrès", COUV: "chapitre",
      POSTER: "poster", THESE: "thèse", OUV: "ouvrage",
      PROCEEDINGS: "actes", UNDEFINED: "preprint",
    };
    const types = [...new Set(publications.map((p) => p.docType_s).filter(Boolean))];
    const typeSummary = types
      .map((t) => `${publications.filter((p) => p.docType_s === t).length}\u00a0${TYPE_LABELS[t] || t}`)
      .join(" · ");

    return `
      <div class="hal-charts-metrics">
        <div class="hal-charts-metric-card">
          <div class="hal-charts-metric-value">${total}</div>
          <div class="hal-charts-metric-label">Publications</div>
          <div class="hal-charts-metric-sub">${yearMin}–${yearMax}</div>
        </div>
        <div class="hal-charts-metric-card">
          <div class="hal-charts-metric-value">${totalCitations}</div>
          <div class="hal-charts-metric-label">Citations</div>
          <div class="hal-charts-metric-sub">toutes sources</div>
        </div>
        <div class="hal-charts-metric-card">
          <div class="hal-charts-metric-value">${hIndex > 0 ? hIndex : "–"}</div>
          <div class="hal-charts-metric-label">Indice h</div>
          <div class="hal-charts-metric-sub">estimé</div>
        </div>
        ${typeSummary ? `
        <div class="hal-charts-metric-card" style="flex:2">
          <div class="hal-charts-metric-value" style="font-size:0.95rem;font-weight:600;color:#1a2e4a;line-height:1.4">${typeSummary}</div>
          <div class="hal-charts-metric-label">Répartition par type</div>
        </div>` : ""}
      </div>`;
  }

  function createChartCard(id, title, extraClass) {
    return `
      <div class="hal-charts-card ${extraClass || ""}">
        <div class="hal-charts-card-title">${title}</div>
        <div class="hal-charts-canvas-wrapper"><canvas id="${id}"></canvas></div>
        <div class="hal-charts-legend" id="${id}-legend"></div>
      </div>`;
  }

  function buildLegend(containerId, labels, colors) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = labels.map((label, i) => `
      <div class="hal-charts-legend-item">
        <span class="hal-charts-legend-dot" style="background:${colors[i % colors.length]}"></span>
        <span>${label}</span>
      </div>`).join("");
  }

  // ── Graphiques Chart.js ────────────────────────────────────────────────────

  function renderBarChart(canvasId, years, categories, byYear, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: years.map(String),
        datasets: categories.map((cat, i) => ({
          label: cat,
          data: years.map((y) => (byYear[cat] && byYear[cat][y]) || 0),
          backgroundColor: colors[i % colors.length],
          borderRadius: 3,
          borderSkipped: false,
        })),
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { title: (items) => `Année ${items[0].label}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { color: "#f0f0f0" },
            title: { display: true, text: "Nombre de publications", font: { size: 11 }, color: "#888" },
          },
        },
      },
    });
  }

  function renderPieChart(canvasId, categories, total, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const data = categories.map((cat) => total[cat] || 0);
    const sum  = data.reduce((a, b) => a + b, 0);
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: categories.map((_, i) => String.fromCharCode(65 + i)),
        datasets: [{ data, backgroundColor: colors.slice(0, categories.length), borderWidth: 2, borderColor: "#fff" }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const pct = sum > 0 ? ((item.raw / sum) * 100).toFixed(1) : 0;
                return ` ${categories[item.dataIndex]} — ${item.raw} pub. (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  function renderImpactChart(canvasId, publications, years) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const citData = years.map((y) =>
      publications
        .filter((p) => extractYear(p.producedDateY_i || p.publicationDateY_i) === y)
        .reduce((s, p) => s + (p.citNb_i || 0), 0)
    );
    const ifData = years.map((y) => {
      const pubs   = publications.filter((p) => extractYear(p.producedDateY_i || p.publicationDateY_i) === y);
      const withIF = pubs.filter((p) => p.journalSJR_d || p.citeSoreY_d);
      if (!withIF.length) return null;
      return Math.round(
        (withIF.reduce((s, p) => s + (p.journalSJR_d || p.citeSoreY_d || 0), 0) / withIF.length) * 100
      ) / 100;
    });
    const hasIF = ifData.some((v) => v !== null);

    const datasets = [{
      label: "Citations / an", data: citData,
      backgroundColor: "rgba(26,86,164,0.15)", borderColor: "#1a56a4",
      borderWidth: 2, fill: true, tension: 0.3, yAxisID: "y",
      pointRadius: 4, pointBackgroundColor: "#1a56a4",
    }];
    const scales = {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        beginAtZero: true, position: "left", grid: { color: "#f0f0f0" },
        title: { display: true, text: "Citations / an", font: { size: 11 }, color: "#888" },
        ticks: { font: { size: 11 } },
      },
    };
    if (hasIF) {
      datasets.push({
        label: "Impact factor moyen / an", data: ifData,
        borderColor: "#e05c2a", borderWidth: 2, borderDash: [4, 3],
        fill: false, tension: 0.3, yAxisID: "y2",
        pointRadius: 4, pointBackgroundColor: "#e05c2a", spanGaps: true,
      });
      scales.y2 = {
        beginAtZero: false, position: "right", grid: { drawOnChartArea: false },
        title: { display: true, text: "Impact factor moyen / an", font: { size: 11 }, color: "#888" },
        ticks: { font: { size: 11 } },
      };
    }
    new Chart(ctx, {
      type: "line",
      data: { labels: years.map(String), datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false } },
        scales,
      },
    });
  }

  // ── Chargement CDN Chart.js ────────────────────────────────────────────────

  function loadChartJs(callback) {
    if (typeof Chart !== "undefined") { callback(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.integrity = "sha512-ZwR1/gSZM3ai6vCdI+LVF1zSq/5HznD3oD+sCoJrzXJ+yKqtkPsqkOcAYVOiQBfBZT/4Suy2xylkMVpNaHI0Q==";
    s.crossOrigin = "anonymous"; s.referrerPolicy = "no-referrer";
    s.onload = callback;
    s.onerror = () => console.error("[hal-charts] Impossible de charger Chart.js.");
    document.head.appendChild(s);
  }

  // ── API HAL ────────────────────────────────────────────────────────────────

  function fetchHalData(idHal, typeList) {
    const fields = [
      "docid","title_s","producedDateY_i","publicationDateY_i",
      "docType_s","keyword_s","domain_s","citNb_i","journalSJR_d","citeSoreY_d",
    ].join(",");
    const typeFilter = typeList && typeList.length
      ? `&fq=docType_s:(${typeList.join(" OR ")})` : "";
    const url = `https://api.archives-ouvertes.fr/search/?q=authIdHal_s:${encodeURIComponent(idHal)}${typeFilter}&fl=${fields}&rows=1000&wt=json`;
    return fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`HAL API ${r.status}`); return r.json(); })
      .then((d) => d.response.docs || []);
  }

  // ── Rendu final ────────────────────────────────────────────────────────────

  function renderAll(container, publications, years, thData, thCats, domData, domCats) {
    const thColors  = PALETTE.slice(0, (thCats  || []).length);
    const domColors = PALETTE.slice(0, (domCats || []).length);

    let html = "";
    html += `<div class="hal-charts-section-title">Indicateurs bibliométriques</div>`;
    html += renderMetrics(publications, years);

    if (thCats && thCats.length) {
      html += `<div class="hal-charts-section-title">Thématiques scientifiques</div>`;
      html += `<div class="hal-charts-grid">`;
      html += createChartCard("hc-th-bar", "Publications / an par thématique");
      html += createChartCard("hc-th-pie", "Répartition globale");
      html += `</div>`;
    }
    if (domCats && domCats.length) {
      html += `<div class="hal-charts-section-title">Domaines d'application</div>`;
      html += `<div class="hal-charts-grid">`;
      html += createChartCard("hc-dom-bar", "Publications / an par domaine");
      html += createChartCard("hc-dom-pie", "Répartition globale");
      html += `</div>`;
    }
    html += `<div class="hal-charts-section-title">Indicateurs d'impact</div>`;
    html += `<div class="hal-charts-grid">`;
    html += createChartCard("hc-impact", "Citations / an & impact factor moyen", "hal-charts-card--full");
    html += `</div>`;

    container.innerHTML = html;

    if (thCats && thCats.length) {
      renderBarChart("hc-th-bar", years, thCats, thData.byYear, thColors);
      buildLegend("hc-th-bar-legend", thCats, thColors);
      renderPieChart("hc-th-pie", thCats, thData.total, thColors);
      buildLegend("hc-th-pie-legend", thCats.map((c, i) => `${String.fromCharCode(65+i)} – ${c}`), thColors);
    }
    if (domCats && domCats.length) {
      renderBarChart("hc-dom-bar", years, domCats, domData.byYear, domColors);
      buildLegend("hc-dom-bar-legend", domCats, domColors);
      renderPieChart("hc-dom-pie", domCats, domData.total, domColors);
      buildLegend("hc-dom-pie-legend", domCats.map((c, i) => `${String.fromCharCode(65+i)} – ${c}`), domColors);
    }
    renderImpactChart("hc-impact", publications, years);
    buildLegend("hc-impact-legend", ["Citations / an", "Impact factor moyen / an"], ["#1a56a4", "#e05c2a"]);
  }

  // ── Point d'entrée ─────────────────────────────────────────────────────────

  function run() {
    const config    = typeof hal_integrator_config !== "undefined" ? hal_integrator_config : {};
    const pluginCfg = (config.plugins && config.plugins.charts) || {};
    const idHal     = config.id;
    if (!idHal) { console.warn("[hal-charts] hal_integrator_config.id manquant."); return; }

    const container = document.getElementById("hal-charts-integrator");
    if (!container) return;

    const maxN              = pluginCfg.maxCategories      || 5;
    const renameThematiques = pluginCfg.renameThematiques  || {};
    const renameDomaines    = pluginCfg.renameDomaines     || {};

    container.innerHTML = `<div class="hal-charts-loading">Chargement des données HAL…</div>`;

    fetchHalData(idHal, config.typeList || [])
      .then((publications) => {
        if (!publications.length) {
          container.innerHTML = `<div class="hal-charts-error">Aucune publication trouvée pour « ${idHal} ».</div>`;
          return;
        }

        // ── Années couvertes ──
        const yearsSet = new Set();
        publications.forEach((p) => {
          const y = extractYear(p.producedDateY_i || p.publicationDateY_i);
          if (y) yearsSet.add(y);
        });
        const years = Array.from(yearsSet).sort();

        // ── Thématiques : détection automatique depuis keyword_s ──
        const thMapping = autoDetectThematiques(publications, maxN, renameThematiques);
        let thData = null, thCats = null;
        if (thMapping) {
          thData = buildCategoryData(publications, "keyword_s", thMapping, years);
          thCats = topCategories(thData.total, maxN);
        }

        // ── Domaines : détection automatique depuis domain_s ──
        const domMapping = autoDetectDomaines(publications, maxN, renameDomaines);
        let domData = null, domCats = null;
        if (domMapping) {
          domData = buildCategoryData(publications, "domain_s", domMapping, years);
          domCats = topCategories(domData.total, maxN);
        }

        loadChartJs(() => renderAll(container, publications, years, thData, thCats, domData, domCats));
      })
      .catch((err) => {
        console.error("[hal-charts]", err);
        container.innerHTML = `<div class="hal-charts-error">Erreur HAL : ${err.message}</div>`;
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
