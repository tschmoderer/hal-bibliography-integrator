import { hbi_helpers } from "../../../js/hbi_common";

// generate the bibliometric table
export function hbi_plugin_charts_render_metrics(data) {
    // var publications = data.publications;
    var years = data.years;
    var total = data.total;
    var type_stats = data.statistics.types;

    var totalCit = data["totalCitation"];
    var hIdx = data["authorHindex"];
    var citSource = "OpenAlex";
    var hIdxSource = "OpenAlex";

    var typeSummaryTab = [];
    for (var t in data.statistics.types) {
        typeSummaryTab.push(data.statistics.types[t] + "\u00a0" + (hbi_helpers[t].label_en || t));
    }
    var typeSummary = typeSummaryTab.join(" · ");

    // Create metrics table
    const container = document.createElement("div");
    container.className = "hbi-charts-metrics";

    // Publications
    container.appendChild(
        createCard(
            total,
            "Publications",
            `${Math.min(...years)}–${Math.max(...years)}`
        )
    );

    // Citations
    container.appendChild(
        createCard(totalCit, "Citations", citSource)
    );

    // h-index
    container.appendChild(
        createCard(hIdx, "Indice h", hIdxSource)
    );

    // Type summary
    container.appendChild(
        createCard(typeSummary, "", "", "hbi-charts-metric-label")
    );

    return container;


    // if (publications._s2Total !== undefined) {
    //     totalCit = publications._s2Total;
    //     hIdx = publications._s2HIndex || 0;
    //     citSource = "Semantic Scholar";
    // } else if (publications._scopusTotal !== undefined) {
    //     totalCit = publications._scopusTotal; citSource = "Scopus";
    //     var cc = publications.map(function (p) { return p._citCount || 0; }).sort(function (a, b) { return b - a; });
    //     cc.forEach(function (c, i) { if (c >= i + 1) hIdx = i + 1; });
    // }


    // var types = [];
    // publications.forEach(function (p) { if (p.docType_s && types.indexOf(p.docType_s) === -1) types.push(p.docType_s); });

    // var typeSummary = types.map(function (t) {
    //     return publications.filter(function (p) { return p.docType_s === t; }).length + "\u00a0" + (hbi_helpers[t].label_en || t);
    // }).join(" · ");

    // return "<div class=\"hbi-charts-metrics\">"
    //     + "<div class=\"hbi-charts-metric-card\"><div class=\"hbi-charts-metric-value\">" + total + "</div>"
    //     + "<div class=\"hbi-charts-metric-label\">Publications</div>"
    //     + "<div class=\"hbi-charts-metric-sub\">" + Math.min.apply(null, years) + "–" + Math.max.apply(null, years) + "</div></div>"
    //     + "<div class=\"hbi-charts-metric-card\"><div class=\"hbi-charts-metric-value\">" + totalCit + "</div>"
    //     + "<div class=\"hbi-charts-metric-label\">Citations</div><div class=\"hbi-charts-metric-sub\">" + citSource + "</div></div>"
    //     + "<div class=\"hbi-charts-metric-card\"><div class=\"hbi-charts-metric-value\">" + (hIdx || "–") + "</div>"
    //     + "<div class=\"hbi-charts-metric-label\">Indice h</div><div class=\"hbi-charts-metric-sub\">" + citSource + "</div></div>"
    //     + (typeSummary ? "<div class=\"hbi-charts-metric-card hbi-charts-metric-card--wide\"><div class=\"hbi-charts-metric-type\">" + typeSummary + "</div><div class=\"hbi-charts-metric-label\">Répartition par type</div></div>" : "")
    //     + "</div>";
}

function createCard(value, label, sub = "", valueExtraClass = "") {
    const card = document.createElement("div");
    card.className = "hbi-charts-metric-card";

    const valueEl = document.createElement("div");
    valueEl.className = `hbi-charts-metric-value ${valueExtraClass}`.trim();
    valueEl.textContent = value;

    const labelEl = document.createElement("div");
    labelEl.className = "hbi-charts-metric-label";
    labelEl.textContent = label;

    card.appendChild(valueEl);
    card.appendChild(labelEl);

    if (sub !== undefined) {
        const subEl = document.createElement("div");
        subEl.className = "hbi-charts-metric-sub";
        subEl.textContent = sub;
        card.appendChild(subEl);
    }

    return card;
}

// generate the bibliometric table
export function hbi_plugin_charts_render_metrics_old(data) {
    var publications = data.publications;
    var years = data.years;

    var total = publications.length
    var totalCit = 0
    var hIdx = 0
    var citSource = "—";

    if (publications._s2Total !== undefined) {
        totalCit = publications._s2Total;
        hIdx = publications._s2HIndex || 0;
        citSource = "Semantic Scholar";
    } else if (publications._scopusTotal !== undefined) {
        totalCit = publications._scopusTotal; citSource = "Scopus";
        var cc = publications.map(function (p) { return p._citCount || 0; }).sort(function (a, b) { return b - a; });
        cc.forEach(function (c, i) { if (c >= i + 1) hIdx = i + 1; });
    }

    var TYPE_LABELS = {
        ART: "article", COMM: "congrès", COUV: "chapitre", POSTER: "poster",
        THESE: "thèse", OUV: "ouvrage", PROCEEDINGS: "actes", UNDEFINED: "preprint"
    };

    var types = [];
    publications.forEach(function (p) { if (p.docType_s && types.indexOf(p.docType_s) === -1) types.push(p.docType_s); });

    var typeSummary = types.map(function (t) {
        return publications.filter(function (p) { return p.docType_s === t; }).length + "\u00a0" + (TYPE_LABELS[t] || t);
    }).join(" · ");

    return "<div class=\"hbi-charts-metrics\">"
        + "<div class=\"hbi-charts-metric-card\"><div class=\"hbi-charts-metric-value\">" + total + "</div>"
        + "<div class=\"hbi-charts-metric-label\">Publications</div>"
        + "<div class=\"hbi-charts-metric-sub\">" + Math.min.apply(null, years) + "–" + Math.max.apply(null, years) + "</div></div>"
        + "<div class=\"hbi-charts-metric-card\"><div class=\"hbi-charts-metric-value\">" + totalCit + "</div>"
        + "<div class=\"hbi-charts-metric-label\">Citations</div><div class=\"hbi-charts-metric-sub\">" + citSource + "</div></div>"
        + "<div class=\"hbi-charts-metric-card\"><div class=\"hbi-charts-metric-value\">" + (hIdx || "–") + "</div>"
        + "<div class=\"hbi-charts-metric-label\">Indice h</div><div class=\"hbi-charts-metric-sub\">" + citSource + "</div></div>"
        + (typeSummary ? "<div class=\"hbi-charts-metric-card hbi-charts-metric-card--wide\"><div class=\"hbi-charts-metric-type\">" + typeSummary + "</div><div class=\"hbi-charts-metric-label\">Répartition par type</div></div>" : "")
        + "</div>";
}