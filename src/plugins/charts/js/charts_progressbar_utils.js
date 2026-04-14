// Une seule instance, un seul div overlay inséré avant le container.
// Phases :
//   "Chargement des données…"   0 → 0.20  (animé lentement)
//   "Récupération des papiers…" 0.20 → 0.50 (animé lentement)
//   "Résolution des DOI…"       0.20 → 0.50 (animé lentement)
//   "Chargement des citations"  0.50 → 1.00 (proportionnel done/total)
//   progressDone                → 1.00 puis masqué

export var _hcBar = null;       // instance ProgressBar.Line
export var _hcBarEl = null;     // div overlay
export var _hcBarLabel = null;  // div texte
export var _hcBuilding = false; // flag anti-réentrance (évite double création)

export var _HC_STEPS = {
    "Chargement des données…": { start: 0.00, end: 0.20 },
    "Récupération des papiers…": { start: 0.20, end: 0.50 },
    "Résolution des DOI…": { start: 0.20, end: 0.50 },
    "Chargement des citations": { start: 0.50, end: 1.00 },
};

export function _hcEnsureOverlay(container) {
    // Déjà construit et présent dans le DOM → rien à faire
    if (_hcBarEl && document.body.contains(_hcBarEl)) return;
    // Construction déjà en cours (appel réentrant depuis halChartsProgressCSS
    // suivi du callback halChartsLoadProgressBar) → récupérer le div existant
    if (_hcBuilding) {
        _hcBarEl = document.getElementById("hbi-charts-progress-overlay") || _hcBarEl;
        _hcBarLabel = _hcBarEl && _hcBarEl.querySelector(".hbi-charts-progress-label");
        return;
    }

    _hcBuilding = true;
    // Réutiliser un div déjà inséré par halChartsProgressCSS
    _hcBarEl = document.getElementById("hbi-charts-progress-overlay");

    if (!_hcBarEl) {
        _hcBarEl = document.createElement("div");
        _hcBarEl.id = "hbi-charts-progress-overlay";
        _hcBarEl.style.cssText = "padding:0.75rem 0 0.25rem;";
        _hcBarLabel = document.createElement("div");
        _hcBarLabel.className = "hbi-charts-progress-label";
        _hcBarEl.appendChild(_hcBarLabel);
        var barWrap = document.createElement("div");
        barWrap.id = "hc-bar-wrap";
        barWrap.style.cssText = "height:6px;";
        _hcBarEl.appendChild(barWrap);
        if (container && container.parentNode) {
            container.parentNode.insertBefore(_hcBarEl, container);
        }
    } else {
        _hcBarLabel = _hcBarEl.querySelector(".hbi-charts-progress-label");
    }

    // Instancier ProgressBar.Line si disponible
    if (typeof ProgressBar !== "undefined") {
        var wrap = document.getElementById("hc-bar-wrap");
        if (wrap) {
            if (_hcBar) { try { _hcBar.destroy(); } catch (e) { } }
            wrap.innerHTML = "";
            _hcBar = new ProgressBar.Line(wrap, {
                strokeWidth: 3, easing: "easeInOut", duration: 250,
                color: "#1a56a4", trailColor: "#e2e6ec", trailWidth: 3,
                svgStyle: { width: "100%", height: "100%" },
            });
        }
    }
    _hcBuilding = false;
}