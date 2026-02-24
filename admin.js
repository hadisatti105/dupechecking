const API_URL = "https://script.google.com/macros/s/AKfycbwiWioRQQfH3ujZNvc0KjggiPUDrAWc18bshKqa0Zz8CKuvkEbOGmTcIvTvKRnKT4pL/exec";

let adminPassword = "";

// ==========================
// LOGIN
// ==========================
function login() {
    adminPassword = document.getElementById("adminPassword").value.trim();

    if (!adminPassword) {
        alert("Enter Admin Password");
        return;
    }

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadStats();

    // Auto load today's data
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("startDate").value = today;
    document.getElementById("endDate").value = today;

    applyFilter();
}

// ==========================
// LOGOUT
// ==========================
function logout() {
    location.reload();
}

// ==========================
// LOAD ANALYTICS
// ==========================
async function loadStats() {
    try {
        const response = await fetch(
            `${API_URL}?action=stats&password=${adminPassword}`
        );

        const data = await response.json();

        if (data.status === "unauthorized") {
            alert("Wrong Password");
            logout();
            return;
        }

        let submissions = 0;
        let duplicates = 0;
        let searches = 0;

        if (data.data) {
            data.data.forEach(row => {
                if (row[0] === "submissions") submissions = row[1];
                if (row[0] === "duplicates") duplicates = row[1];
                if (row[0] === "searches") searches = row[1];
            });
        }

        document.getElementById("submissionsCount").innerText = submissions;
        document.getElementById("duplicatesCount").innerText = duplicates;
        document.getElementById("searchesCount").innerText = searches;

    } catch (error) {
        console.error("Stats error:", error);
        alert("Failed to load analytics");
    }
}

// ==========================
// FILTER DUPE SHEET
// ==========================
async function applyFilter() {
    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");

    if (!startInput.value || !endInput.value) {
        alert("Select start and end date");
        return;
    }

    const startDate = new Date(startInput.value).toISOString().split("T")[0];
    const endDate = new Date(endInput.value).toISOString().split("T")[0];

    try {
        const response = await fetch(
            `${API_URL}?action=filter&password=${adminPassword}&startDate=${startDate}&endDate=${endDate}`
        );

        const data = await response.json();

        if (data.status === "unauthorized") {
            alert("Unauthorized");
            logout();
            return;
        }

        const tableBody = document.querySelector("#resultsTable tbody");
        tableBody.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">No Data Found</td>
                </tr>
            `;
            return;
        }

        data.data.forEach(row => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
                <td>
                    <button onclick="deleteNumber('${row[0]}')">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Filter error:", error);
        alert("Failed to fetch data");
    }
}

// ==========================
// DELETE NUMBER
// ==========================
async function deleteNumber(phone) {
    if (!confirm(`Delete ${phone}?`)) return;

    try {
        const response = await fetch(
            `${API_URL}?action=delete&password=${adminPassword}&phone=${phone}`
        );

        const data = await response.json();

        if (data.status === "deleted") {
            applyFilter();
            loadStats();
        } else {
            alert("Delete failed");
        }

    } catch (error) {
        console.error("Delete error:", error);
        alert("Error deleting number");
    }
}

// ==========================
// PROCESS SOLD NUMBERS (BATCH)
// ==========================
async function processSoldNumbers() {

    if (!confirm("Process Sold Numbers now?")) return;

    try {
        const response = await fetch(
            `${API_URL}?action=processSold&password=${adminPassword}`
        );

        const data = await response.json();

        if (data.status === "processed") {
            alert(`${data.moved} numbers moved to Dupe Sheet`);
            loadStats();
            applyFilter();
        } else if (data.status === "nothing_to_process") {
            alert("Nothing to process");
        } else if (data.status === "unauthorized") {
            alert("Unauthorized");
            logout();
        } else {
            alert("Processing failed");
        }

    } catch (error) {
        console.error("Process error:", error);
        alert("Error processing sold numbers");
    }
}