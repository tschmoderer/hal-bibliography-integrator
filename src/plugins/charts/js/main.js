'use strict';

var hal_charts_plugin_name = "hbi-charts-integrator";

document.addEventListener("hbiMainDone", function () {
  if (typeof hal_integrator_config === "undefined") return false;
  var debug = hal_integrator_config["debug"] || false;
  var hal_charts_div = document.getElementById(hal_charts_plugin_name);
  if (!hal_charts_div) {
    if (debug) console.log("[hbi-charts] Div #" + hal_charts_plugin_name + " absente.");
    return false;
  }
  var hal_plugins = hal_integrator_config["plugins"];
  var plugin_cfg = (hal_plugins && hal_plugins["charts"]) ? hal_plugins["charts"] : {};
  var doit = ("doit" in plugin_cfg) ? plugin_cfg["doit"] : true;
  if (!doit) { if (debug) console.log("[hbi-charts] Désactivé."); return false; }
  initHALCharts(hal_charts_div, plugin_cfg, debug);
});

var HAL_CHARTS_SHOW_OPTIONS = [
  { key: "metrics", label: "Indicateurs bibliométriques" },
  { key: "thematiques", label: "Thématiques scientifiques" },
  { key: "domaines", label: "Domaines d'application" },
  { key: "citations", label: "Citations par année" },
];

function initHALCharts(container, cfg, debug) {
  var maxN = cfg["maxCategories"] || 8;
  var renameThematiques = cfg["renameThematiques"] || {};
  var renameDomaines = cfg["renameDomaines"] || {};
  var showAll = !cfg["show"] || !cfg["show"].length;
  var showSet = {};
  HAL_CHARTS_SHOW_OPTIONS.forEach(function (o) {
    showSet[o.key] = showAll || cfg["show"].indexOf(o.key) !== -1;
  });
  // Afficher immédiatement une barre CSS (avant même que progressbar.js soit chargé)
  halChartsProgressCSS(container, "Chargement des données…");
  // Charger progressbar.js en arrière-plan, puis upgrader vers la barre animée
  halChartsLoadProgressBar(function () {
    halChartsProgress(container, "Chargement des données…", 0, 1);
  });
  fetchHalData(hal_integrator_config["id"], hal_integrator_config["typeList"] || [])
    .then(function (docs) {
      if (debug) console.log("[hbi-charts] HAL :", docs.length, "publications.");
      fetchCitationsAndProcess(docs, container, maxN, renameThematiques, renameDomaines, showSet, debug);
    })
    .catch(function (err) {
      console.error("[hbi-charts]", err);
      halChartsProgressDone(container);
      halChartsProgressDone(container);
      container.innerHTML = "<div class=\"hbi-charts-error\">Erreur HAL : " + err.message + "</div>";
    });
}

