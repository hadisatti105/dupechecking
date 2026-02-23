const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec";

let currentAction = "";

function openSubmit() {
    currentAction = "submit";
    document.getElementById("popupTitle").innerText = "Submit Phone Number";
    document.getElementById("popup").style.display = "flex";
    resetForm();
}

function openSearch() {
    currentAction = "search";
    document.getElementById("popupTitle").innerText = "Search Phone Number";
    document.getElementById("popup").style.display = "flex";
    resetForm();
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

function resetForm() {
    document.getElementById("phoneInput").value = "";
    document.getElementById("responseMsg").innerText = "";
    document.getElementById("responseMsg").className = "";
    document.getElementById("spinner").style.display = "none";
    document.getElementById("actionBtn").disabled = false;
    document.getElementById("phoneInput").focus();
}

function handleEnter(event) {
    if (event.key === "Enter") {
        handleAction();
    }
}

async function handleAction() {
    const phoneInput = document.getElementById("phoneInput");
    const phone = phoneInput.value.trim();
    const responseMsg = document.getElementById("responseMsg");
    const spinner = document.getElementById("spinner");
    const actionBtn = document.getElementById("actionBtn");

    responseMsg.className = "";
    responseMsg.innerText = "";

    // Validation
    if (!/^\d{10}$/.test(phone)) {
        responseMsg.innerText = "Enter valid 10-digit number";
        responseMsg.classList.add("error");
        return;
    }

    actionBtn.disabled = true;
    spinner.style.display = "block";

    try {
        let data;

        if (currentAction === "submit") {
            const response = await fetch(API_URL, {
                method: "POST",
                body: new URLSearchParams({ phone })
            });
            data = await response.json();

            if (data.status === "duplicate") {
                responseMsg.innerText = "Duplicate - Already exists";
                responseMsg.classList.add("error");
            } else {
                responseMsg.innerText = "Successfully added!";
                responseMsg.classList.add("success");
            }
        }

        if (currentAction === "search") {
            const response = await fetch(`${API_URL}?phone=${phone}`);
            data = await response.json();

            if (data.status === "found") {
                responseMsg.innerText = "Duplicate";
                responseMsg.classList.add("success");
            } else {
                responseMsg.innerText = "Not found";
                responseMsg.classList.add("warning");
            }
        }

        // Auto clear after 40 seconds
        setTimeout(() => {
            resetForm();
        }, 40000);

    } catch (error) {
        responseMsg.innerText = "Something went wrong!";
        responseMsg.classList.add("error");
    }

    spinner.style.display = "none";
    actionBtn.disabled = false;
}