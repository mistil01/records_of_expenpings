const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('authMessage');
const transactionBody = document.getElementById('transactionsBody');

const incomeTotal = document.getElementById('incomeTotal');
const expenseTotal = document.getElementById('expenseTotal');
const balanceTotal = document.getElementById('balanceTotal');
const recentCount = document.getElementById('recentCount');
const topCategory = document.getElementById('topCategory');
const todayLabel = document.getElementById('todayLabel');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const transactionForm = document.getElementById('transactionForm');
const transactionSubmitBtn = document.getElementById('transactionSubmitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const transactionFormTitle = document.getElementById('transactionFormTitle');

const tabs = document.querySelectorAll('.auth-tab');

let editingTransactionId = null;

function setMessage(text, isError = false) {
    authMessage.textContent = text;
    authMessage.style.color = isError ? '#dc2626' : '#16a34a';
}

function saveToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

function clearToken() {
    localStorage.removeItem('token');
}

function showDashboard(show) {
    authSection.classList.toggle('hidden', show);
    dashboardSection.classList.toggle('hidden', !show);
    logoutBtn.classList.toggle('hidden', !show);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value || 0);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

function updateInsightCards(transactions) {
    const count = transactions.length;
    recentCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;

    const categoryCount = {};
    transactions.forEach(item => {
        const key = item.category || 'Uncategorized';
        categoryCount[key] = (categoryCount[key] || 0) + 1;
    });

    const top = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
    topCategory.textContent = top ? top[0] : '—';

    const today = new Date();
    todayLabel.textContent = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function resetTransactionForm() {
    transactionForm.reset();
    editingTransactionId = null;
    transactionFormTitle.textContent = 'Add transaction';
    transactionSubmitBtn.textContent = 'Save transaction';
    cancelEditBtn.classList.add('hidden');
}

async function request(url, options = {}) {
    const token = getToken();
    const headers = {
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? options.body : undefined
    });

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            (data && data.detail) ||
            (typeof data === 'string' ? data : 'Request failed')
        );
    }

    return data;
}

async function loginUser(username, password) {
    const result = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });

    saveToken(result.access_token);
    showDashboard(true);
    await loadTransactions();
    setMessage('Logged in successfully');
}

async function registerUser(username, email, password) {
    await request('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    setMessage('Registration successful. You can now log in.');
}

async function loadTransactions() {
    const transactions = await request('/transactions');
    transactionBody.innerHTML = '';

    let income = 0;
    let expense = 0;

    transactions
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .forEach((item) => {
            const row = document.createElement('tr');
            const amount = Number(item.amount || 0);

            if (item.type === 'income') {
                income += amount;
            } else {
                expense += amount;
            }

            row.dataset.description = item.description || '';
            row.innerHTML = `
                <td>${formatDate(item.created_at)}</td>
                <td>${item.type}</td>
                <td>${item.category}</td>
                <td class="${item.type === 'income' ? 'positive' : 'negative'}">${formatCurrency(amount)}</td>
                <td>
                    <div class="transaction-actions">
                        <button class="action-btn edit" data-action="edit" data-id="${item.id}">Edit</button>
                        <button class="action-btn delete" data-action="delete" data-id="${item.id}">Delete</button>
                    </div>
                </td>
            `;

            transactionBody.appendChild(row);
        });

    incomeTotal.textContent = formatCurrency(income);
    expenseTotal.textContent = formatCurrency(expense);
    balanceTotal.textContent = formatCurrency(income - expense);
    updateInsightCards(transactions);
}

async function submitTransaction(event) {
    event.preventDefault();

    const payload = {
        amount: Number(document.getElementById('transactionAmount').value),
        type: document.getElementById('transactionType').value,
        category: document.getElementById('transactionCategory').value,
        description: document.getElementById('transactionDescription').value
    };

    if (editingTransactionId) {
        await request(`/transactions/${editingTransactionId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    } else {
        await request('/create_transactions', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    resetTransactionForm();
    await loadTransactions();
}

async function deleteTransactionById(id) {
    if (!confirm('Delete this transaction?')) {
        return;
    }

    await request(`/transactions/${id}`, {
        method: 'DELETE'
    });
    await loadTransactions();
}

function setAuthMode(mode) {
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
    loginForm.classList.toggle('active-form', mode === 'login');
    registerForm.classList.toggle('active-form', mode === 'register');
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        setMessage('');
        await loginUser(username, password);
    } catch (error) {
        setMessage(error.message, true);
    }
});

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    try {
        setMessage('');
        await registerUser(username, email, password);
    } catch (error) {
        setMessage(error.message, true);
    }
});

transactionForm.addEventListener('submit', async (event) => {
    try {
        await submitTransaction(event);
    } catch (error) {
        alert(error.message);
    }
});

cancelEditBtn.addEventListener('click', () => {
    resetTransactionForm();
});

transactionBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);

    if (button.dataset.action === 'delete') {
        await deleteTransactionById(id);
        return;
    }

    if (button.dataset.action === 'edit') {
        const row = button.closest('tr');
        const cells = row.querySelectorAll('td');
        const type = cells[1].textContent.trim();
        const category = cells[2].textContent.trim();
        const amount = cells[3].textContent.trim();
        const description = row.dataset.description || '';

        document.getElementById('transactionType').value = type;
        document.getElementById('transactionAmount').value = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
        document.getElementById('transactionCategory').value = category;
        document.getElementById('transactionDescription').value = description;
        editingTransactionId = id;
        transactionFormTitle.textContent = 'Edit transaction';
        transactionSubmitBtn.textContent = 'Update transaction';
        cancelEditBtn.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    clearToken();
    showDashboard(false);
    setMessage('');
    resetTransactionForm();
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => setAuthMode(tab.dataset.mode));
});

if (getToken()) {
    showDashboard(true);
    loadTransactions().catch(() => {
        clearToken();
        showDashboard(false);
    });
}
