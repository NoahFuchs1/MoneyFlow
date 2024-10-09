// Dummy Data & Variables
let entries = [];
let isExpense = true;

// Page Elements
const homePage = document.getElementById('home');
const newEntryPage = document.getElementById('new-entry');
const overviewPage = document.getElementById('overview');
const detailViewPage = document.getElementById('detail-view');
const overviewList = document.getElementById('entries-list');
const detailEntriesList = document.getElementById('detail-entries-list');

// Buttons
const expenseBtn = document.getElementById('expense-btn');
const incomeBtn = document.getElementById('income-btn');
const saveBtn = document.getElementById('save-btn');
const backBtn = document.getElementById('back-btn');
const overviewBtn = document.getElementById('overview-btn');
const overviewBackBtn = document.getElementById('overview-back-btn');
const dayViewBtn = document.getElementById('day-view-btn');
const weekViewBtn = document.getElementById('week-view-btn');
const monthViewBtn = document.getElementById('month-view-btn');
const detailBackBtn = document.getElementById('detail-back-btn');

// Input Fields
const amountInput = document.getElementById('amount');
const reasonInput = document.getElementById('reason');
const entryType = document.getElementById('entry-type');
const detailTitle = document.getElementById('detail-title');

// Show Page Funktion
function showPage(pageToShow) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    pageToShow.classList.add('active');
}

// Event Listener für Ausgaben Button
expenseBtn.addEventListener('click', () => {
    isExpense = true;
    entryType.innerText = 'Neue Ausgabe';
    showPage(newEntryPage);
});

// Event Listener für Einnahmen Button
incomeBtn.addEventListener('click', () => {
    isExpense = false;
    entryType.innerText = 'Neue Einnahme';
    showPage(newEntryPage);
});

// Event Listener für Speichern Button
saveBtn.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value);
    const reason = reasonInput.value.trim();

    if (!isNaN(amount) && reason) {
        const entry = {
            id: Date.now(),
            amount: isExpense ? -amount : amount,
            reason,
            date: new Date()
        };
        entries.push(entry);
        amountInput.value = '';
        reasonInput.value = '';
        showPage(homePage);
        alert('Eintrag erfolgreich hinzugefügt!');
    } else {
        alert('Bitte einen gültigen Betrag und einen Grund eingeben.');
    }
});

// Event Listener für Zurück Button
backBtn.addEventListener('click', () => {
    showPage(homePage);
});

// Event Listener für Übersicht Button
overviewBtn.addEventListener('click', () => {
    showPage(overviewPage);
    updateOverview('day'); // Standardmäßig Tagesansicht
});

// Event Listener für Übersicht Zurück Button
overviewBackBtn.addEventListener('click', () => {
    showPage(homePage);
});

// Event Listener für Detail Zurück Button
detailBackBtn.addEventListener('click', () => {
    showPage(overviewPage);
});

// Event Listener für View Buttons
dayViewBtn.addEventListener('click', () => updateOverview('day'));
weekViewBtn.addEventListener('click', () => updateOverview('week'));
monthViewBtn.addEventListener('click', () => updateOverview('month'));

// Übersicht aktualisieren basierend auf der Ansicht
function updateOverview(view) {
    overviewList.innerHTML = ''; // Reset der Liste
    let groupedEntries = {};

    const now = new Date();

    entries.forEach(entry => {
        let key;
        switch (view) {
            case 'day':
                key = entry.date.toLocaleDateString();
                break;
            case 'week':
                const weekNumber = getWeekNumber(entry.date);
                key = `Woche ${weekNumber}, ${entry.date.getFullYear()}`;
                break;
            case 'month':
                key = `${entry.date.toLocaleString('default', { month: 'long' })} ${entry.date.getFullYear()}`;
                break;
            default:
                key = entry.date.toLocaleDateString();
        }

        if (!groupedEntries[key]) {
            groupedEntries[key] = [];
        }
        groupedEntries[key].push(entry);
    });

    for (const [key, group] of Object.entries(groupedEntries)) {
        const total = group.reduce((sum, entry) => sum + entry.amount, 0);
        const entryBox = document.createElement('div');
        entryBox.classList.add('entry-box');
        entryBox.classList.add(total >= 0 ? 'green' : 'red');
        entryBox.innerHTML = `
            <div class="entry-details">
                <span>${key}</span>
                <span>${total.toFixed(2)} €</span>
            </div>
            <button class="view-detail-btn" data-key="${key}">Details</button>
        `;
        overviewList.appendChild(entryBox);
    }

    // Event Listener für Detail Buttons
    const detailButtons = document.querySelectorAll('.view-detail-btn');
    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const key = button.getAttribute('data-key');
            showDetailView(view, key);
        });
    });
}

// Detail Ansicht anzeigen
function showDetailView(view, key) {
    detailEntriesList.innerHTML = '';
    detailTitle.innerText = `Details für ${key}`;

    let filteredEntries = [];

    switch (view) {
        case 'day':
            const [day, month, year] = key.split('.');
            filteredEntries = entries.filter(entry => {
                return entry.date.getDate() === parseInt(day) &&
                    (entry.date.getMonth() + 1) === parseInt(month) &&
                    entry.date.getFullYear() === parseInt(year);
            });
            break;
        case 'week':
            const [_, week, yearWeek] = key.split(' ');
            const weekNum = parseInt(week);
            const yearW = parseInt(yearWeek);
            filteredEntries = entries.filter(entry => {
                const entryWeek = getWeekNumber(entry.date);
                return entryWeek === weekNum && entry.date.getFullYear() === yearW;
            });
            break;
        case 'month':
            const [monthName, yearMonth] = key.split(' ');
            const monthNum = new Date(`${monthName} 1, ${yearMonth}`).getMonth();
            const yearM = parseInt(yearMonth);
            filteredEntries = entries.filter(entry => {
                return entry.date.getMonth() === monthNum && entry.date.getFullYear() === yearM;
            });
            break;
        default:
            filteredEntries = entries;
    }

    filteredEntries.forEach(entry => {
        const entryBox = document.createElement('div');
        entryBox.classList.add('entry-box');
        entryBox.classList.add(entry.amount >= 0 ? 'green' : 'red');
        entryBox.innerHTML = `
            <div class="entry-details">
                <span>${entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>${entry.amount.toFixed(2)} € - ${entry.reason}</span>
            </div>
            <div class="entry-actions">
                <button class="edit-btn" data-id="${entry.id}">Bearbeiten</button>
                <button class="delete-btn" data-id="${entry.id}">Löschen</button>
            </div>
        `;
        detailEntriesList.appendChild(entryBox);
    });

    // Event Listener für Bearbeiten und Löschen Buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            editEntry(id);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            deleteEntry(id);
        });
    });

    showPage(detailViewPage);
}

// Eintrag bearbeiten
function editEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (entry) {
        isExpense = entry.amount < 0;
        entryType.innerText = isExpense ? 'Ausgabe bearbeiten' : 'Einnahme bearbeiten';
        amountInput.value = Math.abs(entry.amount);
        reasonInput.value = entry.reason;
        showPage(newEntryPage);

        // Entferne den alten Eintrag
        entries = entries.filter(e => e.id !== id);
    }
}

// Eintrag löschen
function deleteEntry(id) {
    if (confirm('Bist du sicher, dass du diesen Eintrag löschen möchtest?')) {
        entries = entries.filter(e => e.id !== id);
        updateOverview('day'); // Aktualisiere die Übersicht je nach aktueller Ansicht
    }
}

// Hilfsfunktion zur Berechnung der Kalenderwoche
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}