function fetchHalData(idHal, typeList) {
  var fields = [
    "docid", "halId_s", "title_s",
    "producedDateY_i", "publicationDateY_i", "docType_s",
    "keyword_s", "fr_keyword_s", "en_keyword_s", "domain_s",
    "doi_s", "doiId_s",
  ].join(",");
  var typeFilter = (typeList && typeList.length)
    ? "&fq=docType_s:(" + typeList.join(" OR ") + ")" : "";
  var url = "https://api.archives-ouvertes.fr/search/?q=authIdHal_s:"
    + encodeURIComponent(idHal) + typeFilter + "&fl=" + fields + "&rows=1000&wt=json";
  return fetch(url)
    .then(function (r) { if (!r.ok) throw new Error("HAL API " + r.status); return r.json(); })
    .then(function (d) { return d.response.docs || []; });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CITATIONS SEMANTIC SCHOLAR
// ═══════════════════════════════════════════════════════════════════════════════
function fetchCitationsAndProcess(docs, container, maxN, renameThematiques, renameDomaines, showSet, debug) {

  var s2Cfg = (hal_integrator_config &&
    hal_integrator_config.plugins &&
    hal_integrator_config.plugins.charts &&
    hal_integrator_config.plugins.charts.semanticScholar)
    ? hal_integrator_config.plugins.charts.semanticScholar : null;

  var s2ApiKey = (s2Cfg && s2Cfg.apiKey) ? s2Cfg.apiKey : "";

  // Taille de lot et délai
  // Sans clé : 1 req/s  → lot=1,  délai=1050ms
  // Avec clé  : ~10 req/s → lot=3,  délai=350ms (conservateur vs 429)
  var BATCH_SIZE = 1;                          // séquentiel — évite les bursts 429
  var BATCH_DELAY = s2ApiKey ? 200 : 1100;      // avec clé : 200ms = 5 req/s (sous la limite 10)

  // Retry exponentiel sur 429
  var MAX_RETRIES = 4;     // 4 tentatives : 3s, 6s, 12s, 24s
  var RETRY_BASE = 3000;

  function s2Headers() {
    var h = { "Accept": "application/json" };
    if (s2ApiKey) h["x-api-key"] = s2ApiKey;
    return h;
  }

  function s2FetchRaw(url) {
    return fetch(url, { headers: s2Headers() }).then(function (r) {
      if (r.status === 429) throw new Error("S2 rate-limit 429");
      if (!r.ok) throw new Error("S2 HTTP " + r.status);
      return r.json();
    });
  }

  function isRateLimitError(err) {
    // Firefox masque le 429 derrière "NetworkError" quand CORS header absent
    return err.message.indexOf("429") !== -1 || err.message.indexOf("NetworkError") !== -1;
  }

  function s2Get(url, attempt) {
    attempt = attempt || 0;
    return s2FetchRaw(url).catch(function (err) {
      if (isRateLimitError(err) && attempt < MAX_RETRIES) {
        var wait = RETRY_BASE * Math.pow(2, attempt);
        console.warn("[hbi-charts][S2] 429/NetworkError — retry dans " + wait + "ms (" + (attempt + 1) + "/" + MAX_RETRIES + ")");
        return new Promise(function (res) {
          setTimeout(function () { res(s2Get(url, attempt + 1)); }, wait);
        });
      }
      throw err;
    });
  }

  function s2PostOnce(url, body) {
    return fetch(url, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, s2Headers()),
      body: JSON.stringify(body),
    }).then(function (r) {
      if (r.status === 429) throw new Error("S2 rate-limit 429");
      if (!r.ok) throw new Error("S2 HTTP " + r.status);
      return r.json();
    });
  }

  function s2Post(url, body, attempt) {
    attempt = attempt || 0;
    return s2PostOnce(url, body).catch(function (err) {
      if (isRateLimitError(err) && attempt < MAX_RETRIES) {
        var wait = RETRY_BASE * Math.pow(2, attempt);
        console.warn("[hbi-charts][S2] POST 429/NetworkError — retry dans " + wait + "ms (" + (attempt + 1) + "/" + MAX_RETRIES + ")");
        return new Promise(function (res) {
          setTimeout(function () { res(s2Post(url, body, attempt + 1)); }, wait);
        });
      }
      throw err;
    });
  }

  // Pool de workers parallèles
  function runBatched(tasks, onProgress) {
    if (!tasks.length) return Promise.resolve([]);
    var results = new Array(tasks.length);
    var done = 0;
    return new Promise(function (resolve) {
      var batchStart = 0;
      function launchBatch() {
        if (batchStart >= tasks.length) return;
        var end = Math.min(batchStart + BATCH_SIZE, tasks.length);
        var slice = tasks.slice(batchStart, end);
        var offset = batchStart;
        batchStart = end;
        var pending = slice.length;
        slice.forEach(function (task, i) {
          var idx = offset + i;
          task()
            .then(function (r) { results[idx] = { ok: true, value: r }; })
            .catch(function (e) { results[idx] = { ok: false, error: e }; })
            .finally(function () {
              done++;
              if (onProgress) onProgress(done, tasks.length);
              if (--pending === 0) {
                if (batchStart >= tasks.length) resolve(results);
                else setTimeout(launchBatch, BATCH_DELAY);
              }
            });
        });
      }
      launchBatch();
    });
  }

  function calcHIndex(citCounts) {
    var s = citCounts.slice().sort(function (a, b) { return b - a; });
    var h = 0;
    s.forEach(function (c, i) { if (c >= i + 1) h = i + 1; });
    return h;
  }

  function extractYears(entries) {
    var now = new Date().getFullYear(), out = [];
    entries.forEach(function (e) {
      var y = e.citingPaper && e.citingPaper.year;
      if (y && y >= 1900 && y <= now + 1) out.push(y);
    });
    return out;
  }

  function fetchCitingYears(paperId) {
    var BASE = "https://api.semanticscholar.org/graph/v1/paper/"
      + encodeURIComponent(paperId) + "/citations?fields=year&limit=1000";
    return s2Get(BASE + "&offset=0").then(function (data) {
      var entries = data.data || [];
      var years = extractYears(entries);
      if (entries.length < 1000) return years;
      var total = data.total || entries.length;
      var pages = [];
      for (var off = 1000; off < total; off += 1000) {
        (function (offset) {
          pages.push(function () {
            return s2Get(BASE + "&offset=" + offset).then(function (d) {
              return extractYears(d.data || []);
            });
          });
        })(off);
      }
      if (!pages.length) return years;
      return runBatched(pages, null).then(function (results) {
        results.forEach(function (r) { if (r.ok) years = years.concat(r.value); });
        return years;
      });
    });
  }

  function yearsToByYear(allYearsArrays) {
    var byYear = {}, total = 0;
    allYearsArrays.forEach(function (years) {
      years.forEach(function (y) { byYear[y] = (byYear[y] || 0) + 1; total++; });
    });
    return { byYear: byYear, total: total };
  }

  // Stratégie A : authorId S2 connu
  function fetchByAuthorId(authorId) {
    if (debug) console.log("[hbi-charts][S2] AuthorID :", authorId);
    halChartsProgress(container, "Récupération des papiers…", 0, 1);
    return s2Get(
      "https://api.semanticscholar.org/graph/v1/author/"
      + encodeURIComponent(authorId)
      + "/papers?fields=paperId,citationCount&limit=1000"
    ).then(function (data) {
      var papers = data.data || [];
      if (debug) console.log("[hbi-charts][S2]", papers.length, "papiers.");
      var hIndex = calcHIndex(papers.map(function (p) {
        return typeof p.citationCount === "number" ? p.citationCount : 0;
      }));
      var cited = papers.filter(function (p) { return p.paperId && p.citationCount > 0; });
      if (!cited.length) return { byYear: {}, total: 0, hIndex: hIndex };
      halChartsProgress(container, "Chargement des citations", 0, cited.length);
      var tasks = cited.map(function (paper) {
        return function () { return fetchCitingYears(paper.paperId); };
      });
      return runBatched(tasks, function (done, total) {
        halChartsProgress(container, "Chargement des citations", done, total);
      }).then(function (results) {
        var ok = results.filter(function (r) { return r.ok; });
        if (ok.length === 0 && results.length > 0) {
          // Toutes les requêtes ont échoué → probablement 429 persistant
          console.warn("[hbi-charts][S2] Toutes les requêtes /citations ont échoué — citations partielles (0)");
        }
        var allYears = ok.map(function (r) { return r.value; });
        var agg = yearsToByYear(allYears);
        return { byYear: agg.byYear, total: agg.total, hIndex: hIndex };
      });
    });
  }

  // Stratégie B : recherche auteur par nom
  function searchAuthorByName(halId) {
    var name = String(halId).replace(/-/g, " ").replace(/_/g, " ");
    if (debug) console.log("[hbi-charts][S2] Recherche nom :", name);
    return s2Get(
      "https://api.semanticscholar.org/graph/v1/author/search"
      + "?query=" + encodeURIComponent(name)
      + "&fields=authorId,name,citationCount&limit=5"
    ).then(function (data) {
      var authors = data.data || [];
      if (!authors.length) throw new Error("Auteur S2 introuvable : " + name);
      var best = authors[0];
      if (debug) console.log("[hbi-charts][S2] Retenu :", best.name, best.authorId);
      return fetchByAuthorId(best.authorId);
    });
  }

  // Stratégie C : fallback DOI batch
  function fetchByDois(halDocs) {
    var dois = halDocs
      .map(function (p) { return p.doi_s || p.doiId_s; })
      .filter(Boolean)
      .filter(function (d, i, a) { return a.indexOf(d) === i; });
    if (!dois.length) {
      if (debug) console.log("[hbi-charts][S2] Aucun DOI.");
      return Promise.resolve({ byYear: {}, total: 0, hIndex: 0 });
    }
    if (debug) console.log("[hbi-charts][S2] Batch DOI ×", dois.length);
    halChartsProgress(container, "Résolution des DOI…", 0, 1);
    var chunks = [];
    for (var i = 0; i < dois.length; i += 500) chunks.push(dois.slice(i, i + 500));
    return Promise.all(chunks.map(function (chunk) {
      return s2Post(
        "https://api.semanticscholar.org/graph/v1/paper/batch",
        { ids: chunk.map(function (d) { return "DOI:" + d; }), fields: "paperId,citationCount" }
      );
    })).then(function (responses) {
      var papers = [];
      responses.forEach(function (r) { if (Array.isArray(r)) papers = papers.concat(r); });
      var hIndex = calcHIndex(papers.map(function (p) {
        return (p && typeof p.citationCount === "number") ? p.citationCount : 0;
      }));
      var cited = papers.filter(function (p) { return p && p.paperId && p.citationCount > 0; });
      if (!cited.length) return { byYear: {}, total: 0, hIndex: hIndex };
      halChartsProgress(container, "Chargement des citations", 0, cited.length);
      var tasks = cited.map(function (p) {
        return function () { return fetchCitingYears(p.paperId); };
      });
      return runBatched(tasks, function (done, total) {
        halChartsProgress(container, "Chargement des citations", done, total);
      }).then(function (results) {
        var allYears = results.filter(function (r) { return r.ok; }).map(function (r) { return r.value; });
        var agg = yearsToByYear(allYears);
        return { byYear: agg.byYear, total: agg.total, hIndex: hIndex };
      });
    });
  }

  // Orchestration
  function runS2() {
    var authorId = s2Cfg && s2Cfg.authorId;
    var promise = authorId
      ? fetchByAuthorId(authorId)
      : searchAuthorByName(hal_integrator_config["id"])
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
  if (s2Cfg) {
    if (s2Cfg.authorId && s2Cfg.apiKey) {
      console.log("[hbi-charts][S2] ✓ authorId (" + s2Cfg.authorId + ") · ✓ apiKey → lots de " + BATCH_SIZE + " req, délai " + BATCH_DELAY + "ms");
    } else if (s2Cfg.authorId) {
      console.log("[hbi-charts][S2] ✓ authorId (" + s2Cfg.authorId + ") · ✗ apiKey absente → lots de " + BATCH_SIZE + " req, délai " + BATCH_DELAY + "ms (apiKey = x3 plus rapide)");
    } else if (s2Cfg.apiKey) {
      console.log("[hbi-charts][S2] ✗ authorId absent → recherche par nom HAL · ✓ apiKey → lots de " + BATCH_SIZE + " req, délai " + BATCH_DELAY + "ms");
    } else {
      console.warn("[hbi-charts][S2] ✗ semanticScholar sans authorId ni apiKey → recherche par nom, 1 req/s");
    }
  } else {
    console.warn("[hbi-charts][S2] ✗ semanticScholar non configuré → recherche par nom HAL, 1 req/s");
  }

  if (window.location.protocol === "file:") {
    console.warn("[hbi-charts] ⚠ file:// — APIs bloquées. Utilisez python -m http.server 8080");
    halChartsLoadChartJs(function () {
      processPublications(docs, container, maxN, renameThematiques, renameDomaines, showSet, debug);
    });
    return;
  }

  // Délai initial : laisse hbi-artscore finir ses appels S2 en parallèle
  // avant de démarrer les requêtes hbi-charts (évite les 429 en burst)
  setTimeout(runS2, s2ApiKey ? 3000 : 0);
}


