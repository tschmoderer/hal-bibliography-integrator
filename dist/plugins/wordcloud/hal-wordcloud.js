'use strict';

function init_wordcloud(container) {
    var spinner = create_spinner("hal-wordcloud-spinner");
    container.appendChild(spinner);
}

function HALwordcloud(hal_wordcloud_div) {
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(globalHalData);
    }

    var data = [];
    for (const k in globalHalData) {
        for (const w in globalHalData[k]) {
            if (globalHalData[k][w]["en_keyword_s"] != undefined) {
                data.push({"en_keyword_s": globalHalData[k][w]["en_keyword_s"]});
            }
        }        
    }
   
    var wordcloud_container = document.createElement("div");
    wordcloud_container.classList = "hal-cloud-word";
    
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log(data);
    }
    
    // Extract the English keywords from the publications
    const keywords = data.flatMap(doc => doc.en_keyword_s).filter(keyword => keyword !== undefined && keyword !== null && keyword !== "");
    
    // Create a word frequency object
    const wordFreq = {};
    keywords.forEach(k => wordFreq[k] ? wordFreq[k]++ : wordFreq[k] = 1 );
    
    // Map keyword freq in range 1 to 10
    var max   = Object.entries(wordFreq).reduce((a, b) => a[1] > b[1] ? a : b)[1];
    var min   = Object.entries(wordFreq).reduce((a, b) => a[1] < b[1] ? a : b)[1];
    
    
    // Shuffle wordlist
    var len    = Object.keys(wordFreq).length;
    var suffle = Array.from(Array(len).keys());
    suffle.sort(function(a, b){return 0.5 - Math.random()});
    
    // Create word Cloud
    for (let i = 0; i < len; i++) {
        var word = Object.keys(wordFreq)[suffle[i]];
        var freq = Object.values(wordFreq)[suffle[i]];
        var new_freq = (9*freq+max-10*min)/(max-min);
        wordcloud_container.appendChild(keywordElement(word, new_freq));
    };
    
    hal_wordcloud_div.appendChild(wordcloud_container); 
    document.getElementById("hal-wordcloud-spinner").style.display = "none";   
}

function keywordElement(keyw, freq) {
    var container = document.createElement("a"); 
    container.classList = "keyword keyword-" + freq;
    container.setAttribute("href", "https://hal.science/search/?q=*&authIdHal_s=" + idhal + "&keyword_s=" + keyw);
    container.setAttribute("target","_blank");
    container.innerText = keyw; 
    return container;
}

// Récupède la div ou placer le nuage de mots
var hal_wordcloud_div = document.getElementById("wordcloud-hal");

// Si elle n'existe pas on ne fait rien 
if (hal_wordcloud_div === null) {
    if ((typeof halDebug !== "undefined") && (halDebug)) {
        console.log("No HAL wordcloud div on this page");
    }
} else {
    init_wordcloud(hal_wordcloud_div);

    document.addEventListener("halMainDone", () => {
        if ((typeof halDebug !== "undefined") && (halDebug)) {
            console.log("Create wordcloud of keywords in ");
            console.log(hal_wordcloud_div);
        }
    
        // Sinon on créé le nuage de mot
        HALwordcloud(hal_wordcloud_div);

    });
}
