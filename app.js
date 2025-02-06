document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const formContainer = document.getElementById('form-container');
    const transactionForm = document.getElementById('transaction-form');
    const transactionsList = document.getElementById('transactions-list');
    const showFormBtn = document.getElementById('show-form-btn');
    const closeFormBtn = document.getElementById('close-form-btn');
    const balanceEl = document.getElementById('total-balance');
    const incomeEl = document.getElementById('total-income');
    const expensesEl = document.getElementById('total-expenses');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let editingId = null;

    // Initialize
    renderTransactions();
    updateTotals();

    // Event Listeners
    showFormBtn.addEventListener('click', () => {
        formContainer.classList.add('active');
    });

    closeFormBtn.addEventListener('click', () => {
        formContainer.classList.remove('active');
        resetForm();
    });

    transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Handle clicking outside modal to close
    formContainer.addEventListener('click', (e) => {
        if (e.target === formContainer) {
            formContainer.classList.remove('active');
            resetForm();
        }
    });

    function handleTransactionSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('transaction-name').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const type = document.querySelector('input[name="type"]:checked').value;

        if (!name || !amount) return;

        const transaction = {
            id: editingId || Date.now(),
            name,
            amount,
            type,
            date: new Date().toISOString()
        };

        if (editingId) {
            transactions = transactions.map(t => t.id === editingId ? transaction : t);
            editingId = null;
        } else {
            transactions.unshift(transaction);
        }

        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        renderTransactions();
        updateTotals();
        resetForm();
        formContainer.classList.remove('active');
    }

    function createTransactionElement(transaction) {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.dataset.id = transaction.id;
        
        div.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-type-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                </div>
                <div>
                    <h4>${transaction.name}</h4>
                    <small>${new Date(transaction.date).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="transaction-details">
                <span class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                </span>
                <div class="transaction-actions">
                    <button class="action-btn edit-btn" onclick="handleEdit(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="handleDelete(${transaction.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;

        return div;
    }

    // Make these functions global so they can be accessed by onclick
    window.handleEdit = function(id) {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            editingId = transaction.id;
            document.getElementById('transaction-name').value = transaction.name;
            document.getElementById('transaction-amount').value = transaction.amount;
            document.querySelector(`input[value="${transaction.type}"]`).checked = true;
            formContainer.classList.add('active');
        }
    };

    window.handleDelete = function(id) {
        const transactionElement = document.querySelector(`.transaction-item[data-id="${id}"]`);
        if (transactionElement) {
            // Add fade out animation
            transactionElement.style.animation = 'fadeOut 0.3s ease-out forwards';
            
            // Remove element after animation
            setTimeout(() => {
                transactions = transactions.filter(t => t.id !== id);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                renderTransactions();
                updateTotals();
            }, 300);
        }
    };

    function updateTotals() {
        const amounts = transactions.map(transaction => {
            return transaction.type === 'income' ? transaction.amount : -transaction.amount;
        });

        const total = amounts.reduce((acc, amount) => acc + amount, 0);
        const income = amounts.filter(amount => amount > 0).reduce((acc, amount) => acc + amount, 0);
        const expense = amounts.filter(amount => amount < 0).reduce((acc, amount) => acc + Math.abs(amount), 0);

        balanceEl.textContent = `₹${total.toFixed(2)}`;
        incomeEl.textContent = `₹${income.toFixed(2)}`;
        expensesEl.textContent = `₹${expense.toFixed(2)}`;

        // Update balance card color based on amount
        const balanceCard = balanceEl.closest('.balance-card');
        if (total < 0) {
            balanceCard.style.borderColor = 'var(--danger-color)';
        } else {
            balanceCard.style.borderColor = 'var(--primary-color)';
        }
    }

    function renderTransactions() {
        transactionsList.innerHTML = '';
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions yet</p>
                </div>
            `;
            return;
        }
        
        transactions.forEach(transaction => {
            const element = createTransactionElement(transaction);
            transactionsList.appendChild(element);
        });
    }

    function resetForm() {
        editingId = null;
        transactionForm.reset();
    }

    // Add keyboard support for closing modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && formContainer.classList.contains('active')) {
            formContainer.classList.remove('active');
            resetForm();
        }
    });
});

// Add this CSS for the fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(50px); }
    }
`;
document.head.appendChild(style);