// ── Citations via Scopus API (fallback) ────────────────────────────────────────
function fetchScopusCitations(docs, container, debug, callback) {
  if (!hal_integrator_config ||
    !hal_integrator_config.plugins ||
    !hal_integrator_config.plugins.charts ||
    !hal_integrator_config.plugins.charts.scopus) {
    if (debug) console.log("[hbi-charts][Scopus] Non configuré");
    callback(docs); return;
  }
  var cfg = hal_integrator_config.plugins.charts.scopus;
  if (!cfg.apiKey || !cfg.authorId) { callback(docs); return; }
  var apiKey = cfg.apiKey, authorId = cfg.authorId, start = 0, allEntries = [];
  function fetchPage() {
    var url = "https://api.elsevier.com/content/search/scopus"
      + "?query=AU-ID(" + encodeURIComponent(authorId) + ")"
      + "&start=" + start + "&count=25"
      + "&apiKey=" + encodeURIComponent(apiKey)
      + "&field=coverDate,citedby-count";
    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("Scopus HTTP " + r.status); return r.json(); })
      .then(function (data) {
        var entries = data["search-results"].entry || [];
        allEntries = allEntries.concat(entries);
        var total = parseInt(data["search-results"]["opensearch:totalResults"] || 0, 10);
        start += 25;
        if (start < total) fetchPage(); else process();
      })
      .catch(function (e) { console.error("[hbi-charts][Scopus]", e.message); callback(docs); });
  }
  function process() {
    var byYear = {};
    allEntries.forEach(function (p) {
      var y = p.coverDate ? parseInt(p.coverDate.split("-")[0], 10) : null;
      var tc = parseInt(p["citedby-count"] || 0);
      if (y) byYear[y] = (byYear[y] || 0) + tc;
    });
    docs._scopusByYear = byYear;
    docs._scopusTotal = Object.values(byYear).reduce(function (a, b) { return a + b; }, 0);
    callback(docs);
  }
  fetchPage();
}


