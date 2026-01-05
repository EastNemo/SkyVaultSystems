"use strict";

document.addEventListener("DOMContentLoaded", init);

function init() {
    const resourceLinks = document.querySelectorAll("#docs .resources li > a");

    resourceLinks.forEach(link => {
        link.addEventListener("click", onResourceClick);
    });
}

function onResourceClick(e) {
    e.preventDefault();
    alert("Some error occurred");
}