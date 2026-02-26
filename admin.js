const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec";

let adminPassword = "";

function login() {
  adminPassword = document.getElementById("adminPassword").value.trim();
  if (!adminPassword) return alert("Enter Admin Password");

  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  // default dates = today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").value = today;
  document.getElementById("endDate").value = today;

  loadStats();
  applyFilter();
}

function logout() {
  location.reload();
}

async function loadStats() {
  const res = await fetch(`${API_URL}?action=stats&password=${encodeURIComponent(adminPassword)}`);
  const data = await res.json();

  if (data.status === "unauthorized") {
    alert("Wrong password");
    logout();
    return;
  }

  let submissions = 0, duplicates = 0, searches = 0, moved = 0;

  (data.data || []).forEach(row => {
    const key = String(row[0] || "").trim();
    const val = Number(row[1] || 0);
    if (key === "submissions") submissions = val;
    if (key === "duplicates") duplicates = val;
    if (key === "searches") searches = val;
    if (key === "moved") moved = val;
  });

  document.getElementById("submissionsCount").innerText = submissions;
  document.getElementById("duplicatesCount").innerText = duplicates;
  document.getElementById("searchesCount").innerText = searches;
  document.getElementById("movedCount").innerText = moved;
}

async function applyFilter() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const sheet = document.getElementById("sheetSelect").value;

  if (!startDate || !endDate) return alert("Select start and end date");

  const url =
    `${API_URL}?action=filter&password=${encodeURIComponent(adminPassword)}&sheet=${encodeURIComponent(sheet)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "unauthorized") {
    alert("Unauthorized");
    logout();
    return;
  }

  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  if (!data.data || data.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No Data Found</td></tr>`;
    return;
  }

  data.data.forEach(row => {
    // row layout: [Phone, Timestamp, Date, Time, Clean, Status, IsBad, StatusArray, MatchType]
    const phone = row[0] || "";
    const date = row[2] || "";
    const time = row[3] || "";
    const clean = row[4];
    const status = row[5] || "";
    const bad = row[6];

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${phone}</td>
      <td>${date}</td>
      <td>${time}</td>
      <td>${status}</td>
      <td>${clean === "" || clean === null || clean === undefined ? "" : clean}</td>
      <td>${bad === "" || bad === null || bad === undefined ? "" : bad}</td>
      <td><button class="btn-danger" onclick="deleteNumber('${phone}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteNumber(phone) {
  const sheet = document.getElementById("sheetSelect").value;
  if (!confirm(`Delete ${phone} from ${sheet}?`)) return;

  const url =
    `${API_URL}?action=delete&password=${encodeURIComponent(adminPassword)}&sheet=${encodeURIComponent(sheet)}&phone=${encodeURIComponent(phone)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "deleted") {
    await applyFilter();
    await loadStats();
  } else {
    alert("Delete failed / not found");
  }
}

async function processSoldNumbers() {
  const el = document.getElementById("processResult");
  el.innerText = "Processing...";

  const url = `${API_URL}?action=processSold&password=${encodeURIComponent(adminPassword)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "unauthorized") {
    alert("Unauthorized");
    logout();
    return;
  }

  if (data.status === "processed") {
    el.innerText = `✅ Moved ${data.moved} rows from FreshNumbers → Numbers`;
  } else {
    el.innerText = "Nothing to process.";
  }

  await loadStats();
  await applyFilter();
}