// ── Traitement principal ──────────────────────────────────────────────────────
function processPublications(publications, container, maxN, renameThematiques, renameDomaines, showSet, debug) {
  if (!publications || !publications.length) {
    halChartsProgressDone(container);
    halChartsProgressDone(container);
    container.innerHTML = "<div class=\"hbi-charts-error\">Aucune publication trouvée.</div>";
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
  var aiApiKey = (hal_integrator_config &&
    hal_integrator_config.plugins &&
    hal_integrator_config.plugins.charts &&
    hal_integrator_config.plugins.charts.ai &&
    hal_integrator_config.plugins.charts.ai.apiKey) || "";
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

function halChartsBuildThFromKw(publications, kwMapping, maxN, years) {
  var m = {};
  Object.keys(kwMapping).slice(0, maxN).forEach(function (k) { m[k] = kwMapping[k]; });
  return halChartsMergeKwData(publications, m, years);
}

function halChartsMergeKwData(publications, mapping, years) {
  var result = halChartsBuildCategoryData(publications, "keyword_s", mapping, years, false);
  ["en_keyword_s", "fr_keyword_s"].forEach(function (field) {
    var td = halChartsBuildCategoryData(publications, field, mapping, years, false);
    Object.keys(td.byYear).forEach(function (cat) {
      if (!result.byYear[cat]) result.byYear[cat] = {};
      Object.keys(td.byYear[cat]).forEach(function (y) {
        result.byYear[cat][y] = (result.byYear[cat][y] || 0) + td.byYear[cat][y];
      });
      result.total[cat] = (result.total[cat] || 0) + td.total[cat];
    });
  });
  return result;
}

function halChartsAiThematiques(kwMapping, maxN, apiKey, debug, callback) {
  var kwSample = Object.keys(kwMapping).map(function (k) { return kwMapping[k]; }).slice(0, 60);
  var prompt = "Tu es expert en bibliométrie. Voici les mots-clés les plus fréquents"
    + " des publications d'un chercheur :\n\n"
    + kwSample.map(function (k, i) { return (i + 1) + ". " + k; }).join("\n")
    + "\n\nGroupe-les en exactement " + maxN + " thématiques scientifiques de haut niveau."
    + " Chaque thématique : nom concis de 3–6 mots."
    + " Tout mot-clé doit être affecté à une thématique.\n"
    + "Réponds UNIQUEMENT avec du JSON valide, sans markdown :\n"
    + "{\"themes\":[...],\"mapping\":{\"mot-clé exact\":\"Thématique\",...}}";
  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var text = (data.content || []).filter(function (b) { return b.type === "text"; })
        .map(function (b) { return b.text; }).join("");
      var parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (!parsed.mapping) throw new Error("mapping absent");
      var result = {};
      Object.keys(parsed.mapping).forEach(function (label) {
        var theme = parsed.mapping[label], normL = halChartsNormalize(label), matched = false;
        Object.keys(kwMapping).forEach(function (k) {
          if (halChartsNormalize(kwMapping[k]) === normL) { result[k] = theme; matched = true; }
        });
        if (!matched) result[normL] = theme;
      });
      callback(Object.keys(result).length ? result : null);
    })
    .catch(function (err) { console.warn("[hbi-charts] IA échec :", err.message); callback(null); });
}

