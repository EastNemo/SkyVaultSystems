"use strict"

document.addEventListener("DOMContentLoaded", init);

function init() {
    document.getElementById("submit-request").addEventListener("click", submitRequest)
}

function submitRequest(e) {
    e.preventDefault();

    removeUxElements();

    const isEverythingUsed = checkInputFields();

    if (isEverythingUsed){
        removeAlert();
        insertHtmlCard("<p class=\"success\">Your form was sent to our support team!</p>");
    }
    else if(document.querySelector(`p.alert`) == null){
        removeSuccess();
        insertHtmlCard("<p class=\"alert\">You must fill in every section!</p>");
    }
}

function checkInputFields() {
    const fields = document.querySelectorAll(".form-group input, .form-group textarea");

    for (const field of fields) {
        if (!field.value || field.value.trim() === "") {
            return false;
        }
    }

    return true;
}

function insertHtmlCard(content, position="beforeend"){
    document.querySelector("div.contact-card").insertAdjacentHTML("beforeend", content);
}

function removeAlert(){
    document.querySelectorAll("p.alert").forEach((element) => {
        element.remove();
    });
}

function removeSuccess(){
    document.querySelectorAll("p.success").forEach((element) => {
        element.remove();
    });
}

function removeUxElements(){
    removeAlert();
    removeSuccess();
}