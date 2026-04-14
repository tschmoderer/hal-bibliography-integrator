import { _hcBarEl, _hcBar, _hcBarLabel, _hcEnsureOverlay } from "./charts_progressbar_utils";

/**
 * Display a progress bar overlay inside a container.
 * Falls back to a basic CSS progress bar if progressbar.js is not loaded.
 *
 * @param {HTMLElement} container - Target container element
 * @param {string} [label] - Optional label to display alongside the progress bar
 */
export function hbiChartsProgressCSS(container, label) {
    // Ensure overlay exists
    _hcEnsureOverlay(container);
    if (!_hcBarEl) return;

    _hcBarEl.style.display = "";
    if (_hcBarLabel) _hcBarLabel.textContent = label;

    // Barre CSS basique si progressbar.js pas encore là
    if (!_hcBar) {
        var wrap = document.getElementById("hc-bar-wrap");
        if (wrap && !wrap.querySelector("div")) {
            wrap.style.cssText = "height:6px;background:#e2e6ec;border-radius:99px;overflow:hidden;";
            var fill = document.createElement("div");
            fill.id = "hc-bar-fill";
            fill.style.cssText = "height:100%;width:0%;background:#1a56a4;border-radius:99px;transition:width 1.2s ease;";
            wrap.appendChild(fill);
            setTimeout(function () { fill.style.width = "15%"; }, 50);
        }
    }
}


export function halChartsProgressCSSS(container, label = "") {
    // Ensure overlay exists
    _hcEnsureOverlay(container);

    if (!_hcBarEl) return;

    // Show progress bar container
    _hcBarEl.style.display = "";

    // Update label if available
    if (_hcBarLabel && label) {
        _hcBarLabel.textContent = label;
    }

    // If progressbar.js is already initialized, skip fallback
    if (_hcBar) return;

    const wrap = document.getElementById("hc-bar-wrap");
    if (!wrap) return;

    // Avoid duplicating the progress bar
    if (wrap.querySelector("#hc-bar-fill")) return;

    // Apply base styles (cleaner via Object.assign)
    Object.assign(wrap.style, {
        height: "6px",
        background: "#e2e6ec",
        borderRadius: "999px",
        overflow: "hidden"
    });

    // Create fill element
    const fill = document.createElement("div");
    fill.id = "hc-bar-fill";

    Object.assign(fill.style, {
        height: "100%",
        width: "0%",
        background: "#1a56a4",
        borderRadius: "999px",
        transition: "width 1.2s ease"
    });

    wrap.appendChild(fill);

    // Trigger animation (next frame is more reliable than setTimeout)
    requestAnimationFrame(() => {
        fill.style.width = "15%";
    });
}