function halChartsAutoThematiques(publications, maxN, renameMap, debug) {
  var kwCount = {};
  publications.forEach(function (pub) {
    var allKws = [].concat(pub.keyword_s || []).concat(pub.en_keyword_s || []).concat(pub.fr_keyword_s || []);
    if (!allKws.length) return;
    var seen = {};
    allKws.forEach(function (kwRaw) {
      String(kwRaw).split(/[,;]/).map(function (t) { return t.trim(); }).filter(Boolean)
        .forEach(function (term) {
          if (term.length < 3) return;
          var nk = halChartsNormalize(term);
          if (!nk.split(" ").some(function (w) { return w.length >= 3 && !HAL_CHARTS_STOPWORDS[w]; })) return;
          if (seen[nk]) return;
          seen[nk] = true;
          var lbl = (renameMap && (renameMap[halChartsCapitalize(term)] || renameMap[nk])) || halChartsCapitalize(term);
          if (!kwCount[nk]) kwCount[nk] = { label: lbl, count: 0 };
          kwCount[nk].count++;
          if (lbl.length > kwCount[nk].label.length) kwCount[nk].label = lbl;
        });
    });
  });
  var topKeys = Object.keys(kwCount).sort(function (a, b) { return kwCount[b].count - kwCount[a].count; }).slice(0, maxN);
  if (!topKeys.length) return null;
  var m = {};
  topKeys.forEach(function (k) { m[k] = kwCount[k].label; });
  return m;
}

function halChartsAutoDomaines(publications, maxN, renameMap, debug) {
  var domainCount = {};
  publications.forEach(function (pub) {
    var domains = [].concat(pub.domain_s || []), seen = {};
    domains.forEach(function (rawCode) {
      var code = String(rawCode).toLowerCase().trim();
      var label = (renameMap && renameMap[code]) ? renameMap[code] : halChartsTranslateDomain(code);
      if (seen[label]) return;
      seen[label] = true;
      if (!domainCount[code]) domainCount[code] = { label: label, count: 0 };
      domainCount[code].count++;
    });
  });
  var labelCount = {};
  Object.keys(domainCount).forEach(function (code) {
    var d = domainCount[code];
    if (!labelCount[d.label]) labelCount[d.label] = { code: code, count: 0 };
    labelCount[d.label].count += d.count;
  });
  var topLabels = Object.keys(labelCount).sort(function (a, b) { return labelCount[b].count - labelCount[a].count; }).slice(0, maxN);
  if (!topLabels.length) return null;
  var m = {};
  topLabels.forEach(function (l) { m[labelCount[l].code] = l; });
  return m;
}

function halChartsBuildCategoryData(publications, field, mapping, years, multiValue) {
  var byYear = {}, total = {};
  publications.forEach(function (pub) {
    var year = halChartsExtractYear(pub.producedDateY_i || pub.publicationDateY_i);
    if (!year || years.indexOf(year) === -1) return;
    var values = [].concat(pub[field] || []), cat = null, keys = Object.keys(mapping);
    if (multiValue) {
      for (var i = 0; i < keys.length; i++) {
        var tl = mapping[keys[i]];
        if (values.some(function (v) { return halChartsTranslateDomain(String(v).toLowerCase().trim()) === tl; })) { cat = tl; break; }
      }
    } else {
      for (var i = 0; i < keys.length; i++) {
        var fn = halChartsNormalize(keys[i]);
        if (values.some(function (v) { return halChartsNormalize(String(v)).indexOf(fn) !== -1; })) { cat = mapping[keys[i]]; break; }
      }
    }
    if (!cat) return;
    if (!byYear[cat]) byYear[cat] = {};
    byYear[cat][year] = (byYear[cat][year] || 0) + 1;
    total[cat] = (total[cat] || 0) + 1;
  });
  return { byYear: byYear, total: total };
}

// ── Barre de progression progressbar.js ─────────────────────────────────────
// Une seule instance, un seul div overlay inséré avant le container.
// Phases :
//   "Chargement des données…"   0 → 0.20  (animé lentement)
//   "Récupération des papiers…" 0.20 → 0.50 (animé lentement)
//   "Résolution des DOI…"       0.20 → 0.50 (animé lentement)
//   "Chargement des citations"  0.50 → 1.00 (proportionnel done/total)
//   progressDone                → 1.00 puis masqué

var _hcBar = null;   // instance ProgressBar.Line
var _hcBarEl = null;   // div overlay
var _hcBarLabel = null;   // div texte
var _hcBuilding = false;  // flag anti-réentrance (évite double création)

var _HC_STEPS = {
  "Chargement des données…": { start: 0.00, end: 0.20 },
  "Récupération des papiers…": { start: 0.20, end: 0.50 },
  "Résolution des DOI…": { start: 0.20, end: 0.50 },
  "Chargement des citations": { start: 0.50, end: 1.00 },
};

