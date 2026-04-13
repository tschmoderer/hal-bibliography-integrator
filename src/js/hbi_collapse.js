export function collapse(event) {
    event.preventDefault();
    const elem = event.target.closest("button");
    const elem2 = document.getElementById(elem.getAttribute("data-target").replace('#', ''));
    if (elem2.style.display === "none") {
        elem2.style.display = "block";
        elem.querySelector(".icon-drop_down").classList.remove("fa-rotate-by");
    } else {
        elem2.style.display = "none";
        elem.querySelector(".icon-drop_down").classList.add("fa-rotate-by");
    }
}