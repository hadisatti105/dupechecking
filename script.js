const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec";

// Enter key
function handleEnter(e){
    if(e.key === "Enter") handleAction();
}

async function handleAction(){

    const phone = document.getElementById("phoneInput").value.trim();
    const results = document.getElementById("results");
    const spinner = document.getElementById("spinner");
    const btn = document.getElementById("actionBtn");

    results.innerHTML = "";

    if(!/^\d{10}$/.test(phone)){
        results.innerHTML = `<div class="error-box">Enter valid 10-digit number</div>`;
        return;
    }

    spinner.style.display = "block";
    btn.disabled = true;

    try{

        const response = await fetch(`${API_URL}?phone=${phone}`);
        const data = await response.json();

        const duplicate = data.duplicate;
        const scrub = data.scrub;
        const raw = data.debug?.raw_response ? JSON.parse(data.debug.raw_response) : null;

        let html = "";

        // =========================
        // DATABASE CHECK
        // =========================
        html += `
        <div class="card">
            <h2>Database Check</h2>
            <div class="${duplicate ? 'danger' : 'success'}">
                ${duplicate ? 'Duplicate' : 'Not Found'}
            </div>
        </div>
        `;

        // =========================
        // TCPA SUMMARY
        // =========================
        html += `
        <div class="card">
            <h2>TCPA Risk Summary</h2>
            <div class="${scrub.clean === 1 ? 'success' : 'danger'} big-status">
                ${scrub.clean === 1 ? 'CLEAN - SAFE' : 'HIGH RISK'}
            </div>
            <p><strong>Status:</strong> ${scrub.status}</p>
            <p><strong>Bad Number:</strong> ${scrub.is_bad_number}</p>
        </div>
        `;

        // =========================
        // MATCH INFORMATION
        // =========================
        if(raw && raw.match){

            const matchType = raw.match[phone]?.type || "No Match Type";

            html += `
            <div class="card">
                <h2>Match Details</h2>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Match Type:</strong> ${matchType}</p>
            </div>
            `;
        }

        // =========================
        // RESULTS DETAILS
        // =========================
        if(raw && raw.results){

            const r = raw.results;

            html += `
            <div class="card">
                <h2>Detailed Compliance Data</h2>
                <p><strong>Status:</strong> ${r.status}</p>
                <p><strong>Status Array:</strong> ${r.status_array.join(", ")}</p>
                <p><strong>Case Title:</strong> ${r.case_title || "N/A"}</p>
                <p><strong>Multiple Cases:</strong> ${r.multiple_cases || "0"}</p>
                <p><strong>Phone Type:</strong> ${r.phone_type || "Unknown"}</p>
                <p><strong>Phone Status:</strong> ${r.phone_status || "N/A"}</p>
                <p><strong>Created At:</strong> ${r.created_at || "N/A"}</p>
                <p><strong>Updated At:</strong> ${r.updated_at || "N/A"}</p>
            </div>
            `;
        }

        results.innerHTML = html;

    }catch(error){
        results.innerHTML = `<div class="error-box">Network / Server Error</div>`;
    }

    spinner.style.display = "none";
    btn.disabled = false;
}