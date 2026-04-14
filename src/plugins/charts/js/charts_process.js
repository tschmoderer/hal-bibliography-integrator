import { hbi_plugin_charts_show_message } from "./charts_utils";
import { globalHBIData } from "../../../js/hbi_common";

function compute_hindex(citations) {
    citations.sort((a, b) => b - a);
    let h = 0;

    for (let i = 0; i < citations.length; i++) {
        if (citations[i] >= i + 1) {
            h = i + 1;
        } else {
            break;
        }
    }

    return h;
}

async function fetchCitationsPerYear(doi, debug = false) {
    const url = `https://api.openalex.org/works/https://doi.org/${doi}`;

    if (debug) {
        console.log("[hbi-charts] citations count query openalex: ", url)
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`OpenAlex error: ${response.status}`);
    }
    const data = await response.json();

    return data;
}

async function hbi_plugin_charts_process_citations(doiList, config, debug) {
    var apiCalls = [];
    for (var doi in doiList) {
        if (doiList[doi]) {
            apiCalls.push(fetchCitationsPerYear(doiList[doi], debug));
        }
    }

    const data = await Promise.all(apiCalls);

    return data;
}

export async function hbi_plugin_charts_process_publications(config, debug = true) {
    // Create summary data
    var data = {};
    var doiList = []; // liste of publications' DOI

    // Publications' statistics --> metrics charts
    var types_stats = {};    // number of publication per types 
    var yearsList = [];          // list of publications years 
    var total = 0;           // total number of publications 
    for (var o in globalHBIData) {
        types_stats[o] = globalHBIData[o].length;
        for (var pub in globalHBIData[o]) {
            yearsList.push(globalHBIData[o][pub].publicationDateY_i);
            doiList.push(globalHBIData[o][pub].doiId_s);
            total++;
        }
    }

    if (debug) {
        console.log("[hbi-charts] publication types statistics: ", types_stats);
        console.log("[hbi-charts] publications years extract: ", yearsList);
        console.log("[hbi-charts] total number of publications: ", total);
    }

    /* Write summary data */
    data["total"] = total;
    data["statistics"] = { "types": types_stats };
    data["years"] = yearsList;

    // Publications' citations --> citation charts
    if (debug) {
        console.log("[hbi-charts] doi list of publications: ", doiList);
    }

    var citeData = await hbi_plugin_charts_process_citations(doiList, config, debug)

    var citationPerYearMult = [];
    var citationPerArticle = [];
    for (var o in citeData) {
        citationPerYearMult.push(citeData[o].counts_by_year);
        citationPerArticle.push(citeData[o].cited_by_count);
    }

    citationPerYearMult = citationPerYearMult.flat();
    const citationPerYear = {};
    citationPerYearMult.forEach((item) => {
        const year = item.year;
        const count = item.cited_by_count;
        citationPerYear[year] = (citationPerYear[year] || 0) + count;
    });

    if (debug) {
        console.log("[hbi-charts]  citations count per year: ", citationPerYear);
        console.log("[hbi-charts]  citations count per article: ", citationPerArticle);
    }

    var citation_total = Object.values(citationPerYear).reduce((sum, val) => sum + val, 0);
    var citation_avg = Object.keys(citationPerYear).length > 0 ? (citation_total / Object.keys(citationPerYear).length).toFixed(1) : 0;

    /* Write summary data */
    data["citations"] = {
        "data": citationPerYear,
        "total": citation_total,
        "average": citation_avg,
        "source": "OpenAlex"
    };

    data["totalCitation"] = citation_total; // reuse this variable for metrics
    data["authorHindex"] = compute_hindex(citationPerArticle);

    return data;
}

export function hbi_charts_plugin_process_publications_old(publications, container, config, debug = true) {

    if (!publications || !publications.length) {
        hbi_plugin_charts_show_messagessage(container, "Aucune publication trouvée.", "hbi-charts-error")
        return;
    }

    var yearsSet = {};
    publications.forEach(function (p) {
        var y = halChartsExtractYear(p.producedDateY_i || p.publicationDateY_i);
        if (y) yearsSet[y] = true;
    });
    var years = Object.keys(yearsSet).map(Number).sort();
    var domMapping = showSet.domaines ? halChartsAutoDomaines(publications, maxN, renameDomaines, debug) : null;
    var domData = null, domCats = null;
    if (domMapping) {
        domData = halChartsBuildCategoryData(publications, "domain_s", domMapping, years, true);
        domCats = halChartsTopN(domData.total, maxN);
    }
    var kwMapping = showSet.thematiques ? halChartsAutoThematiques(publications, Math.max(maxN * 5, 40), renameThematiques, debug) : null;
    var aiApiKey = (hal_bibliography_integrator_conf &&
        hal_bibliography_integrator_conf.plugins &&
        hal_bibliography_integrator_conf.plugins.charts &&
        hal_bibliography_integrator_conf.plugins.charts.ai &&
        hal_bibliography_integrator_conf.plugins.charts.ai.apiKey) || "";
    if (aiApiKey && kwMapping) {
        halChartsAiThematiques(kwMapping, maxN, aiApiKey, debug, function (aiMapping) {
            var thData = aiMapping ? halChartsMergeKwData(publications, aiMapping, years)
                : (kwMapping ? halChartsBuildThFromKw(publications, kwMapping, maxN, years) : null);
            var thCats = thData ? halChartsTopN(thData.total, maxN) : null;
            halChartsLoadChartJs(function () {
                halChartsRenderAll(container, publications, years, thData, thCats, domData, domCats, showSet);
            });
        });
    } else {
        var thData = kwMapping ? halChartsBuildThFromKw(publications, kwMapping, maxN, years) : null;
        var thCats = thData ? halChartsTopN(thData.total, maxN) : null;
        halChartsLoadChartJs(function () {
            halChartsRenderAll(container, publications, years, thData, thCats, domData, domCats, showSet);
        });
    }
}