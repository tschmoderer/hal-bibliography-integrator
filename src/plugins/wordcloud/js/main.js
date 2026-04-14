import '../scss/main.scss'
import { hbi_wordcloud_plugin_name, validate_hbi_wordcloud_config } from './wordcloud_utils';
import { create_spinner, globalHBIData } from '../../../js/hbi_common';

function init_wordcloud(container, debug) {
    var spinner = create_spinner("hbi-wordcloud-spinner");
    container.appendChild(spinner);
}

function HALwordcloud(hbi_wordcloud_div, idhal, debug) {
    if (debug) {
        console.log("INFO HBI WORDCLOUD: Raw data to be treated: ")
        console.log(globalHBIData);
    }

    var data = [];
    for (const k in globalHBIData) {
        for (const w in globalHBIData[k]) {
            if (globalHBIData[k][w]["en_keyword_s"] != undefined) {
                data.push({ "en_keyword_s": globalHBIData[k][w]["en_keyword_s"] });
            }
        }
    }

    var wordcloud_container = document.createElement("div");
    wordcloud_container.classList = "hbi-cloud-word";

    if (debug) {
        console.log("INFO HBI WORDCLOUD: Preprocessed data to be treated: ")
        console.log(data);
    }

    // Extract the English keywords from the publications
    const keywords = data.flatMap(doc => doc.en_keyword_s).filter(keyword => keyword !== undefined && keyword !== null && keyword !== "");

    // Create a word frequency object
    const wordFreq = {};
    keywords.forEach(k => wordFreq[k] ? wordFreq[k]++ : wordFreq[k] = 1);

    // Map keyword freq in range 1 to 10
    var max = Object.entries(wordFreq).reduce((a, b) => a[1] > b[1] ? a : b)[1]
    var min = Object.entries(wordFreq).reduce((a, b) => a[1] < b[1] ? a : b)[1]

    // Shuffle wordlist
    var len = Object.keys(wordFreq).length;
    var suffle = Array.from(Array(len).keys())
    suffle.sort(function (a, b) { return 0.5 - Math.random() });

    // Create word Cloud
    for (let i = 0; i < len; i++) {
        var word = Object.keys(wordFreq)[suffle[i]];
        var freq = Object.values(wordFreq)[suffle[i]];
        var new_freq = (9 * freq + max - 10 * min) / (max - min);
        wordcloud_container.appendChild(keywordElement(word, new_freq, idhal));
    };

    hbi_wordcloud_div.appendChild(wordcloud_container);
    document.getElementById("hbi-wordcloud-spinner").style.display = "none";
}

function keywordElement(keyw, freq, id) {
    var container = document.createElement("a");
    container.classList = "keyword keyword-" + freq;
    container.setAttribute("href", `https://hal.science/search/?q=*&authIdHal_s=${id}&keyword_s=${keyw}`);
    container.setAttribute("target", "_blank")
    container.innerText = keyw;
    return container;
}

export function hbi_plugin_wordcloud_start(hbi_config) {
    try {
        validate_hbi_wordcloud_config(hbi_config)
    } catch (err) {
        console.error("HBI WORCLOUD PLUGIN CONFIG ERROR:", err);
        return -1;
    }

    const debug = hbi_config["plugins"]["wordcloud"]["debug"];

    if (!hbi_config["plugins"]["wordcloud"]["doit"]) {
        if (debug) {
            console.warn("HBI: Worcloud plugin execution skipped because 'doit' is false.");
        }
        return 0;
    }

    // Display config
    if (debug) {
        console.log("HBI WORDCLOUD PLUGIN INFO: config");
        console.log(hbi_config["plugins"]["wordcloud"]);
    }

    // Récupère la div ou placer le nuage de mots
    var hbi_wordcloud_div = document.getElementById(hbi_wordcloud_plugin_name);

    // Si elle n'existe pas on ne fait rien 
    if (!hbi_wordcloud_div) {
        throw new Error("HBI WORDCLOUD: No HAL wordcloud div on this page");
    }

    if (debug) {
        console.log("HBI WORDCLOUD DEBUG: target container");
        console.log(hbi_wordcloud_div);
    }

    // Sinon on créé le nuage de mot
    init_wordcloud(hbi_wordcloud_div, debug);
    document.addEventListener("hbiMainDone", () => {
        // generate the wordcloud when main part is finished to deal with the data
        HALwordcloud(hbi_wordcloud_div, hbi_config["id"], debug);
    });
}
