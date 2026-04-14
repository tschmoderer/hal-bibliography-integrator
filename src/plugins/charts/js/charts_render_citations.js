import { hbi_plugin_charts_create_cards } from "./charts_utils";
// import { Chart } from 'chart.js';

function movingAverage(data, windowSize = 3) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
        let sum = 0;

        for (let j = 0; j < windowSize; j++) {
            const idx = i - j;

            // constant rule: if missing,0
            const value = idx >= 0 ? data[idx] : 0;

            sum += value;
        }

        result.push((sum / windowSize).toFixed(1));
    }

    return result;
}

export function hbi_plugin_charts_render_citations(data) {
    const canvas_id = "hc-cit";

    const container = document.createElement("div");
    const card = hbi_plugin_charts_create_cards(canvas_id, "", "hbi-charts-card--full");

    container.appendChild(card);

    const canvas = card.querySelector(`#${canvas_id}`);
    const ctx = canvas.getContext("2d");

    var allYears = Object.keys(data.citations.data);
    var allVals = Object.values(data.citations.data);
    var mov3Vals = movingAverage(allVals, 3);
    var thisYear = new Date().getFullYear();

    const linkColor = "#1A56A4";
    const textColor = "#1a1a2e";
    const gridColor = "#f0f0f0";

    new Chart(ctx, {
        data: {
            labels: allYears.map(String), // years
            datasets: [{
                label: 'Citations',
                type: "bar",
                data: allVals,
                backgroundColor: allYears.map(function (y) { return y === thisYear ? `${linkColor}35` : `${linkColor}82`; }),
                borderColor: allYears.map(function (y) { return y === thisYear ? `{linkColor}` : "transparent"; }),
                borderWidth: allYears.map(function (y) { return y === thisYear ? 1.5 : 0.5; }),
                borderRadius: 2,
                borderSkipped: false
            }, {
                label: "3-year moving average",
                type: "line",
                data: mov3Vals,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor },
                    title: {
                        display: true,
                        text: "Source: OpenAlex",
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor },
                    title: {
                        display: false,
                        text: [
                            "Citations / year",
                            "Source: OpenAlex"
                        ],
                        color: textColor
                    }
                }
            }
        }
    });

    // const el = document.createElement("div");
    // el.classList = "hbi-charts-cites-year";
    // el.id = "hc-cit-metric";

    // // const strongTotal = document.createElement("strong");
    // // strongTotal.textContent = data.citations.total;

    // // el.appendChild(strongTotal);
    // // el.appendChild(document.createTextNode("\u00a0citations"));
    // // el.appendChild(document.createTextNode("\u2002·\u2002"));

    // const strongAvg = document.createElement("strong");
    // strongAvg.textContent = data.citations.average;
    // el.appendChild(strongAvg);
    // el.appendChild(document.createTextNode("\u00a0cites/yr"));
    // el.appendChild(document.createTextNode("\u2002·\u2002"));

    // const em = document.createElement("em");
    // em.textContent = `source\u00a0: ${data.citations.source}`;
    // el.appendChild(em);

    // container.appendChild(el);

    return container;
}