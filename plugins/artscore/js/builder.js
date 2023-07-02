function artscore_base_container(data) { 
    // Create the main container element
    const artscoreGrid = document.createElement('div');
    artscoreGrid.classList.add('artscore-grid');

    // Create the individual child elements
    const srjLegend = document.createElement('div');
    srjLegend.classList.add('artscore-srj-legend');
    srjLegend.innerHTML = "<div class='artscore-legend'>SJR 2022</div>";

    const srjData = document.createElement('div');
    srjData.classList.add('artscore-srj-data');
    srjData.innerHTML = "<div class='artscore-data'>"+ data["SJR"] +"</div>";

    const hindexLegend = document.createElement('div');
    hindexLegend.classList.add('artscore-hindex-legend');
    hindexLegend.innerHTML = "<div class='artscore-legend'>h-index</div>";

    const hindexData = document.createElement('div');
    hindexData.classList.add('artscore-hindex-data');
    hindexData.innerHTML = "<div class='artscore-data'>"+ data["H index"] +"</div>";

    const citiesLegend = document.createElement('div');
    citiesLegend.classList.add('artscore-cities-legend');
    citiesLegend.innerHTML = "<div class='artscore-legend'>Citations</div>";

    const citiesData = document.createElement('div');
    citiesData.classList.add('artscore-cities-data');
    citiesData.innerHTML = "<div class='artscore-data'>" +"</div>";

    const quartiles = document.createElement('div');
    quartiles.classList.add('artscore-quartiles');
    artscore_quartiles(quartiles, data);

    // Append the child elements to the main container
    artscoreGrid.appendChild(srjLegend);
    artscoreGrid.appendChild(srjData);
    artscoreGrid.appendChild(hindexLegend);
    artscoreGrid.appendChild(hindexData);
    artscoreGrid.appendChild(citiesLegend);
    artscoreGrid.appendChild(citiesData);
    artscoreGrid.appendChild(quartiles);

    // Append the main container to the document body or any desired parent element
    return artscoreGrid;
}


export function make_artscore_container(data) {
    var base = artscore_base_container(data);
    return base;
}