/* ==================================================
   CONFIG
================================================== */

const API_URL =
    "https://opensheet.elk.sh/19-mq1MdlveqoRNVWeYz5tYISOuW7sRWqxuaX-KdeyeU/transaksi";


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
   INIT
================================================== */

async function init() {

    const transactions =
        await getTransactions();

    const summary =
        calculateSummary(transactions);

    renderSummary(summary);

}

init();