function _hcEnsureOverlay(container) {
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

function halChartsProgressCSS(container, label) {
  // Affichage immédiat avant chargement de progressbar.js
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

function halChartsProgress(container, label, done, total) {
  _hcEnsureOverlay(container);
  if (!_hcBarEl) return;
  _hcBarEl.style.display = "";

  // Label
  if (_hcBarLabel) {
    _hcBarLabel.innerHTML = label
      + (total > 1
        ? " <span class=\"hbi-charts-progress-count\">" + done + "\u00a0/\u00a0" + total + "</span>"
        : "");
  }

  // Calcul du ratio
  var step = _HC_STEPS[label];
  var ratio = step ? step.start : 0.5;
  if (step) {
    if (total > 1 && done >= 0) {
      ratio = step.start + (done / total) * (step.end - step.start);
    } else {
      ratio = step.end; // animer jusqu'à la fin de la phase
    }
  }

  if (_hcBar) {
    var dur = (total > 1) ? 220 : 1200;
    _hcBar.animate(ratio, { duration: dur });
  } else {
    var fill = document.getElementById("hc-bar-fill");
    if (fill) fill.style.width = Math.round(ratio * 100) + "%";
  }
}

function halChartsProgressDone(container) {
  if (_hcBar) {
    _hcBar.animate(1.0, { duration: 300 });
  } else {
    var fill = document.getElementById("hc-bar-fill");
    if (fill) fill.style.width = "100%";
  }
  setTimeout(function () {
    if (_hcBarEl) _hcBarEl.style.display = "none";
  }, 500);
}

// Chargement de progressbar.js
// Priorité : déjà chargé → local assets/js → jsDelivr CDN → fallback CSS
function halChartsLoadProgressBar(callback) {
  if (typeof ProgressBar !== "undefined") { callback(); return; }

  function tryLoad(src, onFail) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = function () {
      if (typeof ProgressBar !== "undefined") callback();
      else onFail();
    };
    s.onerror = onFail;
    document.head.appendChild(s);
  }

  var localSrc = (function () {
    var scripts = document.querySelectorAll("script[src]");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src.indexOf("hbi-charts") !== -1) {
        return scripts[i].src.replace(/hbi-charts[^/]*$/, "progressbar.min.js");
      }
    }
    return null;
  })();

  if (localSrc) {
    tryLoad(localSrc, function () {
      tryLoad("https://cdn.jsdelivr.net/npm/progressbar.js@1.1.0/dist/progressbar.min.js", function () {
        console.warn("[hbi-charts] progressbar.js indisponible — fallback CSS");
        callback();
      });
    });
  } else {
    tryLoad("https://cdn.jsdelivr.net/npm/progressbar.js@1.1.0/dist/progressbar.min.js", function () {
      console.warn("[hbi-charts] progressbar.js indisponible — fallback CSS");
      callback();
    });
  }
}

// ── Chargement CDN Chart.js ───────────────────────────────────────────────────
// ── Chargement CDN Chart.js ───────────────────────────────────────────────────
function halChartsLoadChartJs(callback) {
  function applyDefaults() {
    var c = getComputedStyle(document.documentElement).getPropertyValue("--main-text-color").trim();
    Chart.defaults.color = c || "#1a1a2e";
    callback();
  }
  if (typeof Chart !== "undefined") { applyDefaults(); return; }
  var CDNJS = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
  var JSDELIVR = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
  function load(url, onFail) {
    var s = document.createElement("script");
    s.src = url;
    s.onload = applyDefaults;
    s.onerror = function () {
      console.warn("[hbi-charts] Chart.js indisponible depuis", url);
      if (onFail) onFail(); else console.error("[hbi-charts] Tous les CDN ont échoué.");
    };
    document.head.appendChild(s);
  }
  load(CDNJS, function () { load(JSDELIVR, null); });
}

// ── Rendu métriques ───────────────────────────────────────────────────────────
function halChartsRenderMetrics(publications, years) {
  var total = publications.length, totalCit = 0, hIdx = 0, citSource = "—";
  if (publications._s2Total !== undefined) {
    totalCit = publications._s2Total; hIdx = publications._s2HIndex || 0; citSource = "Semantic Scholar";
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

function halChartsCreateCard(id, title, extraClass) {
  return "<div class=\"hbi-charts-card " + (extraClass || "") + "\">"
    + "<div class=\"hbi-charts-card-title\">" + title + "</div>"
    + "<div class=\"hbi-charts-canvas-wrapper\"><canvas id=\"" + id + "\"></canvas></div>"
    + "<div class=\"hbi-charts-legend\" id=\"" + id + "-legend\"></div></div>";
}

function halChartsBuildLegend(containerId, labels, colors, lineStyle) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = labels.map(function (l, i) {
    var color = colors[i % colors.length];
    var icon = lineStyle && lineStyle[i]
      ? "<span class=\"hbi-charts-legend-line\" style=\"background:" + color + ";\"></span>"
      : "<span class=\"hbi-charts-legend-dot\" style=\"background:" + color + ";\"></span>";
    return "<div class=\"hbi-charts-legend-item\">" + icon + "<span>" + l + "</span></div>";
  }).join("");
}

// ── Graphiques ────────────────────────────────────────────────────────────────
function halChartsTextColor() {
  var c = getComputedStyle(document.documentElement).getPropertyValue("--main-text-color").trim();
  return c || "#1a1a2e";
}

function halChartsRenderBar(canvasId, years, categories, byYear, colors) {
  var ctx = document.getElementById(canvasId);
  if (!ctx) return;
  var gridColor = getComputedStyle(document.documentElement).getPropertyValue("--main-timeline-color").trim() || "#f0f0f0";
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: years.map(String), datasets: categories.map(function (cat, i) {
        return {
          label: cat, data: years.map(function (y) { return (byYear[cat] && byYear[cat][y]) || 0; }),
          backgroundColor: colors[i % colors.length], borderRadius: 3, borderSkipped: false
        };
      })
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { title: function (it) { return "Année " + it[0].label; } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: halChartsTextColor() } },
        y: {
          beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 }, color: halChartsTextColor() },
          grid: { color: gridColor },
          title: { display: true, text: "Nombre de publications", font: { size: 11 }, color: halChartsTextColor() }
        }
      }
    }
  });
}

