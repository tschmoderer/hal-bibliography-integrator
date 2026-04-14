import { hbi_charts_plugin_process_publications } from "./charts_build";
import { hbiChartsRenderMetrics } from "./charts_render_metrics";
import { hbi_charts_render_all } from "./charts_render";

export function hbi_plugin_charts_make(docs, container, config, debug = true) {

    // var s2Cfg = (hal_bibliography_integrator_conf &&
    //     hal_bibliography_integrator_conf.plugins &&
    //     hal_bibliography_integrator_conf.plugins.charts &&
    //     hal_bibliography_integrator_conf.plugins.charts.semanticScholar)
    //     ? hal_bibliography_integrator_conf.plugins.charts.semanticScholar : null;

    var s2ApiKey = config["semanticScholar"]["apiKey"];

    if (debug) {
        console.log("[hbi-charts]Semantic scholar API key: ", s2ApiKey);
    }

    // var documents = hbi_charts_plugin_process_publications(docs, container, config, debug = true);
    var metrics = hbiChartsRenderMetrics(docs, []);
    console.log(metrics);
    hbi_charts_render_all(container, publications, years, thData, thCats, domData, domCats, showSet);
    // // Taille de lot et délai
    // // Sans clé : 1 req/s  → lot=1,  délai=1050ms
    // // Avec clé  : ~10 req/s → lot=3,  délai=350ms (conservateur vs 429)
    // var BATCH_SIZE = 1;                          // séquentiel — évite les bursts 429
    // var BATCH_DELAY = s2ApiKey ? 200 : 1100;      // avec clé : 200ms = 5 req/s (sous la limite 10)

    // // Retry exponentiel sur 429
    // var MAX_RETRIES = 4;     // 4 tentatives : 3s, 6s, 12s, 24s
    // var RETRY_BASE = 3000;

    // function s2Headers() {
    //     var h = { "Accept": "application/json" };
    //     if (s2ApiKey) h["x-api-key"] = s2ApiKey;
    //     return h;
    // }

    // function s2FetchRaw(url) {
    //     return fetch(url, { headers: s2Headers() }).then(function (r) {
    //         if (r.status === 429) throw new Error("S2 rate-limit 429");
    //         if (!r.ok) throw new Error("S2 HTTP " + r.status);
    //         return r.json();
    //     });
    // }

    // function isRateLimitError(err) {
    //     // Firefox masque le 429 derrière "NetworkError" quand CORS header absent
    //     return err.message.indexOf("429") !== -1 || err.message.indexOf("NetworkError") !== -1;
    // }

    // function s2Get(url, attempt) {
    //     attempt = attempt || 0;
    //     return s2FetchRaw(url).catch(function (err) {
    //         if (isRateLimitError(err) && attempt < MAX_RETRIES) {
    //             var wait = RETRY_BASE * Math.pow(2, attempt);
    //             console.warn("[hbi-charts][S2] 429/NetworkError — retry dans " + wait + "ms (" + (attempt + 1) + "/" + MAX_RETRIES + ")");
    //             return new Promise(function (res) {
    //                 setTimeout(function () { res(s2Get(url, attempt + 1)); }, wait);
    //             });
    //         }
    //         throw err;
    //     });
    // }

    // function s2PostOnce(url, body) {
    //     return fetch(url, {
    //         method: "POST",
    //         headers: Object.assign({ "Content-Type": "application/json" }, s2Headers()),
    //         body: JSON.stringify(body),
    //     }).then(function (r) {
    //         if (r.status === 429) throw new Error("S2 rate-limit 429");
    //         if (!r.ok) throw new Error("S2 HTTP " + r.status);
    //         return r.json();
    //     });
    // }

    // function s2Post(url, body, attempt) {
    //     attempt = attempt || 0;
    //     return s2PostOnce(url, body).catch(function (err) {
    //         if (isRateLimitError(err) && attempt < MAX_RETRIES) {
    //             var wait = RETRY_BASE * Math.pow(2, attempt);
    //             console.warn("[hbi-charts][S2] POST 429/NetworkError — retry dans " + wait + "ms (" + (attempt + 1) + "/" + MAX_RETRIES + ")");
    //             return new Promise(function (res) {
    //                 setTimeout(function () { res(s2Post(url, body, attempt + 1)); }, wait);
    //             });
    //         }
    //         throw err;
    //     });
    // }

    // // Pool de workers parallèles
    // function runBatched(tasks, onProgress) {
    //     if (!tasks.length) return Promise.resolve([]);
    //     var results = new Array(tasks.length);
    //     var done = 0;
    //     return new Promise(function (resolve) {
    //         var batchStart = 0;
    //         function launchBatch() {
    //             if (batchStart >= tasks.length) return;
    //             var end = Math.min(batchStart + BATCH_SIZE, tasks.length);
    //             var slice = tasks.slice(batchStart, end);
    //             var offset = batchStart;
    //             batchStart = end;
    //             var pending = slice.length;
    //             slice.forEach(function (task, i) {
    //                 var idx = offset + i;
    //                 task()
    //                     .then(function (r) { results[idx] = { ok: true, value: r }; })
    //                     .catch(function (e) { results[idx] = { ok: false, error: e }; })
    //                     .finally(function () {
    //                         done++;
    //                         if (onProgress) onProgress(done, tasks.length);
    //                         if (--pending === 0) {
    //                             if (batchStart >= tasks.length) resolve(results);
    //                             else setTimeout(launchBatch, BATCH_DELAY);
    //                         }
    //                     });
    //             });
    //         }
    //         launchBatch();
    //     });
    // }

    // function calcHIndex(citCounts) {
    //     var s = citCounts.slice().sort(function (a, b) { return b - a; });
    //     var h = 0;
    //     s.forEach(function (c, i) { if (c >= i + 1) h = i + 1; });
    //     return h;
    // }

    // function extractYears(entries) {
    //     var now = new Date().getFullYear(), out = [];
    //     entries.forEach(function (e) {
    //         var y = e.citingPaper && e.citingPaper.year;
    //         if (y && y >= 1900 && y <= now + 1) out.push(y);
    //     });
    //     return out;
    // }

    // function fetchCitingYears(paperId) {
    //     var BASE = "https://api.semanticscholar.org/graph/v1/paper/"
    //         + encodeURIComponent(paperId) + "/citations?fields=year&limit=1000";
    //     return s2Get(BASE + "&offset=0").then(function (data) {
    //         var entries = data.data || [];
    //         var years = extractYears(entries);
    //         if (entries.length < 1000) return years;
    //         var total = data.total || entries.length;
    //         var pages = [];
    //         for (var off = 1000; off < total; off += 1000) {
    //             (function (offset) {
    //                 pages.push(function () {
    //                     return s2Get(BASE + "&offset=" + offset).then(function (d) {
    //                         return extractYears(d.data || []);
    //                     });
    //                 });
    //             })(off);
    //         }
    //         if (!pages.length) return years;
    //         return runBatched(pages, null).then(function (results) {
    //             results.forEach(function (r) { if (r.ok) years = years.concat(r.value); });
    //             return years;
    //         });
    //     });
    // }

    // function yearsToByYear(allYearsArrays) {
    //     var byYear = {}, total = 0;
    //     allYearsArrays.forEach(function (years) {
    //         years.forEach(function (y) { byYear[y] = (byYear[y] || 0) + 1; total++; });
    //     });
    //     return { byYear: byYear, total: total };
    // }

    // // Stratégie A : authorId S2 connu
    // function fetchByAuthorId(authorId) {
    //     if (debug) console.log("[hbi-charts][S2] AuthorID :", authorId);
    //     halChartsProgress(container, "Récupération des papiers…", 0, 1);
    //     return s2Get(
    //         "https://api.semanticscholar.org/graph/v1/author/"
    //         + encodeURIComponent(authorId)
    //         + "/papers?fields=paperId,citationCount&limit=1000"
    //     ).then(function (data) {
    //         var papers = data.data || [];
    //         if (debug) console.log("[hbi-charts][S2]", papers.length, "papiers.");
    //         var hIndex = calcHIndex(papers.map(function (p) {
    //             return typeof p.citationCount === "number" ? p.citationCount : 0;
    //         }));
    //         var cited = papers.filter(function (p) { return p.paperId && p.citationCount > 0; });
    //         if (!cited.length) return { byYear: {}, total: 0, hIndex: hIndex };
    //         halChartsProgress(container, "Chargement des citations", 0, cited.length);
    //         var tasks = cited.map(function (paper) {
    //             return function () { return fetchCitingYears(paper.paperId); };
    //         });
    //         return runBatched(tasks, function (done, total) {
    //             halChartsProgress(container, "Chargement des citations", done, total);
    //         }).then(function (results) {
    //             var ok = results.filter(function (r) { return r.ok; });
    //             if (ok.length === 0 && results.length > 0) {
    //                 // Toutes les requêtes ont échoué → probablement 429 persistant
    //                 console.warn("[hbi-charts][S2] Toutes les requêtes /citations ont échoué — citations partielles (0)");
    //             }
    //             var allYears = ok.map(function (r) { return r.value; });
    //             var agg = yearsToByYear(allYears);
    //             return { byYear: agg.byYear, total: agg.total, hIndex: hIndex };
    //         });
    //     });
    // }

    // // Stratégie B : recherche auteur par nom
    // function searchAuthorByName(halId) {
    //     var name = String(halId).replace(/-/g, " ").replace(/_/g, " ");
    //     if (debug) console.log("[hbi-charts][S2] Recherche nom :", name);
    //     return s2Get(
    //         "https://api.semanticscholar.org/graph/v1/author/search"
    //         + "?query=" + encodeURIComponent(name)
    //         + "&fields=authorId,name,citationCount&limit=5"
    //     ).then(function (data) {
    //         var authors = data.data || [];
    //         if (!authors.length) throw new Error("Auteur S2 introuvable : " + name);
    //         var best = authors[0];
    //         if (debug) console.log("[hbi-charts][S2] Retenu :", best.name, best.authorId);
    //         return fetchByAuthorId(best.authorId);
    //     });
    // }

    // // Stratégie C : fallback DOI batch
    // function fetchByDois(halDocs) {
    //     var dois = halDocs
    //         .map(function (p) { return p.doi_s || p.doiId_s; })
    //         .filter(Boolean)
    //         .filter(function (d, i, a) { return a.indexOf(d) === i; });
    //     if (!dois.length) {
    //         if (debug) console.log("[hbi-charts][S2] Aucun DOI.");
    //         return Promise.resolve({ byYear: {}, total: 0, hIndex: 0 });
    //     }
    //     if (debug) console.log("[hbi-charts][S2] Batch DOI ×", dois.length);
    //     halChartsProgress(container, "Résolution des DOI…", 0, 1);
    //     var chunks = [];
    //     for (var i = 0; i < dois.length; i += 500) chunks.push(dois.slice(i, i + 500));
    //     return Promise.all(chunks.map(function (chunk) {
    //         return s2Post(
    //             "https://api.semanticscholar.org/graph/v1/paper/batch",
    //             { ids: chunk.map(function (d) { return "DOI:" + d; }), fields: "paperId,citationCount" }
    //         );
    //     })).then(function (responses) {
    //         var papers = [];
    //         responses.forEach(function (r) { if (Array.isArray(r)) papers = papers.concat(r); });
    //         var hIndex = calcHIndex(papers.map(function (p) {
    //             return (p && typeof p.citationCount === "number") ? p.citationCount : 0;
    //         }));
    //         var cited = papers.filter(function (p) { return p && p.paperId && p.citationCount > 0; });
    //         if (!cited.length) return { byYear: {}, total: 0, hIndex: hIndex };
    //         halChartsProgress(container, "Chargement des citations", 0, cited.length);
    //         var tasks = cited.map(function (p) {
    //             return function () { return fetchCitingYears(p.paperId); };
    //         });
    //         return runBatched(tasks, function (done, total) {
    //             halChartsProgress(container, "Chargement des citations", done, total);
    //         }).then(function (results) {
    //             var allYears = results.filter(function (r) { return r.ok; }).map(function (r) { return r.value; });
    //             var agg = yearsToByYear(allYears);
    //             return { byYear: agg.byYear, total: agg.total, hIndex: hIndex };
    //         });
    //     });
    // }

    // Orchestration
    function runS2() {
        var authorId = s2Cfg && s2Cfg.authorId;
        var promise = authorId
            ? fetchByAuthorId(authorId)
            : searchAuthorByName(hal_bibliography_integrator_conf["id"])
                .catch(function (e) {
                    if (debug) console.warn("[hbi-charts][S2] Nom échoué :", e.message, "— fallback DOI");
                    return fetchByDois(docs);
                });
        promise
            .then(function (agg) {
                if (debug) console.log("[hbi-charts][S2] byYear:", agg.byYear, "total:", agg.total, "h:", agg.hIndex);
                docs._s2ByYear = agg.byYear;
                docs._s2Total = agg.total;
                docs._s2HIndex = agg.hIndex;
                processPublications(docs, container, maxN, renameThematiques, renameDomaines, showSet, debug);
            })
            .catch(function (err) {
                console.error("[hbi-charts][S2] Erreur :", err.message, "— fallback Scopus");
                fetchScopusCitations(docs, container, debug, function (d) {
                    processPublications(d, container, maxN, renameThematiques, renameDomaines, showSet, debug);
                });
            });
    }

    // Diagnostic config S2
    // if (s2Cfg) {
    //     if (s2Cfg.authorId && s2Cfg.apiKey) {
    //         console.log("[hbi-charts][S2] ✓ authorId (" + s2Cfg.authorId + ") · ✓ apiKey → lots de " + BATCH_SIZE + " req, délai " + BATCH_DELAY + "ms");
    //     } else if (s2Cfg.authorId) {
    //         console.log("[hbi-charts][S2] ✓ authorId (" + s2Cfg.authorId + ") · ✗ apiKey absente → lots de " + BATCH_SIZE + " req, délai " + BATCH_DELAY + "ms (apiKey = x3 plus rapide)");
    //     } else if (s2Cfg.apiKey) {
    //         console.log("[hbi-charts][S2] ✗ authorId absent → recherche par nom HAL · ✓ apiKey → lots de " + BATCH_SIZE + " req, délai " + BATCH_DELAY + "ms");
    //     } else {
    //         console.warn("[hbi-charts][S2] ✗ semanticScholar sans authorId ni apiKey → recherche par nom, 1 req/s");
    //     }
    // } else {
    //     console.warn("[hbi-charts][S2] ✗ semanticScholar non configuré → recherche par nom HAL, 1 req/s");
    // }

    // if (window.location.protocol === "file:") {
    //     console.warn("[hbi-charts] ⚠ file:// — APIs bloquées. Utilisez python -m http.server 8080");
    //     halChartsLoadChartJs(function () {
    //         processPublications(docs, container, maxN, renameThematiques, renameDomaines, showSet, debug);
    //     });
    //     return;
    // }

    // Délai initial : laisse hbi-artscore finir ses appels S2 en parallèle
    // avant de démarrer les requêtes hbi-charts (évite les 429 en burst)
    // setTimeout(runS2, s2ApiKey ? 3000 : 0);

}