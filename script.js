const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec"; // must end with /exec

let currentAction = "";

function openSubmit() {
    currentAction = "submit";
    document.getElementById("popupTitle").innerText = "Submit Phone Number";
    document.getElementById("popup").style.display = "block";
}

function openSearch() {
    currentAction = "search";
    document.getElementById("popupTitle").innerText = "Search Phone Number";
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("responseMsg").innerText = "";
}

async function handleAction() {
    const phone = document.getElementById("phoneInput").value.trim();
    const responseMsg = document.getElementById("responseMsg");

    if (!phone) {
        responseMsg.innerText = "Please enter phone number";
        return;
    }

    if (currentAction === "submit") {

        const response = await fetch(API_URL, {
            method: "POST",
            body: new URLSearchParams({ phone: phone })
        });

        const data = await response.json();

        if (data.status === "duplicate") {
            responseMsg.innerText = "Duplicate - Already exists";
        } else {
            responseMsg.innerText = "Successfully added!";
        }
    }

    if (currentAction === "search") {
        const response = await fetch(`${API_URL}?phone=${phone}`);
        const data = await response.json();

        if (data.status === "found") {
            responseMsg.innerText = "Number exists in database";
        } else {
            responseMsg.innerText = "Not found";
        }
    }
}
