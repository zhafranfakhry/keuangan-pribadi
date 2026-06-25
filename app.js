/* ==================================================
   CONFIG
================================================== */

const API_URL =
    "https://opensheet.elk.sh/19-mq1MdlveqoRNVWeYz5tYISOuW7sRWqxuaX-KdeyeU/transaksi";

/* ==================================================
   DATA GLOBAL
================================================== */
let allTransactions = [];
let monthlyChart = null;

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

    renderDashboard(filtered);

}
/* ==================================================
   DASHBOARD RENDERER
================================================== */

function renderDashboard(data) {

    const summary =
        calculateSummary(data);

    renderSummary(summary);

    renderTransactions(data);

    renderChart(data);

    renderTopIncome(data);

    renderTopExpense(data);

    renderStatistics(data);
   
   renderLastSync(data);

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
   CHART
================================================== */

function renderChart(data) {

   if(monthlyChart){

    monthlyChart.destroy();

} 
   const monthly = {};

    data.forEach(item => {

        const month =
            item.tanggal.substring(0,7);

        if(!monthly[month]) {

            monthly[month] = {
                income: 0,
                expense: 0
            };

        }

        const amount =
            Number(item.nominal);

        if(item.jenis === "masuk") {

            monthly[month].income += amount;

        }

        if(item.jenis === "keluar") {

            monthly[month].expense += amount;

        }

    });

    const labels =
        Object.keys(monthly);

    const income =
        labels.map(
            month => monthly[month].income
        );

    const expense =
        labels.map(
            month => monthly[month].expense
        );

    monthlyChart = new Chart(

        document
            .getElementById("monthly-chart"),

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
   TOP INCOME
================================================== */

function renderTopIncome(data) {

    const container =
        document.getElementById("top-income");

    const incomeData =
        data
            .filter(item =>
                item.jenis === "masuk"
            )
            .sort(
                (a,b)=>
                Number(b.nominal) -
                Number(a.nominal)
            )
            .slice(0,3);

    container.innerHTML = "";

    incomeData.forEach(item => {

        container.innerHTML += `
            <div class="top-item">

                <span>
                    ${item.kategori}
                </span>

                <strong>
                    ${formatRupiah(
                        Number(item.nominal)
                    )}
                </strong>

            </div>
        `;

    });

}
/* ==================================================
   TOP EXPENSE
================================================== */

function renderTopExpense(data) {

    const container =
        document.getElementById("top-expense");

    const expenseData =
        data
            .filter(item =>
                item.jenis === "keluar"
            )
            .filter(item =>
                item.kategori !== "nafkah istri"
            )
            .sort(
                (a,b)=>
                Number(b.nominal) -
                Number(a.nominal)
            )
            .slice(0,3);

    container.innerHTML = "";

    expenseData.forEach(item => {

        container.innerHTML += `
            <div class="top-item">

                <span>
                    ${item.kategori}
                </span>

                <strong>
                    ${formatRupiah(
                        Number(item.nominal)
                    )}
                </strong>

            </div>
        `;

    });

}
/* ==================================================
   STATISTICS
================================================== */

function renderStatistics(data) {

    const expenses =
        data.filter(item =>
            item.jenis === "keluar"
        );

    const expensesNoWife =
        expenses.filter(item =>
            item.kategori !== "nafkah istri"
        );


    /* ----------------------------------
       Hari Paling Boros
    ---------------------------------- */

    const dailyTotals = {};

    expensesNoWife.forEach(item => {

        const date =
            item.tanggal;

        if(!dailyTotals[date]) {

            dailyTotals[date] = 0;

        }

        dailyTotals[date] +=
            Number(item.nominal);

    });

    let mostExpensiveDay = "-";
    let highestExpense = 0;

    Object.entries(dailyTotals)
        .forEach(([date,total]) => {

            if(total > highestExpense){

                highestExpense = total;

                mostExpensiveDay =
                    date;

            }

        });

    document
        .getElementById("most-expensive-day")
        .textContent =
        mostExpensiveDay;


    /* ----------------------------------
       Kategori Terboros
    ---------------------------------- */

    const categoryTotals = {};

    expensesNoWife.forEach(item => {

        if(!categoryTotals[item.kategori]) {

            categoryTotals[item.kategori] = 0;

        }

        categoryTotals[item.kategori] +=
            Number(item.nominal);

    });

    let topCategory = "-";
    let categoryValue = 0;

    Object.entries(categoryTotals)
        .forEach(([category,total]) => {

            if(total > categoryValue){

                categoryValue = total;

                topCategory = category;

            }

        });

    document
        .getElementById("top-category")
        .textContent =
        topCategory;


    /* ----------------------------------
       Average Daily Expense
    ---------------------------------- */

    const totalExpense =
        expensesNoWife.reduce(
            (sum,item)=>
            sum + Number(item.nominal),
            0
        );

    const totalDays =
        Object.keys(dailyTotals).length;

    const average =
        totalDays
            ? totalExpense / totalDays
            : 0;

    document
        .getElementById("daily-average")
        .textContent =
        formatRupiah(average);


    /* ----------------------------------
       Saving Rate
    ---------------------------------- */

    const income =
        data
        .filter(item =>
            item.jenis === "masuk"
        )
        .reduce(
            (sum,item)=>
            sum + Number(item.nominal),
            0
        );

    const expense =
        expenses.reduce(
            (sum,item)=>
            sum + Number(item.nominal),
            0
        );

    const savingRate =
        income
        ? ((income-expense)/income)*100
        : 0;

    document
        .getElementById("saving-rate")
        .textContent =
        `${savingRate.toFixed(1)}%`;


    /* ----------------------------------
       Monthly Prediction
    ---------------------------------- */

    const now =
        new Date();

    const currentDay =
        now.getDate();

    const daysInMonth =
        new Date(
            now.getFullYear(),
            now.getMonth()+1,
            0
        ).getDate();

    const prediction =
        currentDay
        ? (expense/currentDay)
            * daysInMonth
        : 0;

    document
        .getElementById("monthly-prediction")
        .textContent =
        formatRupiah(prediction);

}
/* ==================================================
   LAST SYNC
================================================== */

function renderLastSync(data){

    const latest =
        [...data]
        .sort(
            (a,b)=>
            new Date(b.tanggal) -
            new Date(a.tanggal)
        )[0];

    document
        .getElementById("last-sync")
        .textContent =
        `Data terakhir: ${latest.tanggal}`;

}

/* ==================================================
   INIT
================================================== */
populateFilters(allTransactions);

renderDashboard(allTransactions);

registerEvents();

  
}

init();
