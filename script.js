const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec";

function handleEnter(e) {
  if (e.key === "Enter") handleAction();
}

async function handleAction() {
  const phone = document.getElementById("phoneInput").value.trim();
  const results = document.getElementById("results");
  const spinner = document.getElementById("spinner");
  const btn = document.getElementById("actionBtn");

  results.innerHTML = "";

  if (!/^\d{10}$/.test(phone)) {
    results.innerHTML = `<div class="error-box">Enter valid 10-digit number</div>`;
    return;
  }

  spinner.style.display = "block";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();

    const duplicate = !!data.duplicate;
    const scrub = data.scrub || {};
    const httpCode = data.debug?.http_code;

    // Parse raw safely
    let raw = null;
    if (data.debug?.raw_response) {
      try {
        raw = JSON.parse(data.debug.raw_response);
      } catch {
        raw = null;
      }
    }

    // ========= Database Card =========
    let html = `
      <div class="card">
        <h2>Database Check</h2>
        <div class="${duplicate ? "danger" : "success"}">
          ${duplicate ? "Duplicate" : "Not Found"}
        </div>
      </div>
    `;

    // ========= TCPA Summary Card =========
    const isClean = scrub.clean === 1 && scrub.is_bad_number === false;
    const statusText =
      scrub.status ||
      raw?.results?.status ||
      (isClean ? "CLEAN" : "Flagged");

    html += `
      <div class="card">
        <h2>TCPA Risk Summary</h2>
        <div class="${isClean ? "success" : "danger"} big-status">
          ${isClean ? "CLEAN - SAFE" : "HIGH RISK"}
        </div>
        <p><strong>Status:</strong> ${statusText}</p>
        <p><strong>Clean:</strong> ${scrub.clean ?? raw?.results?.clean ?? "N/A"}</p>
        <p><strong>Bad Number:</strong> ${scrub.is_bad_number ?? raw?.results?.is_bad_number ?? "N/A"}</p>
        ${httpCode ? `<p><strong>API Code:</strong> ${httpCode}</p>` : ""}
      </div>
    `;

    // ========= Match Details Card (ONLY if exists) =========
    const matchType = raw?.match?.[phone]?.type || null;
    if (matchType) {
      html += `
        <div class="card">
          <h2>Match Details</h2>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Match Type:</strong> ${matchType}</p>
        </div>
      `;
    }

    // ========= Detailed Compliance Card =========
    const r = raw?.results || null;
    if (r) {
      const statusArray = Array.isArray(r.status_array) ? r.status_array : [];
      html += `
        <div class="card">
          <h2>Detailed Compliance Data</h2>
          <p><strong>Phone:</strong> ${r.phone_number || phone}</p>
          <p><strong>Status:</strong> ${r.status || (isClean ? "CLEAN" : "Flagged")}</p>
          <p><strong>Status Array:</strong> ${statusArray.length ? statusArray.join(", ") : "N/A"}</p>
          <p><strong>Multiple Cases:</strong> ${r.multiple_cases || "0"}</p>
          <p><strong>Phone Type:</strong> ${r.phone_type || "Unknown"}</p>
          <p><strong>Phone Status:</strong> ${r.phone_status || "N/A"}</p>
        </div>
      `;
    }

    results.innerHTML = html;

  } catch (err) {
    console.error(err);
    results.innerHTML = `<div class="error-box">Network / Server Error</div>`;
  }

  spinner.style.display = "none";
  btn.disabled = false;
}