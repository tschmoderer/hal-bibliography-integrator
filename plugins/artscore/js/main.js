import '../scss/main.scss';

import { artscore_data } from '../data/scimagojr 2022';
import { make_artscore_container } from './builder';

//TODO: add to every row two column 

function toggleArtScore(col, id) {
  var elem = document.getElementById(id);
  var icon = col.firstChild;

  if (elem.classList.contains('artscore-hide')) {
    elem.classList.remove('artscore-hide');
    elem.classList.add('artscore-show');

    icon.classList.add("artscore-icon-rotate");
    col.classList.remove("artscore-button-hover");
  } else {
    elem.classList.remove('artscore-show');
    elem.classList.add('artscore-hide');

    icon.classList.remove("artscore-icon-rotate");
    col.classList.add("artscore-button-hover");
  }
}

function make_artscore_collapsable(article_row, artscore_container, halId) {
  var button = document.createElement("td"); 
  button.classList = "artscore-button artscore-button-hover";
  var icon = document.createElement("i");
  icon.classList = "artscore-icon fa-solid fa-caret-left";
  button.onclick = function() {
      toggleArtScore(this, 'artscore-' + halId);
  };

  button.appendChild(icon); 
  article_row.appendChild(button); 

  var new_container = document.createElement("td");
  new_container.id = 'artscore-' + halId;
  new_container.classList = "artscore-column artscore-show";
  new_container.appendChild(artscore_container);
  article_row.appendChild(new_container);
}

function add_artscore(data) {
  var row = document.getElementById("row-" + data["halId_s"]);
  console.log(row);

  var title = data["journalTitle_s"];
  if (title in hal_plugins["artscore"]){
    title = hal_plugins["artscore"][title];
  }

  for (const s in artscore_data) { 
    if (artscore_data[s]["Title"] === title) {
      console.log(artscore_data[s]);
      var ctnr = make_artscore_container(artscore_data[s]);
      make_artscore_collapsable(row, ctnr, data["halId_s"]);
    }
  }
}

function HALartscore() {
  var data = globalHalData["ART"];
  for (const d in data) {
    console.log(data[d]);
    add_artscore(data[d]);
  }
}


document.addEventListener("halMainDone", () => {
  if ((typeof halDebug !== "undefined") && (halDebug)) {
    console.log("Create ArtScore data");
  }
  HALartscore();
});
