import { hbi_plugin_charts_render_metrics } from "./charts_render_metrics";
import { hbi_plugin_charts_render_citations } from "./charts_render_citations";
import { hbi_plugin_charts_create_cards } from "./charts_utils";

const HAL_CHARTS_PALETTE = ["#1a56a4", "#e05c2a", "#2e9e6b", "#8b3ab8", "#c0392b", "#16a085", "#d4ac0d", "#2980b9", "#7f8c8d"];

export function hbi_plugin_charts_render_all(data, container, config, debug = true) {

    // var thColors = HAL_CHARTS_PALETTE.slice(0, (thCats || []).length);
    // var domColors = HAL_CHARTS_PALETTE.slice(0, (domCats || []).length);
    // var html = "";

    var spinner;
    if (config.showSet.metrics) {
        // remove spinner 
        spinner = container.querySelector("#hbi-charts-spinner");
        spinner.remove();

        const metricTabTitle = document.createElement("div");
        metricTabTitle.className = "hbi-charts-section-title";
        metricTabTitle.textContent = "Bibliometric indicators";

        container.appendChild(metricTabTitle);
        container.appendChild(hbi_plugin_charts_render_metrics(data));

        // reset spinner 
        container.appendChild(spinner);
    }
    // if (showSet.thematiques && thCats && thCats.length) {
    //     html += "<div class=\"hbi-charts-section-title\">Thématiques scientifiques</div><div class=\"hbi-charts-grid\">"
    //         + halChartsCreateCard("hc-th-bar", "Publications / an par thématique")
    //         + halChartsCreateCard("hc-th-pie", "Répartition globale") + "</div>";
    // }
    // if (showSet.domaines && domCats && domCats.length) {
    //     html += "<div class=\"hbi-charts-section-title\">Domaines d'application</div><div class=\"hbi-charts-grid\">"
    //         + halChartsCreateCard("hc-dom-bar", "Publications / an par domaine")
    //         + halChartsCreateCard("hc-dom-pie", "Répartition globale") + "</div>";
    // }
    if (config.showSet.citations) {
        // remove spinner 
        spinner = container.querySelector("#hbi-charts-spinner");
        spinner.remove();

        const citationGraphTitle = document.createElement("div");
        citationGraphTitle.className = "hbi-charts-section-title";
        citationGraphTitle.textContent = "Citations per year";

        container.appendChild(citationGraphTitle);
        container.appendChild(hbi_plugin_charts_render_citations(data));

        // reset spinner 
        container.appendChild(spinner);
    }

    // if (!html) {
    //     halChartsProgressDone(container);
    //     halChartsProgressDone(container);
    //     container.innerHTML = "<div class=\"hbi-charts-loading\">Aucun graphique sélectionné.</div>";
    //     return;
    // }
    // halChartsProgressDone(container);
    // halChartsProgressDone(container);
    // container.innerHTML = html;
    // if (showSet.thematiques && thCats && thCats.length) {
    //     halChartsRenderBar("hc-th-bar", years, thCats, thData.byYear, thColors);
    //     halChartsBuildLegend("hc-th-bar-legend", thCats, thColors);
    //     halChartsRenderPie("hc-th-pie", thCats, thData.total, thColors);
    //     halChartsBuildLegend("hc-th-pie-legend", thCats.map(function (c, i) { return String.fromCharCode(65 + i) + " – " + c; }), thColors);
    // }
    // if (showSet.domaines && domCats && domCats.length) {
    //     halChartsRenderBar("hc-dom-bar", years, domCats, domData.byYear, domColors);
    //     halChartsBuildLegend("hc-dom-bar-legend", domCats, domColors);
    //     halChartsRenderPie("hc-dom-pie", domCats, domData.total, domColors);
    //     halChartsBuildLegend("hc-dom-pie-legend", domCats.map(function (c, i) { return String.fromCharCode(65 + i) + " – " + c; }), domColors);
    // }
    // if (showSet.citations) {
    //     halChartsRenderCitations("hc-cit", publications, years);
    // }

    // definitely remove spinner 
    spinner = container.querySelector("#hbi-charts-spinner");
    spinner.remove();
}
