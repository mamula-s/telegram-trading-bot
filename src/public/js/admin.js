document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadSignals();
    populatePairs();
    document.getElementById('signalForm').addEventListener('submit', createSignal);
    document.getElementById('createSignalBtn').addEventListener('click', toggleSignalForm);
});

async function loadUsers() {
    try {
        const response = await fetch('/admin/api/users');
        const users = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.telegramId}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.subscriptionType}</td>
                <td>${new Date(user.subscriptionEndDate).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Помилка завантаження користувачів:', error);
        showAlert('Помилка завантаження користувачів', 'danger');
    }
}

async function loadSignals() {
    try {
      const response = await fetch('/admin/api/signals');
      const signals = await response.json();
      const tbody = document.querySelector('#signalsTable tbody');
      tbody.innerHTML = '';
      signals.forEach(signal => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${signal.type}</td>
          <td>${signal.pair}</td>
          <td>${signal.direction}</td>
          <td>${signal.entryPrice}</td>
          <td>${signal.takeProfit}</td>
          <td>${signal.stopLoss}</td>
          <td>${signal.note || ''}</td>
          <td>${signal.imageUrl ? '<img src="' + signal.imageUrl + '" width="50">' : ''}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="editSignal('${signal._id}')">Редагувати</button>
            <button class="btn btn-sm btn-danger" onclick="deleteSignal('${signal._id}')">Видалити</button>
            ${!signal.published ? `<button class="btn btn-sm btn-success" onclick="publishSignal('${signal._id}')">Опублікувати</button>` : ''}
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Помилка завантаження сигналів:', error);
      showAlert('Помилка завантаження сигналів', 'danger');
    }
}

async function publishSignal(id) {
    try {
      const response = await fetch(`/admin/api/signals/${id}/publish`, {
        method: 'POST'
      });
      if (response.ok) {
        showAlert('Сигнал успішно опубліковано', 'success');
        loadSignals(); // Оновлюємо список сигналів
      } else {
        showAlert('Помилка публікації сигналу', 'danger');
      }
    } catch (error) {
      console.error('Помилка публікації сигналу:', error);
      showAlert('Помилка публікації сигналу', 'danger');
    }
}

async function createSignal(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/admin/api/signals', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Створений сигнал:', result);
            showAlert('Сигнал успішно створено', 'success');
            event.target.reset();
            loadSignals();
            toggleSignalForm();
        } else {
            const errorData = await response.json();
            showAlert(`Помилка створення сигналу: ${errorData.error}`, 'danger');
        }
    } catch (error) {
        console.error('Помилка створення сигналу:', error);
        showAlert('Помилка створення сигналу', 'danger');
    }
}

function populatePairs() {
    const pairs = [
        "BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "XRP/USDT",
        "SOL/USDT", "DOT/USDT", "DOGE/USDT", "AVAX/USDT", "LINK/USDT"
    ];
    const selectElement = document.getElementById('pair');
    pairs.forEach(pair => {
        const option = document.createElement('option');
        option.value = pair;
        option.textContent = pair;
        selectElement.appendChild(option);
    });
}

function toggleSignalForm() {
    const form = document.getElementById('signalForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function editSignal(id) {
    // TODO: Реалізувати редагування сигналу
    console.log('Редагування сигналу', id);
}

async function deleteSignal(id) {
    if (confirm('Ви впевнені, що хочете видалити цей сигнал?')) {
        try {
            const response = await fetch(`/admin/api/signals/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showAlert('Сигнал успішно видалено', 'success');
                loadSignals();
            } else {
                showAlert('Помилка видалення сигналу', 'danger');
            }
        } catch (error) {
            console.error('Помилка видалення сигналу:', error);
            showAlert('Помилка видалення сигналу', 'danger');
        }
    }
}

async function sendSignal(id) {
    try {
        const response = await fetch(`/admin/api/signals/${id}/send`, {
            method: 'POST'
        });
        if (response.ok) {
            showAlert('Сигнал успішно відправлено користувачам', 'success');
        } else {
            showAlert('Помилка відправки сигналу', 'danger');
        }
    } catch (error) {
        console.error('Помилка відправки сигналу:', error);
        showAlert('Помилка відправки сигналу', 'danger');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').prepend(alertDiv);
    
    // Автоматично закрити сповіщення через 5 секунд
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Додаємо дісклеймер до кожного сигналу
function addDisclaimerToSignal(signalElement) {
    const disclaimer = document.createElement('div');
    disclaimer.className = 'disclaimer mt-2';
    disclaimer.innerHTML = `
        <small class="text-muted">
            <strong>Ризик менеджмент:</strong><br>
            Вхід до угоди не повинен бути більше ніж 3-5% від вашого депозиту.<br>
            <em>Ми не несемо відповідальності за ваш депозит. Ви самі ухвалюєте рішення відкрити угоду чи ні. Ми можемо лише показати вам результат торгівлі.</em>
        </small>
    `;
    signalElement.appendChild(disclaimer);
}