function halChartsRenderPie(canvasId, categories, total, colors) {
  var ctx = document.getElementById(canvasId);
  if (!ctx) return;
  var data = categories.map(function (c) { return total[c] || 0; });
  var sum = data.reduce(function (a, b) { return a + b; }, 0);
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories.map(function (_, i) { return String.fromCharCode(65 + i); }),
      datasets: [{ data: data, backgroundColor: colors.slice(0, categories.length), borderWidth: 2, borderColor: "#fff" }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (item) {
              return " " + categories[item.dataIndex] + " — " + item.raw + " pub. (" +
                (sum > 0 ? ((item.raw / sum) * 100).toFixed(1) : 0) + "%)";
            }
          }
        }
      }
    }
  });
}

function halChartsRenderCitations(canvasId, publications, years) {
  var ctx = document.getElementById(canvasId);
  if (!ctx) return;
  var thisYear = new Date().getFullYear(), firstYear = years[0] || thisYear, allYears = [];
  for (var y = firstYear; y <= thisYear; y++) allYears.push(y);
  var citByYear = {};
  allYears.forEach(function (y) { citByYear[y] = 0; });
  var graph = publications._s2ByYear || publications._scopusByYear || publications._scholarByYear || null;
  var src = publications._s2ByYear ? "Semantic Scholar"
    : publications._scopusByYear ? "Scopus"
      : publications._scholarByYear ? "Google Scholar" : "Aucune source";
  if (graph) Object.keys(graph).forEach(function (y) { citByYear[y] = graph[y]; });
  var citData = allYears.map(function (y) { return citByYear[y] || 0; });
  var tot = citData.reduce(function (s, v) { return s + v; }, 0);
  var el = document.getElementById("hc-cit-metric");
  if (el) el.innerHTML = "<strong>" + tot + "</strong>\u00a0citations totales"
    + "\u2002·\u2002<strong>" + (allYears.length > 0 ? (tot / allYears.length).toFixed(1) : "0") + "</strong>\u00a0cites/an"
    + "\u2002·\u2002<em>source\u00a0: " + src + "</em>";
  var gridColor = getComputedStyle(document.documentElement).getPropertyValue("--timeline-background-color").trim() || "#f0f0f0";
  const linkColor = getComputedStyle(document.documentElement).getPropertyValue('--link-color').trim() || "#1A56A4";
  function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
  }
  const rgb = hexToRgb(linkColor);
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: allYears.map(String), datasets: [{
        label: "Citations", data: citData,
        backgroundColor: allYears.map(function (y) { return y === thisYear ? `rgba(${rgb},0.35)` : `rgba(${rgb},0.82)`; }),
        borderColor: allYears.map(function (y) { return y === thisYear ? `{linkColor}` : "transparent"; }),
        borderWidth: allYears.map(function (y) { return y === thisYear ? 1.5 : 0; }),
        borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: halChartsTextColor() } },
        y: {
          beginAtZero: true, ticks: { color: halChartsTextColor() }, grid: { color: gridColor },
          title: { display: true, text: "Citations reçues / an", color: halChartsTextColor() }
        }
      }
    }
  });
}

function halChartsRenderAll(container, publications, years, thData, thCats, domData, domCats, showSet) {
  if (!showSet) { showSet = { metrics: true, thematiques: true, domaines: true, citations: true }; }
  var thColors = HAL_CHARTS_PALETTE.slice(0, (thCats || []).length);
  var domColors = HAL_CHARTS_PALETTE.slice(0, (domCats || []).length);
  var html = "";
  if (showSet.metrics) {
    html += "<div class=\"hbi-charts-section-title\">Indicateurs bibliométriques</div>"
      + halChartsRenderMetrics(publications, years);
  }
  if (showSet.thematiques && thCats && thCats.length) {
    html += "<div class=\"hbi-charts-section-title\">Thématiques scientifiques</div><div class=\"hbi-charts-grid\">"
      + halChartsCreateCard("hc-th-bar", "Publications / an par thématique")
      + halChartsCreateCard("hc-th-pie", "Répartition globale") + "</div>";
  }
  if (showSet.domaines && domCats && domCats.length) {
    html += "<div class=\"hbi-charts-section-title\">Domaines d'application</div><div class=\"hbi-charts-grid\">"
      + halChartsCreateCard("hc-dom-bar", "Publications / an par domaine")
      + halChartsCreateCard("hc-dom-pie", "Répartition globale") + "</div>";
  }
  if (showSet.citations) {
    html += "<div class=\"hbi-charts-section-title\">Citations par année</div><div class=\"hbi-charts-grid\">"
      + halChartsCreateCard("hc-cit", "Citations reçues / an", "hbi-charts-card--full")
      + "</div><div class=\"hbi-charts-cites-year\" id=\"hc-cit-metric\"></div>";
  }
  if (!html) {
    halChartsProgressDone(container);
    halChartsProgressDone(container);
    container.innerHTML = "<div class=\"hbi-charts-loading\">Aucun graphique sélectionné.</div>";
    return;
  }
  halChartsProgressDone(container);
  halChartsProgressDone(container);
  container.innerHTML = html;
  if (showSet.thematiques && thCats && thCats.length) {
    halChartsRenderBar("hc-th-bar", years, thCats, thData.byYear, thColors);
    halChartsBuildLegend("hc-th-bar-legend", thCats, thColors);
    halChartsRenderPie("hc-th-pie", thCats, thData.total, thColors);
    halChartsBuildLegend("hc-th-pie-legend", thCats.map(function (c, i) { return String.fromCharCode(65 + i) + " – " + c; }), thColors);
  }
  if (showSet.domaines && domCats && domCats.length) {
    halChartsRenderBar("hc-dom-bar", years, domCats, domData.byYear, domColors);
    halChartsBuildLegend("hc-dom-bar-legend", domCats, domColors);
    halChartsRenderPie("hc-dom-pie", domCats, domData.total, domColors);
    halChartsBuildLegend("hc-dom-pie-legend", domCats.map(function (c, i) { return String.fromCharCode(65 + i) + " – " + c; }), domColors);
  }
  if (showSet.citations) {
    halChartsRenderCitations("hc-cit", publications, years);
  }
}

