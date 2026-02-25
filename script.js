const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec";

// ===============================
// OPEN SEARCH POPUP
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
    const responseMsg = document.getElementById("responseMsg");
    responseMsg.innerHTML = "";
    responseMsg.className = "";
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
// FORMAT TCPA RESULT PROFESSIONALLY
// ===============================
function formatScrub(scrub) {

    if (!scrub) return "<div class='warning'>No scrub data</div>";

    if (scrub.error) {
        return `<div class="error">Scrub Error</div>`;
    }

    const clean = scrub.clean;
    const status = scrub.status || "Unknown";
    const isBad = scrub.is_bad_number;

    // CLEAN
    if (clean === 1 && !isBad) {
        return `<div class="success">🟢 CLEAN - Safe Number</div>`;
    }

    // BAD NUMBER
    if (clean === 0 || isBad) {
        return `<div class="error">🔴 ${status}</div>`;
    }

    return `<div class="warning">⚠ ${status}</div>`;
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
    responseMsg.innerHTML = "";

    // ✅ 10-digit validation
    if (!/^\d{10}$/.test(phone)) {
        responseMsg.innerHTML = "<div class='error'>Enter valid 10-digit number</div>";
        return;
    }

    actionBtn.disabled = true;
    spinner.style.display = "block";

    try {

        const response = await fetch(`${API_URL}?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        const isDuplicate = !!data.duplicate;

        let duplicateHTML = "";

        if (isDuplicate) {
            duplicateHTML = `<div class="error">Duplicate Found</div>`;
        } else {
            duplicateHTML = `<div class="warning">Not Found (Added to Fresh)</div>`;
        }

        const scrubHTML = formatScrub(data.scrub);

        responseMsg.innerHTML = duplicateHTML + scrubHTML;

        // Auto reset after 40 sec
        setTimeout(() => {
            resetForm();
        }, 40000);

    } catch (error) {

        responseMsg.innerHTML = `<div class="error">Network / Server Error</div>`;

    }

    spinner.style.display = "none";
    actionBtn.disabled = false;
}