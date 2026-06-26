/* ==================================================
   CONFIG
================================================== */

const BASE_URL =
    "https://opensheet.elk.sh/19-mq1MdlveqoRNVWeYz5tYISOuW7sRWqxuaX-KdeyeU";

const API_URL =
    `${BASE_URL}/transaksi`;

const PLANNING_URL =
    `${BASE_URL}/planning`;

/* ==================================================
   GLOBAL
================================================== */

let allData = [];

let planningData = [];

let chart = null;


/* ==================================================
   HELPER
================================================== */

function rupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


/* ==================================================
   API
================================================== */

async function loadData() {

    const response =
        await fetch(API_URL);

    return await response.json();

}
async function loadPlanning() {

    const response =
        await fetch(PLANNING_URL);

    return await response.json();

}


/* ==================================================
   SUMMARY
================================================== */

function renderSummary(data) {

    const income =
        data
            .filter(item =>
                item.jenis === "masuk"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.nominal),
                0
            );

    const expense =
        data
            .filter(item =>
                item.jenis === "keluar"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.nominal),
                0
            );

    document.getElementById(
        "income"
    ).textContent =
        rupiah(income);

    document.getElementById(
        "expense"
    ).textContent =
        rupiah(expense);

    document.getElementById(
        "balance"
    ).textContent =
        rupiah(income - expense);

}


/* ==================================================
   TRANSACTIONS
================================================== */

function renderTransactions(data) {

    const container =
        document.getElementById(
            "transaction-list"
        );

    container.innerHTML = "";

    const sorted =
        [...data].sort(
            (a, b) =>
                new Date(b.tanggal) -
                new Date(a.tanggal)
        );

    sorted.forEach(item => {

        container.innerHTML += `
            <div class="transaction">

                <div class="transaction-top">

                    <strong>
                        ${item.kategori}
                    </strong>

                    <strong>
                        ${rupiah(
                            Number(item.nominal)
                        )}
                    </strong>

                </div>

                <small>
                    ${item.tanggal}
                    •
                    ${item.keterangan}
                </small>

            </div>
        `;

    });

}


/* ==================================================
   CATEGORY SUMMARY
================================================== */

function renderCategorySummary(data) {

    const container =
        document.getElementById(
            "category-summary"
        );

    const categories = {};

    data
        .filter(item =>
            item.jenis === "keluar"
        )
        .forEach(item => {

            if (!categories[item.kategori]) {

                categories[item.kategori] = 0;

            }

            categories[item.kategori] +=
                Number(item.nominal);

        });

    container.innerHTML = "";

    Object.entries(categories)
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(([name, total]) => {

            container.innerHTML += `
                <div>

                    <span>
                        ${name}
                    </span>

                    <strong>
                        ${rupiah(total)}
                    </strong>

                </div>
            `;

        });

}


/* ==================================================
   CHART
================================================== */

function renderChart(data) {

    const monthly = {};

    data.forEach(item => {

        const month =
            item.tanggal.substring(0, 7);

        if (!monthly[month]) {

            monthly[month] = {

                masuk: 0,
                keluar: 0

            };

        }

        monthly[month][item.jenis] +=
            Number(item.nominal);

    });

    const labels =
        Object.keys(monthly);

    const income =
        labels.map(
            month =>
                monthly[month].masuk
        );

    const expense =
        labels.map(
            month =>
                monthly[month].keluar
        );

    if (chart) {

        chart.destroy();

    }

    chart = new Chart(

        document.getElementById(
            "monthlyChart"
        ),

        {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {
                        label: "Pemasukan",
                        data: income
                    },

                    {
                        label: "Pengeluaran",
                        data: expense
                    }

                ]

            }

        }

    );

}


/* ==================================================
   FILTERS
================================================== */

function populateFilters(data) {

    const monthFilter =
        document.getElementById(
            "monthFilter"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    const months =
        [
            ...new Set(
                data.map(item =>
                    item.tanggal.substring(
                        0,
                        7
                    )
                )
            )
        ];

    const categories =
        [
            ...new Set(
                data.map(item =>
                    item.kategori
                )
            )
        ];

    months.forEach(month => {

        monthFilter.innerHTML += `
            <option value="${month}">
                ${month}
            </option>
        `;

    });

    categories.forEach(category => {

        categoryFilter.innerHTML += `
            <option value="${category}">
                ${category}
            </option>
        `;

    });

}


function applyFilters() {

    const month =
        document.getElementById(
            "monthFilter"
        ).value;

    const category =
        document.getElementById(
            "categoryFilter"
        ).value;

    let filtered =
        [...allData];

    if (month) {

        filtered =
            filtered.filter(item =>
                item.tanggal.startsWith(
                    month
                )
            );

    }

    if (category) {

        filtered =
            filtered.filter(item =>
                item.kategori ===
                category
            );

    }

    renderSummary(filtered);

    renderTransactions(filtered);

    renderCategorySummary(filtered);

    renderChart(filtered);

    renderLastSync(filtered);

}


/* ==================================================
   LAST SYNC
================================================== */

function renderLastSync(data) {

    const latest =
        [...data]
            .sort(
                (a, b) =>
                    new Date(
                        b.tanggal
                    ) -
                    new Date(
                        a.tanggal
                    )
            )[0];

    document.getElementById(
        "last-sync"
    ).textContent =
        latest
            ? `Last Sync : ${latest.tanggal}`
            : "Last Sync : -";

}


/* ==================================================
   EVENTS
================================================== */

function registerEvents() {

    document
        .getElementById(
            "monthFilter"
        )
        .addEventListener(
            "change",
            applyFilters
        );

    document
        .getElementById(
            "categoryFilter"
        )
        .addEventListener(
            "change",
            applyFilters
        );

}


/* ==================================================
   INIT
================================================== */

async function init() {

    allData =
        await loadData();

    planningData =
        await loadPlanning();
     console.log(planningData);
   
   populateFilters(allData);

    registerEvents();

    applyFilters();

}

init();
