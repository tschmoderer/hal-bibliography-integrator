// Get the form element
const form = document.querySelector('form');
const docTypeToggles = document.getElementById("formDocTypes");

// Peupler les types de graphiques depuis HAL_CHARTS_SHOW_OPTIONS
const chartTypeToggles = document.getElementById("formChartTypes");
if (typeof HAL_CHARTS_SHOW_OPTIONS !== "undefined") {
    HAL_CHARTS_SHOW_OPTIONS.forEach(function (opt) {
        var toggle = document.createElement("div");
        var input = document.createElement("input");
        input.type = "checkbox";
        input.id = "toggle-chart-" + opt.key;
        input.name = input.id;
        var label = document.createElement("label");
        label.htmlFor = input.id;
        label.innerText = opt.label;
        toggle.appendChild(input);
        toggle.appendChild(label);
        chartTypeToggles.appendChild(toggle);
    });
}

for (const t in hbi_helpers) {
    var toggle = document.createElement('div');
    var input = document.createElement('input');
    input.type = "checkbox";
    input.id = "toggle-" + t;
    input.name = input.id;
    var label = document.createElement('label');
    label.htmlFor = input.id;
    label.innerText = hbi_helpers[t]["title_en"];

    toggle.appendChild(input);
    toggle.appendChild(label);

    docTypeToggles.appendChild(toggle);
}

// Add a submit event listener to the form
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    // Reset variables
    hal_integrator_config = {
        "id": "",
        "onLoad": "collapsed",
        "typeList": [],
        "doit": true,
        "debug": false,
        "plugins": {
            "artscore": {
                "scopus": {
                    "apiKey": "ba28b7b16741bdbc327b34c7b8a8ee24",
                }
            },

            "wordcloud": {},
            "charts": {
                "show": [],
                "scopus": {
                    "apiKey": "ba28b7b16741bdbc327b34c7b8a8ee24",
                    "authorId": ""
                },
                "semanticScholar": {
                    "authorId": "",   // URL : semanticscholar.org/author/Nom/2109238827
                    "apiKey": "Io1PNVnOo49Dl6DHwuQ1E1EfVwB1s76S43ASGgI3"     // optionnel — 10 req/s au lieu de 1
                },
                "maxCategories": 6
            }
        }
    }

    // reset hal containers 
    document.getElementById("hbi-wordcloud-integrator").innerHTML = "";
    document.getElementById("hbi-bibliography-integrator").innerHTML = "";
    document.getElementById("hbi-charts-integrator").innerHTML = "";

    // Get the value of the name field
    const nameInput = document.querySelector('#idhal');
    hal_integrator_config["id"] = nameInput.value;

    // Get the values of the toggle buttons
    docTypeToggles.querySelectorAll("input").forEach((tog) => {
        var id = tog.id;
        var halElem = id.replace('toggle-', '');

        const togInput = document.querySelector('#' + id);
        const togValue = togInput.checked;

        if (togValue) {
            hal_integrator_config["typeList"].push(halElem);
        }

    });

    if (form.querySelector("#toggle-wc").checked) {
        hal_integrator_config["plugins"]["wordcloud"]["doit"] = true;
    } else {
        hal_integrator_config["plugins"]["wordcloud"]["doit"] = false;
    }

    if (form.querySelector("#toggle-display").checked) {
        hal_integrator_config["onLoad"] = "collapsed";
    } else {
        hal_integrator_config["onLoad"] = "expanded";
    }
    if (form.querySelector("#toggle-artdat").checked) {
        hal_integrator_config["plugins"]["artscore"]["doit"] = true;
    } else {
        hal_integrator_config["plugins"]["artscore"]["doit"] = false;
    }
    if (form.querySelector("#toggle-charts").checked) {
        hal_integrator_config["plugins"]["charts"]["doit"] = true;
    } else {
        hal_integrator_config["plugins"]["charts"]["doit"] = false;
    }

    // Graphiques sélectionnés
    if (typeof HAL_CHARTS_SHOW_OPTIONS !== "undefined") {
        var selectedCharts = [];
        chartTypeToggles.querySelectorAll("input").forEach(function (cb) {
            // id = "toggle-chart-metrics" → clé = "metrics"
            var key = cb.id.replace("toggle-chart-", "");
            if (cb.checked) selectedCharts.push(key);
        });
        // Tout coché → pas de filtre (tout afficher, comportement par défaut)
        if (selectedCharts.length > 0 && selectedCharts.length < HAL_CHARTS_SHOW_OPTIONS.length) {
            hal_integrator_config["plugins"]["charts"]["show"] = selectedCharts;
        } else {
            delete hal_integrator_config["plugins"]["charts"]["show"];
        }
    }

    if (hal_integrator_config["typeList"].length > 0) {
        console.log(hal_integrator_config);
        hbi_make(hal_integrator_config["id"], hal_integrator_config["typeList"], hal_integrator_config["debug"]);
    }
});

// Plugins management 
// ART SCORE
const artPluginCheckbox = form.querySelector("#toggle-artdat");
artPluginCheckbox.addEventListener("click", function (event) {
    var toggleART = form.querySelector("#toggle-ART");
    if (event.target.checked) {
        toggleART.checked = true;
        toggleART.onclick = "return false;";
    } else {
        toggleART.onclick = "";
    }
});
// Plugins management 
// ART SCORE
const chartPluginCheckbox = form.querySelector("#toggle-charts");
chartPluginCheckbox.addEventListener("click", function (event) {
    var toggleART = form.querySelector("#toggle-ART");
    var artPluginCheckbox = form.querySelector("#toggle-artdat");
    var toggleChart = form.querySelector("#toggle-chart-metrics");
    var toggleCitations = form.querySelector("#toggle-chart-citations");
    if (event.target.checked) {
        toggleART.checked = true;
        toggleART.onclick = "return false;";
        toggleChart.checked = true;
        toggleChart.onclick = "return false;";
        toggleCitations.checked = true;
        toggleCitations.onclick = "return false;";
        artPluginCheckbox.checked = true;
        artPluginCheckbox.onclick = "return false;";
    } else {
        toggleART.onclick = "";
        toggleChart.onclick = "";
        toggleCitations.onclick = "";
        artPluginCheckbox.onclick = "";
    }
});