/* ==================================================
   CONFIG
================================================== */

const API_URL =
    "https://opensheet.elk.sh/19-mq1MdlveqoRNVWeYz5tYISOuW7sRWqxuaX-KdeyeU/transaksi";

/* ==================================================
   DATA GLOBAL
================================================== */
let allTransactions = [];

/* ==================================================
   HELPER
================================================== */

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);

}


/* ==================================================
   FETCH DATA
================================================== */

async function getTransactions() {

    const response = await fetch(API_URL);

    return await response.json();

}


/* ==================================================
   CALCULATE
================================================== */

function calculateSummary(data) {

    let income = 0;

    let expense = 0;

    data.forEach(item => {

        const amount = Number(item.nominal);

        if (item.jenis === "masuk") {

            income += amount;

        }

        if (item.jenis === "keluar") {

            expense += amount;

        }

    });

    return {
        income,
        expense,
        balance: income - expense
    };

}


/* ==================================================
   RENDER
================================================== */

function renderSummary(summary) {

    document.getElementById("income").textContent =
        formatRupiah(summary.income);

    document.getElementById("expense").textContent =
        formatRupiah(summary.expense);

    document.getElementById("balance").textContent =
        formatRupiah(summary.balance);

    document.getElementById("last-sync").textContent =
        `Last Sync: ${new Date().toLocaleString("id-ID")}`;

}

/* ==================================================
   FILTER OPTIONS
================================================== */

function populateFilters(data) {

    const monthFilter =
        document.getElementById("month-filter");

    const categoryFilter =
        document.getElementById("category-filter");

    const months =
        [...new Set(
            data.map(item =>
                item.tanggal.substring(0, 7)
            )
        )];

    months.forEach(month => {

        const option =
            document.createElement("option");

        option.value = month;

        option.textContent = month;

        monthFilter.appendChild(option);

    });

    const categories =
        [...new Set(
            data.map(item => item.kategori)
        )];

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);

    });

}

/* ==================================================
   RENDER TRANSACTIONS
================================================== */

function renderTransactions(data) {

    const container =
        document.getElementById("transaction-list");

    container.innerHTML = "";

    data.sort((a, b) =>
        new Date(b.tanggal) -
        new Date(a.tanggal)
    );

    data.forEach(item => {

        const amount =
            Number(item.nominal);

        container.innerHTML += `
            <div class="transaction">

                <div class="transaction-top">

                    <span class="transaction-category">
                        ${item.kategori}
                    </span>

                    <span class="transaction-amount">
                        ${formatRupiah(amount)}
                    </span>

                </div>

                <p>${item.keterangan}</p>

                <small class="transaction-date">
                    ${item.tanggal}
                </small>

            </div>
        `;

    });

}

/* ==================================================
   FILTERING
================================================== */

function applyFilters() {

    const month =
        document.getElementById("month-filter").value;

    const type =
        document.getElementById("type-filter").value;

    const category =
        document.getElementById("category-filter").value;

    let filtered =
        [...allTransactions];

    if(month){

        filtered =
            filtered.filter(item =>
                item.tanggal.startsWith(month)
            );

    }

    if(type){

        filtered =
            filtered.filter(item =>
                item.jenis === type
            );

    }

    if(category){

        filtered =
            filtered.filter(item =>
                item.kategori === category
            );

    }

    renderTransactions(filtered);

}

/* ==================================================
   EVENTS
================================================== */

function registerEvents() {

    document
        .getElementById("month-filter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("type-filter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("category-filter")
        .addEventListener("change", applyFilters);

}

/* ==================================================
   INIT
================================================== */

async function init() {

    allTransactions =
        await getTransactions();

    const summary =
        calculateSummary(allTransactions);

    renderSummary(summary);

    populateFilters(allTransactions);

    renderTransactions(allTransactions);

    registerEvents();

}

init();
