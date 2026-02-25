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
    const phoneInput = document.getElementById("phoneInput");
    const responseMsg = document.getElementById("responseMsg");

    phoneInput.value = "";
    responseMsg.innerHTML = "";
    responseMsg.className = "";

    document.getElementById("spinner").style.display = "none";
    document.getElementById("actionBtn").disabled = false;

    phoneInput.focus();
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
// FORMAT TCPA RESULT
// ===============================
function formatScrub(scrub) {

    if (!scrub || scrub.status === "Scrub Failed") {
        return `<div class="warning-box">⚠ Scrub Unavailable</div>`;
    }

    const clean = scrub.clean;
    const status = scrub.status || "Unknown";
    const isBad = scrub.is_bad_number;

    // CLEAN NUMBER
    if (clean === 1 && !isBad) {
        return `
            <div class="result-card clean-box">
                🟢 CLEAN NUMBER
            </div>
        `;
    }

    // BAD / DNC / LITIGATOR
    if (clean === 0 || isBad) {
        return `
            <div class="result-card bad-box">
                🔴 ${status}
            </div>
        `;
    }

    return `
        <div class="result-card warning-box">
            ⚠ ${status}
        </div>
    `;
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

    responseMsg.innerHTML = "";
    responseMsg.className = "";

    // ✅ 10-digit validation
    if (!/^\d{10}$/.test(phone)) {
        responseMsg.innerHTML = `
            <div class="result-card error-box">
                Enter valid 10-digit number
            </div>
        `;
        return;
    }

    actionBtn.disabled = true;
    spinner.style.display = "block";

    try {

        const response = await fetch(`${API_URL}?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        const isDuplicate = !!data.duplicate;

        // Duplicate Result Box
        const duplicateHTML = isDuplicate
            ? `
                <div class="result-card duplicate-box">
                    🔁 Duplicate Found
                </div>
              `
            : `
                <div class="result-card fresh-box">
                    📥 Not Found
                </div>
              `;

        // Scrub Result Box
        const scrubHTML = formatScrub(data.scrub);

        responseMsg.innerHTML = duplicateHTML + scrubHTML;

        // Auto reset after 40 seconds
        setTimeout(() => {
            resetForm();
        }, 40000);

    } catch (error) {

        responseMsg.innerHTML = `
            <div class="result-card error-box">
                Network / Server Error
            </div>
        `;

    }

    spinner.style.display = "none";
    actionBtn.disabled = false;
}