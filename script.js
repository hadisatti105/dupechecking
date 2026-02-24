const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec";

// ===============================
// OPEN SEARCH POPUP ONLY
// ===============================
function openSearch() {
    document.getElementById("popupTitle").innerText = "Search Phone Number";
    document.getElementById("popup").style.display = "flex";
    resetForm();
}

// ===============================
// CLOSE POPUP
// ===============================
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// ===============================
// RESET FORM
// ===============================
function resetForm() {
    document.getElementById("phoneInput").value = "";
    document.getElementById("responseMsg").innerText = "";
    document.getElementById("responseMsg").className = "";
    document.getElementById("spinner").style.display = "none";
    document.getElementById("actionBtn").disabled = false;
    document.getElementById("phoneInput").focus();
}

// ===============================
// ENTER KEY SUPPORT
// ===============================
function handleEnter(event) {
    if (event.key === "Enter") {
        handleAction();
    }
}

// ===============================
// MAIN SEARCH FUNCTION
// ===============================
async function handleAction() {
    const phoneInput = document.getElementById("phoneInput");
    const phone = phoneInput.value.trim();
    const responseMsg = document.getElementById("responseMsg");
    const spinner = document.getElementById("spinner");
    const actionBtn = document.getElementById("actionBtn");

    responseMsg.className = "";
    responseMsg.innerText = "";

    // ✅ Phone validation (10 digits only)
    if (!/^\d{10}$/.test(phone)) {
        responseMsg.innerText = "Enter valid 10-digit number";
        responseMsg.classList.add("error");
        return;
    }

    actionBtn.disabled = true;
    spinner.style.display = "block";

    try {
        const response = await fetch(`${API_URL}?phone=${phone}`);
        const data = await response.json();

        if (data.status === "duplicate") {
            responseMsg.innerText = "Duplicate";
            responseMsg.classList.add("error");
        } 
        else if (data.status === "not_found") {
            responseMsg.innerText = "Not Found";
            responseMsg.classList.add("warning");
        } 
        else {
            responseMsg.innerText = "Server Error";
            responseMsg.classList.add("error");
        }

        // ✅ Auto clear after 40 seconds
        setTimeout(() => {
            resetForm();
        }, 40000);

    } catch (error) {
        responseMsg.innerText = "Network Error";
        responseMsg.classList.add("error");
    }

    spinner.style.display = "none";
    actionBtn.disabled = false;
}