// ── Palette & constantes ──────────────────────────────────────────────────────
var HAL_CHARTS_PALETTE = ["#1a56a4", "#e05c2a", "#2e9e6b", "#8b3ab8", "#c0392b", "#16a085", "#d4ac0d", "#2980b9", "#7f8c8d"];

var HAL_DOMAIN_LABELS = {
  "info": "Informatique", "info.info-ai": "IA & Apprentissage", "info.info-bi": "Bioinformatique",
  "info.info-cv": "Vision par ordinateur", "info.info-lg": "Traitement du langage",
  "info.info-lo": "Logique & Vérification", "info.info-mo": "Modélisation & Simulation",
  "info.info-ni": "Réseaux & Télécoms", "info.info-ro": "Robotique", "info.info-se": "Génie logiciel",
  "math": "Mathématiques", "math.math-ap": "Mathématiques appliquées", "math.math-na": "Analyse numérique",
  "math.math-oc": "Optimisation & Contrôle", "math.math-pr": "Probabilités", "math.math-st": "Statistiques",
  "phys": "Physique", "phys.phys-opti": "Optique & Photonique", "phys.phys-mphy": "Physique médicale",
  "spi": "Sciences de l'ingénieur", "spi.signal": "Traitement du signal", "spi.img": "Imagerie",
  "spi.med": "Ingénierie biomédicale", "spi.opti": "Optique / Photonique", "spi.nano": "Nanosciences",
  "sdv": "Sciences du vivant", "sdv.bc": "Biochimie", "sdv.can": "Cancérologie", "sdv.neu": "Neurosciences",
  "sdv.ima": "Imagerie médicale", "sdv.mhep": "Médecine humaine", "sdv.mhep.neu": "Neurologie",
  "sdv.mhep.chir": "Chirurgie", "sdv.mhep.dent": "Dentisterie", "sdv.mhep.hep": "Hépatologie / Gastro",
  "sdv.mhep.onco": "Oncologie", "chim": "Chimie", "shs": "Sciences humaines & sociales",
  "shs.edu": "Sciences de l'éducation", "shs.info": "Sciences de l'information",
  "stat": "Statistiques", "stat.ml": "Apprentissage automatique",
};

var HAL_CHARTS_STOPWORDS = {
  "the": 1, "a": 1, "an": 1, "of": 1, "in": 1, "for": 1, "on": 1, "and": 1, "or": 1, "to": 1, "with": 1, "by": 1, "at": 1,
  "de": 1, "du": 1, "des": 1, "la": 1, "le": 1, "les": 1, "un": 1, "une": 1, "et": 1, "en": 1, "sur": 1, "par": 1, "pour": 1,
  "dans": 1, "au": 1, "aux": 1, "est": 1, "se": 1, "ce": 1, "qui": 1, "que": 1, "d": 1, "l": 1, "s": 1, "j": 1, "n": 1, "m": 1,
  "based": 1, "using": 1, "via": 1, "new": 1, "novel": 1, "approach": 1, "method": 1, "system": 1,
};

// ── Utilitaires ───────────────────────────────────────────────────────────────
function halChartsExtractYear(d) {
  if (!d) return null;
  var m = String(d).match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}
function halChartsNormalize(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/-]/g, " ").replace(/\s+/g, " ").trim();
}
function halChartsCapitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function halChartsTranslateDomain(code) {
  var c = String(code).toLowerCase().trim().replace(/^\d+\./, "");
  if (HAL_DOMAIN_LABELS[c]) return HAL_DOMAIN_LABELS[c];
  var parts = c.split(".");
  for (var i = parts.length - 1; i > 0; i--) {
    var p = parts.slice(0, i).join(".");
    if (HAL_DOMAIN_LABELS[p]) return HAL_DOMAIN_LABELS[p];
  }
  return halChartsCapitalize(c.replace(/[._-]/g, " "));
}
function halChartsTopN(total, maxN) {
  return Object.keys(total).sort(function (a, b) { return total[b] - total[a]; }).slice(0, maxN);
}